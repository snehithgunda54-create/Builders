/**
 * Pandal Architect - Main Game State Machine & Loop Orchestrator
 */
import { STATES, CONSTANTS, ITEMS, LEVEL_TEMPLATES } from './config.js';
import { ItemManager } from './itemManager.js';
import { LevelManager } from './level.js';
import { BudgetManager } from './budget.js';
import { StabilityTracker } from './stability.js';
import { DecorationTracker } from './decoration.js';
import { EcoTracker } from './eco.js';
import { Renderer } from './renderer.js';
import { InputManager } from './input.js';
import { UIManager } from './ui.js';
import { StorageManager } from './storage.js';
import { AudioManager } from './audio.js';

export class Game {
  constructor() {
    this.state = STATES.MENU;
    this.lastTime = 0;
    this.accumulator = 0;
    this.selectedItemType = 'pillar_wood';
    this.difficultyKey = 'MEDIUM';
    this.transitionTimer = 0;
    this.transitionTargetState = null;
    this.gameoverReason = '';

    // Initialize subsystems
    this.itemManager = new ItemManager();
    this.levelManager = new LevelManager();
    this.budgetManager = new BudgetManager();
    this.stabilityTracker = new StabilityTracker();
    this.decorationTracker = new DecorationTracker();
    this.ecoTracker = new EcoTracker();
    this.storage = StorageManager;
    this.audio = new AudioManager();

    this.settings = this.storage.loadSettings();
    this.saveData = this.storage.loadSaveData();
    this.difficultyKey = this.settings.difficulty || 'MEDIUM';

    this.canvas = document.getElementById('game-canvas');
    this.renderer = new Renderer(this.canvas);
    this.renderer.reducedMotion = !!this.settings.reducedMotion;
    this.renderer.selectedItemType = this.selectedItemType;

    this.ui = new UIManager(this);
    this.input = new InputManager(this.canvas, this);

    this.init();
  }

  init() {
    this.ui.init();
    this.bindWindowEvents();
    this.ui.updateActiveToolbarItem(this.selectedItemType);
    this.ui.showScreen('home-screen');

    // First user gesture initializes WebAudio
    const unlockAudio = () => {
      this.audio.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Start main game animation loop
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.gameLoop(t));
  }

