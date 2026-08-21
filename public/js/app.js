/**
 * @file app.js
 * App Controller and SPA Router for Year 6 Sains DLP & Matematik DLP.
 */

const AVATAR_LIST = [
  { id: 'pixel_scientist', name: 'Pixel Scientist 🔬', icon: '🔬' },
  { id: 'math_ninja', name: 'Math Ninja 🥷', icon: '🥷' },
  { id: 'astro_explorer', name: 'Astro DLP Explorer 🚀', icon: '🚀' },
  { id: 'cyber_bot', name: 'Cyber Bot 🤖', icon: '🤖' },
  { id: 'lab_dynamo', name: 'Lab Dynamo ⚡', icon: '⚡' },
  { id: 'logic_wizard', name: 'Logic Wizard 🧙‍♂️', icon: '🧙‍♂️' }
];

class DLPAppController {
  constructor() {
    this.studentName = localStorage.getItem('dlp_student_name') || 'DLP Arcade Student';
    this.avatarId = localStorage.getItem('dlp_avatar_id') || 'pixel_scientist';

    this.currentSubject = 'sains';
    this.selectedTopics = [];
    this.selectedMode = 'practice';
  }

  init() {
    window.appState = { studentName: this.studentName, avatarId: this.avatarId };
    this.updateStudentHeader();
    this.showView('dashboard-view');
  }

  updateStudentHeader() {
    const avatarObj = AVATAR_LIST.find(a => a.id === this.avatarId) || AVATAR_LIST[0];
    const avatarElem = document.getElementById('hdr-student-avatar');
    const nameElem = document.getElementById('hdr-student-name');

    if (avatarElem) avatarElem.innerText = avatarObj.icon;
    if (nameElem) nameElem.innerText = this.studentName;
  }

  showView(viewId) {
    document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
    const target = document.getElementById(viewId);
    if (target) target.classList.add('active');
  }

  openSubjectPortal(subjectId) {
    this.currentSubject = subjectId;
    this.showView('subject-portal-view');
    this.loadTopics(subjectId);
  }

  async loadTopics(subjectId) {
    const titleElem = document.getElementById('portal-subject-title');
    const topicListElem = document.getElementById('topic-checkbox-list');

    if (titleElem) {
      titleElem.innerText = subjectId === 'sains' ? '🔬 Sains DLP Unit Selection' : '🧮 Matematik DLP Unit Selection';
    }

    try {
      let topics = [];
      if (window.dlpDataService) {
        topics = await window.dlpDataService.getTopics(subjectId);
      } else {
        const res = await fetch(`/api/topics?subject=${subjectId}`);
        const data = await res.json();
        topics = data.topics || [];
      }

      if (topicListElem) {
        let html = '';
        topics.forEach(t => {
          html += `
            <label class="topic-item">
              <input type="checkbox" value="${t.id}" checked class="topic-chk" />
              <span><strong>${t.title}</strong> (${t.questionCount} Qs)</span>
            </label>
          `;
        });
        topicListElem.innerHTML = html;
      }
    } catch (err) {
      console.error('Error loading topics:', err);
    }
  }

  toggleSelectAllTopics(selectAll) {
    document.querySelectorAll('.topic-chk').forEach(chk => chk.checked = selectAll);
  }

  selectMode(mode) {
    this.selectedMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    const btn = document.getElementById(`mode-btn-${mode}`);
    if (btn) btn.classList.add('active');
  }

