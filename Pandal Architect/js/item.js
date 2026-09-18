/**
 * Pandal Architect - Item Definition & Instance Helper
 */
import { ITEMS } from './config.js';

export class Item {
  constructor(itemTypeId, row, col) {
    const config = ITEMS[itemTypeId];
    if (!config) {
      throw new Error(`Unknown item type: ${itemTypeId}`);
    }
    this.typeId = itemTypeId;
    this.name = config.name;
    this.cost = config.cost;
    this.stability = config.stability;
    this.decoration = config.decoration;
    this.eco = config.eco;
    this.crowdSafety = config.crowdSafety;
    this.timeToPlace = config.timeToPlace;
    this.row = row;
    this.col = col;
    this.placedAt = performance.now();
    this.isPlaced = true;
  }
}
