import React, { useState, useEffect, useRef } from 'react';
import { MiniGameResult } from '../MatchTacticalResolver';

export interface MazeEscapeMinigameProps {
  playerTorcidaName?: string;
  playerClubName?: string;
  rivalTorcidaName?: string;
  contingente?: number;
  poderPista?: number;
  onFinish: (result: MiniGameResult) => void;
}

// 15x15 Neighborhood Grid Map
// 0 = Street / Alley (Walkable)
// 1 = Building Block / Wall (Obstacle)
// 2 = Small Rival Mob Spawn (Alley)
// 3 = Stadium Gate Destination
const MAZE_GRID: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Web Audio API helper for sound effects
class MazeAudio {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playMove() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.05);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.05);
  }

  playSiren() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.15);
    osc.frequency.linearRampToValueAtTime(600, t + 0.3);
    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  playRageAlert() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(350, t);
    osc.frequency.exponentialRampToValueAtTime(700, t + 0.25);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playVictoryDrums() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 - i * 20, t + i * 0.12);
      gain.gain.setValueAtTime(0.3, t + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, t + i * 0.12 + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.12);
      osc.stop(t + i * 0.12 + 0.1);
    }
  }

  playClashFail() {
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.linearRampToValueAtTime(40, t + 0.4);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  }
}

const audio = new MazeAudio();