  async launchQuiz() {
    const selectedTopicIds = [];
    document.querySelectorAll('.topic-chk:checked').forEach(chk => selectedTopicIds.push(chk.value));

    const qCount = parseInt(document.getElementById('quiz-qcount-val').value, 10) || 5;
    const timeLimit = parseInt(document.getElementById('quiz-timer-val').value, 10) || 20;

    try {
      let quiz = null;
      if (window.dlpDataService) {
        quiz = await window.dlpDataService.generateQuiz(
          this.currentSubject,
          selectedTopicIds,
          qCount,
          this.selectedMode
        );
      } else {
        const res = await fetch('/api/quiz/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subjectId: this.currentSubject,
            topicIds: selectedTopicIds,
            questionCount: qCount,
            mode: this.selectedMode
          })
        });
        const data = await res.json();
        if (data.success) quiz = data.quiz;
      }

      if (quiz && quiz.questions && quiz.questions.length > 0) {
        this.showView('quiz-arena-view');
        window.quizEngine.startQuiz(quiz, timeLimit);
      } else {
        alert('No questions found for the selected units. Please select at least one unit!');
      }
    } catch (err) {
      console.error('Error launching quiz:', err);
    }
  }

  openAvatarModal() {
    const grid = document.getElementById('avatar-grid-list');
    const modal = document.getElementById('avatar-modal');
    if (!grid || !modal) return;

    let html = '';
    AVATAR_LIST.forEach(av => {
      const isSel = av.id === this.avatarId ? 'selected' : '';
      html += `
        <div class="avatar-card ${isSel}" onclick="window.appController.selectAvatar('${av.id}')">
          <div class="avatar-icon">${av.icon}</div>
          <div class="avatar-name">${av.name}</div>
        </div>
      `;
    });

    grid.innerHTML = html;
    modal.classList.add('active');
  }

  selectAvatar(avId) {
    this.avatarId = avId;
    localStorage.setItem('dlp_avatar_id', avId);
    window.appState.avatarId = avId;
    this.updateStudentHeader();

    const nameInput = document.getElementById('student-name-input');
    if (nameInput && nameInput.value.trim()) {
      this.studentName = nameInput.value.trim();
      localStorage.setItem('dlp_student_name', this.studentName);
      window.appState.studentName = this.studentName;
      this.updateStudentHeader();
    }

    this.closeModal('avatar-modal');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  async openLeaderboardModal(subjectId = null) {
    const modal = document.getElementById('leaderboard-modal');
    const listElem = document.getElementById('leaderboard-list-body');
    if (!modal || !listElem) return;

    try {
      let leaderboard = [];
      if (window.dlpDataService) {
        leaderboard = window.dlpDataService.getLeaderboard(subjectId);
      } else {
        const url = subjectId ? `/api/leaderboard?subject=${subjectId}` : '/api/leaderboard';
        const res = await fetch(url);
        const data = await res.json();
        if (data.success) leaderboard = data.leaderboard;
      }

      let html = '';
      leaderboard.forEach((lb, idx) => {
        const avObj = AVATAR_LIST.find(a => a.id === lb.avatar_id) || AVATAR_LIST[0];
        html += `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#0f172a; padding:0.8rem; border-radius:8px; margin-bottom:0.5rem; border:1px solid #334155;">
            <div style="display:flex; align-items:center; gap:0.8rem;">
              <span style="font-family:var(--font-pixel); color:var(--math-yellow);">#${idx + 1}</span>
              <span style="font-size:1.5rem;">${avObj.icon}</span>
              <div>
                <div style="font-weight:800;">${lb.student_name}</div>
                <div style="font-size:0.75rem; color:var(--text-muted);">${lb.subject_id === 'sains' ? '🔬 Sains DLP' : '🧮 Math DLP'} | ${lb.speed_rating}</div>
              </div>
            </div>
            <div style="font-family:var(--font-pixel); color:var(--primary-cyan); font-size:1.1rem;">
              ${lb.score} PTS
            </div>
          </div>
        `;
      });

      listElem.innerHTML = html || '<div style="text-align:center;">No high scores yet!</div>';
      modal.classList.add('active');
    } catch (err) {
      console.error('Leaderboard error:', err);
    }
  }

  renderScorecardModal(result) {
    const modal = document.getElementById('scorecard-modal');
    const container = document.getElementById('scorecard-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="scorecard-header">
        <div style="font-size:3rem;">${result.rankInfo.badge}</div>
        <div class="score-rank-title">${result.rankInfo.title}</div>
        <div class="score-big">${result.totalScore} PTS</div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-val" style="color:var(--science-green);">${result.accuracyPct}%</div>
          <div class="stat-lbl">ACCURACY</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--math-yellow);">${result.correctCount} / ${result.totalQuestions}</div>
          <div class="stat-lbl">CORRECT</div>
        </div>
        <div class="stat-card">
          <div class="stat-val" style="color:var(--primary-cyan);">${result.speedRating.split(' ')[0]} ${result.avgTimeSeconds}s</div>
          <div class="stat-lbl">AVG SPEED</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:1.5rem;">
        <button class="btn-arcade btn-sains" onclick="window.appController.closeModal('scorecard-modal'); window.appController.showView('dashboard-view');">
          🏠 BACK TO DASHBOARD
        </button>
      </div>
    `;

    modal.classList.add('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.appController = new DLPAppController();
  window.appController.init();
});
