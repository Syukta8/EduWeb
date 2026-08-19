/**
 * @file server.js
 * Main Express backend server for Year 6 Sains DLP & Matematik DLP.
 */

const express = require('express');
const path = require('path');
const { initDatabase } = require('./database/db');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from public/
app.use(express.static(path.join(__dirname, '../public')));

// Mount REST API routes
app.use('/api', apiRoutes);

// Catch-all route to serve SPA frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize Database & Start Server
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 Year 6 Sains & Math DLP Arcade Web Server Running`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`====================================================`);
    });
  })
  .catch((err) => {
    console.error('Fatal database initialization error:', err);
  });
