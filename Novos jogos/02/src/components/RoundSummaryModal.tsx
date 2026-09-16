import React from 'react';
import { RoundResult } from '../types';
import { Trophy, CheckCircle, AlertOctagon, Flame, ArrowRight } from 'lucide-react';

interface RoundSummaryModalProps {
  result: RoundResult;
  isLastRound: boolean;
  onNext: () => void;
}

export const RoundSummaryModal: React.FC<RoundSummaryModalProps> = ({
  result,
  isLastRound,
  onNext,
}) => {
  return (
    <div
      id="round-summary-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="round-summary-card"
        className="w-full max-w-md bg-neutral-900 border border-neutral-750 rounded-2xl p-6 text-white shadow-2xl text-center relative overflow-hidden"
      >
        {/* Glow Header */}
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
            result.isPerfect
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20'
              : result.score >= 70
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {result.isPerfect ? (
            <Trophy className="w-10 h-10 animate-bounce" />
          ) : result.score >= 70 ? (
            <CheckCircle className="w-10 h-10" />
          ) : (
            <AlertOctagon className="w-10 h-10" />
          )}
        </div>

        {/* Title */}
        <div className="mb-2">
          <span className="text-xs uppercase tracking-widest font-semibold text-neutral-400">
            Rodada {result.round} Finalizada
          </span>
          <h3 className="text-2xl font-black mt-0.5">
            {result.isPerfect
              ? 'PERFEITO!'
              : result.score >= 80
              ? 'TREMULADA ESPETACULAR!'
              : result.score >= 60
              ? 'BOM RITMO NA BANCADA!'
              : 'PRECISA DE MAIS COORDENAÇÃO!'}
          </h3>
          <p className="text-sm text-neutral-400 mt-1">{result.patternName}</p>
        </div>

        {/* Score Pill */}
        <div className="my-5 py-3 px-4 bg-neutral-950/70 border border-neutral-800 rounded-xl flex items-center justify-around">
          <div>
            <div className="text-xs text-neutral-400">Nota da Rodada</div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono">
              {result.score} <span className="text-sm text-neutral-500 font-normal">/ 100</span>
            </div>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div>
            <div className="text-xs text-neutral-400">Tempo</div>
            <div className="text-lg font-bold font-mono text-neutral-200">
              {result.timeTaken.toFixed(1)}s
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6 text-left">
          <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block">Cobertura</span>
            <span className="text-base font-bold font-mono text-neutral-100">
              {result.coverage}%
            </span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block">Precisão</span>
            <span className="text-base font-bold font-mono text-neutral-100">
              {result.accuracy}%
            </span>
          </div>

          <div className="bg-neutral-800/60 p-3 rounded-xl border border-neutral-700/50">
            <span className="text-[11px] text-neutral-400 block">Misses</span>
            <span
              className={`text-base font-bold font-mono ${
                result.missCount === 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {result.missCount}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="next-round-button"
          onClick={onNext}
          className="w-full py-3.5 px-6 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-neutral-950 flex items-center justify-center space-x-2 transition-all shadow-lg hover:shadow-amber-500/20 active:scale-98 cursor-pointer"
        >
          <span>{isLastRound ? 'Ver Resultado Final do Minigame' : 'Próximo Traçado'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
