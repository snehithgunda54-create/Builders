/**
 * Pandal Architect - Procedural WebAudio Synthesizer & Sound FX Engine
 * 100% original generative synthesized audio.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = true;
    this.volume = 0.7;
    this.initialized = false;
    this.ambientOsc = null;
    this.ambientGain = null;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    } catch (e) {
      console.warn('WebAudio not supported or blocked:', e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2) {
    if (!this.initialized || this.isMuted || !this.ctx) return;
    this.resume();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const effectiveGain = gainVal * this.volume;
      gain.gain.setValueAtTime(effectiveGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // Graceful fallback
    }
  }

  playPlaceItem() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(440, 'triangle', 0.12, 0.25);
    setTimeout(() => this.playTone(554.37, 'sine', 0.1, 0.2), 40);
  }

  playRemoveItem() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(330, 'sawtooth', 0.15, 0.2);
    setTimeout(() => this.playTone(220, 'sine', 0.15, 0.18), 50);
  }

  playInsufficientBudget() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(180, 'square', 0.12, 0.2);
    setTimeout(() => this.playTone(140, 'square', 0.18, 0.25), 90);
  }

  playHazardWarning() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(600, 'sawtooth', 0.25, 0.3);
    setTimeout(() => this.playTone(520, 'sawtooth', 0.3, 0.35), 180);
  }

  playCollapse() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(110, 'sawtooth', 0.5, 0.4);
    setTimeout(() => this.playTone(75, 'square', 0.6, 0.5), 100);
  }

  playLevelComplete() {
    if (!this.initialized || this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.25, 0.3);
      }, idx * 100);
    });
  }

  playUiClick() {
    if (!this.initialized || this.isMuted) return;
    this.playTone(520, 'sine', 0.05, 0.15);
  }
}
