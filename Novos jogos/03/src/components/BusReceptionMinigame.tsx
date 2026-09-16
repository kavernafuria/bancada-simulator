import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Trophy, CheckCircle2, Volume2, ArrowRight } from 'lucide-react';
import { TeamInfo } from '../types';
import { sound } from '../utils/audio';

interface BusReceptionMinigameProps {
  homeTeam: TeamInfo;
  onFinish: (score: number) => void;
  initialScore?: number;
}

export const BusReceptionMinigame: React.FC<BusReceptionMinigameProps> = ({
  homeTeam,
  onFinish,
  initialScore = 75,
}) => {
  const [busProgress, setBusProgress] = useState<number>(10); // 0 a 100% até os portões
  const [flareHeat, setFlareHeat] = useState<number>(initialScore);
  const [flareCount, setFlareCount] = useState<number>(4);
  const [isBusArrived, setIsBusArrived] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('O ônibus da delegação está descendo a avenida! Acenda as ruas de fogo!');

  // Avanço automático lento do ônibus
  useEffect(() => {
    if (isBusArrived) return;
    const interval = setInterval(() => {
      setBusProgress((prev) => {
        if (prev >= 100) {
          setIsBusArrived(true);
          return 100;
        }
        return prev + 1.2;
      });

      // Esfriamento natural do calor
      setFlareHeat((prev) => Math.max(20, prev - 0.4));
    }, 400);

    return () => clearInterval(interval);
  }, [isBusArrived]);

  const igniteFlare = () => {
    sound.playFlare();
    setFlareCount((prev) => prev + 1);
    setFlareHeat((prev) => Math.min(100, Math.round(prev + 7)));
    setBusProgress((prev) => {
      const next = prev + 5;
      if (next >= 100) {
        setIsBusArrived(true);
        sound.playWhistle();
        return 100;
      }
      return next;
    });
    setFeedback('Sinalizador vermelho aceso! O corredor de fogo ferve ao redor do ônibus!');
  };

  const waveFlag = () => {
    sound.playClap();
    setFlareHeat((prev) => Math.min(100, Math.round(prev + 4)));
    setBusProgress((prev) => Math.min(100, prev + 3));
    setFeedback('Bandeiras tremulando na descida da rampa! Jogadores batem no vidro!');
  };

  const bangBus = () => {
    sound.playDrum();
    setFlareHeat((prev) => Math.min(100, Math.round(prev + 5)));
    setFeedback('TUM! A torcida cerca o ônibus e canta no vidro da delegação!');
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Visual das Ruas de Fogo */}
      <div className="relative w-full h-72 rounded-2xl overflow-hidden border border-slate-700/80 bg-gradient-to-b from-slate-950 via-slate-900 to-black shadow-2xl flex flex-col justify-between p-4">
        {/* Névoa de fumaça avermelhada */}
        <div
          className="absolute inset-0 opacity-70 pointer-events-none mix-blend-screen"
          style={{
            background: `radial-gradient(ellipse at 50% 100%, ${homeTeam.primaryColor}, rgba(239, 68, 68, 0.4) 40%, transparent 80%)`
          }}
        />

        {/* Top Info */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
            <span className="text-xs sm:text-sm font-black uppercase text-white tracking-wider">
              Ruas de Fogo • Chegada da Delegação
            </span>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1 rounded-full border border-slate-700 text-xs font-mono font-bold text-amber-300">
            <span>Calor da Recepção:</span>
            <span className="text-sm font-black text-amber-400">{Math.round(flareHeat)} pts</span>
          </div>
        </div>

        {/* Pista com o Ônibus avançando */}
        <div className="relative z-10 w-full h-32 flex items-center">
          {/* Asfalto da avenida */}
          <div className="absolute inset-x-0 bottom-4 h-16 bg-slate-950/80 rounded-xl border-y border-slate-800 flex items-center px-4 overflow-hidden">
            {/* Faixa pontilhada no asfalto */}
            <div className="w-full h-0.5 border-b border-dashed border-amber-500/40" />
          </div>

          {/* Multidão nas margens */}
          <div className="absolute inset-x-0 bottom-16 flex justify-between px-2 pointer-events-none">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={`fan-${i}`}
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 0.4 + (i % 3) * 0.15 }}
                className="w-3 h-5 rounded-t-sm"
                style={{ backgroundColor: i % 2 === 0 ? homeTeam.primaryColor : homeTeam.secondaryColor }}
              />
            ))}
          </div>

          {/* O Ônibus da Delegação */}
          <motion.div
            className="absolute bottom-6 z-20 flex flex-col items-center"
            animate={{ left: `${Math.min(85, Math.max(5, busProgress))}%` }}
            transition={{ type: 'spring', damping: 20 }}
          >
            {/* Ícone estilizado do ônibus */}
            <div className="relative bg-slate-800 border-2 border-white/80 rounded-xl px-4 py-2 shadow-2xl flex items-center gap-2">
              <span className="text-2xl">🚌</span>
              <div className="text-[10px] font-black uppercase text-white leading-tight">
                <div>{homeTeam.name}</div>
                <div className="text-amber-400 text-[9px]">DELEGAÇÃO</div>
              </div>
              {/* Luz do farol */}
              <div className="absolute -right-10 top-2 w-12 h-6 bg-amber-200/20 blur-sm transform -rotate-12 pointer-events-none" />
            </div>
          </motion.div>

          {/* Portão do Estádio no final */}
          <div className="absolute right-2 bottom-6 z-10 flex flex-col items-center">
            <div className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-black text-[10px] uppercase shadow">
              PORTÃO PRINCIPAL
            </div>
            <div className="w-1 h-14 bg-slate-700" />
          </div>
        </div>

        {/* Barra de Progresso do Trajeto */}
        <div className="relative z-10 w-full">
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-1">
            <span>AVENIDA PRINCIPAL</span>
            <span>{Math.round(busProgress)}% DO PERCURSO</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-950 border border-slate-700 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full"
              animate={{ width: `${busProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Feedback do Momento */}
      <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs sm:text-sm text-slate-300 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>{feedback}</span>
      </div>

      {/* Botões de Ação da Recepção */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          id="btn-ignite-flare"
          onClick={igniteFlare}
          className="p-3.5 rounded-xl border border-rose-600/60 bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 transition text-left flex items-center gap-3 shadow-md"
        >
          <div className="w-10 h-10 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-xl">
            🔥
          </div>
          <div>
            <div className="font-black text-sm text-rose-300">Acender Sinalizador</div>
            <div className="text-[11px] text-rose-200/70">+7 pts Calor • Ruas de Fogo</div>
          </div>
        </button>

        <button
          type="button"
          id="btn-wave-flag"
          onClick={waveFlag}
          className="p-3.5 rounded-xl border border-amber-600/60 bg-amber-950/40 hover:bg-amber-900/60 active:scale-95 transition text-left flex items-center gap-3 shadow-md"
        >
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xl">
            🚩
          </div>
          <div>
            <div className="font-black text-sm text-amber-300">Agitar Bandeiras</div>
            <div className="text-[11px] text-amber-200/70">+4 pts Calor • Corredor</div>
          </div>
        </button>

        <button
          type="button"
          id="btn-bang-bus"
          onClick={bangBus}
          className="p-3.5 rounded-xl border border-purple-600/60 bg-purple-950/40 hover:bg-purple-900/60 active:scale-95 transition text-left flex items-center gap-3 shadow-md"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-xl">
            🥁
          </div>
          <div>
            <div className="font-black text-sm text-purple-300">Bater no Vidro & Cantar</div>
            <div className="text-[11px] text-purple-200/70">+5 pts Calor • Arrepio</div>
          </div>
        </button>
      </div>

      {/* Finalizar Recepção */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <span className="text-xs text-slate-400">
          {isBusArrived ? '✓ O ônibus chegou ao estádio! Delegação pronta para o jogo.' : 'Empurre a delegação até os portões do estádio.'}
        </span>

        <button
          type="button"
          id="btn-confirm-bus"
          onClick={() => onFinish(Math.round(flareHeat))}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Confirmar Nota da Recepção ({Math.round(flareHeat)} pts)</span>
        </button>
      </div>
    </div>
  );
};
