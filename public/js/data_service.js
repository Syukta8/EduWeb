/**
 * @file data_service.js
 * Standalone client-side data service for MathSainsDLP SPA on Firebase Hosting.
 */

(function () {
  const SUBJECTS_DATA = [
    {
      id: 'sains',
      name: 'Sains DLP (Science DLP)',
      icon: '🔬',
      description: 'Year 6 DLP Science Syllabus (13 Units): Scientific Skills, Humans, Microbes, Symbiosis, Preservation, Force, Speed, Food Tech, Waste, Eclipses, Galaxy, Stability, Technology.'
    },
    {
      id: 'matematik',
      name: 'Matematik DLP (Math DLP)',
      icon: '🧮',
      description: 'Year 6 DLP Mathematics Syllabus: Whole Numbers, Fractions & Decimals, Financial Literacy, Time, Geometry & Data Handling.'
    }
  ];

  const TOPICS_DATA = [
    // SAINS DLP TOPICS (13 Units - KSSR Semakan)
    { id: 'sains_u1', subject_id: 'sains', unit_number: 1, title: 'Unit 1: Scientific Skills', description: 'Manipulative skills, hypotheses, variables & experimental controls' },
    { id: 'sains_u2', subject_id: 'sains', unit_number: 2, title: 'Unit 2: Humans', description: 'Reproductive systems, fertilisation, central & peripheral nervous system' },
    { id: 'sains_u3', subject_id: 'sains', unit_number: 3, title: 'Unit 3: Microorganisms', description: 'Fungi, bacteria, algae, protozoa, virus & life processes' },
    { id: 'sains_u4', subject_id: 'sains', unit_number: 4, title: 'Unit 4: Interaction Among Living Things', description: 'Competition, Symbiosis (Mutualism, Commensalism, Parasitism) & biological control' },
    { id: 'sains_u5', subject_id: 'sains', unit_number: 5, title: 'Unit 5: Preservation and Conservation', description: 'Threatened & extinct species, environmental protection, sanctuaries' },
    { id: 'sains_u6', subject_id: 'sains', unit_number: 6, title: 'Unit 6: Force', description: 'Effects of force, frictional force, gravitational pull & air resistance' },
    { id: 'sains_u7', subject_id: 'sains', unit_number: 7, title: 'Unit 7: Speed', description: 'Speed concept, formula (Speed = Distance ÷ Time), unit conversions & calculations' },
    { id: 'sains_u8', subject_id: 'sains', unit_number: 8, title: 'Unit 8: Food Preservation Technology', description: 'Drying, boiling, pickling, pasteurisation, vacuum packing & canning' },
    { id: 'sains_u9', subject_id: 'sains', unit_number: 9, title: 'Unit 9: Waste Management', description: 'Biodegradable vs non-biodegradable waste, 5R practices & recycling' },
    { id: 'sains_u10', subject_id: 'sains', unit_number: 10, title: 'Unit 10: Eclipses', description: 'Lunar eclipse & solar eclipse positions, umbra, penumbra & properties of light' },
    { id: 'sains_u11', subject_id: 'sains', unit_number: 11, title: 'Unit 11: Galaxy', description: 'Milky Way (Bima Sakti), spiral structure, solar system location & universe' },
    { id: 'sains_u12', subject_id: 'sains', unit_number: 12, title: 'Unit 12: Stability and Strength', description: 'Factors of stability (base area & height) and strength (shapes & materials)' },
    { id: 'sains_u13', subject_id: 'sains', unit_number: 13, title: 'Unit 13: Technology', description: 'Development of technology, simple & complex machines, sustainable development' },

    // MATEMATIK DLP TOPICS (7 Units)
    { id: 'math_u1', subject_id: 'matematik', unit_number: 1, title: 'Unit 1: Whole Numbers & Operations', description: 'Prime numbers up to 100, million fractions, standard operations' },
    { id: 'math_u2', subject_id: 'matematik', unit_number: 2, title: 'Unit 2: Fractions, Decimals & Percentages', description: 'Multiplication of fractions, percentage conversion and change' },
    { id: 'math_u3', subject_id: 'matematik', unit_number: 3, title: 'Unit 3: Money & Financial Literacy', description: 'Cost price, selling price, profit, loss, discount, rebate & assets' },
    { id: 'math_u4', subject_id: 'matematik', unit_number: 4, title: 'Unit 4: Time & Time Zones', description: '12-hour and 24-hour clocks, world time zone difference' },
    { id: 'math_u5', subject_id: 'matematik', unit_number: 5, title: 'Unit 5: Measurement & Geometry', description: 'Perimeter, area of composite shapes, volume of 3D solids' },
    { id: 'math_u6', subject_id: 'matematik', unit_number: 6, title: 'Unit 6: Coordinates, Ratio & Proportion', description: 'Cartesian coordinates, simplified ratios & direct proportion' },
    { id: 'math_u7', subject_id: 'matematik', unit_number: 7, title: 'Unit 7: Data Handling & Likelihood', description: 'Mean, median, mode, range, bar chart interpretation & probability' }
  ];

  const INITIAL_LEADERBOARD = [
    { student_name: 'Adam (Ninja)', avatar_id: 'math_ninja', subject_id: 'matematik', score: 1450, accuracy: 100, speed_rating: '⚡ Super Sonic Fast' },
    { student_name: 'Siti (Scientist)', avatar_id: 'pixel_scientist', subject_id: 'sains', score: 1380, accuracy: 100, speed_rating: '🔥 Lightning Fast' },
    { student_name: 'Raju (Astro)', avatar_id: 'astro_explorer', subject_id: 'sains', score: 1220, accuracy: 87.5, speed_rating: '🎯 Quick Thinker' },
    { student_name: 'Mei Ling (Wizard)', avatar_id: 'logic_wizard', subject_id: 'matematik', score: 1190, accuracy: 87.5, speed_rating: '🎯 Quick Thinker' }
  ];

  class DLPDataService {
    constructor() {
      this.questionsCache = {
        sains: null,
        matematik: null
      };
      this.initLeaderboard();
    }

    initLeaderboard() {
      if (!localStorage.getItem('dlp_leaderboard')) {
        localStorage.setItem('dlp_leaderboard', JSON.stringify(INITIAL_LEADERBOARD));
      }
    }

    async loadQuestionBank(subjectId) {
      if (this.questionsCache[subjectId]) {
        return this.questionsCache[subjectId];
      }

      const fileName = subjectId === 'sains' ? 'sains_questions.json' : 'math_questions.json';
      try {
        const response = await fetch(`/data/${fileName}`);
        if (!response.ok) {
          throw new Error(`Failed to load ${fileName}: ${response.statusText}`);
        }
        const data = await response.json();
        this.questionsCache[subjectId] = data;
        return data;
      } catch (err) {
        console.error('DataService question loading error:', err);
        return [];
      }
    }

    async getTopics(subjectId = 'sains') {
      const allQuestions = await this.loadQuestionBank(subjectId);
      const filteredTopics = TOPICS_DATA.filter(t => t.subject_id === subjectId);

      return filteredTopics.map(topic => {
        const count = allQuestions.filter(q => q.topic_id === topic.id).length;
        return {
          ...topic,
          questionCount: count
        };
      });
    }

    /**
     * Fisher-Yates array shuffle
     */
    shuffleArray(array) {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    async generateQuiz(subjectId = 'sains', topicIds = [], questionCount = 5, mode = 'practice') {
      const allQuestions = await this.loadQuestionBank(subjectId);
      
      let candidateQuestions = allQuestions;
      if (Array.isArray(topicIds) && topicIds.length > 0) {
        candidateQuestions = allQuestions.filter(q => topicIds.includes(q.topic_id));
      }

      // Weighted Stratified Sampling: 50% MCQ, 25% True/False, 25% Numeric / Drag&Drop
      const targetMCQ = Math.max(1, Math.round(questionCount * 0.50));
      const targetTF = Math.max(1, Math.round(questionCount * 0.25));
      const targetOther = Math.max(0, questionCount - targetMCQ - targetTF);

      const poolMCQ = this.shuffleArray(candidateQuestions.filter(q => q.question_type === 'mcq'));
      const poolTF = this.shuffleArray(candidateQuestions.filter(q => q.question_type === 'true_false'));
      const poolOther = this.shuffleArray(candidateQuestions.filter(q => q.question_type === 'numeric' || q.question_type === 'drag_drop'));

      const pickedMCQ = poolMCQ.slice(0, targetMCQ);
      const pickedTF = poolTF.slice(0, targetTF);
      const pickedOther = poolOther.slice(0, targetOther);

      const selectedMap = new Set([...pickedMCQ, ...pickedTF, ...pickedOther].map(q => q.id));
      let selected = [...pickedMCQ, ...pickedTF, ...pickedOther];

      // Fill shortfall if any bucket had fewer questions than targeted
      if (selected.length < questionCount) {
        const remainingPool = this.shuffleArray(candidateQuestions.filter(q => !selectedMap.has(q.id)));
        const needed = questionCount - selected.length;
        selected.push(...remainingPool.slice(0, needed));
      }

      // Final shuffle so questions are mixed randomly
      const randomizedSelected = this.shuffleArray(selected);

      // Map topics for titles
      const topicMap = {};
      TOPICS_DATA.forEach(t => {
        topicMap[t.id] = { title: t.title, unit_number: t.unit_number };
      });

      const formattedQuestions = randomizedSelected.map(q => {
        const topicInfo = topicMap[q.topic_id] || { title: 'DLP Unit', unit_number: 1 };
        
        // Map and randomize options for MCQ questions so Option A is not always correct
        let options = (q.options || []).map((opt, i) => ({
          id: i + 1,
          text: opt.text,
          isCorrect: opt.is_correct === 1 || opt.is_correct === true
        }));

        if (q.question_type === 'mcq') {
          options = this.shuffleArray(options);
        }

        return {
          id: q.id,
          topicId: q.topic_id,
          topicTitle: topicInfo.title,
          unitNumber: topicInfo.unit_number,
          questionText: q.question_text,
          questionType: q.question_type,
          diagramSvg: q.diagram_svg || null,
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          options,
          matchingPairs: (q.matching_pairs || []).map(mp => ({
            left: mp.left,
            right: mp.right
          }))
        };
      });

      return {
        subjectId,
        mode,
        totalQuestions: formattedQuestions.length,
        questions: formattedQuestions
      };
    }

    submitQuizResult({ studentName, avatarId, subjectId, mode, answers }) {
      const scoring = window.dlpScoring;
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

        const scoreInfo = scoring.calculateQuestionScore(isCorrect, timeRemaining, timeTotal, currentStreak);

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
      const speedRating = scoring.evaluateSpeedRating(avgTimeSeconds);
      const rankInfo = scoring.evaluateQuizRank(accuracyPct);

      const sessionId = 'qs_' + Date.now();

      // Record to LocalStorage Leaderboard
      if (totalScore > 0) {
        const currentLb = this.getLeaderboard();
        currentLb.push({
          student_name: studentName,
          avatar_id: avatarId,
          subject_id: subjectId,
          score: totalScore,
          accuracy: accuracyPct,
          speed_rating: speedRating,
          date: new Date().toISOString()
        });

        // Keep top 20
        currentLb.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
        localStorage.setItem('dlp_leaderboard', JSON.stringify(currentLb.slice(0, 20)));
      }

      return {
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
      };
    }

    getLeaderboard(subjectId = null) {
      let entries = [];
      try {
        const raw = localStorage.getItem('dlp_leaderboard');
        entries = raw ? JSON.parse(raw) : [...INITIAL_LEADERBOARD];
      } catch (e) {
        entries = [...INITIAL_LEADERBOARD];
      }

      if (subjectId) {
        entries = entries.filter(e => e.subject_id === subjectId);
      }

      entries.sort((a, b) => b.score - a.score || b.accuracy - a.accuracy);
      return entries.slice(0, 10);
    }
  }

  window.dlpDataService = new DLPDataService();
})();
