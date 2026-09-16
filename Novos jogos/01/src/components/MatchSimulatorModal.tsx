import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Trophy, Shield, Flame, Play, RefreshCw, Calculator, BookOpen } from 'lucide-react';
import { calculateMatchSimulation } from '../utils/simulation';
import { MatchSimulationResult } from '../types';

interface MatchSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  stadiumPartyScore: number;
}

export const MatchSimulatorModal: React.FC<MatchSimulatorModalProps> = ({
  isOpen,
  onClose,
  stadiumPartyScore,
}) => {
  const [homeStrength, setHomeStrength] = useState<number>(68);
  const [awayStrength, setAwayStrength] = useState<number>(74);
  const [busReceptionScore, setBusReceptionScore] = useState<number>(80);
  const [partyScore, setPartyScore] = useState<number>(stadiumPartyScore);

  const [result, setResult] = useState<MatchSimulationResult | null>(() =>
    calculateMatchSimulation(68, 74, 80, stadiumPartyScore)
  );

  if (!isOpen) return null;

  const handleSimulate = () => {
    const sim = calculateMatchSimulation(homeStrength, awayStrength, busReceptionScore, partyScore);
    setResult(sim);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 15 }}
        className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl text-stone-100 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-stone-100">
                Bancada Simulator — Motor de Partida
              </h2>
              <p className="text-xs text-stone-400">
                Média Ponderada: 75% Força Base + 25% Desempenho da Torcida
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-stone-800">
          {/* Força do Time da Casa */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-400" />
                Força do Time da Casa
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">{homeStrength}</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={homeStrength}
              onChange={(e) => setHomeStrength(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-1">
              <span>20 (Fraco)</span>
              <span>100 (Favorito)</span>
            </div>
          </div>

          {/* Força do Adversário */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                Força do Adversário
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">{awayStrength}</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              value={awayStrength}
              onChange={(e) => setAwayStrength(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-1">
              <span>20 (Fraco)</span>
              <span>100 (Favorito)</span>
            </div>
          </div>

          {/* Minigame 1: Recepção do Ônibus */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Recepção do Ônibus
              </span>
              <span className="text-xs font-mono font-bold text-amber-400">{busReceptionScore}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={busReceptionScore}
              onChange={(e) => setBusReceptionScore(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 mt-1">
              <span>0 (Fria)</span>
              <span>100 (Ruas de Fogo)</span>
            </div>
          </div>

          {/* Minigame 2: Festa na Arquibancada (Timing Minigame) */}
          <div className="bg-stone-950/60 p-3.5 rounded-2xl border border-stone-800">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-stone-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                Festa na Arquibancada (Minigame)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">{partyScore}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={partyScore}
              onChange={(e) => setPartyScore(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between items-center text-[10px] text-stone-500 mt-1">
              <span>0 (Descompassada)</span>
              <button
                type="button"
                onClick={() => setPartyScore(stadiumPartyScore)}
                className="text-amber-400 underline hover:text-amber-300 cursor-pointer"
              >
                Puxar do Minigame ({stadiumPartyScore})
              </button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleSimulate}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Recalcular & Simular Partida
          </button>
        </div>

        {/* Simulation Output */}
        {result && (
          <div className="mt-6 space-y-5">
            {/* Placar Final */}
            <div className="bg-stone-950 rounded-2xl p-5 border border-stone-800 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-xs uppercase font-bold tracking-widest text-stone-400 mb-2">
                Placar Final da Partida
              </span>
              <div className="flex items-center gap-6 sm:gap-10">
                <div className="text-center">
                  <div className="text-sm font-bold text-stone-300">Mandante</div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 mt-1">
                    {result.homeGoals}
                  </div>
                </div>
                <div className="text-2xl font-light text-stone-600">X</div>
                <div className="text-center">
                  <div className="text-sm font-bold text-stone-300">Visitante</div>
                  <div className="text-4xl sm:text-5xl font-black font-mono text-stone-200 mt-1">
                    {result.awayGoals}
                  </div>
                </div>
              </div>
            </div>

            {/* Cálculo Matemático Rápido */}
            <div className="bg-stone-850/60 rounded-2xl p-4 border border-stone-800 flex items-start gap-3">
              <Calculator className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-stone-200">Demonstrativo do Cálculo Matemático:</div>
                <div className="font-mono text-amber-300/90 leading-relaxed break-words">
                  {result.mathExplanation}
                </div>
                <div className="text-stone-400 text-[11px] pt-1">
                  Média da Torcida: ({result.busReceptionScore} + {result.stadiumPartyScore}) ÷ 2 ={' '}
                  <span className="text-stone-200 font-semibold">{result.crowdAverage.toFixed(1)}</span>.
                  Margem de empate: ±3 pontos.
                </div>
              </div>
            </div>

            {/* Narrativa de 3 Parágrafos */}
            <div className="bg-stone-950/80 rounded-2xl p-5 border border-stone-800 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-300 pb-2 border-b border-stone-800/80">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Crônica do Jogo (3 Parágrafos):
              </div>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                {result.narrative[0]}
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                {result.narrative[1]}
              </p>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-serif">
                {result.narrative[2]}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
