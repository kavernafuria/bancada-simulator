import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. TIPOS & INTERFACES
// ==========================================
export type GameType = 'whack' | 'rojon' | 'rhythm' | 'dodge';

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
// 2. MINI-GAME 1: BRIGA NA MÃO (WHACK-A-MOLE - 6 ALVOS, 10s, DIFICULDADE +20%)
// ==========================================
interface WhackCombatProps {
  opponentTier: 'S' | 'A' | 'B';
  onFinish: (result: MiniGameResult) => void;
}

export const WhackCombat: React.FC<WhackCombatProps> = ({ opponentTier, onFinish }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isAlly, setIsAlly] = useState(false);

  // Speed tuned ~20% faster than base for comfortable challenge
  const speed = opponentTier === 'S' ? 380 : opponentTier === 'A' ? 440 : 520;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const spawner = setInterval(() => {
      const slot = Math.floor(Math.random() * 6);
      const ally = Math.random() < 0.20; // 20% chance of being ally
      setActiveSlot(slot);
      setIsAlly(ally);
    }, speed);

    return () => {
      clearInterval(timer);
      clearInterval(spawner);
    };
  }, [speed]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (score >= 70) {
        onFinish({ gameType: 'whack', modifier: 0.25, rank: 'S', description: 'Linha de frente atropelou o rival (+25% PEC)!' });
      } else if (score >= 40) {
        onFinish({ gameType: 'whack', modifier: 0.10, rank: 'B', description: 'Confronto equilibrado na pista (+10% PEC).' });
      } else if (score >= 20) {
        onFinish({ gameType: 'whack', modifier: 0.00, rank: 'C', description: 'Bonde manteve a posição sem avanços (0% PEC).' });
      } else {
        onFinish({ gameType: 'whack', modifier: -0.20, rank: 'F', description: 'Linha recuou em desordem sob pressão (-20% PEC).' });
      }
    }
  }, [timeLeft, score, onFinish]);

  const handleClick = (index: number) => {
    if (index === activeSlot) {
      if (isAlly) {
        setScore((s) => Math.max(0, s - 15)); // Penalty for hitting ally
      } else {
        setScore((s) => s + 10);
      }
      setActiveSlot(null);
    }
  };

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-red-500">Linha de Frente: Golpeie os Rivais (6 Alvos)</span>
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
// 3. MINI-GAME 2: GUERRA DE ROJÕES (DISPARO DE RADAR BALÍSTICO FLUIDO - 10s)
// ==========================================
interface RojonTargetProps {
  onFinish: (result: MiniGameResult) => void;
}

