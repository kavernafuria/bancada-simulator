import React, { useEffect, useRef, useState } from 'react';
import { MiniGameResult } from '../MatchTacticalResolver';
import { AlertTriangle, Flame, Shield, Trophy, Volume2, VolumeX } from 'lucide-react';

export interface MazeEscapeMinigameProps {
  playerTorcidaName?: string;
  playerClubName?: string;
  rivalTorcidaName?: string;
  playerPrimaryColor?: string;
  playerSecondaryColor?: string;
  rivalPrimaryColor?: string;
  rivalSecondaryColor?: string;
  contingente?: number;
  poderPista?: number;
  onFinish: (result: MiniGameResult) => void;
}

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
   MAZE MAP DEFINITION (15x15)
   ========================================================================== */
const GRID_W = 15;
const GRID_H = 15;

// 0: path/street, 1: wall/concrete barrier, 3: exit (Portão do Caldeirão)
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
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Avenida sul aberta para largada
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface GameItem {
  x: number;
  y: number;
  type: 'flare' | 'drum' | 'banner' | 'ticket';
  label: string;
  collected: boolean;
}

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

export const MazeEscapeMinigame: React.FC<MazeEscapeMinigameProps> = ({
  playerTorcidaName = 'Torcida Organizada',
  playerClubName = 'Nosso Clube',
  rivalTorcidaName = 'Torcida Rival',
  playerPrimaryColor = '#10b981',
  playerSecondaryColor = '#ffffff',
  rivalPrimaryColor = '#dc2626',
  rivalSecondaryColor = '#09090b',
  onFinish,
}) => {
  const crowdRoster: TorcedorMember[] = [
    { id: 1, role: 'leader', name: 'Puxador', shirtColor: playerPrimaryColor, skinColor: '#e0ac69', hairColor: '#1f2937' },
    { id: 2, role: 'drummer', name: 'Bumbo de Alça', shirtColor: playerSecondaryColor, skinColor: '#f1c27d', hairColor: '#374151' },
    { id: 3, role: 'banner', name: 'Bandeirão', shirtColor: playerPrimaryColor, skinColor: '#8d5524', hairColor: '#111827' },
    { id: 4, role: 'singing', name: 'Cantor da Geral', shirtColor: playerSecondaryColor, skinColor: '#c68642', hairColor: '#4b5563' },
    { id: 5, role: 'flare', name: 'Sinalizador', shirtColor: playerPrimaryColor, skinColor: '#ffdbac', hairColor: '#1f2937' },
    { id: 6, role: 'repique', name: 'Caixa de Ritmo', shirtColor: playerSecondaryColor, skinColor: '#e0ac69', hairColor: '#2b2b2b' },
    { id: 7, role: 'megaphone', name: 'Voz da Torcida', shirtColor: playerPrimaryColor, skinColor: '#8d5524', hairColor: '#111827' },
    { id: 8, role: 'surdo', name: 'Surdo de Marcação', shirtColor: playerSecondaryColor, skinColor: '#f1c27d', hairColor: '#374151' },
  ];
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'WON' | 'LOST'>('READY');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [timeLeft, setTimeLeft] = useState(45);
  const [itemsCollected, setItemsCollected] = useState(0);
  const [smallRivalDefeated, setSmallRivalDefeated] = useState(false);
  const [rivalsEnraged, setRivalsEnraged] = useState(false);
  const [lastScore, setLastScore] = useState(85);

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

  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const chantsRef = useRef<{ text: string; x: number; y: number; life: number; maxLife: number }[]>([]);
  const lastChantTimeRef = useRef<number>(0);

  // 3 Big Rival Mobs (6 members each)
  const bigRivalsRef = useRef<BigRivalMob[]>([
    {
      id: 1,
      name: `Bonde Norte (${rivalTorcidaName})`,
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
      name: `Bonde Leste (${rivalTorcidaName})`,
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
      name: `Bonde Oeste (${rivalTorcidaName})`,
      x: 3.5,
      y: 5.5,
      path: [{ x: 3.5, y: 5.5 }, { x: 1.5, y: 5.5 }, { x: 1.5, y: 8.5 }, { x: 3.5, y: 8.5 }],
      targetIdx: 0,
      speed: 1.35,
      isChasing: false,
      alertTimer: 0,
    },
  ]);

  // 2 Police Patrol Cars
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

  // 1 Small Rival Mob (3 members)
  const smallRivalMobRef = useRef<SmallRivalMob>({
    x: 7.5,
    y: 7.5,
    defeated: false,
  });

  const itemsRef = useRef<GameItem[]>([]);
  const smokeParticlesRef = useRef<{ x: number; y: number; vx: number; vy: number; size: number; life: number; color: string }[]>([]);
  const keysRef = useRef<{ [key: string]: boolean }>({});

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audio.enabled = next;
    if (next) audio.init();
  };

  // Keyboard listeners
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

  const initItems = () => {
    itemsRef.current = [
      { x: 1.5, y: 1.5, type: 'flare', label: '🔥', collected: false },
      { x: 7.5, y: 1.5, type: 'drum', label: '🥁', collected: false },
      { x: 7.5, y: 7.5, type: 'banner', label: '🚩', collected: false },
      { x: 13.5, y: 11.5, type: 'ticket', label: '🎟️', collected: false },
      { x: 3.5, y: 9.5, type: 'flare', label: '🔥', collected: false },
    ];
    setItemsCollected(0);
  };

  const isWall = (x: number, y: number) => {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return true;
    const tile = MAZE_MAP[gy][gx];
    return tile === 1;
  };

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
      { text: `VAMOS ${playerTorcidaName.toUpperCase()}! ESCAPAR DA EMBOSCADA!`, x: startX, y: startY - 0.7, life: 2.5, maxLife: 2.5 }
    ];
    lastChantTimeRef.current = performance.now();
    smokeParticlesRef.current = [];
    brawlBannerRef.current = null;

    setSmallRivalDefeated(false);
    setRivalsEnraged(false);
    smallRivalDefeatedRef.current = false;
    rivalsEnragedRef.current = false;

    bigRivalsRef.current = [
      {
        id: 1,
        name: `Bonde Norte (${rivalTorcidaName})`,
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
        name: `Bonde Leste (${rivalTorcidaName})`,
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
        name: `Bonde Oeste (${rivalTorcidaName})`,
        x: 3.5,
        y: 5.5,
        path: [{ x: 3.5, y: 5.5 }, { x: 1.5, y: 5.5 }, { x: 1.5, y: 8.5 }, { x: 3.5, y: 8.5 }],
        targetIdx: 0,
        speed: 1.35,
        isChasing: false,
        alertTimer: 0,
      },
    ];

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

    smallRivalMobRef.current = {
      x: 7.5,
      y: 7.5,
      defeated: false,
    };

    initItems();
    setTimeLeft(45);
    setGameState('PLAYING');
  };

  const finishGameAndReturn = (won: boolean, cause: 'WIN' | 'RIVAL' | 'POLICE' | 'TIMEOUT', msg: string) => {
    setGameState(won ? 'WON' : 'LOST');

    if (won) {
      audio.playCheer();
      const didBeatSmall = smallRivalDefeatedRef.current;
      const timePts = Math.min(25, Math.floor((timeLeft / 45) * 25));
      const itemPts = Math.floor((itemsCollected / 5) * 15);
      
      let score = 60 + timePts + itemPts;
      if (didBeatSmall) {
        score = Math.min(100, score + 25);
        setLastScore(score);
        onFinish({
          gameType: 'maze_escape' as any,
          modifier: 0.25,
          rank: 'S',
          penaltyMP: 0,
          description: `✨ APOTEOSE TOTAL & TRIUNFO DE PISTA! O bonde botou o grupo rival da ${rivalTorcidaName} (3 pessoas) pra correr na mão limpa, rompeu a emboscada no bairro e incendiou o estádio com moral máxima e caixa forte (+25% PEC, +18 Moral, +R$ 6.000)!`,
        });
      } else {
        score = Math.min(80, Math.max(65, score));
        setLastScore(score);
        onFinish({
          gameType: 'maze_escape' as any,
          modifier: 0.15,
          rank: 'A',
          penaltyMP: 0,
          description: `🛡️ FUGA TÁTICA DO BAIRRO! O bonde esquivou das patrulhas da ${rivalTorcidaName} e das viaturas da PM nas ruas do bairro, rompeu a emboscada sem sofrer baixas e chegou a tempo de comandar a Festa no Caldeirão (+15% PEC, +10 Moral, +R$ 4.500)!`,
        });
      }
    } else {
      audio.playWhistle();
      if (cause === 'RIVAL') {
        setLastScore(30);
        onFinish({
          gameType: 'maze_escape' as any,
          modifier: -0.20,
          rank: 'F',
          penaltyMP: 10,
          description: `👹 CERCO & EMBOSCADA RIVAL! O bonde foi cercado por uma das linhas pesadas da ${rivalTorcidaName} nas vielas do bairro. Houve confronto desvantajoso e dispersão sob pancadaria (-20% PEC, -12 Moral, +10% Risco MP).`,
        });
      } else if (cause === 'POLICE') {
        setLastScore(15);
        onFinish({
          gameType: 'maze_escape' as any,
          modifier: -0.25,
          rank: 'F',
          penaltyMP: 25,
          description: `🚓 INTERCEPTAÇÃO & DETENÇÃO PELA POLÍCIA! A viatura da PM encurralou o bonde com farol de busca no percurso. Vários integrantes foram detidos e conduzidos à delegacia por tumulto (+25% Risco MP, -25% PEC, -15 Moral).`,
        });
      } else {
        // TIMEOUT
        setLastScore(35);
        onFinish({
          gameType: 'maze_escape' as any,
          modifier: -0.15,
          rank: 'F',
          penaltyMP: 5,
          description: `⏱️ TEMPO ESGOTADO NO LABIRINTO! O bonde ficou retido nos bloqueios de bairro e perdeu a entrada oficial no estádio antes do apito inicial (-15% PEC, -8 Moral, +5% Risco MP).`,
        });
      }
    }
  };

  // Timer loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (gameState === 'PLAYING') {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev % 4 === 0) audio.playBumbo();
          if (prev <= 1) {
            finishGameAndReturn(false, 'TIMEOUT', 'O tempo se esgotou antes de conseguir escapar da emboscada!');
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
            smallMob.defeated = true;
            smallRivalDefeatedRef.current = true;
            setSmallRivalDefeated(true);

            audio.playBrawl();

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

            rivalsEnragedRef.current = true;
            setRivalsEnraged(true);
            setTimeout(() => audio.playRage(), 350);

            bigRivalsRef.current.forEach((mob) => {
              mob.speed = 2.25;
              mob.isChasing = true;
            });
          }
        }

        // 2. ATUALIZAR 3 BONDES MAIORES DA TORCIDA RIVAL
        bigRivalsRef.current.forEach((mob) => {
          const pdist = Math.hypot(player.x - mob.x, player.y - mob.y);
          const isEnraged = rivalsEnragedRef.current;
          const aggroDist = isEnraged ? 7.5 : 3.8;

          if (pdist < aggroDist) {
            mob.isChasing = true;
          }

          const curSpeed = isEnraged ? 2.25 : 1.45;

          if (mob.isChasing) {
            const dx = player.x - mob.x;
            const dy = player.y - mob.y;
            const len = Math.hypot(dx, dy) || 1;
            const stepX = (dx / len) * curSpeed * dt;
            const stepY = (dy / len) * curSpeed * dt;

            if (!isWall(mob.x + stepX, mob.y)) mob.x += stepX;
            if (!isWall(mob.x, mob.y + stepY)) mob.y += stepY;

            if (pdist < 0.68) {
              finishGameAndReturn(false, 'RIVAL', `Seu bonde foi cercado por um dos bondes maiores do ${rivalTorcidaName}!`);
            }
          } else {
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
              finishGameAndReturn(false, 'RIVAL', `Seu bonde foi cercado por um dos bondes maiores do ${rivalTorcidaName}!`);
            }
          }
        });

        // 3. ATUALIZAR 2 VIATURAS DA POLÍCIA
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
            finishGameAndReturn(false, 'POLICE', 'A viatura da polícia interceptou o bonde! Todos foram detidos e enquadrados.');
          }
        });

        // Breadcrumb trail
        const lastPt = trailRef.current[0];
        if (!lastPt || Math.hypot(player.x - lastPt.x, player.y - lastPt.y) > 0.032) {
          trailRef.current.unshift({ x: player.x, y: player.y });
          if (trailRef.current.length > 140) {
            trailRef.current.pop();
          }
        }

        // Chants
        if (currentTime - lastChantTimeRef.current > 3400) {
          lastChantTimeRef.current = currentTime;
          const chantPhrases = [
            'VAI PRA CIMA!',
            `É A ${playerTorcidaName.toUpperCase()}!`,
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

        for (let i = chantsRef.current.length - 1; i >= 0; i--) {
          const ch = chantsRef.current[i];
          ch.life -= dt;
          ch.y -= dt * 0.22;
          if (ch.life <= 0) {
            chantsRef.current.splice(i, 1);
          }
        }

        // Check Win
        const gx = Math.floor(player.x);
        const gy = Math.floor(player.y);
        if (MAZE_MAP[gy] && MAZE_MAP[gy][gx] === 3) {
          finishGameAndReturn(true, 'WIN', 'Você superou o labirinto e inflou a festa da arquibancada com sucesso!');
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
            ctx.fillStyle = '#064e3b';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
            ctx.fillStyle = '#10b981';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏟️', px + tileSize / 2, py + tileSize / 2);
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

      // Render Small Mob (3 members)
      const sMob = smallRivalMobRef.current;
      const sx = sMob.x * tileSize;
      const sy = sMob.y * tileSize;

      if (!sMob.defeated) {
        const pulse = Math.sin(currentTime / 200) * 4;
        ctx.beginPath();
        ctx.arc(sx, sy, 22 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.18)';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        const smallMobOffsets = [
          { ox: 0, oy: -6 },
          { ox: -7, oy: 4 },
          { ox: 7, oy: 4 }
        ];

        smallMobOffsets.forEach(({ ox, oy }) => {
          const bx = sx + ox;
          const by = sy + oy;
          ctx.fillStyle = '#1e3a8a';
          ctx.beginPath();
          ctx.arc(bx, by + 2, 5.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffdbac';
          ctx.beginPath();
          ctx.arc(bx, by - 5, 3.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#1f2937';
          ctx.beginPath();
          ctx.arc(bx, by - 6, 3.8, Math.PI, Math.PI * 2);
          ctx.fill();
        });

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('🎯 BONDE MENOR (3 PESSOAS)', sx, sy - 16);
        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#fde68a';
        ctx.fillText('Vá pra cima e vença!', sx, sy + 16);
      } else {
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💫🏳️', sx, sy);
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#10b981';
        ctx.fillText('✓ VENCIDO', sx, sy + 12);
      }

      // Render Police Cars
      policeCarsRef.current.forEach((car) => {
        const cx = car.x * tileSize;
        const cy = car.y * tileSize;

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

        ctx.save();
        ctx.translate(cx, cy);
        const isHoriz = car.heading === 'left' || car.heading === 'right';
        const carW = isHoriz ? 24 : 14;
        const carH = isHoriz ? 14 : 24;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-carW / 2, -carH / 2, carW, carH);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.strokeRect(-carW / 2, -carH / 2, carW, carH);

        ctx.fillStyle = '#f8fafc';
        if (isHoriz) {
          ctx.fillRect(-carW / 4, -carH / 2 + 1, carW / 2, carH - 2);
        } else {
          ctx.fillRect(-carW / 2 + 1, -carH / 4, carW - 2, carH / 2);
        }

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

        ctx.font = 'bold 8px sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.textAlign = 'center';
        ctx.fillText('🚓 POLÍCIA', cx, cy - 12);
      });

      // Render 3 Big Rival Mobs (6 members each)
      bigRivalsRef.current.forEach((mob) => {
        const mx = mob.x * tileSize;
        const my = mob.y * tileSize;
        const isEnraged = rivalsEnragedRef.current;

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

        const mobOffsets = [
          { ox: 0, oy: -8, isLeader: true },
          { ox: -8, oy: -1, isLeader: false },
          { ox: 8, oy: -1, isLeader: false },
          { ox: 0, oy: 3, isLeader: false },
          { ox: -6, oy: 9, isLeader: false },
          { ox: 6, oy: 9, isLeader: false },
        ];

        mobOffsets.forEach(({ ox, oy, isLeader }) => {
          const bx = mx + ox;
          const by = my + oy;

          ctx.fillStyle = isLeader ? rivalPrimaryColor : (rivalSecondaryColor !== '#09090b' && rivalSecondaryColor !== '#000000' ? rivalSecondaryColor : rivalPrimaryColor);
          ctx.beginPath();
          ctx.arc(bx, by + 2, 5.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#e0ac69';
          ctx.beginPath();
          ctx.arc(bx, by - 5, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#111827';
          ctx.beginPath();
          ctx.arc(bx, by - 6, 3.5, Math.PI, Math.PI * 2);
          ctx.fill();
        });

        const poleX = mx + 9;
        const poleY = my - 18;
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(poleX, my);
        ctx.lineTo(poleX, poleY);
        ctx.stroke();

        ctx.fillStyle = rivalPrimaryColor;
        ctx.beginPath();
        ctx.moveTo(poleX, poleY);
        ctx.lineTo(poleX + 11, poleY + 4);
        ctx.lineTo(poleX, poleY + 8);
        ctx.closePath();
        ctx.fill();

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

      // Render Player Squad (Crowd of Characters Walking Together)
      const currentCrowdCount = Math.min(crowdRoster.length, 4 + itemsCollected);
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
        const member = crowdRoster[k];
        if (k === 0) {
          crowdToRender.push({
            member,
            x: player.x,
            y: player.y,
            isLeader: true,
            index: 0,
          });
        } else {
          const sampleIdx = Math.min(trailRef.current.length - 1, Math.floor(k * 3.4));
          const basePos = trailRef.current[sampleIdx] || { x: player.x, y: player.y };

          const prevPos = trailRef.current[Math.max(0, sampleIdx - 2)] || basePos;
          const dtx = prevPos.x - basePos.x;
          const dty = prevPos.y - basePos.y;
          const tlen = Math.hypot(dtx, dty) || 1;
          const perpX = -dty / tlen;
          const perpY = dtx / tlen;

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

      crowdToRender.sort((a, b) => a.y - b.y);

      crowdToRender.forEach(({ member, x, y, isLeader, index }) => {
        const cx = x * tileSize;
        const cy = y * tileSize;

        const stepFreq = isMoving ? 13 : 4;
        const bob = isMoving
          ? Math.abs(Math.sin(animSec * stepFreq + index * 1.4)) * 3
          : Math.sin(animSec * 3 + index * 1.1) * 1.2;
        const sway = isMoving ? Math.sin(animSec * 6 + index) * 1.2 : 0;

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

        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 7, 7, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const legOffset = isMoving ? Math.sin(animSec * stepFreq + index * 1.4) * 2.5 : 0;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(cx - 3.5 + sway, cy + 3 - bob + legOffset, 2.5, 4);
        ctx.fillRect(cx + 1 + sway, cy + 3 - bob - legOffset, 2.5, 4);

        const torsoY = cy - 4 - bob;
        ctx.fillStyle = member.shirtColor;
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function') {
          ctx.roundRect(cx - 5 + sway, torsoY, 10, 9, 2);
        } else {
          ctx.rect(cx - 5 + sway, torsoY, 10, 9);
        }
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx - 1 + sway, torsoY, 2, 9);

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + sway, torsoY, 2.5, 0, Math.PI);
        ctx.fill();

        const headY = torsoY - 5;
        ctx.fillStyle = member.skinColor;
        ctx.beginPath();
        ctx.arc(cx + sway, headY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = member.hairColor;
        ctx.beginPath();
        ctx.arc(cx + sway, headY - 1, 4.3, Math.PI * 0.9, Math.PI * 2.1);
        ctx.fill();

        ctx.fillStyle = '#111827';
        ctx.fillRect(cx - 1.8 + sway, headY - 0.5, 1.2, 1.5);
        ctx.fillRect(cx + 0.8 + sway, headY - 0.5, 1.2, 1.5);

        if (isLeader) {
          if (player.flareActive) {
            const fx = cx + 8 + sway;
            const fy = torsoY - 8;
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(cx + 4 + sway, torsoY + 2);
            ctx.lineTo(fx, fy + 4);
            ctx.stroke();

            ctx.fillStyle = '#dc2626';
            ctx.fillRect(fx - 1.5, fy + 2, 3, 5);

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(fx, fy, 4 + Math.sin(animSec * 20) * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(fx, fy, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
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
          const drumY = torsoY + 2;
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(cx + sway, drumY, 6, 3.2, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#f8fafc';
          ctx.beginPath();
          ctx.ellipse(cx + sway, drumY, 4.5, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

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
          const poleX = cx - 5 + sway;
          const poleTopY = torsoY - 17;
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(poleX, torsoY + 5);
          ctx.lineTo(poleX, poleTopY);
          ctx.stroke();

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

          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(poleX, poleTopY + 4);
          ctx.lineTo(poleX + 14, poleTopY + 5 + wave2);
          ctx.stroke();
        } else if (member.role === 'singing') {
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
          const fx = cx + 6 + sway;
          const fy = torsoY - 3;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else if (member.role === 'megaphone') {
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.moveTo(cx + 3 + sway, torsoY + 1);
          ctx.lineTo(cx + 8 + sway, torsoY - 3);
          ctx.lineTo(cx + 8 + sway, torsoY + 4);
          ctx.closePath();
          ctx.fill();
        }
      });

      // Render Floating Chants (Speech Bubbles)
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
        ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
        ctx.fillRect(8, 8, canvas.width - 16, bannerH);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, canvas.width - 16, bannerH);

        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(banner.text, canvas.width / 2, 13);

        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#fca5a5';
        ctx.fillText(banner.sub, canvas.width / 2, 30);
        ctx.restore();
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  const handleTouchDir = (dx: number, dy: number) => {
    audio.init();
    playerRef.current.vx = dx;
    playerRef.current.vy = dy;
  };

  const handleTouchStop = () => {
    playerRef.current.vx = 0;
    playerRef.current.vy = 0;
  };

  // 1. EMERGENCY WARNING NOTICE SCREEN (When READY)
  if (gameState === 'READY') {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 sm:p-8 rounded-3xl border-2 border-red-600/80 text-white max-w-xl w-full select-none shadow-2xl space-y-5 text-center my-auto">
        <div className="border-b border-red-900/60 pb-4 w-full">
          <span className="text-[11px] font-black text-red-400 uppercase tracking-widest block animate-pulse flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-red-500" /> TORCIDA ÚNICA • ALERTA DE EMBOSCADA NO BAIRRO
          </span>
          <h3 className="text-xl font-black text-white uppercase mt-1 tracking-wide">
            Festa no Caldeirão
          </h3>
        </div>

        <div className="bg-red-950/40 border border-red-600/50 p-5 rounded-2xl text-left space-y-3 shadow-inner">
          <p className="text-sm font-bold text-red-200 leading-relaxed flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <span>Um dos seus bondes de Bairro está sofrendo uma tentativa de emboscada por grupos da torcida rival ({rivalTorcidaName}) nas ruas próximas ao estádio!</span>
          </p>
          <div className="text-xs text-zinc-300 leading-relaxed border-t border-red-900/50 pt-3 space-y-1.5">
            <div>• <strong>Objetivo 1 (Fuga):</strong> Guie o <span className="text-emerald-400 font-bold">Pelotão (🥁)</span> até o <span className="text-amber-400 font-bold">Portão do Caldeirão (🏁)</span>.</div>
            <div>• <strong>Objetivo 2 (Confronto):</strong> Localize o <span className="text-yellow-400 font-bold">Bonde Menor Rival (3 pessoas 🎯)</span> para ir pra cima e botar pra correr!</div>
            <div className="text-red-300 font-semibold">• <strong>Atenção:</strong> Cuidado com os <span className="text-red-400 font-bold">3 Bondes Maiores (6 pessoas cada 👺)</span> e com as <span className="text-blue-400 font-bold">2 Viaturas da Polícia (🚔)</span>.</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-xl text-xs font-mono text-emerald-400 w-full text-center font-bold flex items-center justify-center gap-2">
          <Trophy className="w-4 h-4 text-emerald-400" /> Recompensa no Caixa: +R$ 4.500 • Meta: Fuga & Festa (+25% PEC)
        </div>

        <button
          onClick={startMinigame}
          onTouchEnd={(e) => {
            e.preventDefault();
            startMinigame();
          }}
          className="w-full py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer touch-manipulation animate-pulse flex items-center justify-center gap-2"
        >
          🚨 SOCORRER BONDE & INICIAR FUGA
        </button>
      </div>
    );
  }

  // 2. MAIN GAME SCREEN
  return (
    <div className="flex flex-col items-center bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-800 text-white max-w-2xl w-full select-none shadow-2xl space-y-4 my-auto">
      {/* Header HUD Bar */}
      <div className="grid grid-cols-4 gap-2.5 w-full text-center">
        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Tempo</span>
          <span className="text-base font-black text-amber-400 font-mono">{timeLeft}s</span>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Itens</span>
          <span className="text-base font-black text-white font-mono">{itemsCollected}/5</span>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Pelotão</span>
          <span className="text-sm font-black text-emerald-400">{Math.min(CROWD_ROSTER.length, 4 + itemsCollected)} Fãs</span>
        </div>
        <div className="bg-zinc-900/90 border border-zinc-800 p-2.5 rounded-2xl shadow-md">
          <span className="text-[10px] font-bold text-zinc-400 block uppercase tracking-wider">Bonde 3</span>
          <span className={`text-xs font-black ${smallRivalDefeated ? 'text-emerald-400 font-bold' : 'text-amber-400'}`}>
            {smallRivalDefeated ? '✓ Vencido' : '🎯 Localizar'}
          </span>
        </div>
      </div>

      {/* Threat Radar Box */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-xs bg-zinc-900/80 border border-zinc-800 p-3 rounded-2xl shadow-sm">
        <div className="flex flex-col justify-between space-y-1">
          <span className="font-black text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" /> Objetivos do Bonde
          </span>
          <span className="text-zinc-300">1. Escapar até o Portão 🏁</span>
          <span className={smallRivalDefeated ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            2. Vencer Bonde Menor (3p) {smallRivalDefeated ? '✓ VENCIDO!' : '👊'}
          </span>
        </div>
        <div className="flex flex-col justify-between space-y-1 sm:border-l sm:border-zinc-800 sm:pl-3">
          <span className="font-black text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Radar de Ameaças
          </span>
          <span className={rivalsEnraged ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-300'}>
            3 Bondes Maiores (6p): {rivalsEnraged ? '⚡ FÚRIA!' : 'Patrulhando'}
          </span>
          <span className="text-blue-400">2 Viaturas Policiais 🚓</span>
        </div>
      </div>

      {/* Canvas Viewport Container */}
      <div className="relative w-full max-w-[500px] aspect-square bg-zinc-900 rounded-2xl overflow-hidden border-2 border-zinc-800 shadow-2xl flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={560}
          height={560}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Controls: Keyboard or Touch D-Pad */}
      <div className="flex flex-col items-center justify-center pt-1 space-y-1.5 w-full">
        <button
          onMouseDown={() => handleTouchDir(0, -1)}
          onMouseUp={handleTouchStop}
          onTouchStart={(e) => { e.preventDefault(); handleTouchDir(0, -1); }}
          onTouchEnd={(e) => { e.preventDefault(); handleTouchStop(); }}
          className="w-16 h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-amber-500 active:text-black text-amber-400 rounded-2xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow-md cursor-pointer touch-manipulation transition-all"
        >
          ▲
        </button>

        <div className="flex space-x-4">
          <button
            onMouseDown={() => handleTouchDir(-1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => { e.preventDefault(); handleTouchDir(-1, 0); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchStop(); }}
            className="w-16 h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-amber-500 active:text-black text-amber-400 rounded-2xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow-md cursor-pointer touch-manipulation transition-all"
          >
            ◀
          </button>
          <button
            onMouseDown={() => handleTouchDir(0, 1)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => { e.preventDefault(); handleTouchDir(0, 1); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchStop(); }}
            className="w-16 h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-amber-500 active:text-black text-amber-400 rounded-2xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow-md cursor-pointer touch-manipulation transition-all"
          >
            ▼
          </button>
          <button
            onMouseDown={() => handleTouchDir(1, 0)}
            onMouseUp={handleTouchStop}
            onTouchStart={(e) => { e.preventDefault(); handleTouchDir(1, 0); }}
            onTouchEnd={(e) => { e.preventDefault(); handleTouchStop(); }}
            className="w-16 h-12 bg-zinc-900 hover:bg-zinc-800 active:bg-amber-500 active:text-black text-amber-400 rounded-2xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow-md cursor-pointer touch-manipulation transition-all"
          >
            ▶
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center w-full text-[11px] text-zinc-400 border-t border-zinc-800 pt-3 font-mono">
        <span>Controles: Setas / WASD ou D-Pad</span>
        <button
          onClick={toggleSound}
          className="text-zinc-400 hover:text-white flex items-center gap-1.5 cursor-pointer bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          <span>{soundEnabled ? 'Som LIGADO' : 'Mudo'}</span>
        </button>
      </div>
    </div>
  );
};

