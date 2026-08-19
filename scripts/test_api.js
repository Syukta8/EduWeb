/**
 * @file test_api.js
 * Programmatic API verification test script.
 */

const http = require('http');

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('Testing GET /api/subjects...');
  const subjects = await makeRequest('/api/subjects');
  console.log('Subjects:', subjects.success ? `${subjects.subjects.length} subjects found` : 'FAIL');

  console.log('\nTesting GET /api/topics?subject=sains...');
  const topics = await makeRequest('/api/topics?subject=sains');
  console.log('Sains Topics:', topics.success ? `${topics.topics.length} units found` : 'FAIL');

  console.log('\nTesting POST /api/quiz/generate...');
  const quizGen = await makeRequest('/api/quiz/generate', 'POST', {
    subjectId: 'sains',
    topicIds: ['sains_u2', 'sains_u3'],
    questionCount: 5,
    mode: 'challenge'
  });
  console.log('Quiz Generated:', quizGen.success ? `${quizGen.quiz.questions.length} questions` : 'FAIL');

  console.log('\nTesting POST /api/quiz/submit...');
  const submission = await makeRequest('/api/quiz/submit', 'POST', {
    studentName: 'Verification Bot',
    avatarId: 'pixel_scientist',
    subjectId: 'sains',
    mode: 'challenge',
    answers: [
      { questionId: 'sci_q1', isCorrect: true, timeRemaining: 15, timeTotal: 20 },
      { questionId: 'sci_q2', isCorrect: true, timeRemaining: 18, timeTotal: 20 },
      { questionId: 'sci_q3', isCorrect: true, timeRemaining: 12, timeTotal: 20 }
    ]
  });
  console.log('Quiz Result Score:', submission.success ? `${submission.result.totalScore} PTS (${submission.result.rankInfo.title})` : 'FAIL');

  console.log('\nTesting GET /api/leaderboard...');
  const lb = await makeRequest('/api/leaderboard');
  console.log('Leaderboard:', lb.success ? `${lb.leaderboard.length} high score entries` : 'FAIL');
}

runTests().catch(err => console.error('Test error:', err));