export const RojonTarget: React.FC<RojonTargetProps> = ({ onFinish }) => {
  const [timeLeft, setTimeLeft] = useState(10);
  const [stage, setStage] = useState<'AZIMUTH' | 'ELEVATION' | 'RESULT'>('AZIMUTH');
  const [azimuthX, setAzimuthX] = useState(15);
  const [lockedX, setLockedX] = useState<number | null>(null);
  const [elevationY, setElevationY] = useState(15);
  const [lockedY, setLockedY] = useState<number | null>(null);
  const [directHits, setDirectHits] = useState<number>(0);
  const [proximityHits, setProximityHits] = useState<number>(0);
  const [rocketsLeft, setRocketsLeft] = useState<number>(3);

  // Azimuth (X) sweep animation - smooth & fluid
  useEffect(() => {
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
  }, [stage]);

  // Elevation (Y) sweep animation - smooth & fluid
  useEffect(() => {
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
  }, [stage]);

  // 10s master timer
  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (timeLeft === 0 || rocketsLeft === 0) {
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
  }, [timeLeft, rocketsLeft, directHits, proximityHits, onFinish]);

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

    // Target center is X: 50, Y: 50
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

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-orange-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-orange-500">Morteiros: Radar Balístico ({rocketsLeft} Disparos)</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center justify-center">
        {/* Target Zone Center */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-dashed border-red-500 bg-red-950/40 flex flex-col items-center justify-center animate-pulse">
          <span className="text-[10px] font-black text-red-400 uppercase">ALVO</span>
          <span className="text-base">🎯</span>
        </div>

        {/* Horizontal Lock Line (Azimuth X) */}
        <div
          className={`absolute top-0 bottom-0 w-1 transition-none ${
            lockedX !== null ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-yellow-400'
          }`}
          style={{ left: `${lockedX !== null ? lockedX : azimuthX}%` }}
        />

        {/* Vertical Lock Line (Elevation Y) */}
        {stage !== 'AZIMUTH' && (
          <div
            className={`absolute left-0 right-0 h-1 transition-none ${
              lockedY !== null ? 'bg-emerald-400 shadow-[0_0_10px_#10b981]' : 'bg-orange-500'
            }`}
            style={{ top: `${lockedY !== null ? lockedY : elevationY}%` }}
          />
        )}

        {/* Impact Explosion */}
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
// 4. MINI-GAME 3: MOSAICO & BATERIA (3 COLUNAS DE INSTRUMENTOS, 10s)
// ==========================================
interface RhythmBannerProps {
  onFinish: (result: MiniGameResult) => void;
}

export const RhythmBanner: React.FC<RhythmBannerProps> = ({ onFinish }) => {
  const [hits, setHits] = useState<number[]>([]);
  const [notes, setNotes] = useState<{ id: number; lane: number; pos: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(10);
  const animRef = useRef<number | null>(null);

  // Spawn and fall of drum notes across 3 lanes
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    const noteSpawner = setInterval(() => {
      const randomLane = Math.floor(Math.random() * 3);
      setNotes((prev) => [...prev, { id: Date.now() + Math.random(), lane: randomLane, pos: 0 }]);
    }, 850);

    const moveNotes = () => {
      setNotes((prev) =>
        prev
          .map((n) => ({ ...n, pos: n.pos + 2.2 }))
          .filter((n) => n.pos <= 100)
      );
      animRef.current = requestAnimationFrame(moveNotes);
    };

    animRef.current = requestAnimationFrame(moveNotes);

    return () => {
      clearInterval(timer);
      clearInterval(noteSpawner);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0) {
      const perfectHits = hits.filter((h) => h === 1).length;
      if (perfectHits >= 5) {
        onFinish({
          gameType: 'rhythm',
          modifier: 0.25,
          rank: 'S',
          description: 'Mosaico 3D subiu perfeito em sintonia com a bateria (+25% Bancada/PEC)!',
        });
      } else if (perfectHits >= 3) {
        onFinish({
          gameType: 'rhythm',
          modifier: 0.10,
          rank: 'B',
          description: 'Festa da bancada levantou o estádio (+10% Bancada).',
        });
      } else {
        onFinish({
          gameType: 'rhythm',
          modifier: -0.10,
          rank: 'F',
          description: 'Bateria desencontrou e o mosaico subiu torto (-10% Moral).',
        });
      }
    }
  }, [timeLeft, hits, onFinish]);

  const handleHitLane = (targetLane: number) => {
    const currentNote = notes.find((n) => n.lane === targetLane && n.pos >= 65 && n.pos <= 96);
    if (currentNote) {
      setHits((h) => [...h, 1]);
      setNotes((prev) => prev.filter((n) => n.id !== currentNote.id));
    } else {
      setHits((h) => [...h, 0]);
    }
  };

  const laneLabels = ['Surdo 🥁', 'Repique 🪘', 'Caixa 🥁'];

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-emerald-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-emerald-400">Bateria: 3 Instrumentos no Compasso</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        {/* 3 Vertical Lanes */}
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-dashed divide-zinc-800 pointer-events-none" />

        {/* Hit Zone Line */}
        <div className="absolute bottom-4 left-1 right-1 h-9 border-2 border-emerald-400 bg-emerald-950/40 rounded-lg flex items-center justify-center pointer-events-none">
          <span className="text-[9px] font-black tracking-widest text-emerald-300">ZONA DE BATIDA</span>
        </div>

        {/* Notes falling */}
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute w-1/3 flex justify-center transition-all duration-75"
            style={{ left: `${note.lane * 33.33}%`, top: `${note.pos}%` }}
          >
            <div className="w-8 h-8 bg-emerald-500 border border-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">
              🥁
            </div>
          </div>
        ))}
      </div>

      {/* 3 Hit Buttons */}
      <div className="grid grid-cols-3 gap-2 w-full pt-1">
        {[0, 1, 2].map((laneIdx) => (
          <button
            key={laneIdx}
            onClick={() => handleHitLane(laneIdx)}
            className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-black text-xs uppercase transition-all shadow-md cursor-pointer text-center"
          >
            {laneLabels[laneIdx]}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center w-full text-xs text-zinc-400 border-t border-zinc-800 pt-2 font-semibold">
        <span>Batidas Perfeitas:</span>
        <span className="text-emerald-400 font-bold font-mono text-sm">{hits.filter((h) => h === 1).length}</span>
      </div>
    </div>
  );
};

// ==========================================
// 5. MINI-GAME 4: FUGA DA BLITZ (LANE RUNNER - 10s, VELOCIDADE EQUILIBRADA)
// ==========================================
interface CaravanDodgeProps {
  onFinish: (result: MiniGameResult) => void;
}

export const CaravanDodge: React.FC<CaravanDodgeProps> = ({ onFinish }) => {
  const [lane, setLane] = useState<number>(1); // 0: Left, 1: Center, 2: Right
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);
  const [collisions, setCollisions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
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
  }, [lane]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (collisions <= 1) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.25,
          rank: 'S',
          description: 'Caravana furou o bloqueio sem atrasos (+25% Caravana/PEC)!',
        });
      } else if (collisions === 2) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.05,
          rank: 'B',
          penaltyMP: 5,
          description: 'Atraso leve por revista de blitz (+5% Risco MP, +5% PEC).',
        });
      } else {
        onFinish({
          gameType: 'dodge',
          modifier: -0.25,
          rank: 'F',
          penaltyMP: 15,
          description: 'Comboio retido em blitz pesada (-25% PEC, +15% Risco MP).',
        });
      }
    }
  }, [timeLeft, collisions, onFinish]);

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-yellow-700 text-white max-w-sm w-full select-none shadow-2xl space-y-3">
      <div className="flex justify-between w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <span className="text-yellow-400">Caravana: Desvie dos Bloqueios (10 Segundos)</span>
        <span className="text-red-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
        {/* Divisórias das 3 pistas */}
        <div className="absolute inset-0 grid grid-cols-3 divide-x divide-dashed divide-zinc-700 pointer-events-none" />

        {/* Obstáculos descendo */}
        {obstacles.map((obs) => (
          <div
            key={obs.id}
            className="absolute text-2xl text-center w-1/3 transition-all duration-75"
            style={{ left: `${obs.lane * 33.33}%`, top: `${obs.y}%` }}
          >
            {obs.type}
          </div>
        ))}

        {/* Van da Torcida */}
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
// 6. MOTOR DE RESOLUÇÃO TÁTICA & TRAVA DE 80%
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
        // Visitante tem menos de 80% do contingente: sem confronto de pista
        const message = `Torcida visitante em menor número (${context.awayContingent} vs ${context.homeContingent}). O bonde rival recuou com escolta policial. Sem confronto nos portões!`;
        setStatusMessage(message);
        onMatchComplete(message, 0.0);
        return;
      } else {
        // Visitante tem >= 80%: Dispara confronto direto
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
      {activeMiniGame === 'rhythm' && <RhythmBanner onFinish={handleMiniGameFinish} />}
      {activeMiniGame === 'dodge' && <CaravanDodge onFinish={handleMiniGameFinish} />}
    </div>
  );
};
