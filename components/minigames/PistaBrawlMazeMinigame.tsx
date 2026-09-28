import React, { useEffect, useRef, useState } from 'react';
import { MiniGameResult } from '../MatchTacticalResolver';
import { AlertTriangle, Flame, Shield, Trophy, Volume2, VolumeX, Users, Zap, Swords } from 'lucide-react';

export interface PistaBrawlMazeMinigameProps {
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

  playRojaoPickup() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.18);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  playBondePickup() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.18);
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

  playBrawlClimax() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.4);
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.45);
    setTimeout(() => this.playCheer(), 150);
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
   MAZE MAP DEFINITION (15x15 Urban Grid)
   ========================================================================== */
const GRID_W = 15;
const GRID_H = 15;

// 0: Rua/Pista, 1: Muro/Barreira, 3: Saída/Confronto de Pista (Bonde Rival)
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
  [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
  [1,0,1,0,1,1,1,0,1,1,1,0,1,0,1],
  [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
  [1,0,1,1,1,0,1,1,1,0,1,1,1,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1], // Largada do Bonde (1.5, 13.5)
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

interface CollectibleItem {
  id: number;
  x: number;
  y: number;
  type: 'rojao' | 'bonde';
  label: string;
  collected: boolean;
}

export interface PolicePatrolCar {
  id: number;
  x: number;
  y: number;
  path: { x: number; y: number }[];
  targetIdx: number;
  speed: number;
  sirenPhase: number;
}

export interface TorcedorMember {
  id: number;
  role: 'leader' | 'drummer' | 'banner' | 'flare' | 'singing' | 'surdo';
  name: string;
  shirtColor: string;
  skinColor: string;
}

export const PistaBrawlMazeMinigame: React.FC<PistaBrawlMazeMinigameProps> = ({
  playerTorcidaName = 'Torcida Organizada',
  playerClubName = 'Nosso Clube',
  rivalTorcidaName = 'Torcida Rival',
  playerPrimaryColor = '#e11d48',
  playerSecondaryColor = '#ffffff',
  rivalPrimaryColor = '#2563eb',
  rivalSecondaryColor = '#09090b',
  contingente = 50,
  poderPista = 50,
  onFinish,
}) => {
  const crowdRoster: TorcedorMember[] = [
    { id: 1, role: 'leader', name: 'Puxador', shirtColor: playerPrimaryColor, skinColor: '#e0ac69' },
    { id: 2, role: 'drummer', name: 'Bumbo de Alça', shirtColor: playerSecondaryColor, skinColor: '#f1c27d' },
    { id: 3, role: 'banner', name: 'Bandeirão', shirtColor: playerPrimaryColor, skinColor: '#8d5524' },
    { id: 4, role: 'flare', name: 'Sinalizador', shirtColor: playerSecondaryColor, skinColor: '#ffdbac' },
    { id: 5, role: 'surdo', name: 'Surdo de Marcação', shirtColor: playerPrimaryColor, skinColor: '#e0ac69' },
  ];

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'WON' | 'LOST'>('READY');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [timeLeft, setTimeLeft] = useState(40);
  const [rojaoCount, setRojaoCount] = useState(0);
  const [bondeCount, setBondeCount] = useState(0);
  const [lastScore, setLastScore] = useState(85);

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const playerRef = useRef({
    x: 1.5,
    y: 13.5,
    vx: 0,
    vy: 0,
    speed: 3.2,
    flareActive: false,
    flareTime: 0,
  });

  const trailRef = useRef<{ x: number; y: number }[]>([]);
  const itemsRef = useRef<CollectibleItem[]>([]);
  const policeCarsRef = useRef<PolicePatrolCar[]>([]);
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

  const initItemsAndEntities = () => {
    // Collectibles: 🚀 Rojões (+5%) & 👥 Partes do Bonde (+5%)
    itemsRef.current = [
      { id: 1, x: 1.5, y: 1.5, type: 'rojao', label: '🚀', collected: false },
      { id: 2, x: 7.5, y: 1.5, type: 'bonde', label: '👥', collected: false },
      { id: 3, x: 7.5, y: 7.5, type: 'rojao', label: '🚀', collected: false },
      { id: 4, x: 13.5, y: 11.5, type: 'bonde', label: '👥', collected: false },
      { id: 5, x: 3.5, y: 9.5, type: 'rojao', label: '🚀', collected: false },
      { id: 6, x: 11.5, y: 5.5, type: 'bonde', label: '👥', collected: false },
    ];

    policeCarsRef.current = [
      {
        id: 1,
        x: 2.5,
        y: 13.5,
        path: [{ x: 2.5, y: 13.5 }, { x: 13.5, y: 13.5 }],
        targetIdx: 0,
        speed: 1.4,
        sirenPhase: 0,
      },
      {
        id: 2,
        x: 3.5,
        y: 7.5,
        path: [{ x: 3.5, y: 7.5 }, { x: 11.5, y: 7.5 }],
        targetIdx: 0,
        speed: 1.4,
        sirenPhase: 0,
      },
    ];

    setRojaoCount(0);
    setBondeCount(0);
  };

  const isWall = (x: number, y: number) => {
    const gx = Math.floor(x);
    const gy = Math.floor(y);
    if (gx < 0 || gx >= GRID_W || gy < 0 || gy >= GRID_H) return true;
    return MAZE_MAP[gy][gx] === 1;
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
      speed: 3.2,
      flareActive: false,
      flareTime: 0,
    };

    trailRef.current = Array.from({ length: 100 }, () => ({ x: startX, y: startY }));
    smokeParticlesRef.current = [];

    initItemsAndEntities();
    setTimeLeft(40);
    setGameState('PLAYING');
  };

  const finishGameAndReturn = (won: boolean, cause: 'REACHED_RIVAL' | 'POLICE' | 'TIMEOUT') => {
    setGameState(won ? 'WON' : 'LOST');

    const rawBonusPercent = (rojaoCount + bondeCount) * 0.05;
    const finalBonusPercent = Math.min(0.20, rawBonusPercent);
    const bonusDisplayInt = Math.round(finalBonusPercent * 100);

    if (won) {
      audio.playBrawlClimax();
      const score = Math.min(100, 70 + bonusDisplayInt);
      setLastScore(score);

      onFinish({
        gameType: 'pista_brawl' as any,
        modifier: finalBonusPercent + 0.10,
        rank: 'S',
        penaltyMP: 5,
        description: `🥊 TRIUNFO NO CONFRONTO DE PISTA! O bonde da ${playerTorcidaName} coletou rojões e reuniu sub-sedes no percurso (Bônus +${bonusDisplayInt}%), encurralou o Bonde Rival na saída e venceu o embate (+${Math.round((finalBonusPercent + 0.10) * 100)}% PEC, +15 Moral)!`,
      });
    } else {
      audio.playWhistle();
      if (cause === 'POLICE') {
        setLastScore(25);
        onFinish({
          gameType: 'pista_brawl' as any,
          modifier: -0.20,
          rank: 'F',
          penaltyMP: 20,
          description: `🚓 INTERCEPTAÇÃO POLICIAL NA PISTA! As patrulhas da PM interceptaram o bonde durante o deslocamento. Houve apreensão de rojões e detenções de membros (+20% Risco MP, -20% PEC, -12 Moral).`,
        });
      } else {
        setLastScore(35);
        onFinish({
          gameType: 'pista_brawl' as any,
          modifier: -0.15,
          rank: 'F',
          penaltyMP: 10,
          description: `⏱️ TEMPO ESGOTADO NA PISTA! O bonde demorou no percurso e foi surpreendido antes de se estruturar no confronto de saída (-15% PEC, -8 Moral, +10% Risco MP).`,
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
            finishGameAndReturn(false, 'TIMEOUT');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState, rojaoCount, bondeCount]);

  // Main Canvas Render & Animation Loop (60 FPS)
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

        const speed = player.speed;
        const nextX = player.x + player.vx * speed * dt;
        const nextY = player.y + player.vy * speed * dt;

        if (!isWall(nextX, player.y)) player.x = nextX;
        if (!isWall(player.x, nextY)) player.y = nextY;

        // Check Items pickup
        itemsRef.current.forEach((item) => {
          if (!item.collected) {
            const dist = Math.hypot(player.x - item.x, player.y - item.y);
            if (dist < 0.6) {
              item.collected = true;
              if (item.type === 'rojao') {
                audio.playRojaoPickup();
                setRojaoCount((c) => c + 1);
              } else if (item.type === 'bonde') {
                audio.playBondePickup();
                setBondeCount((c) => c + 1);
              }
            }
          }
        });

        // Update Police Patrols
        policeCarsRef.current.forEach((car) => {
          const target = car.path[car.targetIdx];
          const dx = target.x - car.x;
          const dy = target.y - car.y;
          const dist = Math.hypot(dx, dy);

          if (dist < 0.2) {
            car.targetIdx = (car.targetIdx + 1) % car.path.length;
          } else {
            car.x += (dx / dist) * car.speed * dt;
            car.y += (dy / dist) * car.speed * dt;
          }

          // Check collision with Police Car
          const pDist = Math.hypot(player.x - car.x, player.y - car.y);
          if (pDist < 0.7) {
            audio.playPoliceSiren();
            finishGameAndReturn(false, 'POLICE');
          }
        });

        // Check reaching Exit / Rival Bonde at (13.5, 1.5)
        const exitDist = Math.hypot(player.x - 13.5, player.y - 1.5);
        if (exitDist < 0.8) {
          finishGameAndReturn(true, 'REACHED_RIVAL');
        }

        // Update crowd trail
        trailRef.current.unshift({ x: player.x, y: player.y });
        if (trailRef.current.length > 100) trailRef.current.pop();
      }

      // ==========================================
      // CANVAS DRAWING SECTION
      // ==========================================
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw Map Tiles
      for (let r = 0; r < GRID_H; r++) {
        for (let c = 0; c < GRID_W; c++) {
          const tile = MAZE_MAP[r][c];
          const px = c * tileSize;
          const py = r * tileSize;

          if (tile === 1) {
            // Concrete Wall
            ctx.fillStyle = '#18181b';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#27272a';
            ctx.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2);
          } else if (tile === 3) {
            // Exit Gate / Bonde Rival Zone
            ctx.fillStyle = 'rgba(220, 38, 38, 0.25)';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2;
            ctx.strokeRect(px + 2, py + 2, tileSize - 4, tileSize - 4);
          } else {
            // Street Asphalt
            ctx.fillStyle = '#09090b';
            ctx.fillRect(px, py, tileSize, tileSize);
            ctx.strokeStyle = '#18181b';
            ctx.strokeRect(px, py, tileSize, tileSize);
          }
        }
      }

      // 2. Draw Collectible Items (🚀 Rojões & 👥 Bonde)
      itemsRef.current.forEach((item) => {
        if (!item.collected) {
          const ix = item.x * tileSize;
          const iy = item.y * tileSize;
          ctx.font = `${tileSize * 0.6}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(item.label, ix, iy);
        }
      });

      // 3. Draw Police Patrol Cars (🚔)
      policeCarsRef.current.forEach((car) => {
        const cx = car.x * tileSize;
        const cy = car.y * tileSize;
        ctx.font = `${tileSize * 0.65}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚔', cx, cy);
      });

      // 4. Draw Rival Bonde on Exit (💥)
      ctx.font = `${tileSize * 0.75}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('💥', 13.5 * tileSize, 1.5 * tileSize);

      // 5. Draw Player Crowd Trail & Members
      if (currentGameState === 'PLAYING' || currentGameState === 'WON') {
        const trail = trailRef.current;
        crowdRoster.forEach((member, idx) => {
          const posIdx = Math.min(idx * 12, trail.length - 1);
          const pos = trail[posIdx] || { x: player.x, y: player.y };

          const mx = pos.x * tileSize;
          const my = pos.y * tileSize;

          ctx.beginPath();
          ctx.arc(mx, my, tileSize * 0.28, 0, Math.PI * 2);
          ctx.fillStyle = member.shirtColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Member Icon / Role
          ctx.font = `${tileSize * 0.3}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = member.role === 'leader' ? '🚩' : member.role === 'flare' ? '🔥' : '🥁';
          ctx.fillText(icon, mx, my);
        });
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameState]);

  // Touch D-Pad Handler
  const handleDPadMove = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const keys = keysRef.current;
    keys['w'] = dir === 'UP';
    keys['s'] = dir === 'DOWN';
    keys['a'] = dir === 'LEFT';
    keys['d'] = dir === 'RIGHT';
    setTimeout(() => {
      keys['w'] = false;
      keys['s'] = false;
      keys['a'] = false;
      keys['d'] = false;
    }, 200);
  };

  const currentBonusPercent = Math.min(20, (rojaoCount + bondeCount) * 5);

  return (
    <div className="relative w-full max-w-xl mx-auto bg-zinc-950 border border-red-500/50 rounded-3xl p-4 shadow-2xl text-white space-y-3 font-sans animate-fade-in">
      {/* HEADER HUD */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full border border-red-500/50 flex items-center justify-center font-black text-xs" style={{ backgroundColor: playerPrimaryColor }}>
            ⚔️
          </div>
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">{playerTorcidaName}</h3>
            <span className="text-[10px] text-zinc-400">Poder de Pista: {poderPista}</span>
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 cursor-pointer"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2 text-right">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">{rivalTorcidaName}</h3>
            <span className="text-[10px] text-zinc-400">Bonde Rival</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-blue-500/50 flex items-center justify-center font-black text-xs" style={{ backgroundColor: rivalPrimaryColor }}>
            💥
          </div>
        </div>
      </div>

      {/* BONUS HUD BAR */}
      <div className="space-y-1.5 bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center space-x-1 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>BÔNUS DE CONFRONTO: +{currentBonusPercent}% (MÁX 20%)</span>
          </span>
          <span className={`font-mono ${timeLeft <= 10 ? 'text-red-400 animate-pulse font-black text-sm' : 'text-zinc-300'}`}>
            ⏱️ {timeLeft}s
          </span>
        </div>

        <div className="w-full h-2.5 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-full transition-all duration-300"
            style={{ width: `${(currentBonusPercent / 20) * 100}%` }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-zinc-400 pt-1">
          <span className="flex items-center space-x-1">
            <span>🚀 Rojões:</span>
            <strong className="text-amber-300 font-mono">{rojaoCount}</strong>
          </span>
          <span className="flex items-center space-x-1">
            <span>👥 Partes do Bonde:</span>
            <strong className="text-sky-300 font-mono">{bondeCount}</strong>
          </span>
        </div>
      </div>

      {/* CANVAS DISPLAY AREA */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={450}
          height={450}
          className="w-full h-full object-contain"
        />

        {/* START SCREEN OVERLAY */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 p-6 text-center space-y-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-3xl animate-bounce">
                🥊
              </div>
              <h2 className="text-base font-black text-amber-300 uppercase tracking-wider">
                CONFRONTO DE PISTA NA MÃO LIMPA
              </h2>
              <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                Navegue pelas ruas, recolha <strong className="text-amber-400">Rojões 🚀</strong> e <strong className="text-sky-400">Membros do Bonde 👥</strong> para acumular até <strong className="text-emerald-400">+20% de Bônus</strong>, desvie das <strong className="text-red-400">Patrulhas da PM 🚔</strong> e intercepte o <strong className="text-red-400">Bonde Rival 💥</strong> na saída!
              </p>

              <button
                onClick={startMinigame}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-sm uppercase tracking-wider transition transform active:scale-95 shadow-lg shadow-red-600/30 cursor-pointer"
              >
                INICIAR CONFRONTO ➔
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TOUCH CONTROLS (D-PAD) */}
      <div className="pt-2">
        <div className="grid grid-cols-3 gap-1.5 w-48 mx-auto">
          <div />
          <button
            onClick={() => handleDPadMove('UP')}
            disabled={gameState !== 'PLAYING'}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => handleDPadMove('LEFT')}
            disabled={gameState !== 'PLAYING'}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            ◄
          </button>
          <button
            onClick={() => handleDPadMove('DOWN')}
            disabled={gameState !== 'PLAYING'}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            ▼
          </button>
          <button
            onClick={() => handleDPadMove('RIGHT')}
            disabled={gameState !== 'PLAYING'}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            ►
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-500 mt-2">
          Controles: W, A, S, D / Setas do teclado ou D-Pad na tela.
        </p>
      </div>
    </div>
  );
};
