/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicEnabled: boolean = false;
  private musicInterval: number | null = null;
  private currentMode: 'calm' | 'upbeat' = 'calm';
  private beat: number = 0;

  private init() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public isMusicEnabled() {
    return this.musicEnabled;
  }

  public setMusicMode(mode: 'calm' | 'upbeat') {
    this.currentMode = mode;
  }

  private startMusic() {
    if (this.musicInterval) return;
    this.musicInterval = window.setInterval(() => this.tick(), 250);
  }

  private stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  private tick() {
    if (!this.musicEnabled) return;
    this.init();
    
    if (this.currentMode === 'calm') {
      // Arpeggio: C G C E every 4 beats
      if (this.beat % 8 === 0) this.playTone(261.63, 1, 'sine', 0.02); // C4
      if (this.beat % 8 === 4) this.playTone(392.00, 1, 'sine', 0.02); // G4
    } else {
      // More upbeat: faster pulse
      if (this.beat % 2 === 0) {
        const freqs = [261.63, 329.63, 392.00, 523.25];
        this.playTone(freqs[this.beat % 4], 0.2, 'sine', 0.015);
      }
    }
    this.beat = (this.beat + 1) % 16;
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
