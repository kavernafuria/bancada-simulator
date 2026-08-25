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
// 2. MINI-GAME 1: BRIGA NA MÃO (WHACK-A-MOLE)
// ==========================================
interface WhackCombatProps {
  opponentTier: 'S' | 'A' | 'B';
  onFinish: (result: MiniGameResult) => void;
}

export const WhackCombat: React.FC<WhackCombatProps> = ({ opponentTier, onFinish }) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [isAlly, setIsAlly] = useState(false);

  const speed = opponentTier === 'S' ? 420 : opponentTier === 'A' ? 520 : 650;

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
      const slot = Math.floor(Math.random() * 4);
      const ally = Math.random() < 0.25; // 25% de chance de ser membro da própria torcida
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
        onFinish({ gameType: 'whack', modifier: 0.10, rank: 'B', description: 'Confronto equilibrado (+10% PEC).' });
      } else if (score >= 20) {
        onFinish({ gameType: 'whack', modifier: 0.00, rank: 'C', description: 'Bonde manteve a posição (0% PEC).' });
      } else {
        onFinish({ gameType: 'whack', modifier: -0.20, rank: 'F', description: 'Linha recuou em desordem (-20% PEC).' });
      }
    }
  }, [timeLeft, score, onFinish]);

  const handleClick = (index: number) => {
    if (index === activeSlot) {
      if (isAlly) {
        setScore((s) => Math.max(0, s - 15)); // Penalidade por bater no próprio bonde
      } else {
        setScore((s) => s + 10);
      }
      setActiveSlot(null);
    }
  };

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-xl border border-red-800 text-white max-w-sm w-full select-none shadow-2xl">
      <div className="flex justify-between w-full mb-3 text-xs font-black tracking-wider uppercase">
        <span className="text-red-500">Linha de Frente: Golpeie o Rival</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full h-48">
        {[0, 1, 2, 3].map((slot) => (
          <button
            key={slot}
            onClick={() => handleClick(slot)}
            className={`rounded-lg flex flex-col items-center justify-center transition-all cursor-pointer ${
              activeSlot === slot
                ? isAlly
                  ? 'bg-blue-600 border-2 border-blue-300 scale-95'
                  : 'bg-red-600 border-2 border-red-300 scale-95 shadow-lg shadow-red-900/60'
                : 'bg-zinc-900 border border-zinc-800'
            }`}
          >
            {activeSlot === slot && (
              <>
                <span className="text-3xl">{isAlly ? '🛡️' : '👊'}</span>
                <span className="text-[10px] font-bold uppercase mt-1">
                  {isAlly ? 'Própria Torcida!' : 'Rival!'}
                </span>
              </>
            )}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center w-full mt-4 text-xs text-zinc-400 border-t border-zinc-800 pt-2">
        <span>Não acerte o escudo azul!</span>
        <span className="text-yellow-400 font-bold font-mono text-sm">{score} pts</span>
      </div>
    </div>
  );
};

// ==========================================
// 3. MINI-GAME 2: GUERRA DE ROJÕES (MIRA COM INÉRCIA)
// ==========================================
interface RojonTargetProps {
  onFinish: (result: MiniGameResult) => void;
}

export const RojonTarget: React.FC<RojonTargetProps> = ({ onFinish }) => {
  const [crosshairPos, setCrosshairPos] = useState({ x: 50, y: 50 });
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [fired, setFired] = useState(false);
  const animFrame = useRef<number | null>(null);

  // Oscilação senoidal simulando inércia da mira
  useEffect(() => {
    let t = 0;
    const update = () => {
      t += 0.04;
      setCrosshairPos({
        x: 50 + Math.sin(t * 1.5) * 35,
        y: 50 + Math.cos(t * 2.1) * 30,
      });
      animFrame.current = requestAnimationFrame(update);
    };
    animFrame.current = requestAnimationFrame(update);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  // Barra de potência cíclica
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCharging && !fired) {
      interval = setInterval(() => {
        setPower((p) => (p >= 100 ? 0 : p + 8));
      }, 40);
    }
    return () => clearInterval(interval);
  }, [isCharging, fired]);

  const handleFire = () => {
    if (fired) return;
    setFired(true);
    if (animFrame.current) cancelAnimationFrame(animFrame.current);

    // Centro perfeito é (50, 50) com potência >= 70
    const distanceFromCenter = Math.hypot(crosshairPos.x - 50, crosshairPos.y - 50);

    setTimeout(() => {
      if (distanceFromCenter <= 15 && power >= 65) {
        onFinish({
          gameType: 'rojon',
          modifier: 0.25,
          rank: 'S',
          description: 'Rojão certeiro no centro do comboio rival (+25% PEC)!',
        });
      } else if (distanceFromCenter <= 28) {
        onFinish({
          gameType: 'rojon',
          modifier: 0.10,
          rank: 'B',
          description: 'Disparo próximo dispersou a aproximação (+10% PEC).',
        });
      } else {
        onFinish({
          gameType: 'rojon',
          modifier: -0.15,
          rank: 'F',
          penaltyMP: 12,
          description: 'Rojão disparado fora do alvo chamou a PM (+12% Risco MP, -15% PEC).',
        });
      }
    }, 600);
  };

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-xl border border-orange-700 text-white max-w-sm w-full select-none shadow-2xl">
      <div className="flex justify-between w-full mb-3 text-xs font-black tracking-wider uppercase">
        <span className="text-orange-500">Morteiros: Acerte o Comboio</span>
        <span className="text-zinc-400">Potência: {power}%</span>
      </div>

      <div className="relative w-full h-48 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex items-center justify-center">
        {/* Zona Alvo Central */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-dashed border-red-500 bg-red-950/30 flex items-center justify-center">
          <span className="text-xs font-black text-red-400">ALVO</span>
        </div>

        {/* Retículo de Mira com Inércia */}
        <div
          className="absolute w-8 h-8 -ml-4 -mt-4 border-2 border-yellow-400 rounded-full flex items-center justify-center transition-all duration-75 pointer-events-none"
          style={{ left: `${crosshairPos.x}%`, top: `${crosshairPos.y}%` }}
        >
          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
        </div>
      </div>

      {/* Barra de Força */}
      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden mt-3 border border-zinc-700">
        <div
          className={`h-full transition-all duration-75 ${
            power >= 70 ? 'bg-red-500' : power >= 40 ? 'bg-yellow-500' : 'bg-emerald-500'
          }`}
          style={{ width: `${power}%` }}
        />
      </div>

      <button
        onMouseDown={() => setIsCharging(true)}
        onMouseUp={handleFire}
        onTouchStart={() => setIsCharging(true)}
        onTouchEnd={handleFire}
        disabled={fired}
        className="w-full mt-4 bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-800 text-white font-black py-3 rounded-lg uppercase tracking-wider text-xs active:scale-95 transition-all shadow-lg cursor-pointer"
      >
        {fired ? 'Disparado!' : isCharging ? 'Solte para Disparar!' : 'Segure para Carregar Força'}
      </button>
    </div>
  );
};

