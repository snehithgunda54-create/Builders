/**
 * Pandal Architect - Game Configuration & Balance Parameters
 * Strict adherence to the exact specification values.
 */

export const STATES = Object.freeze({
  MENU: 0,
  LEVEL_SELECT: 1,
  PLAYING: 2,
  PAUSED: 3,
  GAME_OVER: 4,
  TRANSITION: 5,
  LEVEL_COMPLETE: 6
});

export const CONSTANTS = Object.freeze({
  TICK_DT: 1 / 60,
  HIT_PAUSE_DURATION: 70, // ms for collapse transition freeze
  FLOW_MAX: 5,
  FLOW_TIMEOUT: 4.0, // seconds for perfect placement streak
  GRID_COLS: 8,
  GRID_ROWS: 6,
  CELL_SIZE: 64,
  MARGINS: Object.freeze({
    LEFT: 40,
    RIGHT: 40,
    TOP: 80,
    BOTTOM: 40
  }),
  MAX_STAT: 100
});

export const ITEMS = Object.freeze({
  pillar_wood: {
    id: 'pillar_wood',
    name: 'Pillar (Wood)',
    slot: 1,
    cost: 60,
    stability: 20,
    decoration: 0,
    eco: 2,
    crowdSafety: 0,
    timeToPlace: 0.4,
    description: 'Solid wooden pillar supporting structure'
  },
  pillar_bamboo: {
    id: 'pillar_bamboo',
    name: 'Pillar (Bamboo)',
    slot: 2,
    cost: 40,
    stability: 15,
    decoration: 0,
    eco: 3,
    crowdSafety: 0,
    timeToPlace: 0.5,
    description: 'Eco-friendly bamboo scaffolding column'
  },
  base_platform: {
    id: 'base_platform',
    name: 'Base Platform',
    slot: 3,
    cost: 120,
    stability: 35,
    decoration: 0,
    eco: 1,
    crowdSafety: 0,
    timeToPlace: 0.6,
    description: 'Reinforced foundation platform'
  },
  string_lights: {
    id: 'string_lights',
    name: 'String Lights',
    slot: 4,
    cost: 30,
    stability: 0, // Note: -2 if > 3 placed
    decoration: 15,
    eco: 0,
    crowdSafety: 0,
    timeToPlace: 0.3,
    description: 'Bright fairy lights (-2 stability if >3 placed)'
  },
  flowers: {
    id: 'flowers',
    name: 'Flowers/Garlands',
    slot: 5,
    cost: 20,
    stability: 0,
    decoration: 12,
    eco: 1,
    crowdSafety: 0,
    timeToPlace: 0.25,
    description: 'Festive marigold garlands'
  },
  rangoli: {
    id: 'rangoli',
    name: 'Rangoli Tiles',
    slot: 6,
    cost: 25,
    stability: 0,
    decoration: 18,
    eco: 2,
    crowdSafety: 0,
    timeToPlace: 0.35,
    description: 'Vibrant decorative floor rangoli'
  },
  cloth_banner: {
    id: 'cloth_banner',
    name: 'Cloth Banner',
    slot: 7,
    cost: 35,
    stability: 0,
    decoration: 20,
    eco: 3,
    crowdSafety: 0,
    timeToPlace: 0.3,
    description: 'Traditional organic fabric backdrop'
  },
  plastic_banner: {
    id: 'plastic_banner',
    name: 'Plastic Banner',
    slot: 8,
    cost: 25,
    stability: 0,
    decoration: 18,
    eco: -2,
    crowdSafety: 0,
    timeToPlace: 0.3,
    description: 'Cheap synthetic banner (-2 eco penalty)'
  },
  canopy: {
    id: 'canopy',
    name: 'Canopy',
    slot: 9,
    cost: 80,
    stability: 10,
    decoration: 0,
    eco: 1,
    crowdSafety: 0,
    timeToPlace: 0.5,
    description: 'Protective overhead waterproof tarp'
  },
  exit_sign: {
    id: 'exit_sign',
    name: 'Exit Sign',
    slot: 10,
    cost: 15,
    stability: 0,
    decoration: 0,
    eco: 0,
    crowdSafety: 10,
    timeToPlace: 0.2,
    description: 'Illuminated crowd emergency egress marker'
  }
});

