/**
 * Pandal Architect - Eco Calculator
 */
export class EcoTracker {
  constructor() {
    this.value = 0;
  }

  reset() {
    this.value = 0;
  }

  calculate(placedItems) {
    let total = 0;
    for (const item of placedItems) {
      if (!item) continue;
      total += item.eco || 0;
    }
    this.value = total;
    return this.value;
  }
}