// ==========================================
// 4. MINI-GAME 3: MOSAICO & BATERIA (RHYTHM GAME)
// ==========================================
interface RhythmBannerProps {
  onFinish: (result: MiniGameResult) => void;
}

export const RhythmBanner: React.FC<RhythmBannerProps> = ({ onFinish }) => {
  const [hits, setHits] = useState<number[]>([]);
  const [notes, setNotes] = useState<{ id: number; pos: number }[]>([]);
  const [timeLeft, setTimeLeft] = useState(6);
  const animRef = useRef<number | null>(null);

  // Spawn e queda de notas
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);

    const noteSpawner = setInterval(() => {
      setNotes((prev) => [...prev, { id: Date.now(), pos: 0 }]);
    }, 1100);

    const moveNotes = () => {
      setNotes((prev) =>
        prev
          .map((n) => ({ ...n, pos: n.pos + 2.5 }))
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
      if (perfectHits >= 4) {
        onFinish({
          gameType: 'rhythm',
          modifier: 0.25,
          rank: 'S',
          description: 'Mosaico 3D subiu perfeito com a bateria (+25% Bancada/PEC)!',
        });
      } else if (perfectHits >= 2) {
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

  const handleHit = () => {
    const currentNote = notes.find((n) => n.pos >= 70 && n.pos <= 95);
    if (currentNote) {
      setHits((h) => [...h, 1]);
      setNotes((prev) => prev.filter((n) => n.id !== currentNote.id));
    } else {
      setHits((h) => [...h, 0]);
    }
  };

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-xl border border-emerald-700 text-white max-w-sm w-full select-none shadow-2xl">
      <div className="flex justify-between w-full mb-3 text-xs font-black tracking-wider uppercase">
        <span className="text-emerald-400">Bateria: Pressione no Compasso</span>
        <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-48 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800 flex flex-col justify-end items-center">
        {/* Hit Zone no fundo */}
        <div className="absolute bottom-4 w-11/12 h-10 border-2 border-emerald-400 bg-emerald-950/40 rounded-lg flex items-center justify-center">
          <span className="text-[10px] font-black tracking-widest text-emerald-300">ZONA DE BATIDA</span>
        </div>

        {/* Notas descendo */}
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute w-8 h-8 bg-emerald-500 border border-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg"
            style={{ top: `${note.pos}%` }}
          >
            🥁
          </div>
        ))}
      </div>

      <button
        onClick={handleHit}
        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black py-3 rounded-lg uppercase tracking-wider text-xs transition-all shadow-lg cursor-pointer"
      >
        Tocar Bumbo (Espaço / Clique)
      </button>

      <div className="mt-2 text-xs text-zinc-400">
        Acertos Perfeitos: <span className="text-emerald-400 font-bold">{hits.filter((h) => h === 1).length}</span>
      </div>
    </div>
  );
};

