/**
 * @file audio.js
 * Retro Arcade Web Audio API Sound Synthesizer for DLP Arcade.
 */

class ArcadeAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.1) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playback error:', e);
    }
  }

  playCorrect() {
    if (this.muted) return;
    this.playTone(523.25, 'triangle', 0.1, 0.15); // C5
    setTimeout(() => this.playTone(659.25, 'triangle', 0.1, 0.15), 80); // E5
    setTimeout(() => this.playTone(783.99, 'square', 0.2, 0.2), 160); // G5
  }

  playWrong() {
    if (this.muted) return;
    this.playTone(220, 'sawtooth', 0.15, 0.2); // A3
    setTimeout(() => this.playTone(185, 'sawtooth', 0.25, 0.2), 120); // F#3
  }

  playTick() {
    if (this.muted) return;
    this.playTone(800, 'sine', 0.03, 0.05);
  }

  playStreak() {
    if (this.muted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'square', 0.12, 0.15), idx * 70);
    });
  }

  playFanfare() {
    if (this.muted) return;
    const melody = [523.25, 659.25, 783.99, 1046.50];
    melody.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 'triangle', 0.2, 0.25), idx * 120);
    });
  }
}

window.arcadeAudio = new ArcadeAudioEngine();
