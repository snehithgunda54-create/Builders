/**
 * Pandal Architect - Local Storage & Data Validation
 */
const SAVE_KEY = 'pandal_architect_save';
const SETTINGS_KEY = 'pandal_architect_settings';

export class StorageManager {
  static getDefaultSettings() {
    return {
      difficulty: 'MEDIUM',
      sound: true,
      music: true,
      volume: 0.7,
      reducedMotion: false
    };
  }

  static getDefaultSaveData() {
    return {
      version: 2,
      attempts: 0,
      levelsCompleted: 0,
      highestLevel: 1,
      bestByDifficulty: {
        EASY: Array.from({ length: 5 }, () => ({ stars: 0, score: 0, completed: false })),
        MEDIUM: Array.from({ length: 5 }, () => ({ stars: 0, score: 0, completed: false })),
        HARD: Array.from({ length: 5 }, () => ({ stars: 0, score: 0, completed: false }))
      },
      achievements: []
    };
  }

  static loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return this.getDefaultSettings();
      const parsed = JSON.parse(raw);
      const defaults = this.getDefaultSettings();
      return {
        difficulty: ['EASY', 'MEDIUM', 'HARD'].includes(parsed.difficulty) ? parsed.difficulty : defaults.difficulty,
        sound: typeof parsed.sound === 'boolean' ? parsed.sound : defaults.sound,
        music: typeof parsed.music === 'boolean' ? parsed.music : defaults.music,
        volume: typeof parsed.volume === 'number' && parsed.volume >= 0 && parsed.volume <= 1 ? parsed.volume : defaults.volume,
        reducedMotion: typeof parsed.reducedMotion === 'boolean' ? parsed.reducedMotion : defaults.reducedMotion
      };
    } catch (e) {
      console.warn('Failed to parse settings, using defaults', e);
      return this.getDefaultSettings();
    }
  }

  static saveSettings(settings) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings', e);
    }
  }

  static loadSaveData() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return this.getDefaultSaveData();
      const parsed = JSON.parse(raw);
      const data = this.getDefaultSaveData();

      // Legacy format migration
      if (parsed.levels && !parsed.bestByDifficulty) {
        data.bestByDifficulty.MEDIUM = parsed.levels.map(lvl => ({
          stars: typeof lvl.stars === 'number' ? Math.max(0, Math.min(3, lvl.stars)) : 0,
          score: typeof lvl.score === 'number' ? Math.max(0, lvl.score) : 0,
          completed: !!lvl.completed
        }));
      } else if (parsed.bestByDifficulty) {
        ['EASY', 'MEDIUM', 'HARD'].forEach(diff => {
          if (Array.isArray(parsed.bestByDifficulty[diff])) {
            data.bestByDifficulty[diff] = parsed.bestByDifficulty[diff].slice(0, 5).map(lvl => ({
              stars: typeof lvl.stars === 'number' ? Math.max(0, Math.min(3, lvl.stars)) : 0,
              score: typeof lvl.score === 'number' ? Math.max(0, lvl.score) : 0,
              completed: !!lvl.completed
            }));
            while (data.bestByDifficulty[diff].length < 5) {
              data.bestByDifficulty[diff].push({ stars: 0, score: 0, completed: false });
            }
          }
        });
      }

      data.attempts = typeof parsed.attempts === 'number' && Number.isFinite(parsed.attempts) ? Math.max(0, parsed.attempts) : 0;
      data.levelsCompleted = typeof parsed.levelsCompleted === 'number' && Number.isFinite(parsed.levelsCompleted) ? Math.max(0, parsed.levelsCompleted) : 0;
      data.highestLevel = typeof parsed.highestLevel === 'number' && Number.isFinite(parsed.highestLevel) ? Math.max(1, Math.min(5, parsed.highestLevel)) : 1;
      data.achievements = Array.isArray(parsed.achievements) ? parsed.achievements : [];

      return data;
    } catch (e) {
      console.warn('Failed to parse save data, initializing fresh', e);
      return this.getDefaultSaveData();
    }
  }

  static saveSaveData(data) {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save game data', e);
    }
  }

  static recordLevelResult(difficulty, levelIndex, stars, score) {
    const data = this.loadSaveData();
    const diff = ['EASY', 'MEDIUM', 'HARD'].includes(difficulty) ? difficulty : 'MEDIUM';
    const lvlRecord = data.bestByDifficulty[diff][levelIndex];

    if (lvlRecord) {
      lvlRecord.completed = true;
      lvlRecord.stars = Math.max(lvlRecord.stars, stars);
      lvlRecord.score = Math.max(lvlRecord.score, score);
    }

    if (levelIndex + 2 > data.highestLevel && levelIndex < 4) {
      data.highestLevel = Math.min(5, levelIndex + 2);
    }

    data.levelsCompleted = Object.values(data.bestByDifficulty).reduce((acc, list) => {
      return acc + list.filter(l => l.completed).length;
    }, 0);

    const newAchievements = this.checkAchievements(data, difficulty, levelIndex, stars, score);
    this.saveSaveData(data);
    return { data, newAchievements };
  }

  static checkAchievements(data, difficulty, levelIndex, stars, score) {
    const newlyUnlocked = [];
    data.achievements = data.achievements || [];

    const tryUnlock = (id, name, desc) => {
      if (!data.achievements.some(a => a.id === id)) {
        const ach = { id, name, desc, unlockedAt: Date.now() };
        data.achievements.push(ach);
        newlyUnlocked.push(ach);
      }
    };

    // 1. First Pandal
    if (levelIndex === 0 && stars >= 1) {
      tryUnlock('first_pandal', 'First Sanctuary', 'Complete your very first pandal level.');
    }

    // 2. Eco Master
    if (stars >= 2) {
      tryUnlock('eco_master', 'Eco Champion', 'Earn an Eco bonus on any level.');
    }

    // 3. Perfect Craft
    if (stars === 3) {
      tryUnlock('perfect_craft', 'Flawless Blueprint', 'Earn 3 stars without dismantling a single item.');
    }

    // 4. Master Architect
    if (levelIndex === 4 && stars >= 1) {
      tryUnlock('master_architect', 'Grand Sthapati', 'Complete the Grand Pandal on Level 5.');
    }

    return newlyUnlocked;
  }

  static incrementAttempts() {
    const data = this.loadSaveData();
    data.attempts = (data.attempts || 0) + 1;
    this.saveSaveData(data);
    return data.attempts;
  }
}
