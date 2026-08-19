const { queryAll } = require('../src/database/db');

async function verifyPerTopicCount() {
  const topics = await queryAll('SELECT * FROM topics ORDER BY subject_id, unit_number');
  console.log('=== VERIFYING QUESTION COUNT PER SYLLABUS UNIT ===');
  for (const t of topics) {
    const qCount = await queryAll('SELECT COUNT(*) as count FROM questions WHERE topic_id = ?', [t.id]);
    console.log(`Unit [${t.subject_id.toUpperCase()} U${t.unit_number}]: ${t.title} -> ${qCount[0].count} questions`);
  }
  const totalQ = await queryAll('SELECT COUNT(*) as count FROM questions');
  console.log(`\nTOTAL QUESTIONS IN DATABASE: ${totalQ[0].count}`);
}

verifyPerTopicCount().then(() => process.exit(0)).catch(console.error);
