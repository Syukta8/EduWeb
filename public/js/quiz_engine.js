/**
 * @file quiz_engine.js
 * Interactive Quiz Engine for Year 6 Sains DLP & Matematik DLP.
 */

class DLPQuizEngine {
  constructor() {
    this.quiz = null;
    this.currentIndex = 0;
    this.userAnswers = [];
    this.currentStreak = 0;
    this.totalScore = 0;

    this.timerInterval = null;
    this.timeTotal = 20;
    this.timeRemaining = 20;
    this.isAnswered = false;

    // DOM Elements
    this.container = document.getElementById('quiz-arena');
  }

  startQuiz(quizData, timePreset = 20) {
    this.quiz = quizData;
    this.timeTotal = parseInt(timePreset, 10) || 20;
    this.currentIndex = 0;
    this.userAnswers = [];
    this.currentStreak = 0;
    this.totalScore = 0;

    this.renderQuestion();
  }

  renderQuestion() {
    this.stopTimer();
    this.isAnswered = false;

    if (this.currentIndex >= this.quiz.questions.length) {
      this.finishQuiz();
      return;
    }

    const q = this.quiz.questions[this.currentIndex];
    this.timeRemaining = this.timeTotal;

    const streakBadgeHtml = this.currentStreak >= 3 
      ? `<div class="streak-badge">${this.currentStreak >= 5 ? '⚡ SUPER COMBO! (' + this.currentStreak + 'x)' : '🔥 ON FIRE! (' + this.currentStreak + 'x)'}</div>` 
      : '';

    let contentHtml = `
      <div class="quiz-header">
        <div>
          <span style="font-weight:900; font-size:1.1rem;">QUESTION ${this.currentIndex + 1} / ${this.quiz.questions.length}</span>
          <span style="color:var(--text-muted); font-size:0.9rem; margin-left:0.5rem;">[${this.quiz.mode.toUpperCase()} MODE]</span>
        </div>
        ${streakBadgeHtml}
        <div class="timer-box">
          ⏱️ <span id="timer-display">${this.timeRemaining}s</span>
        </div>
      </div>

      <div class="question-card">
        <span class="topic-tag">${q.topicTitle || 'DLP Unit'}</span>
        <div class="question-text">${q.questionText}</div>
        ${q.diagramSvg ? `<div class="diagram-container">${q.diagramSvg}</div>` : ''}
        
        <div id="renderer-container"></div>
        <div id="explanation-container"></div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1rem;">
        ${this.quiz.mode === 'practice' ? `<button class="btn-arcade btn-secondary" onclick="window.quizEngine.showHint()">💡 HINT / SOLUTION</button>` : '<div></div>'}
        <button id="btn-next-question" class="btn-arcade" style="display:none;" onclick="window.quizEngine.nextQuestion()">
          NEXT QUESTION ➔
        </button>
      </div>
    `;

    this.container.innerHTML = contentHtml;

    // Render specific question input type
    const renderBox = document.getElementById('renderer-container');
    if (q.questionType === 'mcq' || q.questionType === 'true_false') {
      this.renderMCQ(q, renderBox);
    } else if (q.questionType === 'numeric') {
      this.renderNumeric(q, renderBox);
    } else if (q.questionType === 'drag_drop') {
      this.renderDragDrop(q, renderBox);
    }

    this.startTimer();
  }

