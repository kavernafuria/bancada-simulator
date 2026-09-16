/**
 * Procedural Web Audio synthesizer for stadium chant & rhythm music
 * Dynamic BPM backing track (Guitar Hero style football chant & drums)
 */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private nextBeatTime: number = 0;
  private currentBeat: number = 0;
  private timerId: number | null = null;
  private bpm: number = 100; // changes with speed multiplier

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(80, Math.min(newBpm, 240));
  }

  public startMusic(onBeatCallback?: (beat: number) => void) {
    this.init();
    if (!this.ctx) return;
    this.isMusicPlaying = true;
    this.nextBeatTime = this.ctx.currentTime + 0.05;
    this.currentBeat = 0;

    const schedule = () => {
      if (!this.isMusicPlaying || !this.ctx) return;
      const currentTime = this.ctx.currentTime;

      // Schedule up to 0.15s in advance
      while (this.nextBeatTime < currentTime + 0.15) {
        this.playDrumPattern(this.currentBeat, this.nextBeatTime);
        if (onBeatCallback) {
          onBeatCallback(this.currentBeat);
        }
        const secondsPerBeat = 60.0 / this.bpm;
        this.nextBeatTime += secondsPerBeat;
        this.currentBeat = (this.currentBeat + 1) % 16;
      }

      this.timerId = window.setTimeout(schedule, 25);
    };

    schedule();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  // Play backing stadium chant & rhythm pattern
  private playDrumPattern(beat: number, time: number) {
    if (this.isMuted || !this.ctx) return;

    // Surdo (Big Kick drum) on beats 0, 4, 8, 12 (Downbeats) and syncopated 10
    if (beat % 4 === 0 || beat === 10) {
      this.synthesizeSurdo(time, beat === 0 ? 1.0 : 0.7);
    }

    // Caixa / Snare / Repique on upbeat (beats 2, 6, 10, 14)
    if (beat % 2 === 0) {
      this.synthesizeRepique(time, 0.4);
    }

    // Tamborim / Clave sixteenth rhythm
    if (beat % 2 !== 0) {
      this.synthesizeTamborim(time, 0.25);
    }

    // Melodic Stadium brass/organ synth loop every 4 beats
    if (beat % 4 === 0) {
      const melodyNotes = [220, 261.63, 293.66, 329.63]; // A minor stadium chant
      const noteIdx = Math.floor(beat / 4) % melodyNotes.length;
      this.synthesizeChantOrgan(time, melodyNotes[noteIdx]);
    }
  }

  private synthesizeSurdo(time: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(130, time);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(38, time + 0.16);

    gain.gain.setValueAtTime(0.4 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  private synthesizeRepique(time: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(120, time + 0.06);

    gain.gain.setValueAtTime(0.25 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.07);
  }

  private synthesizeTamborim(time: number, volume: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, time);
    osc.frequency.exponentialRampToValueAtTime(400, time + 0.03);

    gain.gain.setValueAtTime(0.12 * volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.035);
  }

  private synthesizeChantOrgan(time: number, freq: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 1.5, time);
    filter.Q.setValueAtTime(2.0, time);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.35);
  }

  // Interactive Player Input Sounds
  public playHit(isPerfect: boolean = false, combo: number = 0) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Heavy celebratory strike
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isPerfect ? 220 : 160, now);

      const baseFreq = isPerfect ? 120 : 90;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq + Math.min(combo * 2, 40), now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

      gain.gain.setValueAtTime(0.8, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.18);

      // Guitar Hero strike chord
      const chords = isPerfect ? [440, 554.37, 659.25] : [330, 440];
      chords.forEach((freq, idx) => {
        if (!this.ctx) return;
        const gOsc = this.ctx.createOscillator();
        const gGain = this.ctx.createGain();
        gOsc.type = 'triangle';
        gOsc.frequency.setValueAtTime(freq, now + idx * 0.01);
        gGain.gain.setValueAtTime(0.2, now + idx * 0.01);
        gGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        gOsc.connect(gGain);
        gGain.connect(this.ctx.destination);
        gOsc.start(now + idx * 0.01);
        gOsc.stop(now + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  public playMiss() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';

      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(130, now + 0.18);

      osc2.frequency.setValueAtTime(233, now);
      osc2.frequency.exponentialRampToValueAtTime(140, now + 0.18);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now + 0.01);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.2);
    } catch {
      // Ignore
    }
  }

  public playWhistleFinish() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // 3 referee whistle blows
      [0, 0.25, 0.55].forEach((offset, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1600 + idx * 50, now + offset);
        gain.gain.setValueAtTime(0.3, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + (idx === 2 ? 0.45 : 0.18));
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + 0.5);
      });
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
