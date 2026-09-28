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
    gain.gain.setValueAtTime(0.3, now);
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
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
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

  playBrawlClimax() {
    if (!this.ctx || !this.enabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(440, now + 0.4);
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  }
}

const soundEngine = new SoundEngine();

// GRID CONSTANTS
const GRID_ROWS = 9;
const GRID_COLS = 9;

interface ItemSpot {
  r: number;
  c: number;
  type: 'ROJAO' | 'BONDE_MEMBER' | 'POLICE_PATROL';
  id: string;
}

export const PistaBrawlMazeMinigame: React.FC<PistaBrawlMazeMinigameProps> = ({
  playerTorcidaName = "Sua Torcida",
  playerClubName = "Seu Clube",
  rivalTorcidaName = "Torcida Rival",
  playerPrimaryColor = "#e11d48",
  playerSecondaryColor = "#9f1239",
  rivalPrimaryColor = "#2563eb",
  rivalSecondaryColor = "#1e40af",
  contingente = 50,
  poderPista = 50,
  onFinish,
}) => {
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [items, setItems] = useState<ItemSpot[]>([]);
  const [rojaoCount, setRojaoCount] = useState<number>(0);
  const [bondeCount, setBondeCount] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [climaxText, setClimaxText] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Items on Grid
  useEffect(() => {
    soundEngine.init();

    const initialItems: ItemSpot[] = [
      { r: 0, c: 3, type: 'ROJAO', id: 'r1' },
      { r: 2, c: 1, type: 'BONDE_MEMBER', id: 'b1' },
      { r: 2, c: 5, type: 'ROJAO', id: 'r2' },
      { r: 4, c: 2, type: 'POLICE_PATROL', id: 'p1' },
      { r: 4, c: 6, type: 'BONDE_MEMBER', id: 'b2' },
      { r: 5, c: 4, type: 'ROJAO', id: 'r3' },
      { r: 6, c: 1, type: 'POLICE_PATROL', id: 'p2' },
      { r: 6, c: 7, type: 'BONDE_MEMBER', id: 'b3' },
      { r: 7, c: 3, type: 'ROJAO', id: 'r4' },
      { r: 8, c: 5, type: 'BONDE_MEMBER', id: 'b4' },
    ];
    setItems(initialItems);

    // Timer Interval
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleTriggerClimax(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Keyboard Movement Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isFinished) return;
      if (['ArrowUp', 'KeyW'].includes(e.code)) movePlayer(-1, 0);
      else if (['ArrowDown', 'KeyS'].includes(e.code)) movePlayer(1, 0);
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) movePlayer(0, -1);
      else if (['ArrowRight', 'KeyD'].includes(e.code)) movePlayer(0, 1);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, isFinished, items]);

  const movePlayer = (dr: number, dc: number) => {
    if (isFinished) return;

    const newR = Math.max(0, Math.min(GRID_ROWS - 1, playerPos.r + dr));
    const newC = Math.max(0, Math.min(GRID_COLS - 1, playerPos.c + dc));

    if (newR === playerPos.r && newC === playerPos.c) return;

    soundEngine.playBumbo();
    setPlayerPos({ r: newR, c: newC });

    // Check item pickup / collision
    const hitItem = items.find((it) => it.r === newR && it.c === newC);
    if (hitItem) {
      if (hitItem.type === 'ROJAO') {
        soundEngine.playRojaoPickup();
        setRojaoCount((prev) => prev + 1);
        setItems((prev) => prev.filter((it) => it.id !== hitItem.id));
      } else if (hitItem.type === 'BONDE_MEMBER') {
        soundEngine.playBondePickup();
        setBondeCount((prev) => prev + 1);
        setItems((prev) => prev.filter((it) => it.id !== hitItem.id));
      } else if (hitItem.type === 'POLICE_PATROL') {
        soundEngine.playPoliceSiren();
        setTimeLeft((prev) => Math.max(1, prev - 2));
      }
    }

    // Check reaching exit (Rival Bonde at GRID_ROWS - 1, GRID_COLS - 1)
    if (newR === GRID_ROWS - 1 && newC === GRID_COLS - 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      handleTriggerClimax(true);
    }
  };

  const handleTriggerClimax = (reachedRival: boolean) => {
    if (isFinished) return;
    setIsFinished(true);

    soundEngine.playBrawlClimax();

    // Calculate Bonus (5% per rojao, 5% per bonde member, capped at +20%)
    const rawBonusPercent = (rojaoCount + bondeCount) * 0.05;
    const finalBonusPercent = Math.min(0.20, rawBonusPercent);
    const bonusDisplayInt = Math.round(finalBonusPercent * 100);

    const title = reachedRival
      ? `💥 BONDE ENCONTROU O RIVAL NA SAÍDA DA PISTA!`
      : `⏱️ TEMPO ESGOTADO - CONFRONTO FORÇADO NA RODOVIA!`;

    setClimaxText(title);

    // Calculate Fight Win Probability
    const baseWinProb = Math.min(0.85, Math.max(0.15, (poderPista / 100) * 0.6 + (contingente / 100) * 0.4));
    const totalWinProb = Math.min(0.95, baseWinProb + finalBonusPercent);

    const isVictory = Math.random() < totalWinProb;
    const finalPEC = isVictory ? finalBonusPercent + 0.10 : -0.10;

    setTimeout(() => {
      onFinish({
        gameType: 'pista_brawl',
        modifier: finalPEC,
        rank: isVictory ? 'S' : 'F',
        penaltyMP: isVictory ? 5 : 15,
        description: isVictory
          ? `VITÓRIA NA PISTA (+${bonusDisplayInt}% BÔNUS DE ROJÕES E BONDE) - ${playerTorcidaName} dominou o perímetro!`
          : `DERROTA NA PISTA (Bônus +${bonusDisplayInt}% acumulado) - O bonde rival levou a melhor no confronto de saída.`,
      });
    }, 2200);
  };

  // Calculate HUD Bonus Display
  const currentBonusPercent = Math.min(20, (rojaoCount + bondeCount) * 5);

  return (
    <div className="relative w-full max-w-lg mx-auto bg-zinc-950 border border-red-500/50 rounded-3xl p-4 shadow-2xl text-white space-y-3 font-sans animate-fade-in">
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
          onClick={() => {
            soundEngine.enabled = !soundEngine.enabled;
            setSoundOn(soundEngine.enabled);
          }}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400"
        >
          {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <div className="flex items-center space-x-2 text-right">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">{rivalTorcidaName}</h3>
            <span className="text-[10px] text-zinc-400">Rival de Pista</span>
          </div>
          <div className="w-8 h-8 rounded-full border border-blue-500/50 flex items-center justify-center font-black text-xs" style={{ backgroundColor: rivalPrimaryColor }}>
            💥
          </div>
        </div>
      </div>

      {/* BONUS ACCUMULATOR & METRICS BAR */}
      <div className="space-y-1.5 bg-zinc-900/90 rounded-2xl p-3 border border-zinc-800">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center space-x-1 text-amber-400">
            <Zap className="w-3.5 h-3.5 fill-amber-400" />
            <span>BÔNUS DE CONFRONTO: +{currentBonusPercent}% (MÁX 20%)</span>
          </span>
          <span className={`font-mono ${timeLeft <= 5 ? 'text-red-400 animate-pulse font-black text-sm' : 'text-zinc-300'}`}>
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

      {/* CLIMAX OVERLAY MODAL */}
      {climaxText && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4 rounded-3xl backdrop-blur-sm animate-fade-in text-center space-y-4">
          <div className="space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-red-600/30 border border-red-500 flex items-center justify-center text-3xl animate-bounce">
              🥊
            </div>
            <h2 className="text-base font-black text-amber-300 uppercase">{climaxText}</h2>
            <p className="text-xs text-zinc-300">
              Bônus total acumulado no percurso: <strong className="text-emerald-400 font-mono">+{currentBonusPercent}%</strong>
            </p>
            <p className="text-[11px] text-zinc-400 animate-pulse">Calculando resultado do combate de pista...</p>
          </div>
        </div>
      )}

      {/* 2D MAP GRID */}
      <div className="grid grid-cols-9 gap-1 bg-zinc-900 p-2 rounded-2xl border border-zinc-800 relative aspect-square">
        {Array.from({ length: GRID_ROWS }).map((_, r) =>
          Array.from({ length: GRID_COLS }).map((_, c) => {
            const isPlayer = playerPos.r === r && playerPos.c === c;
            const isRival = r === GRID_ROWS - 1 && c === GRID_COLS - 1;
            const itemHere = items.find((it) => it.r === r && it.c === c);

            return (
              <div
                key={`${r}-${c}`}
                className={`relative flex items-center justify-center rounded-lg border text-xs font-bold transition-all ${
                  isPlayer
                    ? 'bg-emerald-500/30 border-emerald-400 text-white shadow-lg shadow-emerald-500/20 scale-105 z-10'
                    : isRival
                    ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
                    : 'bg-zinc-950/80 border-zinc-800/60'
                }`}
              >
                {isPlayer && <span className="text-base animate-bounce">🚩</span>}
                {!isPlayer && isRival && <span className="text-base">💥</span>}
                {!isPlayer && !isRival && itemHere?.type === 'ROJAO' && <span>🚀</span>}
                {!isPlayer && !isRival && itemHere?.type === 'BONDE_MEMBER' && <span>👥</span>}
                {!isPlayer && !isRival && itemHere?.type === 'POLICE_PATROL' && <span className="animate-pulse">🚔</span>}
              </div>
            );
          })
        )}
      </div>

      {/* CONTROLS (ON-SCREEN D-PAD) */}
      <div className="pt-2">
        <div className="grid grid-cols-3 gap-1.5 w-48 mx-auto">
          <div />
          <button
            onClick={() => movePlayer(-1, 0)}
            disabled={isFinished}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50"
          >
            ▲
          </button>
          <div />
          <button
            onClick={() => movePlayer(0, -1)}
            disabled={isFinished}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50"
          >
            ◄
          </button>
          <button
            onClick={() => movePlayer(1, 0)}
            disabled={isFinished}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50"
          >
            ▼
          </button>
          <button
            onClick={() => movePlayer(0, 1)}
            disabled={isFinished}
            className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 font-black text-sm active:scale-95 disabled:opacity-50"
          >
            ►
          </button>
        </div>
        <p className="text-[10px] text-center text-zinc-500 mt-2">
          Dica: Use as setas do teclado ou o controle na tela para recolher rojões 🚀 e membros 👥 até o bonde rival 💥!
        </p>
      </div>
    </div>
  );
};
