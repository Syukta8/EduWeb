/**
 * @file seed_database.js
 * Ingestion and seed script for Year 6 Sains DLP & Matematik DLP.
 * Populates SQLite database with topics, questions, options, and matching pairs
 * imported from modular JSON datasets (sains_questions.json & math_questions.json).
 */

const fs = require('fs');
const path = require('path');
const { initDatabase, queryRun } = require('../src/database/db');

const sainsQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/sains_questions.json'), 'utf8'));
const mathQuestions = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/data/math_questions.json'), 'utf8'));

const subjectsData = [
  {
    id: 'sains',
    name: 'Sains DLP (Science DLP)',
    icon: '🔬',
    description: 'Year 6 DLP Science Syllabus: Scientific Skills, Microorganisms, Symbiosis, Forces, Preservation, Astronomy & Machines.'
  },
  {
    id: 'matematik',
    name: 'Matematik DLP (Math DLP)',
    icon: '🧮',
    description: 'Year 6 DLP Mathematics Syllabus: Whole Numbers, Fractions & Decimals, Financial Literacy, Time, Geometry & Data Handling.'
  }
];

const topicsData = [
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

async function seed() {
  console.log('Seeding SQLite database for Year 6 Sains DLP & Matematik DLP...');
  await initDatabase();

  // Seed Subjects
  for (const s of subjectsData) {
    await queryRun(
      'INSERT OR REPLACE INTO subjects (id, name, icon, description) VALUES (?, ?, ?, ?)',
      [s.id, s.name, s.icon, s.description]
    );
  }

  // Seed Topics
  for (const t of topicsData) {
    await queryRun(
      'INSERT OR REPLACE INTO topics (id, subject_id, unit_number, title, description) VALUES (?, ?, ?, ?, ?)',
      [t.id, t.subject_id, t.unit_number, t.title, t.description]
    );
  }

  const allQuestions = [...sainsQuestions, ...mathQuestions];
  console.log(`Seeding total of ${allQuestions.length} questions into database...`);

  // Seed Questions & Options / Matching Pairs
  for (const q of allQuestions) {
    await queryRun(
      'INSERT OR REPLACE INTO questions (id, topic_id, question_text, question_type, diagram_svg, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [q.id, q.topic_id, q.question_text, q.question_type, q.diagram_svg, q.explanation, q.difficulty]
    );

    // Delete existing options & matching pairs for this question
    await queryRun('DELETE FROM options WHERE question_id = ?', [q.id]);
    await queryRun('DELETE FROM matching_pairs WHERE question_id = ?', [q.id]);

    if (q.options && q.options.length > 0) {
      for (const opt of q.options) {
        await queryRun(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [q.id, opt.text, opt.is_correct]
        );
      }
    }

    if (q.matching_pairs && q.matching_pairs.length > 0) {
      for (const pair of q.matching_pairs) {
        await queryRun(
          'INSERT INTO matching_pairs (question_id, left_item, right_item) VALUES (?, ?, ?)',
          [q.id, pair.left, pair.right]
        );
      }
    }
  }

  // Seed initial leaderboard entries
  const initialLeaderboard = [
    { name: 'Adam (Ninja)', avatar: 'math_ninja', subject: 'matematik', score: 1450, accuracy: 100, speed: '⚡ Super Sonic Fast' },
    { name: 'Siti (Scientist)', avatar: 'pixel_scientist', subject: 'sains', score: 1380, accuracy: 100, speed: '🔥 Lightning Fast' },
    { name: 'Raju (Astro)', avatar: 'astro_explorer', subject: 'sains', score: 1220, accuracy: 87.5, speed: '🎯 Quick Thinker' },
    { name: 'Mei Ling (Wizard)', avatar: 'logic_wizard', subject: 'matematik', score: 1190, accuracy: 87.5, speed: '🎯 Quick Thinker' }
  ];

  for (const lb of initialLeaderboard) {
    await queryRun(
      'INSERT INTO leaderboard (student_name, avatar_id, subject_id, score, accuracy, speed_rating) VALUES (?, ?, ?, ?, ?, ?)',
      [lb.name, lb.avatar, lb.subject, lb.score, lb.accuracy, lb.speed]
    );
  }

  console.log(`Database seeded successfully! Total questions loaded: ${allQuestions.length}`);
}

if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { seed };
