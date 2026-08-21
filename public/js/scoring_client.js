/**
 * @file scoring_client.js
 * Client-side scoring logic, speed decay calculations, streak multipliers, and rank evaluation.
 */

(function () {
  /**
   * Calculates score for a single answered question.
   * @param {boolean} isCorrect - Whether the answer is correct
   * @param {number} timeRemaining - Seconds left on question timer
   * @param {number} timeTotal - Total duration for question timer in seconds
   * @param {number} currentStreak - Current consecutive correct answer count
   * @returns {Object} Score breakdown
   */
  function calculateQuestionScore(isCorrect, timeRemaining, timeTotal, currentStreak = 0) {
    if (!isCorrect) {
      return {
        isCorrect: false,
        basePoints: 0,
        speedBonus: 0,
        streakMultiplier: 1.0,
        totalPoints: 0,
        newStreak: 0
      };
    }

    const basePoints = 100;
    const safeTotal = timeTotal > 0 ? timeTotal : 20;
    const safeRemaining = Math.max(0, Math.min(timeRemaining, safeTotal));

    // Decay Speed Bonus: Up to 50 points based on percentage of remaining time
    const speedRatio = safeRemaining / safeTotal;
    const speedBonus = Math.floor(50 * speedRatio);

    const newStreak = currentStreak + 1;
    let streakMultiplier = 1.0;
    let streakLabel = 'NORMAL';

    if (newStreak >= 5) {
      streakMultiplier = 1.5;
      streakLabel = 'SUPER COMBO! ⚡ (1.5x)';
    } else if (newStreak >= 3) {
      streakMultiplier = 1.2;
      streakLabel = 'ON FIRE! 🔥 (1.2x)';
    }

    const rawTotal = (basePoints + speedBonus) * streakMultiplier;
    const totalPoints = Math.floor(rawTotal);

    return {
      isCorrect: true,
      basePoints,
      speedBonus,
      streakMultiplier,
      streakLabel,
      totalPoints,
      newStreak
    };
  }

  /**
   * Determines speed rating label based on average answer time.
   * @param {number} avgTimeSeconds 
   * @returns {string} Speed Rating string
   */
  function evaluateSpeedRating(avgTimeSeconds) {
    if (avgTimeSeconds <= 4) return '⚡ Super Sonic Fast';
    if (avgTimeSeconds <= 8) return '🔥 Lightning Fast';
    if (avgTimeSeconds <= 14) return '🎯 Quick Thinker';
    return '🐢 Steady Explorer';
  }

  /**
   * Evaluates performance grade/rank for quiz results.
   * @param {number} accuracyPct - Accuracy percentage (0 - 100)
   * @returns {Object} Rank details (badge, grade, title)
   */
  function evaluateQuizRank(accuracyPct) {
    if (accuracyPct >= 90) {
      return { grade: 'S+', title: 'DLP Arcade Master 👑', badge: '🏆 GOLD TROPHY' };
    } else if (accuracyPct >= 75) {
      return { grade: 'A', title: 'Science & Math Hero 🌟', badge: '🥈 SILVER MEDAL' };
    } else if (accuracyPct >= 60) {
      return { grade: 'B', title: 'Rising Scholar 🚀', badge: '🥉 BRONZE MEDAL' };
    } else {
      return { grade: 'C', title: 'Apprentice Explorer 📚', badge: '🎖️ PARTICIPANT' };
    }
  }

  window.dlpScoring = {
    calculateQuestionScore,
    evaluateSpeedRating,
    evaluateQuizRank
  };
})();
