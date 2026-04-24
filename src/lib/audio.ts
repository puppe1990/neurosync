/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioManager {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  public playCorrect() {
    this.playTone(523.25, 0.1, 'sine', 0.1); // C5
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.1), 50); // E5
  }

  public playWrong() {
    this.playTone(220, 0.2, 'square', 0.05); // A3
  }

  public playTick() {
    this.playTone(880, 0.02, 'sine', 0.02); // High beep
  }

  public playComplete() {
    this.playTone(523.25, 0.2);
    setTimeout(() => this.playTone(659.25, 0.2), 100);
    setTimeout(() => this.playTone(783.99, 0.4), 200);
  }
}

export const audio = new AudioManager();
