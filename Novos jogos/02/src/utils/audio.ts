// Web Audio API Synthesizer for stadium sound effects

class StadiumSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play flare ignition / crackle
  playFlareIgnite() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise burst with bandpass filter
      const bufferSize = this.ctx.sampleRate * 0.4;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Audio fallback
    }
  }

  // Sound while dragging (continuous gentle crackle/whoosh)
  playTraceStep(speedNormalized: number = 0.5) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + speedNormalized * 220, now);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio fallback
    }
  }

  // Miss / Out of path alert
  playMissAlert() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio fallback
    }
  }

  // Perfect completion: whistle + triumphant stadium horn chord
  playPerfectCelebration() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;

      // Whistle sweep
      const whistleOsc = this.ctx.createOscillator();
      const whistleGain = this.ctx.createGain();
      whistleOsc.type = 'sine';
      whistleOsc.frequency.setValueAtTime(1800, now);
      whistleOsc.frequency.linearRampToValueAtTime(2400, now + 0.15);
      whistleOsc.frequency.linearRampToValueAtTime(2000, now + 0.35);

      whistleGain.gain.setValueAtTime(0.08, now);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      whistleOsc.connect(whistleGain);
      whistleGain.connect(this.ctx.destination);
      whistleOsc.start(now);
      whistleOsc.stop(now + 0.4);

      // Stadium brass triad (F-A-C-F)
      const freqs = [349.23, 440.0, 523.25, 698.46];
      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.setValueAtTime(0.09 / (idx + 1), now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + idx * 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + 0.1);
        osc.stop(now + 0.9 + idx * 0.1);
      });
    } catch {
      // Audio fallback
    }
  }

  // Continuous stadium drum loop (Bumbo e caixa)
  private drumTimer: number | null = null;
  private chantTimer: number | null = null;
  public isCrowdActive: boolean = false;

  startCrowdAmbience() {
    if (!this.enabled || this.isCrowdActive) return;
    this.initCtx();
    this.isCrowdActive = true;

    let beat = 0;
    // Stadium battery rhythm: 1, 2, 3-and-4 pattern (classic torcida drum rhythm)
    this.drumTimer = window.setInterval(() => {
      if (!this.enabled || !this.isCrowdActive) return;
      beat = (beat + 1) % 8;

      if (beat === 0 || beat === 2 || beat === 4 || beat === 5) {
        this.playDrumBeat(beat === 5);
      }
    }, 280);
  }

  stopCrowdAmbience() {
    this.isCrowdActive = false;
    if (this.drumTimer) {
      clearInterval(this.drumTimer);
      this.drumTimer = null;
    }
  }

  // Bumbo (drum beat) for crowd rhythm
  playDrumBeat(isHigh: boolean = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigh ? 170 : 95, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);

      gain.gain.setValueAtTime(isHigh ? 0.2 : 0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Audio fallback
    }
  }

  // Crowd groan on miss: "Uhhhh!"
  playCrowdGroan() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Filtered noise simulating crowd disappointment
      const bufferSize = this.ctx.sampleRate * 0.6;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(260, now);
      filter.frequency.linearRampToValueAtTime(140, now + 0.6);
      filter.Q.setValueAtTime(2, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Audio fallback
    }
  }
}

export const soundEngine = new StadiumSoundEngine();
