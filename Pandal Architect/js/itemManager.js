/**
 * Pandal Architect - Item Grid & Placement Manager
 */
import { CONSTANTS } from './config.js';
import { Item } from './item.js';

export class ItemManager {
  constructor() {
    this.cols = CONSTANTS.GRID_COLS;
    this.rows = CONSTANTS.GRID_ROWS;
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.removalsCount = 0;
  }

  reset() {
    this.grid = Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    this.removalsCount = 0;
  }

  getPlacedItems() {
    const items = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c]) {
          items.push(this.grid[r][c]);
        }
      }
    }
    return items;
  }

  getItemAt(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    return this.grid[row][col];
  }

  placeItem(itemTypeId, row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    if (this.grid[row][col] !== null) {
      return null; // Cell occupied
    }
    const item = new Item(itemTypeId, row, col);
    this.grid[row][col] = item;
    return item;
  }

  removeItem(row, col) {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return null;
    }
    const existing = this.grid[row][col];
    if (!existing) {
      return null;
    }
    this.grid[row][col] = null;
    this.removalsCount++;
    return existing;
  }

  countByType(typeId) {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.grid[r][c] && this.grid[r][c].typeId === typeId) {
          count++;
        }
      }
    }
    return count;
  }

  countPillars() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const item = this.grid[r][c];
        if (item && (item.typeId === 'pillar_wood' || item.typeId === 'pillar_bamboo')) {
          count++;
        }
      }
    }
    return count;
  }
}
