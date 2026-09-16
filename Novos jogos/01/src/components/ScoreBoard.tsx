import React from 'react';
import { motion } from 'motion/react';
import { Flame, Trophy, Activity, Zap, Play, Timer, Music } from 'lucide-react';
import { GameStats } from '../types';

interface ScoreBoardProps {
  stats: GameStats;
  onOpenMatchModal: () => void;
  onStartSession: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  stats,
  onOpenMatchModal,
  onStartSession,
}) => {
  const progressPercent = (stats.timeLeft / 20) * 100;

  return (
    <div className="w-full space-y-3">
      {/* 20 SECONDS SESSION TIMER BAR */}
      <div className="w-full bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Timer className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-400 font-bold flex items-center gap-2">
              <span>Sessão de Torcida (20s)</span>
              {stats.isPlaying && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                  AO VIVO
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-stone-100">
                {stats.timeLeft.toFixed(1)}s
              </span>
              <span className="text-xs text-stone-500">restantes</span>
            </div>
          </div>
        </div>

        {/* Dynamic Countdown Progress Bar */}
        <div className="w-full sm:flex-1 sm:max-w-xs bg-stone-950 h-3 rounded-full overflow-hidden border border-stone-800 relative">
          <motion.div
            className={`h-full ${
              stats.timeLeft <= 5
                ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]'
                : 'bg-amber-400 shadow-[0_0_10px_#fbbf24]'
            }`}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Start / Restart 20s Session Button */}
        <button
          onClick={onStartSession}
          className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-black text-xs tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
            stats.isPlaying
              ? 'bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700'
              : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/20 active:scale-95'
          }`}
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{stats.isPlaying ? 'Reiniciar (20s)' : 'Iniciar Ritmo (20s)'}</span>
        </button>
      </div>

      {/* STATS TILES */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* COMBO Card */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Combo Guitar Hero
            </span>
            <Flame
              className={`w-4 h-4 ${
                stats.combo > 0 ? 'text-amber-400 fill-amber-400 animate-pulse' : 'text-stone-600'
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <motion.span
              key={stats.combo}
              initial={{ scale: 1.3, color: '#f59e0b' }}
              animate={{ scale: 1, color: stats.combo > 0 ? '#fbbf24' : '#a8a29e' }}
              className="text-3xl sm:text-4xl font-black font-mono"
            >
              {stats.combo}
            </motion.span>
            <span className="text-xs text-stone-500 font-bold">x</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">
            Recorde: <span className="text-stone-300 font-semibold">{stats.maxCombo}x</span>
          </div>
        </div>

        {/* BPM & SPEED */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              BPM & Andamento
            </span>
            <Music className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
              {Math.round(stats.currentBpm)}
            </span>
            <span className="text-xs text-stone-500 font-bold">bpm</span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">
            Multiplicador: {stats.speedMultiplier.toFixed(1)}x
          </div>
        </div>

        {/* FESTA NA ARQUIBANCADA (0-100 Score) */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Nota da Bancada
            </span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              {stats.score}
            </span>
            <span className="text-xs text-stone-500 font-bold">/100</span>
          </div>
          <div className="w-full bg-stone-800 h-1.5 rounded-full overflow-hidden mt-1">
            <motion.div
              className="h-full bg-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${stats.score}%` }}
              transition={{ type: 'spring', stiffness: 100 }}
            />
          </div>
        </div>

        {/* TOTAL HITS & SIMULATOR BUTTON */}
        <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Sincronia
            </span>
            <Trophy className="w-4 h-4 text-stone-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2 font-mono">
            <span className="text-2xl sm:text-3xl font-black text-stone-200">
              {stats.totalHits}
            </span>
            <span className="text-xs text-stone-500">acertos</span>
            <span className="text-xs text-rose-400 font-bold ml-auto">
              {stats.totalMisses} erros
            </span>
          </div>
          <button
            onClick={onOpenMatchModal}
            className="mt-2 w-full py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-lg border border-stone-700/80 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>Simular Jogo</span>
          </button>
        </div>
      </div>
    </div>
  );
};
