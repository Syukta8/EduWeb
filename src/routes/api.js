/**
 * @file api.js
 * Express REST API router for Year 6 Sains & Matematik DLP.
 */

const express = require('express');
const router = express.Router();
const { queryAll, queryGet, queryRun } = require('../database/db');
const { calculateQuestionScore, evaluateSpeedRating, evaluateQuizRank } = require('../utils/scoring');

/**
 * GET /api/subjects
 * Retrieves all available subject hubs (Sains DLP, Matematik DLP)
 */
router.get('/subjects', async (req, res) => {
  try {
    const subjects = await queryAll('SELECT * FROM subjects');
    const enriched = await Promise.all(
      subjects.map(async (subj) => {
        const topicCount = await queryGet('SELECT COUNT(*) as count FROM topics WHERE subject_id = ?', [subj.id]);
        const questionCount = await queryGet(
          'SELECT COUNT(*) as count FROM questions q JOIN topics t ON q.topic_id = t.id WHERE t.subject_id = ?',
          [subj.id]
        );
        return {
          ...subj,
          topicCount: topicCount ? topicCount.count : 0,
          questionCount: questionCount ? questionCount.count : 0
        };
      })
    );
    res.json({ success: true, subjects: enriched });
  } catch (err) {
    console.error('API Error /subjects:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/topics?subject=...
 * Retrieves syllabus units for subject customization
 */
router.get('/topics', async (req, res) => {
  try {
    const subjectId = req.query.subject || 'sains';
    const topics = await queryAll('SELECT * FROM topics WHERE subject_id = ? ORDER BY unit_number ASC', [subjectId]);
    
    // Enrich with question count per topic
    const enriched = await Promise.all(
      topics.map(async (topic) => {
        const qCount = await queryGet('SELECT COUNT(*) as count FROM questions WHERE topic_id = ?', [topic.id]);
        return {
          ...topic,
          questionCount: qCount ? qCount.count : 0
        };
      })
    );

    res.json({ success: true, topics: enriched });
  } catch (err) {
    console.error('API Error /topics:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/quiz/generate
 * Custom Quiz Generator based on selected subject, topics, question count, and mode.
 */
router.post('/quiz/generate', async (req, res) => {
  try {
    const { subjectId = 'sains', topicIds = [], questionCount = 5, mode = 'practice' } = req.body;

    let sql = `
      SELECT q.*, t.title as topic_title, t.unit_number 
      FROM questions q 
      JOIN topics t ON q.topic_id = t.id 
      WHERE t.subject_id = ?
    `;
    const params = [subjectId];

    if (Array.isArray(topicIds) && topicIds.length > 0) {
      const placeholders = topicIds.map(() => '?').join(',');
      sql += ` AND q.topic_id IN (${placeholders})`;
      params.push(...topicIds);
    }

    sql += ` ORDER BY RANDOM() LIMIT ?`;
    params.push(parseInt(questionCount, 10) || 5);

    const questions = await queryAll(sql, params);

    // Fetch options or matching pairs for each question
    const formattedQuestions = await Promise.all(
      questions.map(async (q) => {
        let options = [];
        let matchingPairs = [];

        if (q.question_type === 'mcq') {
          options = await queryAll('SELECT id, option_text, is_correct FROM options WHERE question_id = ? ORDER BY RANDOM()', [q.id]);
        } else if (q.question_type === 'true_false' || q.question_type === 'numeric') {
          options = await queryAll('SELECT id, option_text, is_correct FROM options WHERE question_id = ? ORDER BY id ASC', [q.id]);
        }

        if (q.question_type === 'drag_drop') {
          matchingPairs = await queryAll('SELECT left_item, right_item FROM matching_pairs WHERE question_id = ?', [q.id]);
        }

        return {
          id: q.id,
          topicId: q.topic_id,
          topicTitle: q.topic_title,
          unitNumber: q.unit_number,
          questionText: q.question_text,
          questionType: q.question_type,
          diagramSvg: q.diagram_svg,
          explanation: q.explanation,
          difficulty: q.difficulty,
          options: options.map(opt => ({ id: opt.id, text: opt.option_text, isCorrect: opt.is_correct === 1 })),
          matchingPairs
        };
      })
    );

    res.json({
      success: true,
      quiz: {
        subjectId,
        mode,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions
      }
    });
  } catch (err) {
    console.error('API Error /quiz/generate:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/quiz/submit
 * Submits answers, calculates score breakdown, updates leaderboard, and returns performance analysis.
 */
router.post('/quiz/submit', async (req, res) => {
  try {
    const { studentName = 'Arcade Student', avatarId = 'pixel_scientist', subjectId = 'sains', mode = 'challenge', answers = [] } = req.body;

    let totalScore = 0;
    let correctCount = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    let totalTimeSpent = 0;

    const answerBreakdowns = [];

    for (const ans of answers) {
      const { questionId, isCorrect, timeRemaining = 0, timeTotal = 20 } = ans;
      const timeSpent = Math.max(0, timeTotal - timeRemaining);
      totalTimeSpent += timeSpent;

      const scoreInfo = calculateQuestionScore(isCorrect, timeRemaining, timeTotal, currentStreak);

      if (isCorrect) {
        correctCount++;
        currentStreak = scoreInfo.newStreak;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }

      totalScore += scoreInfo.totalPoints;
      answerBreakdowns.push({
        questionId,
        isCorrect,
        timeSpent,
        pointsAwarded: scoreInfo.totalPoints,
        streakLabel: scoreInfo.streakLabel
      });
    }

    const totalQuestions = answers.length || 1;
    const accuracyPct = Math.round((correctCount / totalQuestions) * 100);
    const avgTimeSeconds = Math.round(totalTimeSpent / totalQuestions);
    const speedRating = evaluateSpeedRating(avgTimeSeconds);
    const rankInfo = evaluateQuizRank(accuracyPct);

    // Save session in DB
    const sessionId = 'qs_' + Date.now();
    await queryRun(
      'INSERT INTO quiz_sessions (id, student_id, subject_id, mode, total_questions, score, correct_count, duration_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sessionId, studentName, subjectId, mode, totalQuestions, totalScore, correctCount, totalTimeSpent]
    );

    // Record in leaderboard if challenge mode or score > 0
    if (totalScore > 0) {
      await queryRun(
        'INSERT INTO leaderboard (student_name, avatar_id, subject_id, score, accuracy, speed_rating) VALUES (?, ?, ?, ?, ?, ?)',
        [studentName, avatarId, subjectId, totalScore, accuracyPct, speedRating]
      );
    }

    res.json({
      success: true,
      result: {
        sessionId,
        studentName,
        avatarId,
        subjectId,
        mode,
        totalQuestions,
        correctCount,
        accuracyPct,
        totalScore,
        maxStreak,
        totalTimeSpent,
        avgTimeSeconds,
        speedRating,
        rankInfo,
        breakdowns: answerBreakdowns
      }
    });
  } catch (err) {
    console.error('API Error /quiz/submit:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/leaderboard?subject=...
 * Retrieves top leaderboard entries
 */
router.get('/leaderboard', async (req, res) => {
  try {
    const subjectId = req.query.subject;
    let sql = 'SELECT * FROM leaderboard';
    const params = [];

    if (subjectId) {
      sql += ' WHERE subject_id = ?';
      params.push(subjectId);
    }

    sql += ' ORDER BY score DESC, accuracy DESC LIMIT 10';

    const entries = await queryAll(sql, params);
    res.json({ success: true, leaderboard: entries });
  } catch (err) {
    console.error('API Error /leaderboard:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
