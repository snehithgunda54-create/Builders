/**
 * Pandal Architect - Input Manager (Mouse, Touch, Keyboard)
 */
export class InputManager {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.isPointerDown = false;
    this.hoverCell = null;

    this.initEvents();
  }

  initEvents() {
    // Prevent context menu on canvas for right-click item removal
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.handleRightClick(e);
    });

    this.canvas.addEventListener('mousemove', (e) => {
      this.handleMouseMove(e);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverCell = null;
      if (this.game.renderer) {
        this.game.renderer.hoverCell = null;
      }
    });

    this.canvas.addEventListener('click', (e) => {
      this.handleClick(e);
    });

    // Touch events for mobile responsiveness
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const cell = this.game.renderer.screenToGrid(touch.clientX, touch.clientY);
        if (cell) {
          this.hoverCell = cell;
          this.game.renderer.hoverCell = cell;
        }
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      if (this.hoverCell) {
        this.game.handleCellInteraction(this.hoverCell.row, this.hoverCell.col, false);
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      this.handleKeyDown(e);
    });
  }

  handleMouseMove(e) {
    if (!this.game.isPlaying()) return;
    const cell = this.game.renderer.screenToGrid(e.clientX, e.clientY);
    this.hoverCell = cell;
    this.game.renderer.hoverCell = cell;
  }

  handleClick(e) {
    if (!this.game.isPlaying()) return;
    const cell = this.game.renderer.screenToGrid(e.clientX, e.clientY);
    if (!cell) return;

    if (e.shiftKey) {
      // Shift + Click removes item
      this.game.handleCellInteraction(cell.row, cell.col, true);
    } else {
      // Normal click places selected item
      this.game.handleCellInteraction(cell.row, cell.col, false);
    }
  }

  handleRightClick(e) {
    if (!this.game.isPlaying()) return;
    const cell = this.game.renderer.screenToGrid(e.clientX, e.clientY);
    if (!cell) return;
    this.game.handleCellInteraction(cell.row, cell.col, true); // true = remove
  }

  handleKeyDown(e) {
    // 1-6 / 1-9 for Item Selection
    if (e.key >= '1' && e.key <= '9') {
      const slot = parseInt(e.key, 10);
      this.game.selectItemBySlot(slot);
      return;
    }

    if (e.key === 'Escape') {
      this.game.togglePause();
      return;
    }

    if (e.key === ' ' && this.hoverCell && this.game.isPlaying()) {
      e.preventDefault();
      this.game.handleCellInteraction(this.hoverCell.row, this.hoverCell.col, false);
      return;
    }

    if (e.key.toLowerCase() === 'f' && this.game.isPlaying()) {
      e.preventDefault();
      this.game.finishLevel();
      return;
    }
  }
}