  renderMCQ(q, container) {
    const letters = ['A', 'B', 'C', 'D'];
    let html = `<div class="options-grid">`;
    q.options.forEach((opt, idx) => {
      html += `
        <button class="option-btn" id="opt-btn-${idx}" onclick="window.quizEngine.submitMCQAnswer(${idx})">
          <span class="option-letter">${letters[idx] || (idx + 1)}</span>
          <span>${opt.text}</span>
        </button>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  renderNumeric(q, container) {
    let html = `
      <div class="numeric-box">
        <input type="text" id="numeric-input-val" class="numeric-input" placeholder="Type answer..." readonly />
        
        <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:0.5rem; width:280px;">
          ${['1','2','3','4','5','6','7','8','9','0','.','/'].map(val => `
            <button class="btn-arcade btn-secondary" onclick="window.quizEngine.appendNumeric('${val}')">${val}</button>
          `).join('')}
        </div>

        <div style="display:flex; gap:0.5rem; width:280px;">
          <button class="btn-arcade btn-danger" style="flex:1;" onclick="window.quizEngine.clearNumeric()">CLEAR</button>
          <button class="btn-arcade btn-sains" style="flex:1;" onclick="window.quizEngine.submitNumericAnswer()">SUBMIT</button>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  renderDragDrop(q, container) {
    // Shuffle right items for matching
    const lefts = q.matchingPairs.map(p => p.left);
    const rights = [...q.matchingPairs.map(p => p.right)].sort(() => 0.5 - Math.random());

    let html = `
      <div class="drag-container">
        <div class="drag-column">
          <div style="font-weight:800; color:var(--primary-cyan); margin-bottom:0.5rem;">ITEM / TERM</div>
          ${lefts.map((leftItem, i) => `
            <div class="drag-item" id="drag-left-${i}">${leftItem}</div>
          `).join('')}
        </div>
        <div class="drag-column">
          <div style="font-weight:800; color:var(--math-yellow); margin-bottom:0.5rem;">SELECT MATCH</div>
          ${rights.map((rightItem, i) => `
            <select class="option-btn" id="match-select-${i}" style="width:100%;">
              <option value="">-- Choose matching definition --</option>
              ${rights.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          `).join('')}
        </div>
      </div>
      <div style="text-align:right; margin-top:1rem;">
        <button class="btn-arcade btn-sains" onclick="window.quizEngine.submitDragDropAnswer()">SUBMIT MATCHES</button>
      </div>
    `;
    container.innerHTML = html;
  }

  appendNumeric(val) {
    if (this.isAnswered) return;
    const inp = document.getElementById('numeric-input-val');
    if (inp) inp.value += val;
  }

  clearNumeric() {
    if (this.isAnswered) return;
    const inp = document.getElementById('numeric-input-val');
    if (inp) inp.value = '';
  }

  startTimer() {
    const display = document.getElementById('timer-display');
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      if (display) display.innerText = `${this.timeRemaining}s`;

      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        window.arcadeAudio.playTick();
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeOut();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  handleTimeOut() {
    if (this.isAnswered) return;
    this.isAnswered = true;
    window.arcadeAudio.playWrong();

    this.currentStreak = 0;
    const q = this.quiz.questions[this.currentIndex];

    this.userAnswers.push({
      questionId: q.id,
      isCorrect: false,
      timeRemaining: 0,
      timeTotal: this.timeTotal
    });

    this.showExplanation(false, `⏰ Time's up! The correct answer is: ${this.getCorrectAnswerText(q)}`);
    this.enableNextButton();
  }

  submitMCQAnswer(idx) {
    if (this.isAnswered) return;
    this.stopTimer();
    this.isAnswered = true;

    const q = this.quiz.questions[this.currentIndex];
    const selectedOpt = q.options[idx];
    const isCorrect = selectedOpt && selectedOpt.isCorrect;

    const btn = document.getElementById(`opt-btn-${idx}`);

    if (isCorrect) {
      if (btn) btn.classList.add('correct');
      window.arcadeAudio.playCorrect();
      this.currentStreak++;
      if (this.currentStreak >= 3) window.arcadeAudio.playStreak();
    } else {
      if (btn) btn.classList.add('wrong');
      window.arcadeAudio.playWrong();
      this.currentStreak = 0;

      // Highlight correct option
      q.options.forEach((opt, oIdx) => {
        if (opt.isCorrect) {
          const correctBtn = document.getElementById(`opt-btn-${oIdx}`);
          if (correctBtn) correctBtn.classList.add('correct');
        }
      });
    }

    this.userAnswers.push({
      questionId: q.id,
      isCorrect,
      timeRemaining: this.timeRemaining,
      timeTotal: this.timeTotal
    });

    this.showExplanation(isCorrect, q.explanation);
    this.enableNextButton();
  }

  submitNumericAnswer() {
    if (this.isAnswered) return;
    const inp = document.getElementById('numeric-input-val');
    if (!inp) return;
    const val = inp.value.trim();

    this.stopTimer();
    this.isAnswered = true;

    const q = this.quiz.questions[this.currentIndex];
    const correctOpt = q.options.find(o => o.isCorrect);
    const isCorrect = correctOpt && correctOpt.text.trim() === val;

    if (isCorrect) {
      inp.style.borderColor = 'var(--science-green)';
      window.arcadeAudio.playCorrect();
      this.currentStreak++;
    } else {
      inp.style.borderColor = 'var(--arcade-crimson)';
      window.arcadeAudio.playWrong();
      this.currentStreak = 0;
    }

    this.userAnswers.push({
      questionId: q.id,
      isCorrect,
      timeRemaining: this.timeRemaining,
      timeTotal: this.timeTotal
    });

    this.showExplanation(isCorrect, `${isCorrect ? 'Correct!' : 'Incorrect. Answer is ' + (correctOpt ? correctOpt.text : '')}. ${q.explanation}`);
    this.enableNextButton();
  }

  submitDragDropAnswer() {
    if (this.isAnswered) return;
    this.stopTimer();
    this.isAnswered = true;

    const q = this.quiz.questions[this.currentIndex];
    let allCorrect = true;

    q.matchingPairs.forEach((pair, idx) => {
      const sel = document.getElementById(`match-select-${idx}`);
      if (!sel || sel.value !== pair.right) {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      window.arcadeAudio.playCorrect();
      this.currentStreak++;
    } else {
      window.arcadeAudio.playWrong();
      this.currentStreak = 0;
    }

    this.userAnswers.push({
      questionId: q.id,
      isCorrect: allCorrect,
      timeRemaining: this.timeRemaining,
      timeTotal: this.timeTotal
    });

    this.showExplanation(allCorrect, q.explanation);
    this.enableNextButton();
  }

  getCorrectAnswerText(q) {
    if (q.options && q.options.length > 0) {
      const correct = q.options.find(o => o.isCorrect);
      return correct ? correct.text : 'N/A';
    }
    return 'See explanation below.';
  }

  showExplanation(isCorrect, text) {
    const container = document.getElementById('explanation-container');
    if (!container) return;

    container.innerHTML = `
      <div class="explanation-box" style="background:${isCorrect ? '#14532d' : '#7f1d1d'}; border-color:${isCorrect ? 'var(--science-green)' : 'var(--arcade-crimson)'};">
        <div class="explanation-title">${isCorrect ? '✅ PERFECT!' : '❌ NOT QUITE!'}</div>
        <div>${text}</div>
      </div>
    `;
  }

  showHint() {
    const q = this.quiz.questions[this.currentIndex];
    this.showExplanation(true, `💡 HINT: ${q.explanation}`);
  }

  enableNextButton() {
    const btn = document.getElementById('btn-next-question');
    if (btn) btn.style.display = 'inline-flex';
  }

  nextQuestion() {
    this.currentIndex++;
    this.renderQuestion();
  }

  async finishQuiz() {
    window.arcadeAudio.playFanfare();

    const studentName = window.appState ? window.appState.studentName : 'DLP Arcade Student';
    const avatarId = window.appState ? window.appState.avatarId : 'pixel_scientist';

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          avatarId,
          subjectId: this.quiz.subjectId,
          mode: this.quiz.mode,
          answers: this.userAnswers
        })
      });

      const data = await res.json();
      if (data.success) {
        window.appController.renderScorecardModal(data.result);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    }
  }
}

window.quizEngine = new DLPQuizEngine();
