/**
 * Pandal Architect - Level Manager & Hazard System
 */
import { LEVEL_TEMPLATES, DIFFICULTIES } from './config.js';

export class LevelManager {
  constructor() {
    this.currentLevelIndex = 0; // 0-based for Level 1..5
    this.difficultyKey = 'MEDIUM';
    this.activeConfig = null;
    this.elapsedTime = 0;
    this.remainingTime = 90;
    this.rainPenalty = 0;
    this.crowdPenalty = 0;
    this.windPenalty = 0;
    this.isWindGustActive = false;
    this.windGustTimer = 0;
    this.hazardEvents = [];
  }

  setDifficulty(diffKey) {
    if (DIFFICULTIES[diffKey]) {
      this.difficultyKey = diffKey;
    }
  }

  applyDifficulty(diffKey) {
    this.setDifficulty(diffKey);
    if (this.activeConfig) {
      this.loadLevel(this.currentLevelIndex, this.difficultyKey);
    }
  }

  loadLevel(levelIndex, diffKey = this.difficultyKey) {
    this.currentLevelIndex = Math.max(0, Math.min(LEVEL_TEMPLATES.length - 1, levelIndex));
    this.difficultyKey = diffKey;
    const template = LEVEL_TEMPLATES[this.currentLevelIndex];
    const diff = DIFFICULTIES[this.difficultyKey] || DIFFICULTIES.MEDIUM;

    // Apply difficulty modifiers
    const budget = Math.round(template.budget * diff.budgetMultiplier);
    const time = Math.max(30, template.time + diff.timeAddition);
    const targetStability = Math.min(diff.targetCeiling || 100, Math.max(diff.targetFloor, template.targetStability + diff.targetDelta));
    const targetDecoration = Math.min(diff.targetCeiling || 100, Math.max(diff.targetFloor, template.targetDecoration + diff.targetDelta));
    const targetCrowdSafety = template.targetCrowdSafety > 0
      ? Math.min(diff.targetCeiling || 100, Math.max(diff.targetFloor, template.targetCrowdSafety + diff.targetDelta))
      : 0;
    const ecoBonusThreshold = template.ecoBonusThreshold + diff.ecoThresholdDelta;

    this.activeConfig = {
      level: template.level,
      name: template.name,
      subtitle: template.subtitle,
      budget,
      time,
      targetStability,
      targetDecoration,
      targetCrowdSafety,
      ecoBonusThreshold,
      hazards: JSON.parse(JSON.stringify(template.hazards)),
      ecoPenalty: template.ecoPenalty ? { ...template.ecoPenalty } : null,
      hazardIntensityMultiplier: diff.hazardIntensityMultiplier
    };

    this.elapsedTime = 0;
    this.remainingTime = this.activeConfig.time;
    this.rainPenalty = 0;
    this.crowdPenalty = 0;
    this.windPenalty = 0;
    this.isWindGustActive = false;
    this.windGustTimer = 0;
    this.hazardEvents = [];

    return this.activeConfig;
  }

  update(dt, itemManager) {
    if (!this.activeConfig) return;

    this.elapsedTime += dt;
    this.remainingTime = Math.max(0, this.activeConfig.time - this.elapsedTime);

    const hazards = this.activeConfig.hazards;
    const intensity = this.activeConfig.hazardIntensityMultiplier;

    // 1. Rain Hazard
    if (hazards.rain && this.elapsedTime >= hazards.rain.startTime) {
      const canopies = itemManager.countByType('canopy');
      if (canopies < hazards.rain.requiredCanopies) {
        this.rainPenalty += hazards.rain.damagePerSec * intensity * dt;
      }
    }

    // 2. Crowd Hazard
    if (hazards.crowd && this.elapsedTime >= hazards.crowd.startTime) {
      const exitSigns = itemManager.countByType('exit_sign');
      if (exitSigns < hazards.crowd.requiredExitSigns) {
        this.crowdPenalty += hazards.crowd.damagePerSec * intensity * dt;
      }
    }

    // 3. Wind Hazard
    if (hazards.wind) {
      const windStart = hazards.wind.startTime || 0;
      if (this.elapsedTime >= windStart) {
        const cycle = hazards.wind.interval + hazards.wind.duration;
        const currentCycleTime = (this.elapsedTime - windStart) % cycle;
        if (currentCycleTime < hazards.wind.duration) {
          this.isWindGustActive = true;
          const pillars = itemManager.countPillars();
          if (pillars < hazards.wind.requiredPillars) {
            this.windPenalty += (hazards.wind.damagePerGust / hazards.wind.duration) * intensity * dt;
          }
        } else {
          this.isWindGustActive = false;
        }
      }
    }
  }

  isTargetsMet(stability, decoration, crowdSafety) {
    if (!this.activeConfig) return false;
    const c = this.activeConfig;
    const stabOk = stability >= c.targetStability;
    const decOk = decoration >= c.targetDecoration;
    const crowdOk = c.targetCrowdSafety === 0 || crowdSafety >= c.targetCrowdSafety;
    return stabOk && decOk && crowdOk;
  }

  calculateScore(stability, decoration, crowdSafety, eco, removalsCount) {
    if (!this.activeConfig) return { baseScore: 0, finalScore: 0, stars: 0, ecoBonusEarned: false };
    const c = this.activeConfig;

    const baseScore = Math.round(stability + decoration + (c.targetCrowdSafety > 0 ? crowdSafety : 0));
    let finalScore = baseScore;

    const ecoBonusEarned = eco >= c.ecoBonusThreshold;
    let ecoBonus = 0;
    if (ecoBonusEarned) {
      ecoBonus = Math.round(baseScore * 0.10);
      finalScore += ecoBonus;
    }

    // Eco Penalty rule
    if (c.ecoPenalty && eco < c.ecoPenalty.ifBelow) {
      const penalty = Math.round(baseScore * c.ecoPenalty.penaltyRatio);
      finalScore -= penalty;
    }

    // Stars Calculation
    let stars = 0;
    const passed = this.isTargetsMet(stability, decoration, crowdSafety);
    if (passed) {
      stars = 1;
      if (ecoBonusEarned) {
        stars = 2;
        if (removalsCount === 0) {
          stars = 3;
        }
      }
    }

    return {
      baseScore,
      ecoBonus,
      finalScore: Math.max(0, finalScore),
      stars,
      ecoBonusEarned,
      removalsCount
    };
  }
}
