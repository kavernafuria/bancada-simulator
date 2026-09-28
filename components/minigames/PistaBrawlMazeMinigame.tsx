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
  isChasing: boolean;
  detectionRadius: number;
}

export interface TorcedorMember {
  id: number;
  role: 'leader' | 'drummer' | 'banner' | 'flare' | 'surdo';
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
  const [gameState, setGameState] = useState<'READY' | 'PLAYING' | 'SIMULATING_BRAWL' | 'WON' | 'LOST'>('READY');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const [timeLeft, setTimeLeft] = useState(40);
  const [rojaoCount, setRojaoCount] = useState(0);
  const [bondeCount, setBondeCount] = useState(0);
  const [policeNotice, setPoliceNotice] = useState('');
  const [brawlPhaseStep, setBrawlPhaseStep] = useState(0);
  const [brawlTickerText, setBrawlTickerText] = useState('CHOQUE DE LINHA DE FRENTE IMINENTE!');
  const [brawlPowerBar, setBrawlPowerBar] = useState(50); // 0 (Rival) to 100 (Player)

  const gameStateRef = useRef(gameState);
  gameStateRef.current = gameState;

  const bondeCountRef = useRef(bondeCount);
  bondeCountRef.current = bondeCount;
  const rojaoCountRef = useRef(rojaoCount);
  rojaoCountRef.current = rojaoCount;

