/**
 * @file db.js
 * Database initialization and async query wrapper using SQLite3.
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../database.sqlite');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to SQLite database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

/**
 * Initialize database tables using schema.sql
 */
function initDatabase() {
  return new Promise((resolve, reject) => {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schema, (err) => {
      if (err) {
        console.error('Failed to run database schema DDL:', err.message);
        return reject(err);
      }
      console.log('Database tables initialized successfully.');
      resolve();
    });
  });
}

/**
 * Helper to run a SQL query returning all matching rows.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Array>}
 */
function queryAll(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Helper to run a SQL query returning a single row.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Object|null>}
 */
function queryGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row || null);
    });
  });
}

/**
 * Helper to execute INSERT, UPDATE, DELETE queries.
 * @param {string} sql 
 * @param {Array} params 
 * @returns {Promise<Object>}
 */
function queryRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

module.exports = {
  db,
  initDatabase,
  queryAll,
  queryGet,
  queryRun
};