export const MazeEscapeMinigame: React.FC<MazeEscapeMinigameProps> = ({
  playerTorcidaName = 'Torcida Organizada',
  playerClubName = 'Nosso Clube',
  rivalTorcidaName = 'Torcida Rival',
  contingente = 50,
  poderPista = 50,
  onFinish,
}) => {
  const [isTutorial, setIsTutorial] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [gameOver, setGameOver] = useState<boolean>(false);

  // Player position
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 1, c: 1 });

  // Small Rival Mob (3 members) position
  const [smallMobPos, setSmallMobPos] = useState<{ r: number; c: number; alive: boolean }>({
    r: 13,
    c: 1,
    alive: true,
  });

  // Rage mode state
  const [isRageMode, setIsRageMode] = useState<boolean>(false);
  const [rageBannerTimer, setRageBannerTimer] = useState<boolean>(false);

  // Big Rival Mobs (6 members each)
  const [bigMobs, setBigMobs] = useState<Array<{ id: number; r: number; c: number; dir: number }>>([
    { id: 1, r: 5, c: 5, dir: 0 },
    { id: 2, r: 9, c: 7, dir: 1 },
    { id: 3, r: 3, c: 11, dir: 2 },
  ]);

  // Police Cars (PM/DRADE with sirens)
  const [policeCars, setPoliceCars] = useState<Array<{ id: number; r: number; c: number; dir: number }>>([
    { id: 1, r: 1, c: 7, dir: 0 },
    { id: 2, r: 7, c: 13, dir: 1 },
  ]);

  const [policeDelayCount, setPoliceDelayCount] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 1. Move Player logic
  const movePlayer = (dr: number, dc: number) => {
    if (gameOver || isTutorial) return;

    setPlayerPos((prev) => {
      const nr = prev.r + dr;
      const nc = prev.c + dc;

      // Check wall bounds
      if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15 || MAZE_GRID[nr][nc] === 1) {
        return prev;
      }

      audio.playMove();

      // Check small mob collision (defeat small mob & trigger RAGE mode!)
      if (smallMobPos.alive && nr === smallMobPos.r && nc === smallMobPos.c) {
        setSmallMobPos((sm) => ({ ...sm, alive: false }));
        setIsRageMode(true);
        setRageBannerTimer(true);
        audio.playRageAlert();
        setTimeout(() => setRageBannerTimer(false), 3000);
      }

      // Check Stadium Gate destination reach!
      if (MAZE_GRID[nr][nc] === 3) {
        setGameOver(true);
        audio.playVictoryDrums();
        setTimeout(() => {
          if (!smallMobPos.alive) {
            // Rank S: Defeated Small Mob + Safe Gate Escape!
            onFinish({
              gameType: 'maze_escape' as any,
              modifier: 0.25,
              rank: 'S',
              penaltyMP: 0,
              description: `✨ VICTÓRIA APOTEÓTICA NO BAIRRO E NA BANCADA! O bonde encurralou o pequeno grupo do ${rivalTorcidaName}, rompeu a emboscada e garantiu a Festa no Caldeirão com lucro recorde no caixa (+25% PEC, +15 Moral, +R$ 4.500)!`,
            });
          } else if (policeDelayCount === 0) {
            // Rank A: Direct Escape to Stadium Gate
            onFinish({
              gameType: 'maze_escape' as any,
              modifier: 0.15,
              rank: 'A',
              penaltyMP: 0,
              description: `🛡️ NAVEGAÇÃO ESTRATÉGICA PELO BAIRRO! O bonde desviou das patrulhas rivais e acessou o Caldeirão a tempo de comandar o show nas arquibancadas (+15% PEC, +10 Moral)!`,
            });
          } else {
            // Rank B: Delayed by Police but Reached Gate
            onFinish({
              gameType: 'maze_escape' as any,
              modifier: 0.05,
              rank: 'B',
              penaltyMP: 5,
              description: `⚠️ CHEGADA COM RETENÇÃO POLICIAL! O bonde enfrentou a blitz da PM nas ruas do bairro, mas entrou a tempo de apoiar o time nas arquibancadas (+5% PEC, +5% Risco MP).`,
            });
          }
        }, 600);
      }

      return { r: nr, c: nc };
    });
  };

  // 2. Keyboard Control Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver || isTutorial) return;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        movePlayer(-1, 0);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        movePlayer(1, 0);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        movePlayer(0, -1);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        movePlayer(0, 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver, isTutorial, smallMobPos, policeDelayCount]);

  // 3. Game Timer
  useEffect(() => {
    if (isTutorial || gameOver) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setGameOver(true);
          audio.playClashFail();
          onFinish({
            gameType: 'maze_escape' as any,
            modifier: -0.20,
            rank: 'F',
            penaltyMP: 15,
            description: `❌ TEMPO ESGOTADO NAS RUAS DO BAIRRO! O bonde ficou preso nos bloqueios antes de alcançar os portões do Caldeirão (-20% PEC, +15% Risco MP).`,
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTutorial, gameOver, onFinish]);

  // 4. Enemy & Police AI loop
  useEffect(() => {
    if (isTutorial || gameOver) return;

    const moveIntervalTime = isRageMode ? 350 : 500;

    const aiInterval = setInterval(() => {
      // Move Big Mobs
      setBigMobs((prevMobs) =>
        prevMobs.map((mob) => {
          const directions = [
            { dr: -1, dc: 0 },
            { dr: 1, dc: 0 },
            { dr: 0, dc: -1 },
            { dr: 0, dc: 1 },
          ];

          // Try moving in current direction or pick valid neighbor
          let validMoves: Array<{ dr: number; dc: number; dirIdx: number }> = [];
          directions.forEach((d, idx) => {
            const nr = mob.r + d.dr;
            const nc = mob.c + d.dc;
            if (nr >= 0 && nr < 15 && nc >= 0 && nc < 15 && MAZE_GRID[nr][nc] !== 1) {
              validMoves.push({ dr: d.dr, dc: d.dc, dirIdx: idx });
            }
          });

          if (validMoves.length === 0) return mob;

          // Prefer towards player if in Rage Mode!
          let chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          if (isRageMode) {
            let minDistance = 999;
            validMoves.forEach((m) => {
              const testR = mob.r + m.dr;
              const testC = mob.c + m.dc;
              const dist = Math.abs(testR - playerPos.r) + Math.abs(testC - playerPos.c);
              if (dist < minDistance) {
                minDistance = dist;
                chosenMove = m;
              }
            });
          }

          const newR = mob.r + chosenMove.dr;
          const newC = mob.c + chosenMove.dc;

          // Check collision with player
          if (newR === playerPos.r && newC === playerPos.c) {
            setGameOver(true);
            audio.playClashFail();
            onFinish({
              gameType: 'maze_escape' as any,
              modifier: -0.20,
              rank: 'F',
              penaltyMP: 15,
              description: `💥 BONDE EMBOSCADO NO BAIRRO! O grupo rival maior do ${rivalTorcidaName} cercou a travessia nas ruas antes do estádio (-20% PEC, +15% Risco MP).`,
            });
          }

          return { ...mob, r: newR, c: newC, dir: chosenMove.dirIdx };
        })
      );

      // Move Police Cars
      setPoliceCars((prevCars) =>
        prevCars.map((car) => {
          const dirs = [
            { dr: 0, dc: 1 },
            { dr: 0, dc: -1 },
            { dr: 1, dc: 0 },
            { dr: -1, dc: 0 },
          ];

          let d = dirs[car.dir];
          let nr = car.r + d.dr;
          let nc = car.c + d.dc;

          if (nr < 0 || nr >= 15 || nc < 0 || nc >= 15 || MAZE_GRID[nr][nc] === 1) {
            const nextDir = (car.dir + 1) % 4;
            d = dirs[nextDir];
            nr = car.r + d.dr;
            nc = car.c + d.dc;
            return { ...car, r: car.r, c: car.c, dir: nextDir };
          }

          // Check police collision (blitz delay)
          if (nr === playerPos.r && nc === playerPos.c) {
            audio.playSiren();
            setPoliceDelayCount((c) => c + 1);
          }

          return { ...car, r: nr, c: nc };
        })
      );
    }, moveIntervalTime);

    return () => clearInterval(aiInterval);
  }, [isTutorial, gameOver, isRageMode, playerPos, rivalTorcidaName, onFinish]);

  // 5. Canvas Render Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const render = () => {
      tick++;
      const tileSize = canvas.width / 15;

      // Background Asphalt
      ctx.fillStyle = '#18181b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Grid Tiles
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
          const x = c * tileSize;
          const y = r * tileSize;
          const cell = MAZE_GRID[r][c];

          if (cell === 1) {
            // Wall / Neighborhood Block
            ctx.fillStyle = '#09090b';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = '#27272a';
            ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 2);

            // Roof detail lines
            ctx.fillStyle = '#1c1917';
            ctx.fillRect(x + 4, y + 4, tileSize - 8, tileSize - 8);
          } else if (cell === 3) {
            // Stadium Gate Area
            const glow = Math.sin(tick * 0.1) * 0.3 + 0.7;
            ctx.fillStyle = `rgba(245, 158, 11, ${glow})`;
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, tileSize, tileSize);

            // Gate icon text
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🏟️', x + tileSize / 2, y + tileSize / 2);
          } else {
            // Street surface & sidewalk markings
            ctx.fillStyle = '#27272a';
            ctx.fillRect(x, y, tileSize, tileSize);
            ctx.strokeStyle = '#3f3f46';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(x, y, tileSize, tileSize);
          }
        }
      }

      // Draw Small Rival Mob (if alive)
      if (smallMobPos.alive) {
        const smX = smallMobPos.c * tileSize;
        const smY = smallMobPos.r * tileSize;

        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.beginPath();
        ctx.arc(smX + tileSize / 2, smY + tileSize / 2, tileSize * 0.45, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👊', smX + tileSize / 2, smY + tileSize / 2);
      }

      // Draw Big Rival Mobs (6 figures)
      bigMobs.forEach((mob) => {
        const mx = mob.c * tileSize;
        const my = mob.r * tileSize;

        if (isRageMode) {
          const pulse = (Math.sin(tick * 0.2) + 1) * 0.4 + 0.2;
          ctx.fillStyle = `rgba(220, 38, 38, ${pulse})`;
          ctx.beginPath();
          ctx.arc(mx + tileSize / 2, my + tileSize / 2, tileSize * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('👺', mx + tileSize / 2, my + tileSize / 2);
      });

      // Draw Police Patrol Cars
      policeCars.forEach((car) => {
        const cx = car.c * tileSize;
        const cy = car.r * tileSize;

        // Siren light flashing alternating red/blue
        const isRed = (Math.floor(tick / 6) % 2) === 0;
        ctx.fillStyle = isRed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(cx + tileSize / 2, cy + tileSize / 2, tileSize * 0.55, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚔', cx + tileSize / 2, cy + tileSize / 2);
      });

      // Draw Player Convoy (Pelotão da Torcida)
      const px = playerPos.c * tileSize;
      const py = playerPos.r * tileSize;

      // Flare trail particles around player
      const flareAlpha = Math.sin(tick * 0.15) * 0.3 + 0.5;
      ctx.fillStyle = `rgba(34, 197, 94, ${flareAlpha})`;
      ctx.beginPath();
      ctx.arc(px + tileSize / 2, py + tileSize / 2, tileSize * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Convoy Sprite Icon
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🥁', px + tileSize / 2, py + tileSize / 2);

      animFrame = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animFrame);
  }, [playerPos, bigMobs, policeCars, smallMobPos, isRageMode]);

  // Render Tutorial Card / Emergency Warning Notice
  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-500/80 text-white max-w-md w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-red-900/60 pb-3 w-full">
          <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block animate-pulse">
            🚨 TORCIDA ÚNICA • ALERTA DE EMBOSCADA NO BAIRRO
          </span>
          <h3 className="text-base font-black text-white uppercase mt-0.5 tracking-wide">
            Festa no Caldeirão
          </h3>
        </div>

        <div className="bg-red-950/40 border border-red-600/50 p-4 rounded-xl text-left space-y-2 shadow-inner">
          <p className="text-xs font-bold text-red-200 leading-relaxed flex items-start space-x-1.5">
            <span className="text-lg">⚠️</span>
            <span>Um dos seus bondes de Bairro está sofrendo uma tentativa de emboscada por grupos da torcida rival nas ruas próximas ao estádio!</span>
          </p>
          <p className="text-[11px] text-zinc-300 leading-relaxed border-t border-red-900/40 pt-2">
            Guie o <strong className="text-emerald-400">Pelotão (🥁)</strong> pelas ruas do bairro, desvie dos grupos rivais maiores e alcance o <strong className="text-amber-400">Portão do Caldeirão (🏟️)</strong> para salvar o bonde e iniciar a festa monumental!
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[11px] font-mono text-emerald-400 w-full text-center font-bold">
          💰 Recompensa no Caixa: +R$ 4.500 • Meta: Salvar o Bonde & Festa (+25% PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsTutorial(false);
          }}
          className="w-full py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer touch-manipulation animate-pulse"
        >
          🚨 SOCORRER BONDE & INICIAR FUGA
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-4 sm:p-6 rounded-2xl border border-amber-500/80 text-white max-w-md w-full select-none shadow-2xl space-y-3">
      {/* Dynamic Header */}
      <div className="flex justify-between items-center w-full border-b border-zinc-800 pb-2 text-xs font-black uppercase">
        <div className="flex items-center space-x-2">
          <span className="text-amber-400 font-bold">🚨 Emboscada no Bairro</span>
          {isRageMode && (
            <span className="bg-red-600/80 text-white px-2 py-0.5 rounded text-[9px] font-mono tracking-widest animate-pulse">
              🔥 RAGE MODE
            </span>
          )}
        </div>
        <div className="font-mono text-sm text-yellow-400 font-bold">
          ⏱️ {timeLeft}s
        </div>
      </div>

      {/* RAGE Banner Alert */}
      {rageBannerTimer && (
        <div className="w-full bg-red-600/90 text-white text-[10px] font-black uppercase text-center py-1 rounded-lg animate-bounce border border-red-400">
          💥 BONDE RIVAL PEQUENO DERROTADO! MODO RAGE ACTIVATED NOS RIVAIS!
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="relative w-full aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 shadow-inner flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Mobile D-Pad Touch Controls */}
      <div className="flex flex-col items-center justify-center pt-2 space-y-1.5 w-full">
        <button
          onClick={() => movePlayer(-1, 0)}
          onTouchEnd={(e) => {
            e.preventDefault();
            movePlayer(-1, 0);
          }}
          className="w-14 h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500 active:text-black text-amber-400 rounded-xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow cursor-pointer touch-manipulation"
        >
          ▲
        </button>

        <div className="flex space-x-4">
          <button
            onClick={() => movePlayer(0, -1)}
            onTouchEnd={(e) => {
              e.preventDefault();
              movePlayer(0, -1);
            }}
            className="w-14 h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500 active:text-black text-amber-400 rounded-xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow cursor-pointer touch-manipulation"
          >
            ◀
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            onTouchEnd={(e) => {
              e.preventDefault();
              movePlayer(1, 0);
            }}
            className="w-14 h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500 active:text-black text-amber-400 rounded-xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow cursor-pointer touch-manipulation"
          >
            ▼
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            onTouchEnd={(e) => {
              e.preventDefault();
              movePlayer(0, 1);
            }}
            className="w-14 h-12 bg-zinc-800 hover:bg-zinc-700 active:bg-amber-500 active:text-black text-amber-400 rounded-xl font-black text-lg border border-zinc-700 flex items-center justify-center shadow cursor-pointer touch-manipulation"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center w-full text-[10px] text-zinc-400 font-mono border-t border-zinc-800 pt-2">
        <span>Bonde Pequeno: <strong className={smallMobPos.alive ? 'text-red-400' : 'text-emerald-400 font-bold'}>{smallMobPos.alive ? ' Localizar 👊' : ' Defeated ✨'}</strong></span>
        <span>Retenções PM: <strong className="text-blue-400 font-bold">{policeDelayCount}</strong></span>
      </div>
    </div>
  );
};