  const noticeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const playerRef = useRef({
    x: 1.5,
    y: 13.5,
    vx: 0,
    vy: 0,
    speed: 3.2,
    flareActive: false,
    flareTime: 0,
    invincibleTimer: 0,
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
    itemsRef.current = [
      { id: 1, x: 1.5, y: 1.5, type: 'rojao', collected: false },
      { id: 2, x: 7.5, y: 1.5, type: 'bonde', collected: false },
      { id: 3, x: 7.5, y: 7.5, type: 'rojao', collected: false },
      { id: 4, x: 13.5, y: 11.5, type: 'bonde', collected: false },
      { id: 5, x: 3.5, y: 9.5, type: 'rojao', collected: false },
      { id: 6, x: 11.5, y: 5.5, type: 'bonde', collected: false },
    ];

    // 5 Active Police Patrol Vehicles with Small Perception Zones (Radius 0.5 tiles)
    policeCarsRef.current = [
      {
        id: 1,
        x: 7.5,
        y: 13.5,
        path: [{ x: 7.5, y: 13.5 }, { x: 13.5, y: 13.5 }],
        targetIdx: 0,
        speed: 1.5,
        sirenPhase: 0,
        isChasing: false,
        detectionRadius: 0.5,
      },
      {
        id: 2,
        x: 5.5,
        y: 7.5,
        path: [{ x: 5.5, y: 7.5 }, { x: 13.5, y: 7.5 }],
        targetIdx: 0,
        speed: 1.5,
        sirenPhase: 0,
        isChasing: false,
        detectionRadius: 0.5,
      },
      {
        id: 3,
        x: 5.5,
        y: 3.5,
        path: [{ x: 5.5, y: 3.5 }, { x: 13.5, y: 3.5 }],
        targetIdx: 0,
        speed: 1.5,
        sirenPhase: 0,
        isChasing: false,
        detectionRadius: 0.5,
      },
      {
        id: 4,
        x: 3.5,
        y: 1.5,
        path: [{ x: 3.5, y: 1.5 }, { x: 3.5, y: 9.5 }],
        targetIdx: 0,
        speed: 1.4,
        sirenPhase: 0,
        isChasing: false,
        detectionRadius: 0.5,
      },
      {
        id: 5,
        x: 11.5,
        y: 1.5,
        path: [{ x: 11.5, y: 1.5 }, { x: 11.5, y: 13.5 }],
        targetIdx: 0,
        speed: 1.4,
        sirenPhase: 0,
        isChasing: false,
        detectionRadius: 0.5,
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
      invincibleTimer: 0,
    };

    trailRef.current = Array.from({ length: 100 }, () => ({ x: startX, y: startY }));
    smokeParticlesRef.current = [];

    initItemsAndEntities();
    setTimeLeft(40);
    setPoliceNotice('');
    setGameState('PLAYING');
  };

  // Trigger Interactive Brawl Simulation Overlay
  const startBrawlSimulation = (reachedRival: boolean) => {
    setGameState('SIMULATING_BRAWL');
    audio.playBrawlClimax();

    const rawBonusPercent = (rojaoCount + bondeCount) * 0.05;
    const finalBonusPercent = Math.min(0.20, rawBonusPercent);
    const bonusDisplayInt = Math.round(finalBonusPercent * 100);

    // Initial Tug of War bar starting point
    setBrawlPowerBar(50 + bonusDisplayInt);
    setBrawlPhaseStep(1);
    setBrawlTickerText(`⚡ CHOQUE DE LINHA DE FRENTE! O bonde da ${playerTorcidaName} colidiu com o Bonde Rival da ${rivalTorcidaName}!`);

    // Step 2 (1.2s): Firework & Allies barrage
    setTimeout(() => {
      setBrawlPhaseStep(2);
      setBrawlTickerText(`🧨 DISPARO DE ROJÕES E REFORÇO DAS SUB-SEDES! (+${bonusDisplayInt}% Bônus de Pista em ação!)`);
      setBrawlPowerBar((prev) => Math.min(95, prev + 15));
      audio.playRojaoPickup();
    }, 1200);

    // Step 3 (2.4s): Battle Outcome & Final Finish Call
    setTimeout(() => {
      setBrawlPhaseStep(3);

      const baseWinProb = Math.min(0.85, Math.max(0.15, (poderPista / 100) * 0.6 + (contingente / 100) * 0.4));
      const totalWinProb = Math.min(0.95, baseWinProb + finalBonusPercent);
      const isVictory = Math.random() < totalWinProb;
      const finalPEC = isVictory ? finalBonusPercent + 0.10 : -0.10;

      if (isVictory) {
        audio.playCheer();
        setBrawlTickerText(`🏆 DOMÍNIO TOTAL DA PISTA! O bonde da ${playerTorcidaName} venceu o confronto de saída!`);
        setBrawlPowerBar(95);
      } else {
        audio.playWhistle();
        setBrawlTickerText(`🚨 RECUO E EMBOSCADA RIVAL! O bonde rival conteve o avanço no perímetro.`);
        setBrawlPowerBar(25);
      }

      setTimeout(() => {
        onFinish({
          gameType: 'pista_brawl' as any,
          modifier: finalPEC,
          rank: isVictory ? 'S' : 'F',
          penaltyMP: isVictory ? 5 : 15,
          description: isVictory
            ? `🥊 TRIUNFO NO CONFRONTO DE PISTA! O bonde da ${playerTorcidaName} coletou rojões e reuniu sub-sedes no percurso (Bônus +${bonusDisplayInt}%), encurralou o Bonde Rival da ${rivalTorcidaName} na saída e venceu o embate (+${Math.round((finalPEC) * 100)}% PEC, +15 Moral)!`
            : `DERROTA NA PISTA (Bônus +${bonusDisplayInt}% acumulado) - O bonde rival levou a melhor no confronto de saída.`,
        });
      }, 1800);
    }, 2500);
  };

  const finishGameAndReturn = (won: boolean, cause: 'REACHED_RIVAL' | 'POLICE' | 'TIMEOUT') => {
    if (cause === 'REACHED_RIVAL' || cause === 'TIMEOUT') {
      startBrawlSimulation(cause === 'REACHED_RIVAL');
      return;
    }

    setGameState('LOST');
    audio.playWhistle();
    onFinish({
      gameType: 'pista_brawl' as any,
      modifier: -0.20,
      rank: 'F',
      penaltyMP: 20,
      description: `🚓 INTERCEPTAÇÃO POLICIAL NA PISTA! As patrulhas da PM interceptaram o bonde durante o deslocamento. Houve apreensão de rojões e detenções de membros (+20% Risco MP, -20% PEC, -12 Moral).`,
    });
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
        if (player.invincibleTimer > 0) {
          player.invincibleTimer = Math.max(0, player.invincibleTimer - dt);
        }

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

        // Update Police Patrols (Perception Zone & Equal Speed Pursuit)
        policeCarsRef.current.forEach((car) => {
          const pDist = Math.hypot(player.x - car.x, player.y - car.y);

          // Check Perception Zone (Radius 0.5 tiles)
          if (pDist <= car.detectionRadius) {
            if (!car.isChasing) {
              car.isChasing = true;
              audio.playPoliceSiren();
            }
          } else if (pDist > 2.5) {
            car.isChasing = false; // Player outmaneuvered police car!
          }

          if (car.isChasing) {
            // PURSUIT MODE: Chase player at EQUAL SPEED (3.2 tiles/sec)
            const dx = player.x - car.x;
            const dy = player.y - car.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 0.05) {
              const chaseSpeed = player.speed; // 3.2 (Equal speed to player!)
              const nextCarX = car.x + (dx / dist) * chaseSpeed * dt;
              const nextCarY = car.y + (dy / dist) * chaseSpeed * dt;

              if (!isWall(nextCarX, car.y)) car.x = nextCarX;
              if (!isWall(car.x, nextCarY)) car.y = nextCarY;
            }
          } else {
            // PATROL MODE: Follow routine route
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
          }

          // Check collision with Police Car (Deduct members instead of instant game over)
          if (pDist < 0.75 && player.invincibleTimer <= 0) {
            player.invincibleTimer = 1.8; // 1.8s invincibility window
            car.isChasing = false; // Disengage police car pursuit temporarily
            audio.playPoliceSiren();

            if (bondeCountRef.current > 0) {
              setBondeCount((c) => Math.max(0, c - 1));
              setPoliceNotice('🚨 INTERCEPTAÇÃO POLICIAL! PERDEU 1 ALIADO (-5% BÔNUS)');
            } else if (rojaoCountRef.current > 0) {
              setRojaoCount((c) => Math.max(0, c - 1));
              setPoliceNotice('🚨 POLÍCIA APREENDEU 1 ROJÃO (-5% BÔNUS)!');
            } else {
              setTimeLeft((t) => Math.max(1, t - 5));
              setPoliceNotice('🚨 INTERCEPTAÇÃO POLICIAL! (-5 SEG DE TEMPO)');
            }

            if (noticeTimeoutRef.current) clearTimeout(noticeTimeoutRef.current);
            noticeTimeoutRef.current = setTimeout(() => {
              setPoliceNotice('');
            }, 2500);
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
            ctx.fillStyle = 'rgba(220, 38, 38, 0.35)';
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

      // 2. Draw Collectible Items (Custom Mortar & Real Torcedores)
      itemsRef.current.forEach((item) => {
        if (!item.collected) {
          const ix = item.x * tileSize;
          const iy = item.y * tileSize;

          if (item.type === 'rojao') {
            // CUSTOM DRAWN ROJAAN MORTAR
            ctx.save();
            ctx.translate(ix, iy);

            ctx.fillStyle = '#991b1b';
            ctx.fillRect(-tileSize * 0.18, -tileSize * 0.25, tileSize * 0.36, tileSize * 0.5);
            ctx.strokeStyle = '#f59e0b';
            ctx.lineWidth = 1.5;
            ctx.strokeRect(-tileSize * 0.18, -tileSize * 0.1, tileSize * 0.36, tileSize * 0.2);

            const sparkY = -tileSize * 0.28;
            ctx.beginPath();
            ctx.arc(0, sparkY, 3 + Math.sin(currentTime * 0.02) * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#fbbf24';
            ctx.fill();

            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#fef08a';
            ctx.textAlign = 'center';
            ctx.fillText('ROJÃO', 0, tileSize * 0.35);

            ctx.restore();
          } else if (item.type === 'bonde') {
            // SEPARATED MEMBERS DRAWN AS REAL TORCEDORES
            ctx.save();
            ctx.translate(ix, iy);

            const pulse = 1 + Math.sin(currentTime * 0.008) * 0.15;
            ctx.beginPath();
            ctx.arc(0, 0, tileSize * 0.35 * pulse, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
            ctx.fill();

            const offsets = [
              { x: -tileSize * 0.12, y: -tileSize * 0.08 },
              { x: tileSize * 0.12, y: -tileSize * 0.08 },
              { x: 0, y: tileSize * 0.12 },
            ];

            offsets.forEach((off) => {
              ctx.beginPath();
              ctx.arc(off.x, off.y, tileSize * 0.14, 0, Math.PI * 2);
              ctx.fillStyle = playerPrimaryColor;
              ctx.fill();
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 1;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(off.x, off.y - tileSize * 0.06, tileSize * 0.07, 0, Math.PI * 2);
              ctx.fillStyle = '#e0ac69';
              ctx.fill();
            });

            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#38bdf8';
            ctx.textAlign = 'center';
            ctx.fillText('ALIADOS', 0, tileSize * 0.38);

            ctx.restore();
          }
        }
      });

      // 3. Draw 5 Police Patrol Cars with Perception Zones (🚔)
      policeCarsRef.current.forEach((car) => {
        const cx = car.x * tileSize;
        const cy = car.y * tileSize;

        // Draw Perception Zone Ring
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, car.detectionRadius * tileSize, 0, Math.PI * 2);
        ctx.fillStyle = car.isChasing ? 'rgba(239, 68, 68, 0.22)' : 'rgba(239, 68, 68, 0.08)';
        ctx.fill();
        ctx.strokeStyle = car.isChasing ? '#ef4444' : 'rgba(239, 68, 68, 0.4)';
        ctx.lineWidth = car.isChasing ? 2 : 1;
        if (!car.isChasing) ctx.setLineDash([4, 4]);
        ctx.stroke();

        if (car.isChasing) {
          ctx.font = 'black 9px sans-serif';
          ctx.fillStyle = '#ef4444';
          ctx.textAlign = 'center';
          ctx.fillText('🚨 PERSEGUIÇÃO', cx, cy - tileSize * 0.55);
        }
        ctx.restore();

        // Draw Police Car Icon
        ctx.font = `${tileSize * 0.65}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚔', cx, cy);
      });

      // 4. DRAW RIVAL BONDE CLEARLY ON EXIT TILE (13.5, 1.5)
      ctx.save();
      const rx = 13.5 * tileSize;
      const ry = 1.5 * tileSize;
      ctx.translate(rx, ry);

      // Pulsating Red Warning Ring around Rival Bonde
      const rivalPulse = 1 + Math.sin(currentTime * 0.01) * 0.18;
      ctx.beginPath();
      ctx.arc(0, 0, tileSize * 0.45 * rivalPulse, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Group of 3 Rival Torcedores
      const rivalOffsets = [
        { x: -tileSize * 0.14, y: -tileSize * 0.1 },
        { x: tileSize * 0.14, y: -tileSize * 0.1 },
        { x: 0, y: tileSize * 0.12 },
      ];

      rivalOffsets.forEach((off) => {
        ctx.beginPath();
        ctx.arc(off.x, off.y, tileSize * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = rivalPrimaryColor;
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(off.x, off.y - tileSize * 0.07, tileSize * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = '#8d5524';
        ctx.fill();
      });

      // Explicit Label Text for Rival Bonde
      ctx.font = 'black 10px sans-serif';
      ctx.fillStyle = '#fca5a5';
      ctx.textAlign = 'center';
      ctx.fillText(`⚔️ BONDE RIVAL`, 0, -tileSize * 0.42);

      ctx.restore();

      // 5. Draw Player Crowd Trail & WALKING PEOPLE IN THE BONDE
      if (currentGameState === 'PLAYING' || currentGameState === 'WON') {
        const isInvincible = player.invincibleTimer > 0;
        const blinkVisible = !isInvincible || Math.floor(currentTime / 80) % 2 === 0;

        if (blinkVisible) {
          const trail = trailRef.current;
          crowdRoster.forEach((member, idx) => {
            const posIdx = Math.min(idx * 12, trail.length - 1);
            const pos = trail[posIdx] || { x: player.x, y: player.y };

            const mx = pos.x * tileSize;
            const my = pos.y * tileSize;

            const walkBob = Math.sin(currentTime * 0.012 + idx * 1.2) * 2.5;

            ctx.save();
            if (isInvincible) ctx.globalAlpha = 0.55;
            ctx.translate(mx, my + walkBob);

          ctx.beginPath();
          ctx.arc(0, 0, tileSize * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = member.shirtColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(0, -tileSize * 0.12, tileSize * 0.13, 0, Math.PI * 2);
          ctx.fillStyle = member.skinColor;
          ctx.fill();

          const legAngle = Math.sin(currentTime * 0.015 + idx) * 0.4;
          ctx.strokeStyle = '#18181b';
          ctx.lineWidth = 2;

          ctx.beginPath();
          ctx.moveTo(-tileSize * 0.08, tileSize * 0.18);
          ctx.lineTo(-tileSize * 0.08 + Math.sin(legAngle) * 4, tileSize * 0.32);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(tileSize * 0.08, tileSize * 0.18);
          ctx.lineTo(tileSize * 0.08 - Math.sin(legAngle) * 4, tileSize * 0.32);
          ctx.stroke();

          ctx.font = `${tileSize * 0.28}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          const icon = member.role === 'leader' ? '🚩' : member.role === 'flare' ? '🔥' : '🥁';
          ctx.fillText(icon, 0, -tileSize * 0.02);

          ctx.restore();
        });
        }
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
          <div className="w-8 h-8 rounded-full border border-red-500/50 flex items-center justify-center font-black text-xs shadow" style={{ backgroundColor: playerPrimaryColor }}>
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
            <span className="text-[10px] text-red-400 font-bold">🎯 ALVO: BONDE RIVAL</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-red-500/80 flex items-center justify-center font-black text-xs shadow" style={{ backgroundColor: rivalPrimaryColor }}>
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
            <span>🧨 Rojões:</span>
            <strong className="text-amber-300 font-mono">{rojaoCount}</strong>
          </span>
          <span className="flex items-center space-x-1">
            <span>👥 Aliados Reunidos:</span>
            <strong className="text-sky-300 font-mono">{bondeCount}</strong>
          </span>
        </div>
      </div>

      {/* CANVAS DISPLAY AREA */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
        {policeNotice && (
          <div className="absolute top-3 inset-x-3 z-30 px-3 py-2 bg-red-950/90 text-red-200 border-2 border-red-500 rounded-xl text-center text-xs font-black shadow-xl animate-bounce backdrop-blur-sm">
            {policeNotice}
          </div>
        )}
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
                Navegue pelas ruas, recolha <strong className="text-amber-400">Rojões 🧨</strong> e <strong className="text-sky-400">Aliados 👥</strong> para acumular até <strong className="text-emerald-400">+20% de Bônus</strong>, desvie da <strong className="text-red-400">PM 🚔</strong> e intercepte o <strong className="text-red-400">Bonde Rival ({rivalTorcidaName}) 💥</strong> no canto oposto do mapa!
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

        {/* INTERACTIVE BRAWL SIMULATION OVERLAY WITH VIDEO */}
        {gameState === 'SIMULATING_BRAWL' && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/95 p-3 text-center space-y-2 backdrop-blur-md animate-fade-in overflow-hidden">
            <div className="w-full space-y-2">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500 text-red-400 font-black text-[10px] uppercase tracking-widest animate-pulse">
                <Swords className="w-3.5 h-3.5" /> CONFRONTO DE PISTA EM ANDAMENTO
              </div>

              {/* BRAWL VIDEO PLAYER */}
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden border-2 border-red-500/60 shadow-2xl bg-black">
                <video
                  src="/videos/briganamao.mp4"
                  autoPlay
                  playsInline
                  muted={false}
                  controls={false}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 border border-red-500/40 text-[9px] font-black text-red-400 uppercase tracking-wider">
                  🔴 IMAGENS DO EMBATE DE PISTA
                </div>
              </div>

              {/* ARENA LINEUP HEADERS */}
              <div className="grid grid-cols-2 gap-2 items-center">
                {/* PLAYER SIDE */}
                <div className="bg-zinc-900/90 border border-emerald-500/40 p-2 rounded-xl space-y-0.5 text-left">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: playerPrimaryColor }} />
                    <span className="text-[11px] font-black text-white truncate">{playerTorcidaName}</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 block font-bold">
                    +{currentBonusPercent}% Bônus de Rojões/Aliados
                  </span>
                </div>

                {/* RIVAL SIDE */}
                <div className="bg-zinc-900/90 border border-red-500/40 p-2 rounded-xl space-y-0.5 text-right">
                  <div className="flex items-center justify-end space-x-1.5">
                    <span className="text-[11px] font-black text-white truncate">{rivalTorcidaName}</span>
                    <div className="w-4 h-4 rounded-full border border-white" style={{ backgroundColor: rivalPrimaryColor }} />
                  </div>
                  <span className="text-[9px] text-red-400 block font-bold">Bonde Rival em Linha</span>
                </div>
              </div>

              {/* TUG OF WAR CLASH POWER BAR */}
              <div className="space-y-0.5">
                <div className="flex justify-between text-[9px] font-bold text-zinc-400">
                  <span>Força {playerTorcidaName}</span>
                  <span>VS</span>
                  <span>Força {rivalTorcidaName}</span>
                </div>
                <div className="w-full h-2.5 bg-zinc-950 rounded-full border border-zinc-800 p-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 transition-all duration-700 rounded-full shadow-lg shadow-amber-500/30"
                    style={{ width: `${brawlPowerBar}%` }}
                  />
                </div>
              </div>

              {/* ACTION TICKER LOG */}
              <div className="bg-zinc-900 p-2 rounded-xl border border-zinc-800 font-mono text-[11px] text-amber-300 min-h-[36px] flex items-center justify-center">
                <span className="animate-pulse">{brawlTickerText}</span>
              </div>
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
