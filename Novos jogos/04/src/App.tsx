import React, { useEffect, useRef, useState } from 'react';
import { BANCADA_ZIP_BASE64 } from './zipData';
import {
  Trophy,
  Play,
  RotateCcw,
  Flame,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Download,
  ExternalLink,
  Users,
  Sparkles,
  Shield,
  Clock,
  Send,
  AlertTriangle
} from 'lucide-react';

/* ==========================================================================
   WEB AUDIO API SOUND SYNTHESIZER
   ========================================================================== */
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  init() {
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

  playBumbo() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  playPickup() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.12);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playWhistle() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, now);
    osc.frequency.setValueAtTime(2200, now + 0.08);
    osc.frequency.setValueAtTime(2600, now + 0.16);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playPoliceSiren() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.15);
    osc.frequency.linearRampToValueAtTime(650, now + 0.3);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playBrawl() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.25);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
    setTimeout(() => this.playCheer(), 120);
  }

  playRage() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.linearRampToValueAtTime(450, now + 0.22);
    osc.frequency.linearRampToValueAtTime(130, now + 0.42);
    gain.gain.setValueAtTime(0.26, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  playCheer() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    [440, 554.37, 659.25, 880].forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.18, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + 0.5);
    });
  }
}

const audio = new SoundEngine();

/* ==========================================================================
   MAZE DEFINITIONS
   ========================================================================== */
const GRID_W = 15;
const GRID_H = 15;

