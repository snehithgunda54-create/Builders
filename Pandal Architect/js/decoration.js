/**
 * Pandal Architect - Decoration Calculator
 */
import { CONSTANTS } from './config.js';

export class DecorationTracker {
  constructor() {
    this.value = 0;
    this.cap = CONSTANTS.MAX_STAT;
  }

  reset() {
    this.value = 0;
  }

  calculate(placedItems, activeHazardPenalty = 0) {
    let total = 0;
    for (const item of placedItems) {
      if (!item) continue;
      total += item.decoration || 0;
    }
    total -= activeHazardPenalty;
    this.value = Math.max(0, Math.min(this.cap, total));
    return this.value;
  }
}
