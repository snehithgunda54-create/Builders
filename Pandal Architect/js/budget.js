/**
 * Pandal Architect - Budget Tracker & Accounting
 */
export class BudgetManager {
  constructor(initialBudget = 400) {
    this.initialBudget = initialBudget;
    this.currentBudget = initialBudget;
    this.totalSpent = 0;
    this.totalRefunded = 0;
  }

  reset(newBudget) {
    this.initialBudget = newBudget;
    this.currentBudget = newBudget;
    this.totalSpent = 0;
    this.totalRefunded = 0;
  }

  canAfford(cost) {
    return this.currentBudget >= cost;
  }

  spend(cost) {
    if (!this.canAfford(cost)) {
      return false;
    }
    this.currentBudget -= cost;
    this.totalSpent += cost;
    return true;
  }

  refund(cost) {
    const refundAmount = Math.floor(cost * 0.5);
    this.currentBudget += refundAmount;
    this.totalRefunded += refundAmount;
    return refundAmount;
  }
}
