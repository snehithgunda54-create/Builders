/**
 * Pandal Architect - Stability Calculator & Collapse Rules
 */
import { CONSTANTS } from './config.js';

export class StabilityTracker {
  constructor() {
    this.value = 0;
    this.cap = CONSTANTS.MAX_STAT;
    this.hasCollapsed = false;
  }

  reset() {
    this.value = 0;
    this.hasCollapsed = false;
  }

  calculate(placedItems, activeHazardPenalty = 0) {
    let total = 0;
    let stringLightsCount = 0;

    for (const item of placedItems) {
      if (!item) continue;
      total += item.stability || 0;
      if (item.typeId === 'string_lights') {
        stringLightsCount++;
      }
    }

    // Special rule: if >3 string lights, penalty of -2 stability per light over 3
    if (stringLightsCount > 3) {
      const extra = stringLightsCount - 3;
      total -= extra * 2;
    }

    total -= activeHazardPenalty;

    this.value = Math.min(this.cap, total);

    // If stability drops to or below 0 when items were placed (or during play)
    if (placedItems.length > 0 && this.value <= 0) {
      this.hasCollapsed = true;
    } else {
      this.hasCollapsed = false;
    }

    return this.value;
  }
}
