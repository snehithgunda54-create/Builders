/**
 * Pandal Architect - Canvas Renderer & Visual FX
 * Implements "Midnight Marigold & Royal Terracotta Blueprint" visual theme.
 */
import { CONSTANTS, ITEMS } from './config.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = window.devicePixelRatio || 1;
    this.width = 0;
    this.height = 0;
    this.gridOriginX = 0;
    this.gridOriginY = 0;
    this.cellSize = CONSTANTS.CELL_SIZE;
    this.cols = CONSTANTS.GRID_COLS;
    this.rows = CONSTANTS.GRID_ROWS;
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.particles = [];
    this.reducedMotion = false;
    this.hoverCell = null;
    this.selectedItemType = null;
    this.timeCounter = 0;

    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const parent = this.canvas.parentElement || document.body;
    const rect = parent.getBoundingClientRect();
    this.dpr = window.devicePixelRatio || 1;
    
    // Fit within available view container
    const w = Math.max(320, rect.width || window.innerWidth);
    const h = Math.max(360, rect.height || window.innerHeight);

    this.width = w;
    this.height = h;
    this.canvas.width = Math.floor(w * this.dpr);
    this.canvas.height = Math.floor(h * this.dpr);
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Calculate dynamic grid positioning & cell size to fit nicely
    const availW = w - CONSTANTS.MARGINS.LEFT - CONSTANTS.MARGINS.RIGHT;
    const availH = h - CONSTANTS.MARGINS.TOP - CONSTANTS.MARGINS.BOTTOM;
    
    const sizeFromW = availW / this.cols;
    const sizeFromH = availH / this.rows;
    this.cellSize = Math.floor(Math.min(sizeFromW, sizeFromH, 72));
    this.cellSize = Math.max(36, this.cellSize);

    const totalGridW = this.cols * this.cellSize;
    const totalGridH = this.rows * this.cellSize;

    this.gridOriginX = Math.floor((w - totalGridW) / 2);
    this.gridOriginY = Math.floor(CONSTANTS.MARGINS.TOP + (availH - totalGridH) / 2);
  }

  triggerShake(intensity = 8, duration = 0.25) {
    if (this.reducedMotion) return;
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  screenToGrid(screenX, screenY) {
    const rect = this.canvas.getBoundingClientRect();
    const x = screenX - rect.left - this.gridOriginX;
    const y = screenY - rect.top - this.gridOriginY;

    if (x < 0 || y < 0) return null;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
      return { row, col };
    }
    return null;
  }

  gridToScreen(row, col) {
    return {
      x: this.gridOriginX + col * this.cellSize,
      y: this.gridOriginY + row * this.cellSize
    };
  }

  addParticle(x, y, color = '#F59E0B', count = 8) {
    if (this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 60 + 20;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 15,
        color,
        size: Math.random() * 3 + 2,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 0.6 + Math.random() * 0.4
      });
    }
  }

  render(dt, itemManager, levelManager, stabilityTracker, decorationTracker, ecoTracker) {
    this.timeCounter += dt;
    const ctx = this.ctx;
    ctx.save();

    // 1. Screen Shake
    if (this.shakeDuration > 0 && !this.reducedMotion) {
      this.shakeDuration -= dt;
      const offsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      const offsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      ctx.translate(offsetX, offsetY);
    }

    // 2. Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // 3. Render Themed Procedural Background
    this.drawBackground(ctx, levelManager);

    // 4. Render Architectural Grid Ground & Foundations
    this.drawGridArea(ctx, itemManager);

    // 5. Render Placed Items
    this.drawPlacedItems(ctx, itemManager);

    // 6. Render Hover Preview
    this.drawHoverPreview(ctx, itemManager);

    // 7. Render Hazard Overlays (Rain, Wind, Crowd)
    this.drawHazards(ctx, levelManager);

    // 8. Render Floating Particle Sparks
    this.drawParticles(ctx, dt);

    ctx.restore();
  }

  drawBackground(ctx, levelManager) {
    const w = this.width;
    const h = this.height;
    const lvl = levelManager ? levelManager.currentLevelIndex + 1 : 1;

    // Deep Midnight Gradient based on level
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (lvl === 1) {
      grad.addColorStop(0, '#0B1021');
      grad.addColorStop(1, '#182245');
    } else if (lvl === 2) { // Rain monsoon
      grad.addColorStop(0, '#090D1A');
      grad.addColorStop(1, '#142038');
    } else if (lvl === 3) { // Crowd bustle
      grad.addColorStop(0, '#100E26');
      grad.addColorStop(1, '#24173D');
    } else if (lvl === 4) { // Wind squall
      grad.addColorStop(0, '#081721');
      grad.addColorStop(1, '#132B3B');
    } else { // Grand pandal
      grad.addColorStop(0, '#120B24');
      grad.addColorStop(1, '#2D1645');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Silhouetted Temple / Canopy Arches in Background (Layer 1)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
    for (let i = 0; i < 4; i++) {
      const archX = (w / 4) * i + 40;
      ctx.beginPath();
      ctx.arc(archX + w / 8, h - 80, w / 9, Math.PI, 0, false);
      ctx.fill();
    }

    // Festive Fairy Light Garland at Top (Layer 2)
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 45);
    for (let x = 0; x <= w; x += 60) {
      const sag = Math.sin(x * 0.05 + this.timeCounter) * 8 + 45;
      ctx.lineTo(x, sag);
    }
    ctx.stroke();

    // Warm Ambient Lantern Glows
    for (let lx = 30; lx < w; lx += 120) {
      const ly = Math.sin(lx * 0.05 + this.timeCounter) * 8 + 45;
      const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 18);
      glow.addColorStop(0, 'rgba(251, 191, 36, 0.6)');
      glow.addColorStop(1, 'rgba(251, 191, 36, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(lx, ly, 18, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawGridArea(ctx, itemManager) {
    const startX = this.gridOriginX;
    const startY = this.gridOriginY;
    const size = this.cellSize;
    const totalW = this.cols * size;
    const totalH = this.rows * size;

    // Blueprint Ground Mat with Brass Trim
    ctx.fillStyle = 'rgba(17, 24, 39, 0.75)';
    ctx.strokeStyle = 'rgba(217, 119, 6, 0.6)'; // Brass gilded
    ctx.lineWidth = 2;
    ctx.fillRect(startX - 8, startY - 8, totalW + 16, totalH + 16);
    ctx.strokeRect(startX - 8, startY - 8, totalW + 16, totalH + 16);

    // Decorative corner markers (Indian Architectural Motif)
    this.drawCornerBracket(ctx, startX - 8, startY - 8, 1, 1);
    this.drawCornerBracket(ctx, startX + totalW + 8, startY - 8, -1, 1);
    this.drawCornerBracket(ctx, startX - 8, startY + totalH + 8, 1, -1);
    this.drawCornerBracket(ctx, startX + totalW + 8, startY + totalH + 8, -1, -1);

    // Grid Cells
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const x = startX + c * size;
        const y = startY + r * size;

        // Blueprint subtle cell styling
        ctx.fillStyle = (r + c) % 2 === 0 ? 'rgba(30, 41, 59, 0.35)' : 'rgba(15, 23, 42, 0.35)';
        ctx.fillRect(x, y, size, size);

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.15)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size, size);

        // Center dot marker
        ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        ctx.fillRect(x + size / 2 - 1, y + size / 2 - 1, 2, 2);
      }
    }
  }

  drawCornerBracket(ctx, x, y, dirX, dirY) {
    ctx.save();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y + dirY * 12);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dirX * 12, y);
    ctx.stroke();
    ctx.restore();
  }

  drawPlacedItems(ctx, itemManager) {
    const items = itemManager.getPlacedItems();
    for (const item of items) {
      const pos = this.gridToScreen(item.row, item.col);
      this.drawItemGraphic(ctx, item.typeId, pos.x, pos.y, this.cellSize);
    }
  }

  drawHoverPreview(ctx, itemManager) {
    if (!this.hoverCell || !this.selectedItemType) return;
    const { row, col } = this.hoverCell;
    const existing = itemManager.getItemAt(row, col);
    const pos = this.gridToScreen(row, col);

    if (existing) {
      // Cell occupied feedback
      ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.fillRect(pos.x, pos.y, this.cellSize, this.cellSize);
      ctx.strokeRect(pos.x, pos.y, this.cellSize, this.cellSize);
    } else {
      // Valid placement preview
      ctx.fillStyle = 'rgba(16, 185, 129, 0.2)';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.fillRect(pos.x, pos.y, this.cellSize, this.cellSize);
      ctx.strokeRect(pos.x, pos.y, this.cellSize, this.cellSize);

      ctx.save();
      ctx.globalAlpha = 0.55;
      this.drawItemGraphic(ctx, this.selectedItemType, pos.x, pos.y, this.cellSize);
      ctx.restore();
    }
  }

  drawItemGraphic(ctx, typeId, x, y, size) {
    ctx.save();
    const pad = 4;
    const w = size - pad * 2;
    const h = size - pad * 2;
    const cx = x + size / 2;
    const cy = y + size / 2;

    switch (typeId) {
      case 'pillar_wood': {
        // Sturdy polished wooden column
        ctx.fillStyle = '#854D0E';
        ctx.fillRect(cx - w * 0.25, y + pad, w * 0.5, h);
        ctx.fillStyle = '#A16207';
        ctx.fillRect(cx - w * 0.15, y + pad, w * 0.3, h);
        // Base and Capital
        ctx.fillStyle = '#713F12';
        ctx.fillRect(cx - w * 0.35, y + pad, w * 0.7, 6);
        ctx.fillRect(cx - w * 0.35, y + size - pad - 6, w * 0.7, 6);
        break;
      }
      case 'pillar_bamboo': {
        // Bamboo pole with nodes
        ctx.fillStyle = '#4D7C0F';
        ctx.fillRect(cx - w * 0.2, y + pad, w * 0.4, h);
        // Nodes
        ctx.fillStyle = '#65A30D';
        for (let i = 1; i <= 3; i++) {
          ctx.fillRect(cx - w * 0.26, y + pad + (h / 4) * i, w * 0.52, 4);
        }
        break;
      }
      case 'base_platform': {
        // Solid Stone / Teak Foundation Block
        ctx.fillStyle = '#475569';
        ctx.fillRect(x + pad, y + pad, w, h);
        ctx.fillStyle = '#64748B';
        ctx.fillRect(x + pad + 2, y + pad + 2, w - 4, h - 4);
        ctx.strokeStyle = '#94A3B8';
        ctx.strokeRect(x + pad + 4, y + pad + 4, w - 8, h - 8);
        break;
      }
      case 'string_lights': {
        // Glowing festive bulbs
        ctx.strokeStyle = '#FDE047';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.35, 0, Math.PI * 2);
        ctx.stroke();
        // Glow pulse
        const pulse = Math.sin(this.timeCounter * 6) * 2;
        const rad = Math.max(2, w * 0.2 + pulse);
        const glow = ctx.createRadialGradient(cx, cy, 1, cx, cy, rad * 1.8);
        glow.addColorStop(0, '#FEF08A');
        glow.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(cx, cy, rad * 1.8, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'flowers': {
        // Sacred Marigold & Lotus Petals
        ctx.fillStyle = '#EA580C';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          const px = cx + Math.cos(a) * (w * 0.25);
          const py = cy + Math.sin(a) * (h * 0.25);
          ctx.beginPath();
          ctx.arc(px, py, w * 0.16, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.18, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'rangoli': {
        // Geometric rangoli art
        ctx.fillStyle = '#EC4899';
        ctx.beginPath();
        ctx.moveTo(cx, y + pad);
        ctx.lineTo(x + size - pad, cy);
        ctx.lineTo(cx, y + size - pad);
        ctx.lineTo(x + pad, cy);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(cx, cy, w * 0.2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'cloth_banner': {
        // Festive Fabric Toran Backdrop
        ctx.fillStyle = '#DC2626';
        ctx.fillRect(x + pad, y + pad, w, h * 0.6);
        // Scallops
        ctx.fillStyle = '#F59E0B';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(x + pad + (w / 3) * (i + 0.5), y + pad + h * 0.6, w / 6, 0, Math.PI);
          ctx.fill();
        }
        break;
      }
      case 'plastic_banner': {
        // Synthetic bright cyan banner
        ctx.fillStyle = '#0284C7';
        ctx.fillRect(x + pad, y + pad, w, h * 0.7);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(x + pad + 2, y + pad + 2, w - 4, 6);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PVC', cx, cy + 2);
        break;
      }
      case 'canopy': {
        // Overhead Weatherproof Tent Shading
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.moveTo(cx, y + pad);
        ctx.lineTo(x + size - pad, y + size - pad);
        ctx.lineTo(x + pad, y + size - pad);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#FDE68A';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }
      case 'exit_sign': {
        // Illuminated Green Safety Egress
        ctx.fillStyle = '#065F46';
        ctx.fillRect(x + pad, cy - h * 0.3, w, h * 0.6);
        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EXIT ➜', cx, cy + 3);
        break;
      }
      default:
        ctx.fillStyle = '#F59E0B';
        ctx.fillRect(x + pad, y + pad, w, h);
    }
    ctx.restore();
  }

  drawHazards(ctx, levelManager) {
    if (!levelManager || !levelManager.activeConfig) return;
    const w = this.width;
    const h = this.height;

    // Rain Streaks
    if (levelManager.activeConfig.hazards.rain && levelManager.elapsedTime >= levelManager.activeConfig.hazards.rain.startTime) {
      ctx.save();
      ctx.strokeStyle = 'rgba(147, 197, 253, 0.4)';
      ctx.lineWidth = 1.2;
      const t = this.timeCounter * 400;
      for (let i = 0; i < 40; i++) {
        const rx = (i * 37 + t * 0.3) % w;
        const ry = (i * 29 + t) % h;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx - 5, ry + 16);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Wind Gust Overlay
    if (levelManager.isWindGustActive) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      const wt = this.timeCounter * 600;
      for (let j = 0; j < 5; j++) {
        const wy = (j * 70 + 60) % h;
        const wx = (wt + j * 120) % (w + 200) - 100;
        ctx.beginPath();
        ctx.moveTo(wx, wy);
        ctx.lineTo(wx + 80, wy + Math.sin(wx * 0.05) * 8);
        ctx.stroke();
      }
      ctx.restore();
    }

    // Crowd Alert Pulsing Border
    if (levelManager.activeConfig.hazards.crowd && levelManager.elapsedTime >= levelManager.activeConfig.hazards.crowd.startTime) {
      const pulse = (Math.sin(this.timeCounter * 4) + 1) * 0.5;
      ctx.save();
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.15 + pulse * 0.25})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, w - 4, h - 4);
      ctx.restore();
    }
  }

  drawParticles(ctx, dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;

      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}
