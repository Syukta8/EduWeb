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
        <div class="numeric-input-wrapper">
          <input 
            type="text" 
            id="numeric-input-val" 
            class="numeric-input" 
            placeholder="Type or use keypad..." 
            inputmode="decimal" 
            autocomplete="off" 
            onkeydown="if(event.key==='Enter') window.quizEngine.submitNumericAnswer()" 
          />
        </div>
        
        <div class="numeric-keypad-grid">
          ${['1','2','3','4','5','6','7','8','9','0','.','/'].map(val => `
            <button class="btn-arcade btn-secondary keypad-btn" onclick="window.quizEngine.appendNumeric('${val}')">${val}</button>
          `).join('')}
        </div>

        <div class="numeric-actions">
          <button class="btn-arcade btn-danger" style="flex:1;" onclick="window.quizEngine.clearNumeric()">CLEAR</button>
          <button class="btn-arcade btn-sains" style="flex:1.5;" onclick="window.quizEngine.submitNumericAnswer()">SUBMIT ➔</button>
        </div>
      </div>
    `;
    container.innerHTML = html;
  }

  renderDragDrop(q, container) {
    const lefts = q.matchingPairs.map(p => p.left);
    // Shuffle right items for matching
    const rights = [...q.matchingPairs.map(p => p.right)].sort(() => 0.5 - Math.random());
    this.currentMatches = {}; // leftIndex -> rightText
    this.selectedLeftIndex = null;
    this.matchingLefts = lefts;
    this.matchingRights = rights;

    let html = `
      <div class="match-help-banner">
        💡 <strong>Tap to Match:</strong> Tap an item on the left, then tap its matching definition on the right (or use the dropdown selectors).
      </div>

      <div class="drag-container">
        <div class="drag-column" id="match-col-left">
          <div class="match-col-header" style="color:var(--primary-cyan);">📋 ITEM / TERM</div>
          ${lefts.map((leftItem, i) => `
            <div class="drag-item" id="drag-left-${i}" onclick="window.quizEngine.selectLeftMatchItem(${i})">
              <div class="drag-item-content">
                <span class="drag-item-num">${i + 1}</span>
                <span class="drag-item-text">${leftItem}</span>
              </div>
              <div class="drag-item-badge" id="match-badge-${i}">Tap to select</div>
            </div>
          `).join('')}
        </div>

        <div class="drag-column" id="match-col-right">
          <div class="match-col-header" style="color:var(--math-yellow);">🎯 DEFINITION / MATCH</div>
          ${rights.map((rightItem, rIdx) => `
            <div class="match-target-card" id="match-right-card-${rIdx}" onclick="window.quizEngine.selectRightMatchItem(${rIdx})">
              <div class="match-target-text">${rightItem}</div>
              <div class="match-select-wrapper" onclick="event.stopPropagation()">
                <select class="option-btn match-select" id="match-select-${rIdx}" onchange="window.quizEngine.onSelectMatchChange(${rIdx}, this.value)">
                  <option value="">-- Match with Item --</option>
                  ${lefts.map((l, lIdx) => `<option value="${lIdx}">Item ${lIdx + 1}: ${l}</option>`).join('')}
                </select>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="display:flex; justify-content:flex-end; margin-top:1.5rem;">
        <button class="btn-arcade btn-sains" onclick="window.quizEngine.submitDragDropAnswer()">SUBMIT ALL MATCHES ➔</button>
      </div>
    `;
    container.innerHTML = html;
  }

  selectLeftMatchItem(leftIndex) {
    if (this.isAnswered) return;
    this.selectedLeftIndex = leftIndex;

    // Update active highlight on left items
    this.matchingLefts.forEach((_, i) => {
      const el = document.getElementById(`drag-left-${i}`);
      if (el) {
        if (i === leftIndex) {
          el.classList.add('tap-selected');
        } else {
          el.classList.remove('tap-selected');
        }
      }
    });

    if (window.arcadeAudio) window.arcadeAudio.playTick();
  }

  selectRightMatchItem(rightIndex) {
    if (this.isAnswered) return;
    if (this.selectedLeftIndex === null) return;

    const leftIdx = this.selectedLeftIndex;
    const rightText = this.matchingRights[rightIndex];

    this.currentMatches[leftIdx] = rightText;

    // Update badge on left item
    const badge = document.getElementById(`match-badge-${leftIdx}`);
    if (badge) {
      badge.innerText = `✓ Matched`;
      badge.classList.add('badge-paired');
    }

    // Sync corresponding select dropdown
    const selectEl = document.getElementById(`match-select-${rightIndex}`);
    if (selectEl) {
      selectEl.value = String(leftIdx);
    }

    // Unselect left item
    const leftEl = document.getElementById(`drag-left-${leftIdx}`);
    if (leftEl) leftEl.classList.remove('tap-selected');
    this.selectedLeftIndex = null;

    if (window.arcadeAudio) window.arcadeAudio.playTick();
  }

  onSelectMatchChange(rightIndex, leftIndexVal) {
    if (this.isAnswered) return;
    if (leftIndexVal === '') return;

    const leftIdx = parseInt(leftIndexVal, 10);
    const rightText = this.matchingRights[rightIndex];
    this.currentMatches[leftIdx] = rightText;

    const badge = document.getElementById(`match-badge-${leftIdx}`);
    if (badge) {
      badge.innerText = `✓ Matched`;
      badge.classList.add('badge-paired');
    }
  }

  appendNumeric(val) {
    if (this.isAnswered) return;
    const inp = document.getElementById('numeric-input-val');
    if (inp) {
      inp.value += val;
      inp.focus();
    }
  }

  clearNumeric() {
    if (this.isAnswered) return;
    const inp = document.getElementById('numeric-input-val');
    if (inp) {
      inp.value = '';
      inp.focus();
    }
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
    if (!val) return;

    this.stopTimer();
    this.isAnswered = true;

    const q = this.quiz.questions[this.currentIndex];
    const correctOpt = q.options.find(o => o.isCorrect);
    const correctText = correctOpt ? correctOpt.text.trim() : '';

    // Compare as string or as numeric value
    let isCorrect = false;
    if (val.toLowerCase() === correctText.toLowerCase()) {
      isCorrect = true;
    } else if (!isNaN(parseFloat(val)) && !isNaN(parseFloat(correctText))) {
      isCorrect = Math.abs(parseFloat(val) - parseFloat(correctText)) < 0.0001;
    }

    if (isCorrect) {
      inp.style.borderColor = 'var(--science-green)';
      inp.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.6)';
      window.arcadeAudio.playCorrect();
      this.currentStreak++;
    } else {
      inp.style.borderColor = 'var(--arcade-crimson)';
      inp.style.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
      window.arcadeAudio.playWrong();
      this.currentStreak = 0;
    }

    this.userAnswers.push({
      questionId: q.id,
      isCorrect,
      timeRemaining: this.timeRemaining,
      timeTotal: this.timeTotal
    });

    this.showExplanation(isCorrect, `${isCorrect ? '✅ Spot on!' : '❌ Incorrect. Correct answer: ' + (correctOpt ? correctOpt.text : '')}. ${q.explanation}`);
    this.enableNextButton();
  }

  submitDragDropAnswer() {
    if (this.isAnswered) return;
    this.stopTimer();
    this.isAnswered = true;

    const q = this.quiz.questions[this.currentIndex];
    let allCorrect = true;

    // Check matches either from currentMatches or dropdown values
    q.matchingPairs.forEach((pair, leftIdx) => {
      const matchedRight = this.currentMatches[leftIdx];
      // Check if dropdown selected it
      let dropdownRight = null;
      this.matchingRights.forEach((r, rIdx) => {
        const sel = document.getElementById(`match-select-${rIdx}`);
        if (sel && sel.value === String(leftIdx)) {
          dropdownRight = r;
        }
      });

      const actualAnswer = matchedRight || dropdownRight;
      const isPairCorrect = actualAnswer === pair.right;

      const leftCard = document.getElementById(`drag-left-${leftIdx}`);
      if (leftCard) {
        if (isPairCorrect) {
          leftCard.classList.add('correct');
        } else {
          leftCard.classList.add('wrong');
          allCorrect = false;
        }
      } else if (!isPairCorrect) {
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
      let result = null;
      if (window.dlpDataService) {
        result = window.dlpDataService.submitQuizResult({
          studentName,
          avatarId,
          subjectId: this.quiz.subjectId,
          mode: this.quiz.mode,
          answers: this.userAnswers
        });
      } else {
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
        if (data.success) result = data.result;
      }

      if (result) {
        window.appController.renderScorecardModal(result);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
    }
  }
}

window.quizEngine = new DLPQuizEngine();