export const LEVEL_TEMPLATES = [
  {
    level: 1,
    name: 'Street Pandal',
    subtitle: 'Quiet Neighborhood Sanctuary',
    budget: 400,
    time: 90,
    targetStability: 60,
    targetDecoration: 50,
    targetCrowdSafety: 0,
    ecoBonusThreshold: 5,
    hazards: {
      rain: null,
      wind: null,
      crowd: null
    },
    ecoPenalty: null
  },
  {
    level: 2,
    name: 'Society Pandal',
    subtitle: 'Monsoon Rain Threat',
    budget: 450,
    time: 80,
    targetStability: 65,
    targetDecoration: 55,
    targetCrowdSafety: 0,
    ecoBonusThreshold: 6,
    hazards: {
      rain: { startTime: 40, damagePerSec: 1, requiredCanopies: 1 },
      wind: null,
      crowd: null
    },
    ecoPenalty: null
  },
  {
    level: 3,
    name: 'Main Road Pandal',
    subtitle: 'High Surge Crowd Surge',
    budget: 500,
    time: 85,
    targetStability: 70,
    targetDecoration: 60,
    targetCrowdSafety: 40,
    ecoBonusThreshold: 7,
    hazards: {
      rain: null,
      wind: null,
      crowd: { startTime: 0, damagePerSec: 0.5, requiredExitSigns: 2 }
    },
    ecoPenalty: null
  },
  {
    level: 4,
    name: 'Festival Square',
    subtitle: 'Wind Squalls & Eco Rigor',
    budget: 480,
    time: 75,
    targetStability: 75,
    targetDecoration: 65,
    targetCrowdSafety: 0,
    ecoBonusThreshold: 7,
    hazards: {
      rain: null,
      wind: { interval: 10, duration: 3, damagePerGust: 3, requiredPillars: 4 },
      crowd: null
    },
    ecoPenalty: { ifBelow: 0, penaltyRatio: 0.15 } // -15% if Eco < 0
  },
  {
    level: 5,
    name: 'Grand Pandal',
    subtitle: 'The Supreme Festival Concourse',
    budget: 520,
    time: 90,
    targetStability: 80,
    targetDecoration: 70,
    targetCrowdSafety: 50,
    ecoBonusThreshold: 8,
    hazards: {
      rain: { startTime: 30, damagePerSec: 1, requiredCanopies: 1 },
      wind: { interval: 10, duration: 3, damagePerGust: 3, requiredPillars: 4, startTime: 20 },
      crowd: { startTime: 10, damagePerSec: 0.5, requiredExitSigns: 2 }
    },
    ecoPenalty: { ifBelow: 0, penaltyRatio: 0.20 } // -20% if Eco < 0
  }
];

export const DIFFICULTIES = Object.freeze({
  EASY: {
    id: 'easy',
    name: 'Easy',
    budgetMultiplier: 1.20,
    timeAddition: 20,
    targetDelta: -10,
    targetFloor: 30,
    hazardIntensityMultiplier: 0.70,
    ecoThresholdDelta: 0
  },
  MEDIUM: {
    id: 'medium',
    name: 'Medium',
    budgetMultiplier: 1.0,
    timeAddition: 0,
    targetDelta: 0,
    targetFloor: 30,
    hazardIntensityMultiplier: 1.0,
    ecoThresholdDelta: 0
  },
  HARD: {
    id: 'hard',
    name: 'Hard',
    budgetMultiplier: 0.85,
    timeAddition: -15,
    targetDelta: 10,
    targetCeiling: 90,
    hazardIntensityMultiplier: 1.30,
    ecoThresholdDelta: 2
  }
});
