/**
 * Pandal Architect - UI Controller & Screen Transition Manager
 */
import { ITEMS, STATES, LEVEL_TEMPLATES } from './config.js';

export class UIManager {
  constructor(game) {
    this.game = game;
    this.activeScreen = 'home-screen';
    this.notificationTimer = null;
  }

  init() {
    this.bindButtons();
    this.renderToolbar();
  }

  showScreen(screenId) {
    document.querySelectorAll('.screen-container').forEach(el => {
      el.classList.add('hidden');
      el.setAttribute('aria-hidden', 'true');
    });

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.remove('hidden');
      target.setAttribute('aria-hidden', 'false');
      this.activeScreen = screenId;
      if (screenId === 'playing-screen' && this.game.renderer) {
        requestAnimationFrame(() => this.game.renderer.resize());
      }
    }
  }

  bindButtons() {
    // Home Screen buttons
    document.getElementById('btn-play')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.startLevel(0);
    });

    document.getElementById('btn-level-select')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.renderLevelSelectGrid();
      this.showScreen('level-select-screen');
    });

    document.getElementById('btn-settings')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.populateSettingsForm();
      this.showScreen('settings-screen');
    });

    document.getElementById('btn-statistics')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.renderStatistics();
      this.showScreen('statistics-screen');
    });

    document.getElementById('btn-help')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.showScreen('help-screen');
    });

    // Difficulty Segmented Control
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.game.audio.playUiClick();
        const diff = e.target.dataset.diff;
        this.game.setDifficulty(diff);
        document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
      });
    });

    // In-game HUD buttons
    document.getElementById('btn-pause')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.togglePause();
    });

    document.getElementById('btn-finish')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.finishLevel();
    });

    document.getElementById('btn-sound-toggle')?.addEventListener('click', () => {
      this.game.toggleAudio();
    });

    // Pause Screen buttons
    document.getElementById('btn-resume')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.togglePause();
    });

    document.getElementById('btn-restart-level')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.restartCurrentLevel();
    });

    document.getElementById('btn-pause-level-select')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.renderLevelSelectGrid();
      this.showScreen('level-select-screen');
    });

    document.getElementById('btn-pause-home')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.showScreen('home-screen');
    });

    // Game Over buttons
    document.getElementById('btn-gameover-retry')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.restartCurrentLevel();
    });

    document.getElementById('btn-gameover-level-select')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.renderLevelSelectGrid();
      this.showScreen('level-select-screen');
    });

    document.getElementById('btn-gameover-home')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.showScreen('home-screen');
    });

    // Level Complete buttons
    document.getElementById('btn-complete-next')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.playNextLevel();
    });

    document.getElementById('btn-complete-retry')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.game.restartCurrentLevel();
    });

    document.getElementById('btn-complete-level-select')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.renderLevelSelectGrid();
      this.showScreen('level-select-screen');
    });

    document.getElementById('btn-complete-home')?.addEventListener('click', () => {
      this.game.audio.playUiClick();
      this.showScreen('home-screen');
    });

    // Back to Home standard buttons
    document.querySelectorAll('.btn-back-home').forEach(btn => {
      btn.addEventListener('click', () => {
        this.game.audio.playUiClick();
        this.showScreen('home-screen');
      });
    });

    // Settings controls bindings
    document.getElementById('setting-sound')?.addEventListener('change', (e) => {
      this.game.settings.sound = e.target.checked;
      this.game.audio.isMuted = !e.target.checked;
      this.game.saveSettings();
    });

    document.getElementById('setting-music')?.addEventListener('change', (e) => {
      this.game.settings.music = e.target.checked;
      this.game.audio.musicEnabled = e.target.checked;
      this.game.saveSettings();
    });

    document.getElementById('setting-volume')?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      this.game.settings.volume = vol;
      this.game.audio.volume = vol;
      this.game.saveSettings();
    });

    document.getElementById('setting-reduced-motion')?.addEventListener('change', (e) => {
      this.game.settings.reducedMotion = e.target.checked;
      if (this.game.renderer) {
        this.game.renderer.reducedMotion = e.target.checked;
      }
      this.game.saveSettings();
    });

    document.getElementById('btn-reset-stats')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all records and statistics?')) {
        localStorage.removeItem('pandal_architect_save');
        this.game.loadSaveData();
        this.renderStatistics();
        this.showNotification('All records reset successfully!');
      }
    });
  }

  renderToolbar() {
    const container = document.getElementById('toolbar-items');
    if (!container) return;
    container.innerHTML = '';

    Object.values(ITEMS).forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'toolbar-item-btn';
      btn.dataset.type = item.id;
      btn.setAttribute('aria-label', `${item.name} cost ₹${item.cost}`);
      btn.innerHTML = `
        <span class="item-slot-badge">${item.slot}</span>
        <span class="item-name">${item.name}</span>
        <span class="item-cost">₹${item.cost}</span>
      `;
      btn.addEventListener('click', () => {
        this.game.audio.playUiClick();
        this.game.selectItemType(item.id);
      });
      container.appendChild(btn);
    });
  }

  updateActiveToolbarItem(typeId) {
    document.querySelectorAll('.toolbar-item-btn').forEach(btn => {
      if (btn.dataset.type === typeId) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    });
  }

  renderLevelSelectGrid() {
    const grid = document.getElementById('level-select-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const saveData = this.game.saveData;
    const diff = this.game.difficultyKey || 'MEDIUM';
    const levelRecords = (saveData.bestByDifficulty && saveData.bestByDifficulty[diff]) || [];
    const highest = saveData.highestLevel || 1;

    LEVEL_TEMPLATES.forEach((tmpl, idx) => {
      const isLocked = (idx + 1) > highest;
      const rec = levelRecords[idx] || { stars: 0, score: 0 };

      const card = document.createElement('div');
      card.className = `level-card ${isLocked ? 'locked' : 'unlocked'}`;
      card.innerHTML = `
        <div class="level-card-header">
          <span class="level-number">Level ${tmpl.level}</span>
          ${isLocked ? '<span class="lock-icon">🔒</span>' : `<span class="star-rating">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</span>`}
        </div>
        <h3 class="level-title">${tmpl.name}</h3>
        <p class="level-subtitle">${tmpl.subtitle}</p>
        <div class="level-targets-brief">
          <span>Stab: ≥${tmpl.targetStability}</span>
          <span>Dec: ≥${tmpl.targetDecoration}</span>
        </div>
        ${!isLocked ? `<button class="btn btn-primary btn-sm btn-play-level" data-level="${idx}">Play</button>` : '<span class="locked-text">Locked</span>'}
      `;

      if (!isLocked) {
        card.querySelector('.btn-play-level')?.addEventListener('click', () => {
          this.game.audio.playUiClick();
          this.game.startLevel(idx);
        });
      }

      grid.appendChild(card);
    });
  }

  renderStatistics() {
    const container = document.getElementById('stats-content');
    if (!container) return;
    const data = this.game.saveData;

    let html = `
      <div class="stats-summary-grid">
        <div class="stat-box">
          <span class="stat-number">${data.attempts || 0}</span>
          <span class="stat-title">Total Attempts</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${data.levelsCompleted || 0}</span>
          <span class="stat-title">Levels Cleared</span>
        </div>
        <div class="stat-box">
          <span class="stat-number">${data.highestLevel || 1}</span>
          <span class="stat-title">Max Level Reached</span>
        </div>
      </div>
      <h3 class="stats-subheading">Best Scores by Difficulty</h3>
      <div class="stats-table-wrapper">
        <table class="stats-table">
          <thead>
            <tr>
              <th>Difficulty</th>
              <th>L1</th>
              <th>L2</th>
              <th>L3</th>
              <th>L4</th>
              <th>L5</th>
            </tr>
          </thead>
          <tbody>
    `;

    ['EASY', 'MEDIUM', 'HARD'].forEach(d => {
      const records = (data.bestByDifficulty && data.bestByDifficulty[d]) || [];
      html += `<tr><td class="diff-tag">${d}</td>`;
      for (let i = 0; i < 5; i++) {
        const r = records[i] || { stars: 0, score: 0 };
        html += `<td>${r.stars > 0 ? `${r.stars}★ (${r.score})` : '—'}</td>`;
      }
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
  }

  populateSettingsForm() {
    const s = this.game.settings;
    const soundEl = document.getElementById('setting-sound');
    const musicEl = document.getElementById('setting-music');
    const volEl = document.getElementById('setting-volume');
    const redMotionEl = document.getElementById('setting-reduced-motion');

    if (soundEl) soundEl.checked = !!s.sound;
    if (musicEl) musicEl.checked = !!s.music;
    if (volEl) volEl.value = s.volume !== undefined ? s.volume : 0.7;
    if (redMotionEl) redMotionEl.checked = !!s.reducedMotion;
  }

  updateHUD(state) {
    const { budget, time, stability, targetStability, decoration, targetDecoration, eco, ecoThreshold, crowdSafety, targetCrowdSafety, levelName, difficulty } = state;

    const elBudget = document.getElementById('hud-budget');
    const elTime = document.getElementById('hud-time');
    const elStabVal = document.getElementById('hud-stab-val');
    const elStabBar = document.getElementById('hud-stab-bar');
    const elDecVal = document.getElementById('hud-dec-val');
    const elDecBar = document.getElementById('hud-dec-bar');
    const elEcoVal = document.getElementById('hud-eco-val');
    const elCrowdContainer = document.getElementById('hud-crowd-container');
    const elCrowdVal = document.getElementById('hud-crowd-val');
    const elCrowdBar = document.getElementById('hud-crowd-bar');
    const elLvlName = document.getElementById('hud-level-name');
    const elDiff = document.getElementById('hud-difficulty-badge');

    if (elBudget) elBudget.textContent = `₹${budget}`;
    if (elTime) elTime.textContent = `${Math.ceil(time)}s`;

    if (elStabVal) elStabVal.textContent = `${Math.round(stability)} / ${targetStability}`;
    if (elStabBar) elStabBar.style.width = `${Math.min(100, Math.round(stability))}%`;

    if (elDecVal) elDecVal.textContent = `${Math.round(decoration)} / ${targetDecoration}`;
    if (elDecBar) elDecBar.style.width = `${Math.min(100, Math.round(decoration))}%`;

    if (elEcoVal) {
      elEcoVal.textContent = eco >= 0 ? `+${eco}` : `${eco}`;
      elEcoVal.className = eco >= ecoThreshold ? 'eco-positive-bonus' : (eco < 0 ? 'eco-negative' : 'eco-neutral');
    }

    if (elCrowdContainer) {
      if (targetCrowdSafety > 0) {
        elCrowdContainer.classList.remove('hidden');
        if (elCrowdVal) elCrowdVal.textContent = `${Math.round(crowdSafety)} / ${targetCrowdSafety}`;
        if (elCrowdBar) elCrowdBar.style.width = `${Math.min(100, Math.round(crowdSafety))}%`;
      } else {
        elCrowdContainer.classList.add('hidden');
      }
    }

    if (elLvlName) elLvlName.textContent = levelName;
    if (elDiff) elDiff.textContent = difficulty;
  }

  showNotification(text, isError = false) {
    let notif = document.getElementById('hud-notification');
    if (!notif) return;
    notif.textContent = text;
    notif.className = `notification-toast ${isError ? 'error' : 'info'} active`;

    if (this.notificationTimer) clearTimeout(this.notificationTimer);
    this.notificationTimer = setTimeout(() => {
      notif.classList.remove('active');
    }, 2400);
  }
}