// 0: path/street, 1: wall/concrete barrier, 3: exit (Ponto de Fuga / Portão da Bancada)
const MAZE_MAP = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,3,1],
  [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
  [1,0,1,0,0,0,0,0,1,0,0,0,1,0,1],
  [1,0,1,1,1,1,0,1,1,1,1,0,1,0,1],
  [1,0,0,0,0,1,0,0,0,0,1,0,0,0,1],
  [1,1,1,0,1,1,1,0,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Avenida central aberta
  [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1], // Avenida para viatura 2
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Avenida sul aberta para largada e viatura 1
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface GameItem {
  x: number;
  y: number;
  type: 'flare' | 'drum' | 'banner' | 'ticket';
  label: string;
  collected: boolean;
}

// 3 Bondes Maiores da Torcida Rival
export interface BigRivalMob {
  id: number;
  name: string;
  x: number;
  y: number;
  path: { x: number; y: number }[];
  targetIdx: number;
  speed: number;
  isChasing: boolean;
  alertTimer: number;
}

// 2 Viaturas da Polícia (Pouco alcance de visão, prendem se chegar perto)
export interface PoliceCar {
  id: number;
  x: number;
  y: number;
  path: { x: number; y: number }[];
  targetIdx: number;
  speed: number;
  heading: 'left' | 'right' | 'up' | 'down';
  sirenPhase: number;
}

// 1 Bonde Menor Rival (Grupo menor para enquadrar e vencer)
export interface SmallRivalMob {
  x: number;
  y: number;
  defeated: boolean;
}

export interface TorcedorMember {
  id: number;
  role: 'leader' | 'drummer' | 'banner' | 'flare' | 'singing' | 'repique' | 'megaphone' | 'surdo';
  name: string;
  shirtColor: string;
  skinColor: string;
  hairColor: string;
}

export const CROWD_ROSTER: TorcedorMember[] = [
  { id: 1, role: 'leader', name: 'Puxador', shirtColor: '#10b981', skinColor: '#e0ac69', hairColor: '#1f2937' },
  { id: 2, role: 'drummer', name: 'Bumbo de Alça', shirtColor: '#059669', skinColor: '#f1c27d', hairColor: '#374151' },
  { id: 3, role: 'banner', name: 'Bandeirão', shirtColor: '#047857', skinColor: '#8d5524', hairColor: '#111827' },
  { id: 4, role: 'singing', name: 'Cantor da Geral', shirtColor: '#10b981', skinColor: '#c68642', hairColor: '#4b5563' },
  { id: 5, role: 'flare', name: 'Sinalizador', shirtColor: '#059669', skinColor: '#ffdbac', hairColor: '#1f2937' },
  { id: 6, role: 'repique', name: 'Caixa de Ritmo', shirtColor: '#047857', skinColor: '#e0ac69', hairColor: '#2b2b2b' },
  { id: 7, role: 'megaphone', name: 'Voz da Torcida', shirtColor: '#10b981', skinColor: '#8d5524', hairColor: '#111827' },
  { id: 8, role: 'surdo', name: 'Surdo de Marcação', shirtColor: '#047857', skinColor: '#f1c27d', hairColor: '#374151' },
];

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'minigame' | 'simulator' | 'code'>('minigame');
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Minigame State
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'WON' | 'LOST'>('READY');
  const [timeLeft, setTimeLeft] = useState(45);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [flaresCount, setFlaresCount] = useState(0);
  const [lastMinigameScore, setLastMinigameScore] = useState(85);
  const [statusMessage, setStatusMessage] = useState('');
  const [smallRivalDefeated, setSmallRivalDefeated] = useState(false);
  const [rivalsEnraged, setRivalsEnraged] = useState(false);

  // Simulator State
  const [homeStrength, setHomeStrength] = useState(62);
  const [awayStrength, setAwayStrength] = useState(78);
  const [busScore, setBusScore] = useState(90);
  const [partyScore, setPartyScore] = useState(85);
  const [simulationRun, setSimulationRun] = useState(false);
  const [simScoreHome, setSimScoreHome] = useState(0);
  const [simScoreAway, setSimScoreAway] = useState(0);
  const [narrative, setNarrative] = useState<{ p1: string; p2: string; p3: string } | null>(null);

  // Code Copy & ZIP Download State
  const [copied, setCopied] = useState(false);
  const [zipDownloaded, setZipDownloaded] = useState(false);
  const [singleHtmlContent, setSingleHtmlContent] = useState<string>('');

  // Internal mutable refs for smooth 60fps canvas loop
  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;
  const smallRivalDefeatedRef = useRef(false);
  const rivalsEnragedRef = useRef(false);
  const brawlBannerRef = useRef<{ text: string; sub: string; life: number } | null>(null);

  const playerRef = useRef({
    x: 1.5,
    y: 13.5,
    vx: 0,
    vy: 0,
    speed: 3.0,
    flareActive: false,
    flareTime: 0,
  });

  // Pelotão da Torcida (Crowd Members & Trail)
  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const chantsRef = useRef<{ text: string; x: number; y: number; life: number; maxLife: number }[]>([]);
  const lastChantTimeRef = useRef<number>(0);

  // 3 Bondes Maiores da Torcida Rival (Patrulham; ao aproximar perseguem; ficam mais rápidos após bonde menor ser vencido)
  const bigRivalsRef = useRef<BigRivalMob[]>([
    {
      id: 1,
      name: 'Bonde Norte Rival',
      x: 5.5,
      y: 1.5,
      path: [{ x: 5.5, y: 1.5 }, { x: 9.5, y: 1.5 }, { x: 12.5, y: 3.5 }, { x: 7.5, y: 3.5 }],
      targetIdx: 0,
      speed: 1.35,
      isChasing: false,
      alertTimer: 0,
    },
    {
      id: 2,
      name: 'Bonde Leste Rival',
      x: 13.5,
      y: 5.5,
      path: [{ x: 13.5, y: 5.5 }, { x: 13.5, y: 10.5 }, { x: 11.5, y: 7.5 }],
      targetIdx: 0,
      speed: 1.4,
      isChasing: false,
      alertTimer: 0,
    },
    {
      id: 3,
      name: 'Bonde Oeste Rival',
      x: 3.5,
      y: 5.5,
      path: [{ x: 3.5, y: 5.5 }, { x: 1.5, y: 5.5 }, { x: 1.5, y: 8.5 }, { x: 3.5, y: 8.5 }],
      targetIdx: 0,
      speed: 1.35,
      isChasing: false,
      alertTimer: 0,
    },
  ]);

  // 2 Viaturas da Polícia (Pouco alcance de visão, prendem se chegar perto)
  const policeCarsRef = useRef<PoliceCar[]>([
    {
      id: 1,
      x: 2.5,
      y: 13.5,
      path: [{ x: 2.5, y: 13.5 }, { x: 13.5, y: 13.5 }],
      targetIdx: 0,
      speed: 1.35,
      heading: 'right',
      sirenPhase: 0,
    },
    {
      id: 2,
      x: 3.5,
      y: 9.5,
      path: [{ x: 3.5, y: 9.5 }, { x: 11.5, y: 9.5 }],
      targetIdx: 0,
      speed: 1.35,
      heading: 'right',
      sirenPhase: 0,
    },
  ]);

  // 1 Bonde Menor da Torcida Rival (Grupo pequeno isolado para enquadrar e vencer)
  const smallRivalMobRef = useRef<SmallRivalMob>({
    x: 7.5,
    y: 7.5,
    defeated: false,
  });

  const itemsRef = useRef<GameItem[]>([]);
  const smokeParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; life: number; color: string }[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
    if (next) audio.init();
  };

  // Fetch single HTML file content for the code tab
  useEffect(() => {
    fetch('/fuga-do-labirinto.html')
      .then((res) => res.text())
      .then((txt) => setSingleHtmlContent(txt))
      .catch(() => {
        setSingleHtmlContent('<!-- Arquivo único /fuga-do-labirinto.html disponível no diretório public -->');
      });
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Maze Items Initialization
  const initItems = () => {
    const freshItems: GameItem[] = [
      { x: 1.5, y: 1.5, type: 'flare', label: '🔥', collected: false },
      { x: 7.5, y: 1.5, type: 'drum', label: '🥁', collected: false },
      { x: 7.5, y: 7.5, type: 'banner', label: '🚩', collected: false },
      { x: 13.5, y: 11.5, type: 'ticket', label: '🎟️', collected: false },
      { x: 3.5, y: 9.5, type: 'flare', label: '🔥', collected: false },
    ];
    itemsRef.current = freshItems;
    setItemsCollected(0);
    setFlaresCount(0);
  };

  // Wall collision check
  const isWall = (x: number, y: number) => {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return true;
    const tile = MAZE_MAP[gy][gx];
    return tile === 1 || tile === 2;
  };

  // Start minigame
  const startMinigame = () => {
    audio.init();
    audio.playWhistle();

    const startX = 1.5;
    const startY = 13.5;

    playerRef.current = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      speed: 3.0,
      flareActive: false,
      flareTime: 0,
    };
    trailRef.current = Array.from({ length: 140 }, () => ({ x: startX, y: startY }));
    chantsRef.current = [
      { text: 'VAMOS BANCADA! ESCAPAR DA EMBOSCADA!', x: startX, y: startY - 0.7, life: 2.5, maxLife: 2.5 }
    ];
    lastChantTimeRef.current = performance.now();
    smokeParticlesRef.current = [];
    brawlBannerRef.current = null;

    setSmallRivalDefeated(false);
    setRivalsEnraged(false);
    smallRivalDefeatedRef.current = false;
    rivalsEnragedRef.current = false;

    // Reset 3 Big Rival Mobs
    bigRivalsRef.current = [
      {
        id: 1,
        name: 'Bonde Norte Rival',
        x: 5.5,
        y: 1.5,
        path: [{ x: 5.5, y: 1.5 }, { x: 9.5, y: 1.5 }, { x: 12.5, y: 3.5 }, { x: 7.5, y: 3.5 }],
        targetIdx: 0,
        speed: 1.35,
        isChasing: false,
        alertTimer: 0,
      },
      {
        id: 2,
        name: 'Bonde Leste Rival',
        x: 13.5,
        y: 5.5,
        path: [{ x: 13.5, y: 5.5 }, { x: 13.5, y: 10.5 }, { x: 11.5, y: 7.5 }],
        targetIdx: 0,
        speed: 1.4,
        isChasing: false,
        alertTimer: 0,
      },
      {
        id: 3,
        name: 'Bonde Oeste Rival',
        x: 3.5,
        y: 5.5,
        path: [{ x: 3.5, y: 5.5 }, { x: 1.5, y: 5.5 }, { x: 1.5, y: 8.5 }, { x: 3.5, y: 8.5 }],
        targetIdx: 0,
        speed: 1.35,
        isChasing: false,
        alertTimer: 0,
      },
    ];

    // Reset 2 Police Patrol Cars
    policeCarsRef.current = [
      {
        id: 1,
        x: 2.5,
        y: 13.5,
        path: [{ x: 2.5, y: 13.5 }, { x: 13.5, y: 13.5 }],
        targetIdx: 0,
        speed: 1.35,
        heading: 'right',
        sirenPhase: 0,
      },
      {
        id: 2,
        x: 3.5,
        y: 9.5,
        path: [{ x: 3.5, y: 9.5 }, { x: 11.5, y: 9.5 }],
        targetIdx: 0,
        speed: 1.35,
        heading: 'right',
        sirenPhase: 0,
      },
    ];

    // Reset 1 Small Rival Mob
    smallRivalMobRef.current = {
      x: 7.5,
      y: 7.5,
      defeated: false,
    };

    initItems();
    setTimeLeft(45);
    setGameState('PLAYING');
    setStatusMessage('');
  };

  // End minigame
  const endMinigame = (won: boolean, msg: string) => {
    setGameState(won ? 'WON' : 'LOST');
    setStatusMessage(msg);

    if (won) {
      audio.playCheer();
      const didBeatSmall = smallRivalDefeatedRef.current;
      const timePts = Math.min(25, Math.floor((timeLeft / 45) * 25));
      const itemPts = Math.floor((itemsCollected / 5) * 15);
      
      let score = 60 + timePts + itemPts;
      if (didBeatSmall) {
        score = Math.min(100, score + 25); // Top score for beating small mob + escaping!
      } else {
        score = Math.min(80, Math.max(65, score)); // Good escape score
      }

      setLastMinigameScore(score);
      setPartyScore(score); // auto-sync with match simulator
    } else {
      audio.playWhistle();
      const itemPts = Math.floor((itemsCollected / 5) * 20);
      const score = Math.min(45, Math.max(15, itemPts + 15));
      setLastMinigameScore(score);
      setPartyScore(score);
    }
  };

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev % 4 === 0) audio.playBumbo();
          if (prev <= 1) {
            endMinigame(false, 'O tempo se esgotou antes de conseguir escapar da emboscada!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, itemsCollected]);

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const renderLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const currentGameState = gameStateRef.current;
      const player = playerRef.current;
      const tileSize = canvas.width / GRID_W;

      // Update game physics if playing
      if (currentGameState === 'PLAYING') {
        const keys = keysRef.current;
        let moveX = 0;
        let moveY = 0;
        if (keys['arrowup'] || keys['w']) moveY -= 1;
        if (keys['arrowdown'] || keys['s']) moveY += 1;
        if (keys['arrowleft'] || keys['a']) moveX -= 1;
        if (keys['arrowright'] || keys['d']) moveX += 1;

        if (moveX !== 0 || moveY !== 0) {
          const len = Math.hypot(moveX, moveY);
          player.vx = moveX / len;
          player.vy = moveY / len;
        }

        let speed = player.speed;
        if (player.flareActive) {
          speed *= 1.45;
          player.flareTime -= dt;
          if (player.flareTime <= 0) player.flareActive = false;

          if (Math.random() < 0.6) {
            smokeParticlesRef.current.push({
              x: player.x * tileSize,
              y: player.y * tileSize,
              vx: (Math.random() - 0.5) * 30,
              vy: -20 - Math.random() * 30,
              size: 6 + Math.random() * 8,
              life: 1.0,
              color: Math.random() > 0.5 ? 'rgba(239, 68, 68,' : 'rgba(245, 158, 11,',
            });
          }
        }

        const nextX = player.x + player.vx * speed * dt;
        const nextY = player.y + player.vy * speed * dt;

        if (!isWall(nextX, player.y)) player.x = nextX;
        if (!isWall(player.x, nextY)) player.y = nextY;

        // Check Items
        itemsRef.current.forEach((item) => {
          if (!item.collected) {
            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            if (dist < 0.6) {
              item.collected = true;
              audio.playPickup();
              setItemsCollected((c) => c + 1);
              if (item.type === 'flare') {
                player.flareActive = true;
                player.flareTime = 5;
                setFlaresCount((f) => f + 1);
              }
            }
          }
        });

        // Update smoke
        for (let i = smokeParticlesRef.current.length - 1; i >= 0; i--) {
          const p = smokeParticlesRef.current[i];
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt * 1.5;
          p.size += dt * 6;
          if (p.life <= 0) {
            smokeParticlesRef.current.splice(i, 1);
          }
        }

        // Update Brawl banner notification life
        if (brawlBannerRef.current) {
          brawlBannerRef.current.life -= dt;
          if (brawlBannerRef.current.life <= 0) {
            brawlBannerRef.current = null;
          }
        }

        // 1. CONFRONTO COM O BONDE MENOR RIVAL (Objetivo 2)
        const smallMob = smallRivalMobRef.current;
        if (!smallMob.defeated) {
          const smDist = Math.hypot(player.x - smallMob.x, player.y - smallMob.y);
          if (smDist < 0.85) {
            // Nosso bonde foi pra cima e ganhou!
            smallMob.defeated = true;
            smallRivalDefeatedRef.current = true;
            setSmallRivalDefeated(true);

            audio.playBrawl();

            // Partículas de vitória no confronto
            for (let p = 0; p < 25; p++) {
              smokeParticlesRef.current.push({
                x: smallMob.x * tileSize,
                y: smallMob.y * tileSize,
                vx: (Math.random() - 0.5) * 90,
                vy: (Math.random() - 0.5) * 90,
                size: 6 + Math.random() * 8,
                life: 1.4,
                color: Math.random() > 0.5 ? 'rgba(239, 68, 68,' : 'rgba(245, 158, 11,',
              });
            }

            brawlBannerRef.current = {
              text: '💥 BONDE MENOR (3 PESSOAS) VENCIDO!',
              sub: 'BOTOU PRA CORRER! OS 3 BONDES MAIORES (6 PESSOAS CADA) ENTRARAM EM FÚRIA!',
              life: 3.8,
            };

            chantsRef.current.push({
              text: 'O BONDE É NOSSO! CORRERAM!',
              x: player.x,
              y: player.y - 0.7,
              life: 3.0,
              maxLife: 3.0,
            });

            // ATIVAR FÚRIA NOS 3 BONDES MAIORES RIVAIS!
            rivalsEnragedRef.current = true;
            setRivalsEnraged(true);
            setTimeout(() => audio.playRage(), 350);

            bigRivalsRef.current.forEach((mob) => {
              mob.speed = 2.25; // Mais rápidos!
              mob.isChasing = true; // Vêm pra cima imediatamente!
            });
          }
        }

        // 2. ATUALIZAR 3 BONDES MAIORES DA TORCIDA RIVAL
        bigRivalsRef.current.forEach((mob) => {
          const pdist = Math.hypot(player.x - mob.x, player.y - mob.y);
          const isEnraged = rivalsEnragedRef.current;
          const aggroDist = isEnraged ? 7.5 : 3.8;

          // Se o jogador chegar perto, eles percebem e vêm pra cima!
          if (pdist < aggroDist) {
            mob.isChasing = true;
          }

          const curSpeed = isEnraged ? 2.25 : 1.45;

          if (mob.isChasing) {
            // Perseguição ativa ao jogador
            const dx = player.x - mob.x;
            const dy = player.y - mob.y;
            const len = Math.hypot(dx, dy) || 1;
            const stepX = (dx / len) * curSpeed * dt;
            const stepY = (dy / len) * curSpeed * dt;

            if (!isWall(mob.x + stepX, mob.y)) mob.x += stepX;
            if (!isWall(mob.x, mob.y + stepY)) mob.y += stepY;

            // Se encostar no jogador: DERROTA!
            if (pdist < 0.68) {
              audio.playWhistle();
              endMinigame(false, 'Seu bonde foi cercado por um dos bondes maiores da torcida rival! Você caiu na emboscada.');
            }
          } else {
            // Patrulha de rotina
            const target = mob.path[mob.targetIdx];
            const gdx = target.x - mob.x;
            const gdy = target.y - mob.y;
            const gdist = Math.hypot(gdx, gdy);

            if (gdist < 0.15) {
              mob.targetIdx = (mob.targetIdx + 1) % mob.path.length;
            } else {
              mob.x += (gdx / gdist) * curSpeed * dt;
              mob.y += (gdy / gdist) * curSpeed * dt;
            }

            if (pdist < 0.68) {
              audio.playWhistle();
              endMinigame(false, 'Seu bonde foi cercado por um dos bondes maiores da torcida rival! Você caiu na emboscada.');
            }
          }
        });

        // 3. ATUALIZAR 2 VIATURAS DA POLÍCIA (Pouco alcance de visão, prendem se perto)
        policeCarsRef.current.forEach((car) => {
          const target = car.path[car.targetIdx];
          const dx = target.x - car.x;
          const dy = target.y - car.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 0.15) {
            car.targetIdx = (car.targetIdx + 1) % car.path.length;
          } else {
            const vx = dx / dist;
            const vy = dy / dist;
            car.x += vx * car.speed * dt;
            car.y += vy * car.speed * dt;

            if (Math.abs(vx) > Math.abs(vy)) {
              car.heading = vx > 0 ? 'right' : 'left';
            } else {
              car.heading = vy > 0 ? 'down' : 'up';
            }
          }

          car.sirenPhase = (car.sirenPhase + dt * 12) % (Math.PI * 2);

          // Checagem de proximidade (alcance curto, 1.85 tiles na direção dos faróis ou 0.65 colisão direta)
          const pdist = Math.hypot(player.x - car.x, player.y - car.y);
          let inHeadlight = false;
          if (pdist < 1.85) {
            if (car.heading === 'right' && player.x > car.x && Math.abs(player.y - car.y) < 0.65) inHeadlight = true;
            if (car.heading === 'left' && player.x < car.x && Math.abs(player.y - car.y) < 0.65) inHeadlight = true;
            if (car.heading === 'down' && player.y > car.y && Math.abs(player.x - car.x) < 0.65) inHeadlight = true;
            if (car.heading === 'up' && player.y < car.y && Math.abs(player.x - car.x) < 0.65) inHeadlight = true;
          }

          if (pdist < 0.65 || inHeadlight) {
            audio.playPoliceSiren();
            endMinigame(false, 'A viatura da polícia interceptou o bonde! Todos foram detidos e enquadrados.');
          }
        });

        // Update crowd breadcrumb trail
        const lastPt = trailRef.current[0];
        if (!lastPt || Math.hypot(player.x - lastPt.x, player.y - lastPt.y) > 0.032) {
          trailRef.current.unshift({ x: player.x, y: player.y });
          if (trailRef.current.length > 140) {
            trailRef.current.pop();
          }
        }

        // Periodic Torcida Chants (speech balloons over the crowd)
        if (currentTime - lastChantTimeRef.current > 3400) {
          lastChantTimeRef.current = currentTime;
          const chantPhrases = [
            'VAI PRA CIMA!',
            'É A BANCADA!',
            'VAMOS MEU TIME!',
            'DÁ-LHE, DÁ-LHE!',
            'EXPLODE O CALDEIRÃO!',
            'EU SOU TORCIDA!',
            'BATERIA A MIL!',
            'NINGUÉM PEGA O BONDE!'
          ];
          const chosenText = chantPhrases[Math.floor(Math.random() * chantPhrases.length)];
          chantsRef.current.push({
            text: chosenText,
            x: player.x,
            y: player.y - 0.7,
            life: 2.2,
            maxLife: 2.2,
          });
          if (Math.random() > 0.45) {
            audio.playBumbo();
          }
        }

        // Update active chants
        for (let i = chantsRef.current.length - 1; i >= 0; i--) {
          const ch = chantsRef.current[i];
          ch.life -= dt;
          ch.y -= dt * 0.22; // gently floats up
          if (ch.life <= 0) {
            chantsRef.current.splice(i, 1);
          }
        }

        // Check Win (exit tile = 3 - Ponto de Fuga / Portão da Bancada)
        const gx = Math.floor(player.x);
        const gy = Math.floor(player.y);
        if (MAZE_MAP[gy] && MAZE_MAP[gy][gx] === 3) {
          if (smallRivalDefeatedRef.current) {
            endMinigame(true, 'VITÓRIA TOTAL! Você botou o bonde menor rival pra correr e escapou com louvor da emboscada até a bancada!');
          } else {
            endMinigame(true, 'FUGA TÁTICA! Seu bonde conseguiu despistar a emboscada e chegou em segurança à bancada!');
          }
        }
      }

      // Drawing
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Maze tiles
      for (let y = 0; y < GRID_H; y++) {
        for (let x = 0; x < GRID_W; x++) {
          const tile = MAZE_MAP[y][x];
          const px = x * tileSize;
          const py = y * tileSize;

          if (tile === 1) {
            ctx.fillStyle = '#16212e';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#27384e';
            ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
          } else if (tile === 3) {
            // Ponto de Fuga / Portão da Bancada
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#10b981';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏁', px + tileSize / 2, py + tileSize / 2);
          } else {
            ctx.fillStyle = '#0e1622';
            ctx.fillRect(px, py, tileSize, tileSize);
          }
        }
      }

      // Items
      itemsRef.current.forEach((item) => {
        if (!item.collected) {
          const ix = item.x * tileSize;
          const iy = item.y * tileSize;

          ctx.beginPath();
          ctx.arc(ix, iy, 12, 0, Math.PI * 2);
          ctx.fillStyle = item.type === 'flare' ? 'rgba(239, 68, 68, 0.25)' : 'rgba(245, 158, 11, 0.25)';
          ctx.fill();

          ctx.font = '18px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.label, ix, iy);
        }
      });

      // 1. RENDERIZAR BONDE MENOR DA TORCIDA RIVAL (Objetivo 2)
      const sMob = smallRivalMobRef.current;
      const sx = sMob.x * tileSize;
      const sy = sMob.y * tileSize;

      if (!sMob.defeated) {
        // Indicador de alvo pulsante
        const pulse = Math.sin(currentTime / 200) * 4;
        ctx.beginPath();
        ctx.arc(sx, sy, 22 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3 Torcedores Rivais Pequenos (Bonde Menor - 3 pessoas)
        const smallMobOffsets = [
          { ox: 0, oy: -6 },
          { ox: -7, oy: 4 },
          { ox: 7, oy: 4 }
        ];

        smallMobOffsets.forEach(({ ox, oy }) => {
          const bx = sx + ox;
          const by = sy + oy;
          // Corpo
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(bx, by + 2, 5.5, 0, Math.PI * 2);
          ctx.fill();
          // Cabeça
          ctx.fillStyle = '#ffdbac';
          ctx.beginPath();
          ctx.arc(bx, by - 5, 3.8, 0, Math.PI * 2);
          ctx.fill();
          // Cabelo / Boné
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(bx, by - 6, 3.8, Math.PI, Math.PI * 2);
          ctx.fill();
        });

        // Etiqueta indicando que podemos ir pra cima e vencer o grupo de 3
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 BONDE MENOR (3 PESSOAS)', sx, sy - 16);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText('Vá pra cima e vença!', sx, sy + 16);
      } else {
        // Estado derrotado no chão
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫🏳️', sx, sy);
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText('✓ VENCIDO', sx, sy + 12);
      }

      // 2. RENDERIZAR 2 VIATURAS DA POLÍCIA (Pouco alcance de visão com farol)
      policeCarsRef.current.forEach((car) => {
        const cx = car.x * tileSize;
        const cy = car.y * tileSize;

        // Cone de luz do farol dianteiro (mostra o pouco alcance de visão)
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.18)';
        ctx.beginPath();
        if (car.heading === 'right') {
          ctx.moveTo(cx + 12, cy - 6);
          ctx.lineTo(cx + tileSize * 1.8, cy - 14);
          ctx.lineTo(cx + tileSize * 1.8, cy + 14);
          ctx.lineTo(cx + 12, cy + 6);
        } else if (car.heading === 'left') {
          ctx.moveTo(cx - 12, cy - 6);
          ctx.lineTo(cx - tileSize * 1.8, cy - 14);
          ctx.lineTo(cx - tileSize * 1.8, cy + 14);
          ctx.lineTo(cx - 12, cy + 6);
        } else if (car.heading === 'down') {
          ctx.moveTo(cx - 6, cy + 12);
          ctx.lineTo(cx - 14, cy + tileSize * 1.8);
          ctx.lineTo(cx + 14, cy + tileSize * 1.8);
          ctx.lineTo(cx + 6, cy + 12);
        } else {
          ctx.moveTo(cx - 6, cy - 12);
          ctx.lineTo(cx - 14, cy - tileSize * 1.8);
          ctx.lineTo(cx + 14, cy - tileSize * 1.8);
          ctx.lineTo(cx + 6, cy - 12);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Corpo do Carro Policial
        ctx.save();
        ctx.translate(cx, cy);
        const isHoriz = car.heading === 'left' || car.heading === 'right';
        const carW = isHoriz ? 24 : 14;
        const carH = isHoriz ? 14 : 24;

        // Chassi
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW / 2, -carH / 2, carW, carH);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-carW / 2, -carH / 2, carW, carH);

        // Faixa branca central
        ctx.fillStyle = '#f8fafc';
        if (isHoriz) {
          ctx.fillRect(-carW / 4, -carH / 2 + 1, carW / 2, carH - 2);
        } else {
          ctx.fillRect(-carW / 2 + 1, -carH / 4, carW - 2, carH / 2);
        }

        // Giroflex no teto (alternando azul e vermelho estroboscópico)
        const strobe = Math.sin(car.sirenPhase) > 0;
        ctx.fillStyle = strobe ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(-2, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = !strobe ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(2, 0, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Texto indicativo
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🚓 POLÍCIA', cx, cy - 12);
      });

      // 3. RENDERIZAR 3 BONDES MAIORES DA TORCIDA RIVAL (5 torcedores juntos + bandeira)
      bigRivalsRef.current.forEach((mob) => {
        const mx = mob.x * tileSize;
        const my = mob.y * tileSize;
        const isEnraged = rivalsEnragedRef.current;

        // Círculo de percepção e perigo
        const auraRadius = (isEnraged ? 7.5 : 3.8) * tileSize;
        ctx.beginPath();
        ctx.arc(mx, my, auraRadius, 0, Math.PI * 2);
        ctx.strokeStyle = mob.isChasing
          ? 'rgba(239, 68, 68, 0.28)'
          : 'rgba(239, 68, 68, 0.1)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        if (mob.isChasing) {
          ctx.beginPath();
          ctx.arc(mx, my, 26, 0, Math.PI * 2);
          ctx.fillStyle = isEnraged ? 'rgba(239, 68, 68, 0.3)' : 'rgba(239, 68, 68, 0.18)';
          ctx.fill();
        }

        // Pelotão Rival: 6 Torcedores juntos + bandeira
        const mobOffsets = [
          { ox: 0, oy: -8, isLeader: true },   // Líder na ponta
          { ox: -8, oy: -1, isLeader: false }, // Ala esquerda
          { ox: 8, oy: -1, isLeader: false },  // Ala direita
          { ox: 0, oy: 3, isLeader: false },   // Centro do pelotão
          { ox: -6, oy: 9, isLeader: false },  // Retaguarda esquerda
          { ox: 6, oy: 9, isLeader: false },   // Retaguarda direita
        ];

        mobOffsets.forEach(({ ox, oy, isLeader }) => {
          const bx = mx + ox;
          const by = my + oy;

          // Camiseta rival (marinho com listra vermelha)
          ctx.fillStyle = isLeader ? '#991b1b' : '#1e3a8a';
          ctx.beginPath();
          ctx.arc(bx, by + 2, 5.5, 0, Math.PI * 2);
          ctx.fill();

          // Cabeça
          ctx.fillStyle = '#e0ac69';
          ctx.beginPath();
          ctx.arc(bx, by - 5, 3.5, 0, Math.PI * 2);
          ctx.fill();

          // Cabelo
          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(bx, by - 6, 3.5, Math.PI, Math.PI * 2);
          ctx.fill();
        });

        // Bandeira do Bonde Rival no topo
        const poleX = mx + 9;
        const poleY = my - 18;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(poleX, my);
        ctx.lineTo(poleX, poleY);
        ctx.stroke();

        ctx.fillStyle = '#991b1b';
        ctx.beginPath();
        ctx.moveTo(poleX, poleY);
        ctx.lineTo(poleX + 11, poleY + 4);
        ctx.lineTo(poleX, poleY + 8);
        ctx.closePath();
        ctx.fill();

        // Status flutuante
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        if (isEnraged) {
          ctx.fillStyle = '#ef4444';
          ctx.fillText('⚡ FÚRIA! (6 PESSOAS)', mx, my - 22);
        } else if (mob.isChasing) {
          ctx.fillStyle = '#f87171';
          ctx.fillText('🔥 VEM PRA CIMA! (6)', mx, my - 22);
        } else {
          ctx.fillStyle = '#fca5a5';
          ctx.fillText('⚠️ Bonde Maior (6)', mx, my - 22);
        }
      });

      // Render Pelotão da Torcida (Crowd of Characters Walking Together)
      const currentCrowdCount = Math.min(CROWD_ROSTER.length, 4 + itemsCollected);
      const isMoving = Math.hypot(player.vx, player.vy) > 0.05;
      const animSec = currentTime / 1000;

      interface RenderableMember {
        member: TorcedorMember;
        x: number;
        y: number;
        isLeader: boolean;
        index: number;
      }

      const crowdToRender: RenderableMember[] = [];

      for (let k = 0; k < currentCrowdCount; k++) {
        const member = CROWD_ROSTER[k];
        if (k === 0) {
          crowdToRender.push({
            member,
            x: player.x,
            y: player.y,
            isLeader: true,
            index: 0,
          });
        } else {
          // Sample along breadcrumb trail
          const sampleIdx = Math.min(trailRef.current.length - 1, Math.floor(k * 3.4));
          const basePos = trailRef.current[sampleIdx] || { x: player.x, y: player.y };

          // Direction along trail to find lateral perpendicular offset
          const prevPos = trailRef.current[Math.max(0, sampleIdx - 2)] || basePos;
          const dtx = prevPos.x - basePos.x;
          const dty = prevPos.y - basePos.y;
          const tlen = Math.hypot(dtx, dty) || 1;
          const perpX = -dty / tlen;
          const perpY = dtx / tlen;

          // Stagger lateral offset: alternate left/right to form an organic pack of fans
          const lateralFactor = (k % 2 === 1 ? -1 : 1) * (0.13 + (k % 3) * 0.035);
          let candX = basePos.x + perpX * lateralFactor;
          let candY = basePos.y + perpY * lateralFactor;

          if (isWall(candX, candY)) {
            candX = basePos.x;
            candY = basePos.y;
          }

          crowdToRender.push({
            member,
            x: candX,
            y: candY,
            isLeader: false,
            index: k,
          });
        }
      }

      // Sort by Y for realistic depth layering
      crowdToRender.sort((a, b) => a.y - b.y);

      // Draw each torcedor bonequinho
      crowdToRender.forEach(({ member, x, y, isLeader, index }) => {
        const cx = x * tileSize;
        const cy = y * tileSize;

        // Bobbing walk cycle
        const stepFreq = isMoving ? 13 : 4;
        const bob = isMoving
          ? Math.abs(Math.sin(animSec * stepFreq + index * 1.4)) * 3
          : Math.sin(animSec * 3 + index * 1.1) * 1.2;
        const sway = isMoving ? Math.sin(animSec * 6 + index) * 1.2 : 0;

        // Flare aura for leader if active
        if (isLeader && player.flareActive) {
          const glowGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, 22);
          glowGrad.addColorStop(0, 'rgba(245, 158, 11, 0.45)');
          glowGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.22)');
          glowGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
          ctx.fillStyle = glowGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // Drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 7, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Animated feet
        const legOffset = isMoving ? Math.sin(animSec * stepFreq + index * 1.4) * 2.5 : 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 3.5 + sway, cy + 3 - bob + legOffset, 2.5, 4);
        ctx.fillRect(cx + 1 + sway, cy + 3 - bob - legOffset, 2.5, 4);

        // Torso / Team Jersey
        const torsoY = cy - 4 - bob;
        ctx.fillStyle = member.shirtColor;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(cx - 5 + sway, torsoY, 10, 9, 2);
        } else {
          ctx.rect(cx - 5 + sway, torsoY, 10, 9);
        }
        ctx.fill();

        // White stripe on jersey
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1 + sway, torsoY, 2, 9);

        // Collar
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + sway, torsoY, 2.5, 0, Math.PI);
        ctx.fill();

        // Head
        const headY = torsoY - 5;
        ctx.fillStyle = member.skinColor;
        ctx.beginPath();
        ctx.arc(cx + sway, headY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Hair / Cap
        ctx.fillStyle = member.hairColor;
        ctx.beginPath();
        ctx.arc(cx + sway, headY - 1, 4.3, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#111827';
        ctx.fillRect(cx - 1.8 + sway, headY - 0.5, 1.2, 1.5);
        ctx.fillRect(cx + 0.8 + sway, headY - 0.5, 1.2, 1.5);

        // Props & Role visuals
        if (isLeader) {
          if (player.flareActive) {
            // Blazing Flare
            const fx = cx + 8 + sway;
            const fy = torsoY - 8;
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + 4 + sway, torsoY + 2);
            ctx.lineTo(fx, fy + 4);
            ctx.stroke();

            // Flare torch body
            ctx.fillStyle = '#dc2626';
            ctx.fillRect(fx - 1.5, fy + 2, 3, 5);

            // Flickering fire
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(fx, fy, 4 + Math.sin(animSec * 20) * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            // Leader leading chants with arm raised
            ctx.strokeStyle = member.skinColor;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + 4 + sway, torsoY + 2);
            ctx.lineTo(cx + 8 + sway, headY - 3 + Math.sin(animSec * 8) * 2);
            ctx.stroke();
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx + 6 + sway, headY - 4 + Math.sin(animSec * 8) * 2, 3, 2);
          }
        } else if (member.role === 'drummer' || member.role === 'repique' || member.role === 'surdo') {
          // Bumbo / Percussion strapped to chest
          const drumY = torsoY + 2;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(cx + sway, drumY, 6, 3.2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(cx + sway, drumY, 4.5, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Beating drumsticks
          const drumBeat = Math.sin(animSec * 16 + index);
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(cx - 5 + sway, drumY - 4 - drumBeat * 2.5);
          ctx.lineTo(cx - 1 + sway, drumY);
          ctx.moveTo(cx + 5 + sway, drumY - 4 + drumBeat * 2.5);
          ctx.lineTo(cx + 1 + sway, drumY);
          ctx.stroke();
        } else if (member.role === 'banner') {
          // Large Waving Team Banner / Bandeirão
          const poleX = cx - 5 + sway;
          const poleTopY = torsoY - 17;
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(poleX, torsoY + 5);
          ctx.lineTo(poleX, poleTopY);
          ctx.stroke();

          // Waving fabric
          const wave1 = Math.sin(animSec * 8 + index) * 3;
          const wave2 = Math.cos(animSec * 8 + index + 1) * 2.5;
          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(poleX, poleTopY);
          ctx.quadraticCurveTo(poleX + 7, poleTopY + wave1, poleX + 14, poleTopY + wave2);
          ctx.lineTo(poleX + 14, poleTopY + 10 + wave2);
          ctx.quadraticCurveTo(poleX + 7, poleTopY + 10 + wave1, poleX, poleTopY + 8);
          ctx.closePath();
          ctx.fill();

          // White diagonal sash across flag
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(poleX, poleTopY + 4);
          ctx.lineTo(poleX + 14, poleTopY + 5 + wave2);
          ctx.stroke();
        } else if (member.role === 'singing') {
          // Arms raised high jumping & singing
          ctx.strokeStyle = member.skinColor;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 4 + sway, torsoY + 3);
          ctx.lineTo(cx - 7 + sway, headY - 4);
          ctx.moveTo(cx + 4 + sway, torsoY + 3);
          ctx.lineTo(cx + 7 + sway, headY - 4);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cx - 8 + sway, headY - 5, 2.5, 2);
          ctx.fillRect(cx + 6 + sway, headY - 5, 2.5, 2);
        } else if (member.role === 'flare') {
          // Torch with small red tip
          const fx = cx + 6 + sway;
          const fy = torsoY - 3;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (member.role === 'megaphone') {
          // Megaphone
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(cx + 3 + sway, torsoY + 1);
          ctx.lineTo(cx + 8 + sway, torsoY - 3);
          ctx.lineTo(cx + 8 + sway, torsoY + 4);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Render Floating Torcida Chants (Comic Speech Bubbles)
      chantsRef.current.forEach((ch) => {
        const bx = ch.x * tileSize;
        const by = ch.y * tileSize;
        const alpha = Math.min(1, ch.life / 0.4);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = 'bold 11px sans-serif';
        const textMetrics = ctx.measureText(ch.text);
        const paddingX = 8;
        const boxW = textMetrics.width + paddingX * 2;
        const boxH = 20;

        const startX = bx - boxW / 2;
        const startY = by - boxH;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(startX, startY, boxW, boxH, 6);
        } else {
          ctx.rect(startX, startY, boxW, boxH);
        }
        ctx.fill();
        ctx.stroke();

        // Speech pointer arrow pointing to the crowd
        ctx.beginPath();
        ctx.moveTo(bx - 3, startY + boxH);
        ctx.lineTo(bx, startY + boxH + 4);
        ctx.lineTo(bx + 3, startY + boxH);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(bx - 3, startY + boxH);
        ctx.lineTo(bx, startY + boxH + 4);
        ctx.lineTo(bx + 3, startY + boxH);
        ctx.stroke();

        // Text
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ch.text, bx, startY + boxH / 2);
        ctx.restore();
      });

      // Render Top Announcement Banner (Brawl Alert / Rage Warning)
      if (brawlBannerRef.current && brawlBannerRef.current.life > 0) {
        const banner = brawlBannerRef.current;
        const bannerH = 46;
        const bAlpha = Math.min(1, banner.life / 0.5);

        ctx.save();
        ctx.globalAlpha = bAlpha;
        // Background banner bar
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(8, 8, canvas.width - 16, bannerH);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, canvas.width - 16, bannerH);

        // Header text
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(banner.text, canvas.width / 2, 13);

        // Subtitle text
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(banner.sub, canvas.width / 2, 30);
        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Directional touch helper
  const handleTouchDir = (dx: number, dy: number) => {
    audio.init();
    playerRef.current.vx = dx;
    playerRef.current.vy = dy;
  };
  const handleTouchStop = () => {
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
  };

  // Bancada Simulator Math Calculations
  const mediaTorcida = (busScore + partyScore) / 2;
  const finalHome = (homeStrength * 0.75) + (mediaTorcida * 0.25);
  const finalAway = awayStrength;
  const diff = finalHome - finalAway;

  // Execute Match Simulation and generate 3-paragraph dynamic narrative
  const handleSimulateMatch = () => {
    audio.init();
    audio.playWhistle();

    let scoreH = 0;
    let scoreA = 0;
    let p1 = '';
    let p2 = '';
    let p3 = '';

    if (Math.abs(diff) <= 3) {
      // Tie zone (dentro da margem de 3 pontos)
      const rand = Math.random();
      if (rand > 0.4) {
        scoreH = 1; scoreA = 1;
      } else if (rand > 0.15) {
        scoreH = 2; scoreA = 2;
      } else {
        scoreH = 0; scoreA = 0;
      }

      p1 = `O árbitro apitou o início da partida sob uma atmosfera elétrica nas arquibancadas. O equilíbrio milimétrico entre as forças ficou nítido desde o primeiro toque na bola: com a Força Final da Casa avaliada em ${finalHome.toFixed(1)} e a do Adversário em ${finalAway.toFixed(1)}, os dois esquemas táticos se travaram em uma disputa ferrenha de posse e marcação alta, sem que nenhum dos lados concedesse espaços livres.`;
      p2 = `Ao longo do segundo tempo, o rugido da torcida inflamada tentou desequilibrar o confronto em favor do mandante, empurrando a equipe em sucessivas bolas alçadas e abafes na intermediária. No entanto, o visitante demonstrou frieza admirável para suportar o ambiente hostil, neutralizando as investidas com bloqueios seguros e respondendo com contragolpes perigosos que mantiveram o jogo no fio da navalha.`;
      p3 = `Nos acréscimos carregados de dramaticidade, uma sequência de escanteios fez o estádio prender o fôlego coletivo, mas as defesas prevaleceram sobre os ataques. O apito final confirmou o placar de ${scoreH} x ${scoreA}, selando um empate justo e fidedigno à margem estreita calculada pelo motor, onde a garra da bancada equilibrou a balança até o último suspiro.`;

    } else if (diff > 3) {
      // Vitória da Casa
      if (diff > 20) {
        scoreH = 3 + Math.floor(Math.random() * 2);
        scoreA = 0;
      } else if (diff > 10) {
        scoreH = 2 + Math.floor(Math.random() * 2);
        scoreA = Math.random() > 0.5 ? 1 : 0;
      } else {
        scoreH = 2;
        scoreA = 1;
      }

      const crowdCarried = homeStrength < awayStrength && finalHome > awayStrength;

      if (crowdCarried) {
        // Superação heroica com a torcida carregando o time
        p1 = `Entrando em campo como franco atirador devido à inferioridade técnica inicial (${homeStrength} contra ${awayStrength} do adversário), o time da casa encontrou seu verdadeiro motor no apoio ensurdecedor das arquibancadas. A apoteose na recepção do ônibus e a intensidade da festa (Média da Torcida ${mediaTorcida.toFixed(1)}) criaram uma redoma eletrizante que intimidou a zaga visitante logo nos minutos iniciais.`;
        p2 = `O reflexo tático do buff de 25% foi imediato: a Força Final saltou para ${finalHome.toFixed(1)}, orquestrando um abafa implacável que encurralou o rival em seu próprio campo defensivo. Os atletas mandantes compensaram a disparidade técnica com uma intensidade física avassaladora, dividindo cada lance como se fosse o último e forçando erros capitais na saída de bola adversária.`;
        p3 = `No clímax do segundo tempo, o abafa se traduziu em gols apoteóticos que explodiram o estádio em sinalizadores e fumaça, sacramentando o triunfo histórico por ${scoreH} x ${scoreA}. Ao apito final, confirmou-se a clássica mística da Bancada Simulator: quando a arquibancada joga junto, a matemática do favoritismo é destroçada no gramado.`;
      } else {
        // Vitória por autoridade técnica e apoio da torcida
        p1 = `Com postura hegemônica desde os primeiros movimentos e impulsionado pelo mar de bandeiras nas arquibancadas, o time da casa assumiu o protagonismo absoluto do duelo. A superioridade da Força Final (${finalHome.toFixed(1)} frente aos ${finalAway.toFixed(1)} do oponente) traduziu-se em ritmo acelerado e volume ofensivo constante pelas alas.`;
        p2 = `O visitante até tentou resistir com linhas compactas, porém a pressão contínua do time mandante minou a resistência física adversária. Alimentados pelos cantos incansáveis da bateria, os meias controlaram o tempo do jogo e construíram oportunidades cristalinas através de triangulações velozes.`;
        p3 = `Os gols saíram com naturalidade para coroar a atuação magistral, fechando a conta no placar elástico de ${scoreH} x ${scoreA}. Uma celebração completa onde técnica refinada e o espetáculo da torcida andaram de mãos dadas rumo a três pontos irretocáveis.`;
      }

    } else {
      // Vitória do Adversário
      scoreA = 2 + Math.floor(Math.random() * 2);
      scoreH = Math.random() > 0.4 ? 1 : 0;

      p1 = `Apesar da festa incansável montada pelos torcedores locais, a solidez técnica do adversário (${finalAway.toFixed(1)} contra ${finalHome.toFixed(1)}) prevaleceu com autoridade logo na primeira etapa. O time visitante soube administrar a pressão das arquibancadas e impôs seu plano de jogo com posse qualificada e frieza cirúrgica.`;
      p2 = `O time da casa tentou reagir no ímpeto e na coragem, impulsionado pelos bumbos da bancada que não paravam de ressoar. Contudo, os descompassos defensivos ao se lançar ao ataque abriram espaços mortais para os contra-ataques do adversário, que castigou com finalizações precisas.`;
      p3 = `O apito final encerrou a contenda em ${scoreH} x ${scoreA} para os visitantes. Embora o resultado no marcador tenha sido amargo para o mandante, a torcida deu uma demonstração admirável de fidelidade, cantando alto até o último segundo e aplaudindo o suor deixado em campo.`;
    }

    setSimScoreHome(scoreH);
    setSimScoreAway(scoreA);
    setNarrative({ p1, p2, p3 });
    setSimulationRun(true);

    if (scoreH > scoreA) {
      audio.playCheer();
    }
  };

  // Copy single HTML code
  const handleCopyCode = () => {
    if (singleHtmlContent) {
      navigator.clipboard.writeText(singleHtmlContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Download single HTML file
  const handleDownloadFile = () => {
    const blob = new Blob([singleHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fuga-do-labirinto.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download full ZIP generated in-memory via Blob (guarantees uncorrupted 72 KB file, bypassing proxy issues)
  const handleDownloadZip = () => {
    try {
      const binaryString = atob(BANCADA_ZIP_BASE64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'application/zip' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bancada-simulator.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setZipDownloaded(true);
      setTimeout(() => setZipDownloaded(false), 3500);
    } catch (e) {
      console.error('Failed to download blob zip:', e);
      window.open('/bancada-simulator.zip', '_blank');
    }
  };

  return (
    <div id="bancada-app-root" className="min-h-screen bg-[#0b0f14] text-gray-100 flex flex-col items-center p-3 md:p-6 select-none font-sans">
      
      {/* HEADER */}
      <header id="main-header" className="w-full max-w-4xl bg-[#141c26] border border-[#27374b] rounded-2xl p-4 mb-5 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-xl shadow-lg shadow-emerald-950">
            🏟️
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black text-white tracking-tight flex items-center gap-2">
              Bancada Simulator
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold uppercase">
                Fuga do Labirinto
              </span>
            </h1>
            <p className="text-xs text-gray-400">Minigame Hyper-Casual & Motor de Simulação Ponderada (75% Time / 25% Torcida)</p>
          </div>
        </div>

        {/* TOP CONTROLS & TABS */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="btn-download-zip"
            onClick={handleDownloadZip}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white shadow active:scale-95"
            title="Baixar arquivo ZIP completo do jogo (72 KB) gerado na memória do navegador"
          >
            {zipDownloaded ? <Check size={14} className="text-emerald-300" /> : <Download size={14} />}
            {zipDownloaded ? 'ZIP Baixado! (72 KB)' : 'Baixar ZIP (72 KB)'}
          </button>

          <button
            id="btn-sound-toggle"
            onClick={toggleSound}
            className="p-2 rounded-lg bg-[#1e293b] border border-[#334155] text-gray-300 hover:text-white transition"
            title={soundEnabled ? 'Silenciar Áudio' : 'Ativar Efeitos Sonoros'}
          >
            {soundEnabled ? <Volume2 size={18} className="text-emerald-400" /> : <VolumeX size={18} className="text-gray-500" />}
          </button>

          <div className="flex bg-[#0f172a] p-1 rounded-xl border border-[#27384e]">
            <button
              id="tab-btn-minigame"
              onClick={() => setActiveTab('minigame')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'minigame' ? 'bg-emerald-500 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Play size={14} /> Minigame
            </button>
            <button
              id="tab-btn-simulator"
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'simulator' ? 'bg-amber-500 text-black shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Trophy size={14} /> Simulador
            </button>
            <button
              id="tab-btn-code"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'code' ? 'bg-indigo-600 text-white shadow' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Copy size={14} /> Arquivo HTML
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="w-full max-w-4xl flex flex-col gap-6">

        {/* =========================================================================
            VIEW 1: MINIGAME "FUGA DO LABIRINTO"
            ========================================================================= */}
        {activeTab === 'minigame' && (
          <div id="minigame-view" className="bg-[#141c26] border border-[#27374b] rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col items-center">
            
            {/* HUD */}
            <div id="game-hud" className="w-full grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3">
              <div className="bg-[#1a2533] border border-[#2b3d52] rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                  <Clock size={12} className="text-emerald-400" /> Tempo Restante
                </span>
                <span className={`text-lg md:text-xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
              </div>

              <div className="bg-[#1a2533] border border-[#2b3d52] rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                  <Sparkles size={12} className="text-amber-400" /> Itens Resgatados
                </span>
                <span className="text-lg md:text-xl font-black text-amber-300">
                  {itemsCollected}/5
                </span>
              </div>

              <div className="bg-[#1a2533] border border-[#2b3d52] rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                  <Flame size={12} className="text-emerald-400" /> Pelotão da Torcida
                </span>
                <span className="text-lg md:text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
                  {Math.min(CROWD_ROSTER.length, 4 + itemsCollected)} <span className="text-xs font-semibold text-gray-400">membros</span>
                </span>
              </div>

              <div className="bg-[#1a2533] border border-[#2b3d52] rounded-xl p-2.5 text-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center justify-center gap-1">
                  <Trophy size={12} className="text-amber-400" /> Nota Minigame
                </span>
                <span className="text-lg md:text-xl font-black text-amber-300">
                  {lastMinigameScore} pts
                </span>
              </div>
            </div>

            {/* OBJECTIVES & THREAT RADAR BAR */}
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 mb-3">
              {/* Objectives */}
              <div className="bg-[#16202c] border border-[#2a3c50] rounded-xl p-2.5 text-xs flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                  <Shield size={12} className="text-emerald-400" /> Objetivos da Emboscada
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-gray-300">
                    <span>1. Escapar da emboscada até a Bancada 🏁</span>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      Principal
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-gray-300">
                    <span>2. Encontrar bonde menor rival (3 pessoas) 👊</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      smallRivalDefeated 
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}>
                      {smallRivalDefeated ? '✓ VENCIDO!' : 'Pendente'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Threat Radar */}
              <div className="bg-[#16202c] border border-[#2a3c50] rounded-xl p-2.5 text-xs flex flex-col gap-1.5">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider flex items-center gap-1">
                  <AlertTriangle size={12} className="text-red-400" /> Radar de Ameaças Rivais
                </span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">⚠️ 3 Bondes Maiores (6 pessoas cada):</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                      rivalsEnraged 
                        ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' 
                        : 'bg-gray-800 text-gray-300 border-gray-700'
                    }`}>
                      {rivalsEnraged ? '⚡ ENFURECIDOS (Velozes!)' : 'Patrulhando'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">🚓 2 Viaturas da Polícia:</span>
                    <span className="text-[10px] font-bold bg-blue-950/60 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded">
                      Curto Alcance (Faróis)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CANVAS CONTAINER WITH GAME OVERLAYS */}
            <div className="relative w-full max-w-[540px] aspect-square rounded-xl overflow-hidden border-2 border-[#2b3d52] bg-[#0c131c] shadow-2xl">
              <canvas
                id="game-canvas-instance"
                ref={canvasRef}
                width={540}
                height={540}
                className="w-full h-full block"
              />

              {/* OVERLAY: START SCREEN */}
              {gameState === 'READY' && (
                <div id="game-start-overlay" className="absolute inset-0 bg-[#0b0f14]/92 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl mb-3 shadow-lg">
                    ⚠️
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight mb-1">
                    FUGA DO LABIRINTO
                  </h2>
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-3">
                    Simulação de Emboscada no Bonde
                  </span>
                  
                  <div className="text-left bg-[#131c27] border border-[#27384e] p-3 rounded-xl max-w-sm mb-4 text-xs text-gray-300 flex flex-col gap-2">
                    <div className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">1.</span>
                      <span><strong>Objetivo 1 (Fuga):</strong> Despistar as ameaças e chegar ao Portão 🏁 para levar a nota à bancada.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">2.</span>
                      <span><strong>Objetivo 2 (Confronto):</strong> Se encontrar o <strong>Bonde Menor Rival (3 pessoas) 🎯</strong>, vá pra cima e ganhe!</span>
                    </div>
                    <div className="border-t border-[#233144] pt-1.5 flex items-start gap-2 text-red-300">
                      <span>⚠️</span>
                      <span><strong>Atenção:</strong> 3 bondes maiores rivais (6 pessoas cada) patrulham. Se você vencer o menor (3 pessoas), os 3 maiores ficam <strong>enfurecidos e velozes</strong>! Cuidado com as 2 viaturas 🚓.</span>
                    </div>
                  </div>

                  <button
                    id="btn-play-game"
                    onClick={startMinigame}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition transform hover:-translate-y-0.5 cursor-pointer"
                  >
                    <Play size={18} /> Iniciar Fuga da Emboscada
                  </button>
                  <span className="text-[11px] text-gray-500 mt-2.5">
                    Use Setas / WASD no PC ou o Direcional Virtual abaixo
                  </span>
                </div>
              )}

              {/* OVERLAY: GAME OVER / VICTORY SCREEN */}
              {(gameState === 'WON' || gameState === 'LOST') && (
                <div id="game-finish-overlay" className="absolute inset-0 bg-[#0b0f14]/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20">
                  <div className="text-4xl mb-2">{gameState === 'WON' ? (smallRivalDefeated ? '🏆💥' : '🏟️') : '🚨'}</div>
                  <h2 className={`text-xl md:text-2xl font-black tracking-tight mb-1 ${gameState === 'WON' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {gameState === 'WON' 
                      ? (smallRivalDefeated ? 'VITÓRIA TOTAL & HONRA DO BONDE!' : 'FUGA TÁTICA BEM-SUCEDIDA!') 
                      : 'EMBOSCADA FRUSTRADA!'}
                  </h2>
                  <p className="text-xs md:text-sm text-gray-300 max-w-sm mb-4 leading-relaxed">
                    {statusMessage}
                  </p>

                  <div className="grid grid-cols-2 gap-2 bg-[#141e2b] border border-[#2a3c50] p-3 rounded-xl mb-5 w-full max-w-xs">
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                        Bonde Menor (3 pessoas)
                      </span>
                      <span className={`text-sm font-black ${smallRivalDefeated ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {smallRivalDefeated ? '✓ VENCIDO (+25)' : 'Não confrontado'}
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-bold">
                        Nota da Torcida
                      </span>
                      <span className="text-2xl font-black text-amber-400">
                        {lastMinigameScore} / 100
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      id="btn-restart-game"
                      onClick={startMinigame}
                      className="px-5 py-2.5 bg-[#1e2a3a] hover:bg-[#28384d] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer border border-[#33465e]"
                    >
                      <RotateCcw size={15} /> Jogar Novamente
                    </button>
                    <button
                      id="btn-go-simulator"
                      onClick={() => setActiveTab('simulator')}
                      className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-amber-500/20"
                    >
                      <Trophy size={15} /> Levar Nota ao Simulador
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* VIRTUAL D-PAD FOR MOBILE / TOUCH USERS */}
            <div className="mt-4 flex flex-col items-center">
              <span className="text-[11px] text-gray-400 font-semibold mb-2">Controles Virtuais Touch (Mobile / D-Pad)</span>
              <div className="grid grid-cols-3 gap-1.5 w-44">
                <div></div>
                <button
                  id="touch-up"
                  onMouseDown={() => handleTouchDir(0, -1)}
                  onMouseUp={handleTouchStop}
                  onTouchStart={() => handleTouchDir(0, -1)}
                  onTouchEnd={handleTouchStop}
                  className="h-12 rounded-xl bg-[#1c2736] border border-[#2b3c52] text-white text-base font-bold flex items-center justify-center active:bg-emerald-500 active:text-black transition"
                >
                  ▲
                </button>
                <div></div>

                <button
                  id="touch-left"
                  onMouseDown={() => handleTouchDir(-1, 0)}
                  onMouseUp={handleTouchStop}
                  onTouchStart={() => handleTouchDir(-1, 0)}
                  onTouchEnd={handleTouchStop}
                  className="h-12 rounded-xl bg-[#1c2736] border border-[#2b3c52] text-white text-base font-bold flex items-center justify-center active:bg-emerald-500 active:text-black transition"
                >
                  ◀
                </button>
                <div className="h-12 rounded-xl bg-[#111924] border border-[#1d2938] flex items-center justify-center text-[10px] text-gray-500 font-bold">
                  MOVE
                </div>
                <button
                  id="touch-right"
                  onMouseDown={() => handleTouchDir(1, 0)}
                  onMouseUp={handleTouchStop}
                  onTouchStart={() => handleTouchDir(1, 0)}
                  onTouchEnd={handleTouchStop}
                  className="h-12 rounded-xl bg-[#1c2736] border border-[#2b3c52] text-white text-base font-bold flex items-center justify-center active:bg-emerald-500 active:text-black transition"
                >
                  ▶
                </button>

                <div></div>
                <button
                  id="touch-down"
                  onMouseDown={() => handleTouchDir(0, 1)}
                  onMouseUp={handleTouchStop}
                  onTouchStart={() => handleTouchDir(0, 1)}
                  onTouchEnd={handleTouchStop}
                  className="h-12 rounded-xl bg-[#1c2736] border border-[#2b3c52] text-white text-base font-bold flex items-center justify-center active:bg-emerald-500 active:text-black transition"
                >
                  ▼
                </button>
                <div></div>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: MOTOR DE SIMULAÇÃO DE PARTIDAS (BANCADA SIMULATOR)
            ========================================================================= */}
        {activeTab === 'simulator' && (
          <div id="simulator-view" className="bg-[#141c26] border border-[#27374b] rounded-2xl p-5 md:p-7 shadow-2xl flex flex-col gap-6">
            
            {/* SIMULATOR HEADER */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27374b] pb-4">
              <div>
                <h2 className="text-lg md:text-xl font-black text-white flex items-center gap-2">
                  <Shield size={20} className="text-emerald-400" />
                  Motor de Simulação de Partidas
                </h2>
                <p className="text-xs text-gray-400">
                  Cálculo Ponderado: Força do Mandante = (75% Força Base) + (25% Média da Torcida)
                </p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs px-3 py-1 rounded-full font-bold">
                Margem de Empate: ±3 pontos
              </div>
            </div>

            {/* INPUT SLIDERS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Home Team Strength */}
              <div className="bg-[#192433] border border-[#2a3c50] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                    Força do Time da Casa
                  </label>
                  <span className="text-sm font-black text-emerald-400">{homeStrength}/100</span>
                </div>
                <input
                  id="slider-home-strength"
                  type="range"
                  min="0"
                  max="100"
                  value={homeStrength}
                  onChange={(e) => setHomeStrength(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <span className="text-[11px] text-gray-400">Desempenho técnico base (peso de 75%)</span>
              </div>

              {/* Away Team Strength */}
              <div className="bg-[#192433] border border-[#2a3c50] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide">
                    Força do Adversário (Visitante)
                  </label>
                  <span className="text-sm font-black text-red-400">{awayStrength}/100</span>
                </div>
                <input
                  id="slider-away-strength"
                  type="range"
                  min="0"
                  max="100"
                  value={awayStrength}
                  onChange={(e) => setAwayStrength(Number(e.target.value))}
                  className="w-full accent-red-500 cursor-pointer"
                />
                <span className="text-[11px] text-gray-400">Joga fora de casa sem o buff de torcida</span>
              </div>

              {/* Recepção do Ônibus */}
              <div className="bg-[#192433] border border-[#2a3c50] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Users size={14} className="text-amber-400" /> Recepção do Ônibus
                  </label>
                  <span className="text-sm font-black text-amber-400">{busScore}/100</span>
                </div>
                <input
                  id="slider-bus-score"
                  type="range"
                  min="0"
                  max="100"
                  value={busScore}
                  onChange={(e) => setBusScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <span className="text-[11px] text-gray-400">Minigame 1: Clima e fumaça na chegada da delegação</span>
              </div>

              {/* Festa na Arquibancada / Minigame Fuga do Labirinto */}
              <div className="bg-[#192433] border border-[#2a3c50] p-4 rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-300 uppercase tracking-wide flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-400" /> Festa na Arquibancada (Minigames)
                  </label>
                  <span className="text-sm font-black text-amber-400">{partyScore}/100</span>
                </div>
                <input
                  id="slider-party-score"
                  type="range"
                  min="0"
                  max="100"
                  value={partyScore}
                  onChange={(e) => setPartyScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between items-center text-[11px] text-gray-400">
                  <span>Sincronizado com sua fuga do labirinto</span>
                  <button
                    onClick={() => setPartyScore(lastMinigameScore)}
                    className="text-emerald-400 font-bold hover:underline"
                  >
                    Usar Nota do Labirinto ({lastMinigameScore})
                  </button>
                </div>
              </div>

            </div>

            {/* MATHEMATICAL CALCULATION DISPLAY */}
            <div id="math-calculation-box" className="bg-[#0e1622] border border-dashed border-emerald-500/40 rounded-xl p-4 font-mono text-xs md:text-sm text-emerald-300 flex flex-col gap-1.5 shadow-inner">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                Demonstração Matemática do Motor:
              </div>
              <div>
                • <span className="text-gray-300">Média da Torcida</span> = ({busScore} + {partyScore}) / 2 = <strong>{mediaTorcida.toFixed(1)}</strong>
              </div>
              <div>
                • <span className="text-gray-300">Força Final Mandante</span> = ({homeStrength} × 0.75) + ({mediaTorcida.toFixed(1)} × 0.25) = <strong className="text-white text-base">{(finalHome).toFixed(2)}</strong>
              </div>
              <div>
                • <span className="text-gray-300">Força Final Adversário</span> = <strong>{finalAway.toFixed(2)}</strong> (Base pura sem o buff)
              </div>
              <div className="pt-1 border-t border-[#1e2f42] flex flex-wrap items-center justify-between text-xs">
                <span>
                  Diferença: <strong className={diff >= 0 ? 'text-emerald-400' : 'text-red-400'}>{diff >= 0 ? `+${diff.toFixed(2)}` : diff.toFixed(2)} pontos</strong>
                </span>
                <span className="text-amber-400 font-sans">
                  {Math.abs(diff) <= 3
                    ? '⚠️ Diferença ≤ 3 pts: Zona de Equilíbrio / Alta Chance de Empate!'
                    : diff > 3
                    ? (homeStrength < awayStrength ? '🔥 Efeito Caldeirão: Torcida virou o favoritismo!' : '⚡ Mandante com ampla vantagem!')
                    : '🛡️ Visitante mais forte tecnicamente!'}
                </span>
              </div>
            </div>

            {/* SIMULATE BUTTON */}
            <button
              id="btn-run-simulation"
              onClick={handleSimulateMatch}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black rounded-xl text-sm md:text-base flex items-center justify-center gap-2 shadow-xl shadow-amber-500/20 transition transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Send size={18} />
              Simular Partida e Gerar Narrativa de 3 Parágrafos
            </button>

            {/* SIMULATION RESULTS & 3-PARAGRAPH NARRATIVE */}
            {simulationRun && narrative && (
              <div id="simulation-output-card" className="bg-[#182330] border border-[#2b3c50] rounded-xl p-5 flex flex-col gap-4 animate-in fade-in duration-300">
                
                {/* PLACAR FINAL */}
                <div className="bg-[#0f1722] border border-[#233244] rounded-xl p-4 flex items-center justify-around">
                  <div className="text-center flex-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Time da Casa</span>
                    <span className="text-3xl md:text-4xl font-black text-white">{simScoreHome}</span>
                    <span className="text-[11px] text-emerald-400 block mt-1">Força {finalHome.toFixed(1)}</span>
                  </div>

                  <div className="px-4 text-center">
                    <span className="text-lg font-black text-amber-400">X</span>
                    <span className="text-[10px] text-gray-500 uppercase block font-mono">FIM DE JOGO</span>
                  </div>

                  <div className="text-center flex-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Adversário</span>
                    <span className="text-3xl md:text-4xl font-black text-white">{simScoreAway}</span>
                    <span className="text-[11px] text-red-400 block mt-1">Força {finalAway.toFixed(1)}</span>
                  </div>
                </div>

                {/* NARRATIVA DE 3 PARÁGRAFOS */}
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles size={14} /> Crônica da Partida (Impacto dos Minigames e Força Ponderada)
                  </span>

                  <div className="bg-[#0d131c] border-l-4 border-amber-500 rounded-r-xl p-4 flex flex-col gap-3 text-xs md:text-sm text-gray-200 leading-relaxed font-sans">
                    <p id="narrative-p1">
                      <strong className="text-amber-400">1º Tempo:</strong> {narrative.p1}
                    </p>
                    <p id="narrative-p2">
                      <strong className="text-amber-400">2º Tempo:</strong> {narrative.p2}
                    </p>
                    <p id="narrative-p3">
                      <strong className="text-amber-400">Desfecho:</strong> {narrative.p3}
                    </p>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            VIEW 3: SINGLE-FILE HTML EXPORT & CODE
            ========================================================================= */}
        {activeTab === 'code' && (
          <div id="code-view" className="bg-[#141c26] border border-[#27374b] rounded-2xl p-5 md:p-6 shadow-2xl flex flex-col gap-4">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27374b] pb-4">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Copy size={18} className="text-indigo-400" />
                  Código HTML Único (Single-File Standalone)
                </h2>
                <p className="text-xs text-gray-400">
                  Arquivo 100% autônomo com HTML, CSS e JavaScript embutidos conforme solicitado.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleDownloadZip}
                  className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white border border-blue-400/40 flex items-center gap-1.5 transition shadow active:scale-95"
                  title="Baixar projeto completo em arquivo ZIP (72 KB) gerado na memória para o Antigravity"
                >
                  {zipDownloaded ? <Check size={14} className="text-emerald-300" /> : <Download size={14} />}
                  {zipDownloaded ? 'ZIP Baixado! (72 KB)' : 'Baixar ZIP (72 KB Antigravity)'}
                </button>
                <a
                  href="/fuga-do-labirinto.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#28384d] text-xs font-bold text-gray-200 border border-[#334155] flex items-center gap-1.5 transition"
                >
                  <ExternalLink size={14} /> Abrir em Nova Aba
                </a>
                <button
                  onClick={handleDownloadFile}
                  className="px-3 py-1.5 rounded-lg bg-[#1e293b] hover:bg-[#28384d] text-xs font-bold text-gray-200 border border-[#334155] flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Baixar .HTML
                </button>
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold flex items-center gap-1.5 transition shadow"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar Código'}
                </button>
              </div>
            </div>

            {/* CODE PREVIEW BOX */}
            <div className="relative bg-[#0b0e14] border border-[#222e3d] rounded-xl p-4 overflow-hidden">
              <pre className="text-xs font-mono text-emerald-400 overflow-x-auto max-h-[480px] p-2 select-text">
                {singleHtmlContent || 'Carregando código...'}
              </pre>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        Bancada Simulator © 2026 • Motor de Partidas e Minigames de Torcida
      </footer>

    </div>
  );
}