  bindWindowEvents() {
    // Auto-pause on tab blur or visibility change during PLAYING
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === STATES.PLAYING) {
        this.pauseGame();
      }
    });

    window.addEventListener('blur', () => {
      if (this.state === STATES.PLAYING) {
        this.pauseGame();
      }
    });
  }

  isPlaying() {
    return this.state === STATES.PLAYING;
  }

  setDifficulty(diffKey) {
    this.difficultyKey = diffKey;
    this.settings.difficulty = diffKey;
    this.levelManager.applyDifficulty(diffKey);
    this.saveSettings();
  }

  saveSettings() {
    this.storage.saveSettings(this.settings);
  }

  loadSaveData() {
    this.saveData = this.storage.loadSaveData();
  }

  selectItemType(typeId) {
    if (ITEMS[typeId]) {
      this.selectedItemType = typeId;
      this.renderer.selectedItemType = typeId;
      this.ui.updateActiveToolbarItem(typeId);
    }
  }

  selectItemBySlot(slot) {
    const item = Object.values(ITEMS).find(i => i.slot === slot);
    if (item) {
      this.selectItemType(item.id);
      this.audio.playUiClick();
    }
  }

  startLevel(levelIndex) {
    this.audio.init();
    this.storage.incrementAttempts();
    this.loadSaveData();

    const config = this.levelManager.loadLevel(levelIndex, this.difficultyKey);
    this.itemManager.reset();
    this.budgetManager.reset(config.budget);
    this.stabilityTracker.reset();
    this.decorationTracker.reset();
    this.ecoTracker.reset();

    this.recalculateStats();

    this.state = STATES.PLAYING;
    this.ui.showScreen('playing-screen');
    this.renderer.resize();
    this.ui.showNotification(`Started ${config.name}! Build your pandal.`);
  }

  restartCurrentLevel() {
    this.startLevel(this.levelManager.currentLevelIndex);
  }

  playNextLevel() {
    const nextIdx = this.levelManager.currentLevelIndex + 1;
    if (nextIdx < LEVEL_TEMPLATES.length) {
      this.startLevel(nextIdx);
    } else {
      this.ui.renderLevelSelectGrid();
      this.ui.showScreen('level-select-screen');
      this.ui.showNotification('Congratulations! You completed all levels on this difficulty!');
    }
  }

  togglePause() {
    if (this.state === STATES.PLAYING) {
      this.pauseGame();
    } else if (this.state === STATES.PAUSED) {
      this.resumeGame();
    }
  }

  pauseGame() {
    if (this.state === STATES.PLAYING) {
      this.state = STATES.PAUSED;
      this.ui.showScreen('pause-screen');
    }
  }

  resumeGame() {
    if (this.state === STATES.PAUSED) {
      this.state = STATES.PLAYING;
      this.ui.showScreen('playing-screen');
      this.lastTime = performance.now();
    }
  }

  toggleAudio() {
    this.audio.isMuted = !this.audio.isMuted;
    this.settings.sound = !this.audio.isMuted;
    this.saveSettings();
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) {
      btn.textContent = this.audio.isMuted ? '🔇' : '🔊';
    }
  }

  handleCellInteraction(row, col, isRemove) {
    if (this.state !== STATES.PLAYING) return;

    if (isRemove) {
      const removed = this.itemManager.removeItem(row, col);
      if (removed) {
        const refund = this.budgetManager.refund(removed.cost);
        this.audio.playRemoveItem();
        const pos = this.renderer.gridToScreen(row, col);
        this.renderer.addParticle(pos.x + this.renderer.cellSize / 2, pos.y + this.renderer.cellSize / 2, '#EF4444', 6);
        this.ui.showNotification(`Removed ${removed.name} (+₹${refund} refunded)`);
        this.recalculateStats();
      }
    } else {
      // Place Item
      const itemConfig = ITEMS[this.selectedItemType];
      if (!itemConfig) return;

      if (this.itemManager.getItemAt(row, col)) {
        this.audio.playInsufficientBudget();
        this.ui.showNotification('Cell is already occupied!', true);
        return;
      }

      if (!this.budgetManager.canAfford(itemConfig.cost)) {
        this.audio.playInsufficientBudget();
        this.ui.showNotification(`Insufficient budget! Needs ₹${itemConfig.cost}`, true);
        return;
      }

      this.budgetManager.spend(itemConfig.cost);
      const placed = this.itemManager.placeItem(this.selectedItemType, row, col);
      if (placed) {
        this.audio.playPlaceItem();
        const pos = this.renderer.gridToScreen(row, col);
        this.renderer.addParticle(pos.x + this.renderer.cellSize / 2, pos.y + this.renderer.cellSize / 2, '#10B981', 8);
        this.recalculateStats();
      }
    }
  }

  recalculateStats() {
    const placed = this.itemManager.getPlacedItems();
    const totalHazardDamage = this.levelManager.rainPenalty + this.levelManager.windPenalty;
    const stability = this.stabilityTracker.calculate(placed, totalHazardDamage);
    const decoration = this.decorationTracker.calculate(placed, this.levelManager.crowdPenalty);
    const eco = this.ecoTracker.calculate(placed);

    let crowdSafety = 0;
    for (const item of placed) {
      crowdSafety += item.crowdSafety || 0;
    }

    return { stability, decoration, eco, crowdSafety };
  }

  finishLevel() {
    if (this.state !== STATES.PLAYING) return;

    const stats = this.recalculateStats();
    const config = this.levelManager.activeConfig;

    if (!this.levelManager.isTargetsMet(stats.stability, stats.decoration, stats.crowdSafety)) {
      this.audio.playInsufficientBudget();
      this.ui.showNotification('Targets not yet met! Increase stability and decoration before finishing.', true);
      return;
    }

    const result = this.levelManager.calculateScore(
      stats.stability,
      stats.decoration,
      stats.crowdSafety,
      stats.eco,
      this.itemManager.removalsCount
    );

    // Record result in local storage
    const { newAchievements } = this.storage.recordLevelResult(
      this.difficultyKey,
      this.levelManager.currentLevelIndex,
      result.stars,
      result.finalScore
    );
    this.loadSaveData();

    // Show Level Complete Screen
    this.state = STATES.LEVEL_COMPLETE;
    this.audio.playLevelComplete();

    // Burst celebratory festive confetti sparks
    for (let i = 0; i < 5; i++) {
      const rx = Math.random() * this.renderer.width;
      const ry = Math.random() * (this.renderer.height * 0.6);
      this.renderer.addParticle(rx, ry, ['#F59E0B', '#FBBF24', '#EC4899', '#10B981'][i % 4], 12);
    }

    const titleEl = document.getElementById('complete-title');
    const scoreEl = document.getElementById('complete-score');
    const starsEl = document.getElementById('complete-stars');
    const ecoEl = document.getElementById('complete-eco-bonus');
    const removalsEl = document.getElementById('complete-removals');

    if (titleEl) titleEl.textContent = `${config.name} Cleared!`;
    if (scoreEl) scoreEl.textContent = `${result.finalScore} pts`;
    if (starsEl) starsEl.textContent = `${'★'.repeat(result.stars)}${'☆'.repeat(3 - result.stars)}`;
    if (ecoEl) ecoEl.textContent = result.ecoBonusEarned ? `+${result.ecoBonus} pts (Threshold reached)` : 'No bonus';
    if (removalsEl) removalsEl.textContent = `${result.removalsCount} items`;

    if (newAchievements && newAchievements.length > 0) {
      setTimeout(() => {
        this.ui.showNotification(`🏆 Achievement Unlocked: ${newAchievements[0].name}!`);
      }, 700);
    }

    this.ui.showScreen('level-complete-screen');
  }

  triggerGameOver(reason) {
    this.gameoverReason = reason;
    this.transitionTargetState = STATES.GAME_OVER;
    this.transitionTimer = CONSTANTS.HIT_PAUSE_DURATION / 1000;
    this.state = STATES.TRANSITION;

    this.audio.playCollapse();
    this.renderer.triggerShake(14, 0.35);

    const titleEl = document.getElementById('gameover-reason');
    const lvlEl = document.getElementById('gameover-level');
    const attemptsEl = document.getElementById('gameover-attempts');

    if (titleEl) titleEl.textContent = reason;
    if (lvlEl) lvlEl.textContent = this.levelManager.activeConfig ? this.levelManager.activeConfig.name : 'Level';
    if (attemptsEl) attemptsEl.textContent = `${this.saveData.attempts || 1}`;
  }

  update(dt) {
    if (this.state === STATES.TRANSITION) {
      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        this.state = this.transitionTargetState || STATES.GAME_OVER;
        if (this.state === STATES.GAME_OVER) {
          this.ui.showScreen('gameover-screen');
        }
      }
      return;
    }

    if (this.state !== STATES.PLAYING) return;

    // Update level hazards & timer
    this.levelManager.update(dt, this.itemManager);
    const stats = this.recalculateStats();

    // Check for collapse
    if (this.stabilityTracker.hasCollapsed) {
      this.triggerGameOver('Structural Collapse! Stability reached 0.');
      return;
    }

    // Check for time up
    if (this.levelManager.remainingTime <= 0) {
      if (this.levelManager.isTargetsMet(stats.stability, stats.decoration, stats.crowdSafety)) {
        this.finishLevel();
      } else {
        this.triggerGameOver('Time Expired! Targets were not achieved in time.');
      }
      return;
    }

    // Update HUD
    const config = this.levelManager.activeConfig;
    this.ui.updateHUD({
      budget: this.budgetManager.currentBudget,
      time: this.levelManager.remainingTime,
      stability: stats.stability,
      targetStability: config ? config.targetStability : 60,
      decoration: stats.decoration,
      targetDecoration: config ? config.targetDecoration : 50,
      eco: stats.eco,
      ecoThreshold: config ? config.ecoBonusThreshold : 5,
      crowdSafety: stats.crowdSafety,
      targetCrowdSafety: config ? config.targetCrowdSafety : 0,
      levelName: config ? config.name : 'Level 1',
      difficulty: this.difficultyKey
    });
  }

  gameLoop(currentTime) {
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.1); // Capped at 0.1s to prevent spiral

    this.accumulator += dt;
    while (this.accumulator >= CONSTANTS.TICK_DT) {
      this.update(CONSTANTS.TICK_DT);
      this.accumulator -= CONSTANTS.TICK_DT;
    }

    // Render Canvas if in playing, transition or paused
    if (this.state === STATES.PLAYING || this.state === STATES.TRANSITION || this.state === STATES.PAUSED) {
      this.renderer.render(
        dt,
        this.itemManager,
        this.levelManager,
        this.stabilityTracker,
        this.decorationTracker,
        this.ecoTracker
      );
    }

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Bootstrap on DOM loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new Game();
});