// ==========================================
// 5. MINI-GAME 4: FUGA DA BLITZ (LANE RUNNER)
// ==========================================
interface CaravanDodgeProps {
  onFinish: (result: MiniGameResult) => void;
}

export const CaravanDodge: React.FC<CaravanDodgeProps> = ({ onFinish }) => {
  const [lane, setLane] = useState<number>(1); // 0: Esquerda, 1: Centro, 2: Direita
  const [obstacles, setObstacles] = useState<{ id: number; lane: number; y: number; type: string }[]>([]);
  const [collisions, setCollisions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t <= 1 ? 0 : t - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const spawnInterval = setInterval(() => {
      const randomLane = Math.floor(Math.random() * 3);
      const types = ['🚧', '🚔', '🛞'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      setObstacles((prev) => [...prev, { id: Date.now(), lane: randomLane, y: 0, type: randomType }]);
    }, 850);

    const moveInterval = setInterval(() => {
      setObstacles((prev) => {
        const next: typeof prev = [];
        for (const obs of prev) {
          const nextY = obs.y + 10;
          if (nextY >= 68 && nextY <= 85 && obs.lane === lane) {
            setCollisions((c) => c + 1);
            continue;
          }
          if (nextY < 100) {
            next.push({ ...obs, y: nextY });
          }
        }
        return next;
      });
    }, 70);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(moveInterval);
    };
  }, [lane]);

  useEffect(() => {
    if (timeLeft === 0) {
      if (collisions === 0) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.25,
          rank: 'S',
          description: 'Caravana furou o bloqueio sem atrasos (+25% Caravana/PEC)!',
        });
      } else if (collisions === 1) {
        onFinish({
          gameType: 'dodge',
          modifier: 0.05,
          rank: 'B',
          penaltyMP: 5,
          description: 'Atraso leve por revista (+5% Risco MP, +5% PEC).',
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
    <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-xl border border-yellow-700 text-white max-w-sm w-full select-none shadow-2xl">
      <div className="flex justify-between w-full mb-3 text-xs font-black tracking-wider uppercase">
        <span className="text-yellow-400">Caravana: Desvie dos Bloqueios</span>
        <span className="text-red-400 font-mono text-sm">{timeLeft}s</span>
      </div>

      <div className="relative w-full h-52 bg-zinc-900 rounded-lg overflow-hidden border border-zinc-800">
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

      <div className="grid grid-cols-2 gap-3 w-full mt-4">
        <button
          onClick={() => lane > 0 && setLane(lane - 1)}
          className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 py-2.5 rounded-lg font-black text-sm cursor-pointer"
        >
          ⬅️ Esquerda
        </button>
        <button
          onClick={() => lane < 2 && setLane(lane + 1)}
          className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 py-2.5 rounded-lg font-black text-sm cursor-pointer"
        >
          Direita ➡️
        </button>
      </div>

      <div className="mt-2 text-xs text-zinc-400">
        Colisões / Multas: <span className="text-red-400 font-bold font-mono">{collisions}</span>
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
