"use client";

export interface AudioTrackInfo {
  url: string;
  filename: string;
  title: string;
  isTheme: boolean;
}

export interface MusicServiceState {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTrack: AudioTrackInfo | null;
  isMinigameActive: boolean;
  hasStartedTheme: boolean;
  availableTracks: AudioTrackInfo[];
  themeTrack: AudioTrackInfo | null;
}

type Listener = (state: MusicServiceState) => void;

class BackgroundMusicService {
  private audio: HTMLAudioElement | null = null;
  private listeners: Set<Listener> = new Set();

  private state: MusicServiceState = {
    isPlaying: false,
    isMuted: false,
    volume: 0.3,
    currentTrack: null,
    isMinigameActive: false,
    hasStartedTheme: false,
    availableTracks: [],
    themeTrack: null,
  };

  private initialized = false;
  private userPausePreference = false; // True ONLY if the user manually clicked Pause!

  constructor() {
    if (typeof window !== "undefined") {
      const savedMuted = localStorage.getItem("bancada_music_muted");
      if (savedMuted !== null) {
        this.state.isMuted = savedMuted === "true";
      }

      const savedVol = localStorage.getItem("bancada_music_volume");
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.state.volume = parsed;
        }
      }
    }
  }

  public async init() {
    if (this.initialized || typeof window === "undefined") return;
    this.initialized = true;

    // Create single Audio element
    this.audio = new Audio();
    this.audio.volume = this.state.isMuted ? 0 : this.state.volume;

    // Track ended listener -> play next random track continuously
    this.audio.addEventListener("ended", () => {
      this.handleTrackEnded();
    });

    // Error listener -> skip to next track if file missing
    this.audio.addEventListener("error", (e) => {
      console.warn("Audio file failed to load, playing next track:", e);
      this.nextTrack();
    });

    // Fetch dynamic track list from API
    await this.fetchTracks();

    // Setup global user interaction listener to bypass browser autoplay restrictions
    const unlockAutoplay = () => {
      if (!this.state.isPlaying && !this.userPausePreference) {
        this.startTheme();
      }
    };

    window.addEventListener("click", unlockAutoplay, { once: true });
    window.addEventListener("touchstart", unlockAutoplay, { once: true });
    window.addEventListener("keydown", unlockAutoplay, { once: true });

    // Listen for custom global events
    window.addEventListener("bancada:music:start-theme", () => this.startTheme());
    window.addEventListener("bancada:minigame:start", () => this.notifyMinigameStart());
    window.addEventListener("bancada:minigame:end", () => this.notifyMinigameEnd());
  }

  public async fetchTracks() {
    try {
      const res = await fetch("/api/music");
      if (res.ok) {
        const data = await res.json();
        this.state.themeTrack = data.themeTrack || null;
        this.state.availableTracks = data.tracks || [];

        if (!this.state.themeTrack && this.state.availableTracks.length === 0) {
          this.setupFallbackTracks();
        }
      } else {
        this.setupFallbackTracks();
      }
    } catch {
      this.setupFallbackTracks();
    }
    this.emitChange();
  }

  private setupFallbackTracks() {
    this.state.themeTrack = {
      url: "/music/tema.webm",
      filename: "tema.webm",
      title: "Tema Oficial do Jogo",
      isTheme: true,
    };
    this.state.availableTracks = [
      { url: "/music/sambatorcida.webm", filename: "sambatorcida.webm", title: "Samba de Torcida", isTheme: false },
      { url: "/music/musicabarra.webm", filename: "musicabarra.webm", title: "Música de Barra & Arquibancada", isTheme: false },
      { url: "/music/rap.webm", filename: "rap.webm", title: "Rap da Torcida", isTheme: false },
      { url: "/music/reggae.webm", filename: "reggae.webm", title: "Reggae da Arquibancada", isTheme: false },
      { url: "/music/rock.webm", filename: "rock.webm", title: "Rock de Pista", isTheme: false },
      { url: "/music/funktorcidas.webm", filename: "funktorcidas.webm", title: "Funk das Torcidas", isTheme: false },
    ];
  }

  /**
   * Starts playing the official "tema" music
   */
  public async startTheme() {
    await this.init();
    this.userPausePreference = false;
    this.state.hasStartedTheme = true;

    const trackToPlay = this.state.themeTrack || (this.state.availableTracks[0] ?? null);

    if (trackToPlay) {
      await this.playTrack(trackToPlay);
    }
  }

  /**
   * Play a specific track (Always plays continuously unless user paused)
   */
  public async playTrack(track: AudioTrackInfo) {
    if (!this.audio) return;

    try {
      this.audio.src = track.url;
      this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
      this.state.currentTrack = track;

      if (!this.userPausePreference) {
        await this.audio.play();
        this.state.isPlaying = true;
      }
    } catch (err) {
      console.warn("Autoplay blocked or play error:", err);
      this.state.isPlaying = false;
    }
    this.emitChange();
  }

  /**
   * Called automatically when track ends -> plays random next track
   */
  private handleTrackEnded() {
    if (!this.userPausePreference) {
      this.nextTrack();
    }
  }

  /**
   * Plays next track in random shuffle mode
   */
  public nextTrack() {
    const pool = [...this.state.availableTracks];
    if (this.state.themeTrack && !pool.some((t) => t.url === this.state.themeTrack?.url)) {
      pool.push(this.state.themeTrack);
    }

    if (pool.length === 0) return;

    const candidatePool =
      pool.length > 1
        ? pool.filter((t) => t.url !== this.state.currentTrack?.url)
        : pool;

    const randomIndex = Math.floor(Math.random() * candidatePool.length);
    const selectedTrack = candidatePool[randomIndex];

    this.playTrack(selectedTrack);
  }

  /**
   * Toggle play / pause manually by the USER ONLY
   */
  public togglePlay() {
    if (!this.audio) return;

    if (this.state.isPlaying) {
      this.userPausePreference = true; // User explicitly paused!
      this.audio.pause();
      this.state.isPlaying = false;
    } else {
      this.userPausePreference = false; // User explicitly unpaused!
      if (!this.state.currentTrack) {
        this.startTheme();
        return;
      }
      this.audio.play().catch(console.warn);
      this.state.isPlaying = true;
    }
    this.emitChange();
  }

  /**
   * Minigames no longer force pause background music per user preference
   */
  public notifyMinigameStart() {
    this.state.isMinigameActive = true;
    this.emitChange();
  }

  public notifyMinigameEnd() {
    this.state.isMinigameActive = false;
    this.emitChange();
  }

  /**
   * Toggle Mute State
   */
  public toggleMute() {
    this.state.isMuted = !this.state.isMuted;
    if (typeof window !== "undefined") {
      localStorage.setItem("bancada_music_muted", String(this.state.isMuted));
    }

    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : this.state.volume;
    }
    this.emitChange();
  }

  /**
   * Change Volume (0 to 1)
   */
  public setVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    this.state.volume = clamped;
    if (typeof window !== "undefined") {
      localStorage.setItem("bancada_music_volume", String(clamped));
    }

    if (this.audio) {
      this.audio.volume = this.state.isMuted ? 0 : clamped;
    }
    this.emitChange();
  }

  public getState(): MusicServiceState {
    return { ...this.state };
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emitChange() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => listener(currentState));
  }
}

export const MusicService = new BackgroundMusicService();
