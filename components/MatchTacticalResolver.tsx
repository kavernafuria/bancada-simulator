import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. TIPOS & INTERFACES
// ==========================================
export type GameType = 'whack' | 'rojon' | 'rhythm' | 'dodge' | 'punch';

export interface MiniGameResult {
  gameType: GameType;
  modifier: number; // Ex: -0.25 a +0.25
  rank: 'S' | 'B' | 'C' | 'F';
  penaltyMP?: number; // Risco de Ministério Público adicional
  description: string;
}

export interface MatchContext {
  isHome: boolean;
  tacticalChoice: 'gate_concentration' | 'front_charge' | 'rojon_barrage' | 'rhythm_mosaic' | 'caravan_escape';
  homeContingent: number;
  awayContingent: number;
  opponentTier: 'S' | 'A' | 'B';
}

// ==========================================
// 2. MINI-GAME 1: BRIGA DE BARRAS DE FERRO / CLICAR NO RIVAL (WHACK COMBAT - 10s)
// ==========================================
interface WhackCombatProps {
  opponentTier: 'S' | 'A' | 'B';
  onFinish: (result: MiniGameResult) => void;
}

export const WhackCombat: React.FC<WhackCombatProps> = ({ opponentTier, onFinish }) => {
  const [isTutorial, setIsTutorial] = useState(true);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isAlly, setIsAlly] = useState(false);

  // Comfortable target speed
  const speed = opponentTier === 'S' ? 520 : opponentTier === 'A' ? 620 : 720;

  useEffect(() => {
    if (isTutorial) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTutorial]);

  useEffect(() => {
    if (isTutorial) return;
    const spawner = setInterval(() => {
      const slot = Math.floor(Math.random() * 6);
      const ally = Math.random() < 0.20;
      setActiveSlot(slot);
      setIsAlly(ally);
    }, speed);

    return () => clearInterval(spawner);
  }, [isTutorial, speed]);

  useEffect(() => {
    if (!isTutorial && timeLeft === 0) {
      if (score >= 60) {
        onFinish({ gameType: 'whack', modifier: 0.25, rank: 'S', description: 'Linha de frente com barras de ferro atropelou o rival (+25% PEC)!' });
      } else if (score >= 35) {
        onFinish({ gameType: 'whack', modifier: 0.10, rank: 'B', description: 'Confronto equilibrado de barras de ferro na pista (+10% PEC).' });
      } else if (score >= 15) {
        onFinish({ gameType: 'whack', modifier: 0.00, rank: 'C', description: 'Bonde manteve a posição sem avanços (0% PEC).' });
      } else {
        onFinish({ gameType: 'whack', modifier: -0.20, rank: 'F', description: 'Linha recuou em desordem sob pressão (-20% PEC).' });
      }
    }
  }, [timeLeft, score, isTutorial, onFinish]);

  const handleClick = (index: number) => {
    if (isTutorial || index !== activeSlot) return;
    if (isAlly) {
      setScore((s) => Math.max(0, s - 15));
    } else {
      setScore((s) => s + 10);
    }
    setActiveSlot(null);
  };

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">🪵 CONFRONTO DE BARRAS DE FERRO</span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">Golpe de Precisão na Pista</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Clique rapidamente nos alvos rivais que surgirem nos setores.
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>Clique nos alvos rivais (<span className="text-red-400 font-bold">👊 Rival</span>) para pontuar!</li>
          <li>Evite clicar nos escudos azuis da sua própria torcida (<span className="text-blue-400 font-bold">🛡️ Aliado</span>)!</li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 10s • Meta Rank S: 60+ pts (+25% PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR BARRAS DE FERRO
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-red-500">Barras de Ferro: Golpeie o Rival</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 w-full h-52">
        {[0, 1, 2, 3, 4, 5].map((slot) => (
          <button
            key={slot}
            onClick={() => handleClick(slot)}
            className={`rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeSlot === slot
                ? isAlly
                  ? 'bg-blue-600 border-2 border-blue-300 scale-95 shadow-lg shadow-blue-900/60'
                  : 'bg-red-600 border-2 border-red-300 scale-95 shadow-lg shadow-red-900/60'
                : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'
            }`}
          >
            {activeSlot === slot && (
              <>
                <span className="text-2xl">{isAlly ? '🛡️' : '👊'}</span>
                <span className="text-[9px] font-black uppercase mt-1">
                  {isAlly ? 'Nossos!' : 'Rival!'}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span className="text-blue-400 text-[10px]">Cuidado: Escudo azul é aliado!</span>
        <span className="text-yellow-400 font-bold font-mono text-sm">{score} pts</span>
      </div>
    </div>
  );
};

// ==========================================
// 3. MINI-GAME 2: COMBATE DE PUNHOS & BLOQUEIO (PUNCH COMBAT - RITMO AJUSTADO)
// ==========================================
interface PunchFrontCombatProps {
  opponentTier: 'S' | 'A' | 'B';
  onFinish: (result: MiniGameResult) => void;
}

export const PunchFrontCombat: React.FC<PunchFrontCombatProps> = ({ opponentTier, onFinish }) => {
  const [isTutorial, setIsTutorial] = useState(true);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [rivalState, setRivalState] = useState<{
    lane: number;
    type: 'ATTACK' | 'GUARD_OPEN';
  } | null>(null);

  // Slowed down comfortable pace for punches
  const speed = opponentTier === 'S' ? 750 : opponentTier === 'A' ? 900 : 1050;

  useEffect(() => {
    if (isTutorial) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTutorial]);

  useEffect(() => {
    if (isTutorial) return;
    const spawner = setInterval(() => {
      const randomLane = Math.floor(Math.random() * 3);
      const isAttack = Math.random() < 0.40;
      setRivalState({ lane: randomLane, type: isAttack ? 'ATTACK' : 'GUARD_OPEN' });
    }, speed);

    return () => clearInterval(spawner);
  }, [isTutorial, speed]);

  useEffect(() => {
    if (!isTutorial && timeLeft === 0) {
      if (score >= 45) {
        onFinish({ gameType: 'punch', modifier: 0.25, rank: 'S', description: 'Linha de frente atropelou com combos de punho (+25% PEC)!' });
      } else if (score >= 25) {
        onFinish({ gameType: 'punch', modifier: 0.10, rank: 'B', description: 'Confronto equilibrado de punhos na pista (+10% PEC).' });
      } else if (score >= 10) {
        onFinish({ gameType: 'punch', modifier: 0.00, rank: 'C', description: 'Bonde manteve a guarda e travou a pista (0% PEC).' });
      } else {
        onFinish({ gameType: 'punch', modifier: -0.20, rank: 'F', description: 'Guarda furada pela linha rival (-20% PEC).' });
      }
    }
  }, [timeLeft, score, isTutorial, onFinish]);

  const handlePunch = (targetLane: number) => {
    if (isTutorial || !rivalState) return;
    if (rivalState.type === 'GUARD_OPEN' && rivalState.lane === targetLane) {
      setScore((s) => s + 10);
      setRivalState(null);
    } else if (rivalState.type === 'ATTACK' && rivalState.lane === targetLane) {
      setScore((s) => Math.max(0, s - 10));
      setRivalState(null);
    }
  };

  const handleBlock = () => {
    if (isTutorial || !rivalState) return;
    if (rivalState.type === 'ATTACK') {
      setScore((s) => s + 8);
      setRivalState(null);
    } else {
      setScore((s) => Math.max(0, s - 5));
    }
  };

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-red-500 uppercase tracking-widest block">🥊 LINHA DE FRENTE</span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">Combate de Punhos & Bloqueio</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Reaja com golpes e bloqueios nos setores da pista.
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>Quando a guarda rival abrir (<span className="text-yellow-400 font-bold">🎯 Guarda Aberta</span>), acerte o soco da pista correspondente!</li>
          <li>Quando o rival atacar (<span className="text-red-400 font-bold">⚠️ Golpe Pesado</span>), acione <span className="text-blue-400 font-bold">🛡️ BLOQUEAR</span>!</li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 10s • Meta Rank S: 45+ pts (+25% PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR DESAFIO DE PUNHOS
        </button>
      </div>
    );
  }

  const laneNames = ['ESQUERDA', 'CENTRO', 'DIREITA'];

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-red-500">Combate de Punhos: Reaja no Ritmo</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex flex-col justify-end">
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-dashed divide-zinc-800 pointer-events-none" />

        {rivalState && (
          <div
            className="absolute top-6 w-1/3 flex flex-col items-center justify-center transition-all duration-75"
            style={{ left: `${rivalState.lane * 33.33}%` }}
          >
            {rivalState.type === 'ATTACK' ? (
              <div className="flex flex-col items-center animate-bounce">
                <span className="text-3xl">👊</span>
                <span className="text-[9px] font-black bg-red-600 px-1.5 py-0.5 rounded text-white mt-1 shadow">
                  ⚠️ ATAQUE!
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-pulse">
                <span className="text-3xl">🎯</span>
                <span className="text-[9px] font-black bg-yellow-500 px-1.5 py-0.5 rounded text-black mt-1 shadow">
                  GUARDA ABERTA!
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-full pt-1">
        {[0, 1, 2].map((laneIdx) => (
          <button
            key={laneIdx}
            onClick={() => handlePunch(laneIdx)}
            className="py-2.5 rounded-xl bg-red-700 hover:bg-red-600 active:scale-95 text-white font-black text-[10px] uppercase transition-all shadow-md cursor-pointer text-center"
          >
            💥 SOCO {laneNames[laneIdx]}
          </button>
        ))}
      </div>

      <button
        onClick={handleBlock}
        className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center"
      >
        🛡️ BLOQUEAR GOLPE RIVAL
      </button>

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span>Pontuação de Combate:</span>
        <span className="text-yellow-400 font-bold font-mono text-sm">{score} pts</span>
      </div>
    </div>
  );
};

// ==========================================
// 4. MINI-GAME 3: MOSAICO 3D (JOGO DA MEMÓRIA - 3 FASES FIXAS DE REPETIÇÃO, FLASH RÁPIDO 300ms)
// ==========================================
interface MemoryMosaicProps {
  onFinish: (result: MiniGameResult) => void;
}

export const MemoryMosaic: React.FC<MemoryMosaicProps> = ({ onFinish }) => {
  const [isTutorial, setIsTutorial] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(1); // Phase 1, 2, 3

  const colors = [
    { name: 'Vermelho', hex: '#ef4444', icon: '🔴' },
    { name: 'Azul', hex: '#3b82f6', icon: '🔵' },
    { name: 'Amarelo', hex: '#eab308', icon: '🟡' },
    { name: 'Verde', hex: '#22c55e', icon: '🟢' },
  ];

  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeHighlightColor, setActiveHighlightColor] = useState<number | null>(null);

  // Generate sequence for current phase (Phase 1 = 3 colors, Phase 2 = 4 colors, Phase 3 = 5 colors)
  const startPhase = (phaseNum: number) => {
    const seqLength = phaseNum === 1 ? 3 : phaseNum === 2 ? 4 : 5;
    const newSeq = Array.from({ length: seqLength }, () => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setUserSequence([]);
    setIsShowingSequence(true);

    // Fast snappy flash playback (300ms on, 120ms off)
    newSeq.forEach((colorIdx, step) => {
      setTimeout(() => {
        setActiveHighlightColor(colorIdx);
        setTimeout(() => setActiveHighlightColor(null), 300);
      }, step * 420);
    });

    setTimeout(() => {
      setIsShowingSequence(false);
    }, newSeq.length * 420 + 100);
  };

  useEffect(() => {
    if (!isTutorial) {
      startPhase(1);
    }
  }, [isTutorial]);

  const handleTileClick = (colorIdx: number) => {
    if (isTutorial || isShowingSequence) return;
    const nextUserSeq = [...userSequence, colorIdx];
    setUserSequence(nextUserSeq);

    const stepIndex = nextUserSeq.length - 1;
    if (nextUserSeq[stepIndex] !== sequence[stepIndex]) {
      // Wrong tile, restart current phase!
      setUserSequence([]);
      startPhase(currentPhase);
      return;
    }

    if (nextUserSeq.length === sequence.length) {
      // Phase completed!
      if (currentPhase < 3) {
        const nextP = currentPhase + 1;
        setCurrentPhase(nextP);
        setTimeout(() => {
          startPhase(nextP);
        }, 500);
      } else {
        // All 3 phases completed!
        setTimeout(() => {
          onFinish({
            gameType: 'rhythm',
            modifier: 0.25,
            rank: 'S',
            description: 'Mosaico 3D de 3 fases completado perfeitamente na bancada (+25% Bancada/PEC)!',
          });
        }, 300);
      }
    }
  };

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-emerald-700 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest block">🧩 MOSAICO 3D</span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">Jogo da Memória (3 Fases de Repetição)</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Complete as **3 Fases de Sequências Coloridas** da arquibancada (🔴 🔵 🟡 🟢).
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li><strong>Fase 1:</strong> Sequência de 3 cores.</li>
          <li><strong>Fase 2:</strong> Sequência de 4 cores.</li>
          <li><strong>Fase 3:</strong> Sequência de 5 cores.</li>
          <li>Sem limite de tempo corrido — concentre-se e repita cada fase perfeitamente!</li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          🎯 Objetivo: Concluir as 3 Fases sem errar (+25% Bancada/PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR MOSAICO DE MEMÓRIA (3 FASES)
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-emerald-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-emerald-400">Mosaico: Fase {currentPhase} de 3 ({currentPhase + 2} Cores)</span>
        <span className="text-yellow-400 font-mono text-xs">FASE {currentPhase}/3</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 p-3 flex flex-col justify-between">
        <div className="text-[10px] font-black text-center text-zinc-400 uppercase tracking-wider">
          {isShowingSequence ? '⚡ OBSERVE A SEQUÊNCIA RÁPIDA...' : '👇 REPITA A SEQUÊNCIA!'}
        </div>

        {/* 4 Color Tiles Grid */}
        <div className="grid grid-cols-2 gap-3 h-36">
          {colors.map((col, idx) => (
            <button
              key={idx}
              onClick={() => handleTileClick(idx)}
              disabled={isShowingSequence}
              className={`rounded-xl flex items-center justify-center text-2xl transition-all cursor-pointer border ${
                activeHighlightColor === idx
                  ? 'scale-105 border-white shadow-[0_0_18px_rgba(255,255,255,0.9)] bg-white/30'
                  : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
              }`}
              style={{ backgroundColor: col.hex }}
            >
              {col.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span>Progresso do Mosaico:</span>
        <span className="text-emerald-400 font-bold font-mono text-xs">
          FASE {currentPhase}/3 ({userSequence.length}/{sequence.length})
        </span>
      </div>
    </div>
  );
};

// ==========================================
// 5. MINI-GAME 4: GUERRA DE ROJÕES (RADAR BALÍSTICO X/Y - Approved)
// ==========================================
interface RojonTargetProps {
  onFinish: (result: MiniGameResult) => void;
}

export const RojonTarget: React.FC<RojonTargetProps> = ({ onFinish }) => {
  const [isTutorial, setIsTutorial] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [stage, setStage] = useState<'AZIMUTH' | 'ELEVATION' | 'RESULT'>('AZIMUTH');
  const [azimuthX, setAzimuthX] = useState(15);
  const [lockedX, setLockedX] = useState<number | null>(null);
  const [elevationY, setElevationY] = useState(15);
  const [lockedY, setLockedY] = useState<number | null>(null);
  const [directHits, setDirectHits] = useState<number>(0);
  const [proximityHits, setProximityHits] = useState<number>(0);
  const [rocketsLeft, setRocketsLeft] = useState<number>(3);

  useEffect(() => {
    if (isTutorial) return;
    let xInterval: NodeJS.Timeout;
    if (stage === 'AZIMUTH') {
      let dir = 1;
      xInterval = setInterval(() => {
        setAzimuthX((prev) => {
          if (prev >= 85) dir = -1;
          if (prev <= 15) dir = 1;
          return prev + dir * 3.5;
        });
      }, 25);
    }
    return () => clearInterval(xInterval);
  }, [isTutorial, stage]);

  useEffect(() => {
    if (isTutorial) return;
    let yInterval: NodeJS.Timeout;
    if (stage === 'ELEVATION') {
      let dir = 1;
      yInterval = setInterval(() => {
        setElevationY((prev) => {
          if (prev >= 85) dir = -1;
          if (prev <= 15) dir = 1;
          return prev + dir * 4.0;
        });
      }, 25);
    }
    return () => clearInterval(yInterval);
  }, [isTutorial, stage]);

  useEffect(() => {
    if (isTutorial) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isTutorial]);

  useEffect(() => {
    if (!isTutorial && (timeLeft === 0 || rocketsLeft === 0)) {
      if (directHits >= 1 || proximityHits >= 2) {
        onFinish({
          gameType: 'rojon',
          modifier: 0.25,
          rank: 'S',
          description: 'Morteiros atingiram em cheio o comboio rival (+25% PEC)!',
        });
      } else if (proximityHits >= 1) {
        onFinish({
          gameType: 'rojon',
          modifier: 0.10,
          rank: 'B',
          description: 'Disparo próximo dispersou a aproximação rival (+10% PEC).',
        });
      } else {
        onFinish({
          gameType: 'rojon',
          modifier: -0.15,
          rank: 'F',
          penaltyMP: 10,
          description: 'Rojões disparados fora do alvo chamaram a polícia (+10% Risco MP, -15% PEC).',
        });
      }
    }
  }, [timeLeft, rocketsLeft, directHits, proximityHits, isTutorial, onFinish]);

  const handleLockAzimuth = () => {
    if (stage !== 'AZIMUTH') return;
    setLockedX(azimuthX);
    setStage('ELEVATION');
  };

  const handleFireRocket = () => {
    if (stage !== 'ELEVATION' || lockedX === null) return;
    const finalY = elevationY;
    setLockedY(finalY);
    setStage('RESULT');

    const distX = Math.abs(lockedX - 50);
    const distY = Math.abs(finalY - 50);
    const totalDist = Math.hypot(distX, distY);

    if (totalDist <= 24) {
      setDirectHits((h) => h + 1);
    } else if (totalDist <= 38) {
      setProximityHits((p) => p + 1);
    }

    setTimeout(() => {
      setRocketsLeft((r) => r - 1);
      setLockedX(null);
      setLockedY(null);
      setStage('AZIMUTH');
    }, 600);
  };

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-orange-700 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest block">🚀 GUERRA DE ROJÕES</span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">Radar Balístico de Morteiros</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Dispare até 3 morterios contra o comboio rival no centro.
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>Clique em <span className="text-amber-400 font-bold">1️⃣ Travar Direção</span> para travar o Eixo X.</li>
          <li>Clique em <span className="text-orange-400 font-bold">2️⃣ Disparar Morteiro</span> para lançar no Eixo Y!</li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 10s • Meta Rank S: 1 Impacto Direto (+25% PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR RADAR DE MORTEIROS
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-orange-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-orange-500">Morteiros: Radar Balístico ({rocketsLeft} Disparos)</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
        <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-red-500 bg-red-950/40 flex flex-col items-center justify-center animate-pulse">
          <span className="text-[10px] font-black text-red-400 uppercase">ALVO</span>
          <span className="text-base">🎯</span>
        </div>

        <div
          className={`absolute top-0 bottom-0 w-1 transition-none ${
            lockedX !== null ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-yellow-400'
          }`}
          style={{ left: `${lockedX !== null ? lockedX : azimuthX}%` }}
        />

        {stage !== 'AZIMUTH' && (
          <div
            className={`absolute left-0 right-0 h-1 transition-none ${
              lockedY !== null ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-orange-500'
            }`}
            style={{ top: `${lockedY !== null ? lockedY : elevationY}%` }}
          />
        )}

        {stage === 'RESULT' && lockedX !== null && lockedY !== null && (
          <div
            className="absolute text-4xl animate-ping pointer-events-none"
            style={{ left: `${lockedX}%`, top: `${lockedY}%` }}
          >
            💥
          </div>
        )}
      </div>

      {stage === 'AZIMUTH' && (
        <button
          onClick={handleLockAzimuth}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer"
        >
          1️⃣ TRAVAR DIREÇÃO HORIZONTAL (EIXO X)
        </button>
      )}

      {stage === 'ELEVATION' && (
        <button
          onClick={handleFireRocket}
          className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg cursor-pointer animate-bounce"
        >
          2️⃣ DISPARAR MORTEIRO! (EIXO Y)
        </button>
      )}

      {stage === 'RESULT' && (
        <div className="w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 font-black text-xs uppercase tracking-wider text-center">
          🚀 Morteiro em Voo...
        </div>
      )}

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span>Alvo Direto: <strong className="text-emerald-400">{directHits}</strong></span>
        <span>Próximos: <strong className="text-amber-400">{proximityHits}</strong></span>
      </div>
    </div>
  );
};

// ==========================================
// 6. MINI-GAME 5: FUGA DA BLITZ / CARAVANA / FLANCOS (LANE RUNNER - 10s)
// ==========================================
interface CaravanDodgeProps {
  onFinish: (result: MiniGameResult) => void;
}

export const CaravanDodge: React.FC<CaravanDodgeProps> = ({ onFinish }) => {
  const [isTutorial, setIsTutorial] = useState(true);
  const [lane, setLane] = useState<number>(1);
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);
  const [collisions, setCollisions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    if (isTutorial) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTutorial]);

  useEffect(() => {
    if (isTutorial) return;
    const spawnInterval = setInterval(() => {
      const randomLane = Math.floor(Math.random() * 3);
      const types = ['🚧', '🚔', '🛞', '🚓'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setObstacles((prev) => [...prev, { id: Date.now() + Math.random(), lane: randomLane, y: 0, type: randomType }]);
    }, 750);

    const moveInterval = setInterval(() => {
      setObstacles((prev) => {
        const next: typeof prev = [];
        for (const obs of prev) {
          const nextY = obs.y + 8.5;
          if (nextY >= 68 && nextY <= 88 && obs.lane === lane) {
            setCollisions((c) => c + 1);
            continue;
          }
          if (nextY < 100) {
            next.push({ ...obs, y: nextY });
          }
        }
        return next;
      });
    }, 60);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [isTutorial, lane]);

  useEffect(() => {
    if (!isTutorial && timeLeft === 0) {
      if (collisions <= 1) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.25,
          rank: 'S',
          description: 'Caravana/Bonde pelos flancos superou os bloqueios sem atrasos (+25% PEC)!',
        });
      } else if (collisions === 2) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.05,
          rank: 'B',
          penaltyMP: 5,
          description: 'Atraso leve por revista ou retenção nos flancos (+5% Risco MP, +5% PEC).',
        });
      } else {
        onFinish({
          gameType: 'dodge',
          modifier: -0.25,
          rank: 'F',
          penaltyMP: 15,
          description: 'Comboio retido em blitz pesada nos flancos (-25% PEC, +15% Risco MP).',
        });
      }
    }
  }, [timeLeft, collisions, isTutorial, onFinish]);

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-yellow-700 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-widest block">🚐 CARAVANA & FLANCOS</span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">Fuga de Bloqueios</h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Conduza a caravana pelas 3 pistas evitando bloqueios (🚧 🚔 🛞).
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>Use os botões de <span className="text-yellow-400 font-bold">⬅️ Pista Esquerda</span> e <span className="text-yellow-400 font-bold">Pista Direita ➡️</span>.</li>
          <li>Evite colidir para não tomar multas da PM nem atrasar o bonde!</li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 10s • Meta Rank S: No máximo 1 colisão (+25% PEC)
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-yellow-600 hover:bg-yellow-500 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR CORRIDA DE PISTA
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-yellow-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-yellow-400">Caravana: Desvie dos Bloqueios (10 Segundos)</span>
        <span className="text-red-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-dashed divide-zinc-700 pointer-events-none" />

        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute text-2xl text-center w-1/3 transition-all duration-75"
            style={{ left: `${obs.lane * 33.33}%`, top: `${obs.y}%` }}
          >
            {obs.type}
          </div>
        ))}

        <div
          className="absolute bottom-3 text-3xl text-center w-1/3 transition-all duration-100"
          style={{ left: `${lane * 33.33}%` }}
        >
          🚐
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full pt-1">
        <button
          onClick={() => lane > 0 && setLane(lane - 1)}
          className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer"
        >
          ⬅️ Pista Esquerda
        </button>
        <button
          onClick={() => lane < 2 && setLane(lane + 1)}
          className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 py-2.5 rounded-xl font-black text-xs uppercase cursor-pointer"
        >
          Pista Direita ➡️
        </button>
      </div>

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span>Colisões / Multas:</span>
        <span className="text-red-400 font-bold font-mono text-sm">{collisions}</span>
      </div>
    </div>
  );
};

// ==========================================
// 7. MOTOR DE RESOLUÇÃO TÁTICA & TRAVA DE 80%
// ==========================================
export const MatchTacticalResolver: React.FC<{
  context: MatchContext;
  onMatchComplete: (resultText: string, finalPECModifier: number, penaltyMP?: number) => void;
}> = ({ context, onMatchComplete }) => {
  const [activeMiniGame, setActiveMiniGame] = useState<GameType | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    // -------------------------------------------------------------
    // REGRA: CONCENTRAÇÃO NO PORTÃO (JOGO EM CASA)
    // -------------------------------------------------------------
    if (context.isHome && context.tacticalChoice === 'gate_concentration') {
      const threshold = context.homeContingent * 0.8;
      const visitorHasEnoughContingent = context.awayContingent >= threshold;

      if (!visitorHasEnoughContingent) {
        const message = `Torcida visitante em menor número (${context.awayContingent} vs ${context.homeContingent}). O bonde rival recuou com escolta policial. Sem confronto nos portões!`;
        setStatusMessage(message);
        onMatchComplete(message, 0.0);
        return;
      } else {
        setStatusMessage('Visitante com grande contingente forçou passagem pelo portão! Confronto iminente!');
        setActiveMiniGame('whack');
        return;
      }
    }

    // Seleção de mini-game conforme tática padrão
    if (context.tacticalChoice === 'front_charge') setActiveMiniGame('whack');
    if (context.tacticalChoice === 'rojon_barrage') setActiveMiniGame('rojon');
    if (context.tacticalChoice === 'rhythm_mosaic') setActiveMiniGame('rhythm');
    if (context.tacticalChoice === 'caravan_escape') setActiveMiniGame('dodge');
  }, [context, onMatchComplete]);

  const handleMiniGameFinish = (result: MiniGameResult) => {
    setActiveMiniGame(null);
    onMatchComplete(result.description, result.modifier, result.penaltyMP);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {statusMessage && (
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded-xl text-center text-sm text-zinc-300 max-w-sm mb-4">
          {statusMessage}
        </div>
      )}

      {activeMiniGame === 'whack' && (
        <WhackCombat opponentTier={context.opponentTier} onFinish={handleMiniGameFinish} />
      )}
      {activeMiniGame === 'rojon' && <RojonTarget onFinish={handleMiniGameFinish} />}
      {activeMiniGame === 'rhythm' && <MemoryMosaic onFinish={handleMiniGameFinish} />}
      {activeMiniGame === 'dodge' && <CaravanDodge onFinish={handleMiniGameFinish} />}
    </div>
  );
};
