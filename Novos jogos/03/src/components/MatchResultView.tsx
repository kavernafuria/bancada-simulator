import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Sparkles, Flame, ShieldAlert, CheckCircle2, Share2 } from 'lucide-react';
import { MatchSimulationResult } from '../types';

interface MatchResultViewProps {
  result: MatchSimulationResult;
  onPlayAgain: () => void;
  onEditTeams: () => void;
}

export const MatchResultView: React.FC<MatchResultViewProps> = ({
  result,
  onPlayAgain,
  onEditTeams,
}) => {
  const isHomeWinner = result.outcome === 'home_win';
  const isDraw = result.outcome === 'draw';

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Placar Oficial & Header do Jogo */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-gradient-to-b from-slate-900 via-slate-900 to-black p-6 sm:p-8 shadow-2xl">
        {/* Glow de fundo */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{
            backgroundColor: isHomeWinner ? result.homeTeam.primaryColor : isDraw ? '#eab308' : '#64748b'
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Tag de Status */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-4 border bg-black/50 backdrop-blur-md">
            {isHomeWinner ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5" /> VITÓRIA MAIÚSCULA DO MANDANTE!
              </span>
            ) : isDraw ? (
              <span className="text-amber-400 flex items-center gap-1">
                ⚖️ EMPATE DISPUTADO ATÉ O FIM!
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> VITÓRIA DO ADVERSÁRIO FORA DE CASA
              </span>
            )}
          </div>

          {/* Confronto e Placar Gigante */}
          <div className="w-full max-w-2xl flex items-center justify-between gap-4 my-2">
            {/* Time da Casa */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl border-2 mb-2 font-black text-white"
                style={{
                  backgroundColor: result.homeTeam.primaryColor,
                  borderColor: result.homeTeam.accentColor
                }}
              >
                ⚽
              </div>
              <h3 className="font-black text-base sm:text-xl text-white tracking-tight">
                {result.homeTeam.name}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                (MANDANTE)
              </span>
            </div>

            {/* Placar Numérico */}
            <div className="flex flex-col items-center px-4">
              <div className="flex items-center gap-3 font-mono font-black text-4xl sm:text-6xl text-white tracking-tight drop-shadow-md">
                <span className={result.homeGoals > result.awayGoals ? 'text-amber-400' : 'text-white'}>
                  {result.homeGoals}
                </span>
                <span className="text-slate-600">:</span>
                <span className={result.awayGoals > result.homeGoals ? 'text-rose-400' : 'text-white'}>
                  {result.awayGoals}
                </span>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400 mt-1">
                Fim de Jogo (90')
              </span>
            </div>

            {/* Time Adversário */}
            <div className="flex-1 flex flex-col items-center">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-xl border-2 mb-2 font-black text-white"
                style={{
                  backgroundColor: result.awayTeam.primaryColor,
                  borderColor: result.awayTeam.accentColor
                }}
              >
                🛡️
              </div>
              <h3 className="font-black text-base sm:text-xl text-white tracking-tight">
                {result.awayTeam.name}
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                (VISITANTE)
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            Local: <strong className="text-slate-200">{result.homeTeam.stadium}</strong> • Clima de Caldeirão
          </p>
        </div>
      </div>

      {/* Destaque do Cálculo Matemático */}
      <div className="p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900 to-amber-950/20 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-black uppercase tracking-wider text-amber-400">
          <Sparkles className="w-4 h-4" />
          <span>MOTOR MATEMÁTICO DO BANCADA SIMULATOR</span>
        </div>

        <div className="p-3 bg-black/60 rounded-xl border border-amber-500/30 font-mono text-sm sm:text-base font-bold text-amber-200 break-words">
          {result.mathBreakdown}
        </div>

        {/* Detalhamento das parcelas ponderadas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 pt-3 border-t border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Base Casa (75%)</span>
            <span className="text-sm font-black text-white font-mono">
              {result.homeBaseStrength} pts &rarr; {(result.homeBaseStrength * 0.75).toFixed(1)}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Torcida (25%)</span>
            <span className="text-sm font-black text-amber-300 font-mono">
              Média: {result.crowdAverage} &rarr; {(result.crowdAverage * 0.25).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              (Ônibus: {result.busScore} | Bancada: {result.standScore})
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Força Final Casa</span>
            <span className="text-sm font-black text-emerald-400 font-mono">
              {result.finalHomeStrength.toFixed(1)} pts
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Força Final Rival</span>
            <span className="text-sm font-black text-rose-400 font-mono">
              {result.finalAwayStrength.toFixed(1)} pts
            </span>
          </div>
        </div>
      </div>

      {/* Narrativa de 3 Parágrafos da Partida */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col gap-4">
        <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white flex items-center gap-2">
          <span>📰 CRÔNICA DO JOGO • A VOZ DA ARQUIBANCADA</span>
        </h3>

        <div className="space-y-4 text-slate-300 text-sm sm:text-base leading-relaxed">
          {/* Parágrafo 1: O Início e o Clima */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">
              1º Tempo • O Clima e a Postura Inicial
            </span>
            <p>{result.narrative[0]}</p>
          </div>

          {/* Parágrafo 2: O Momento Crucial & Ações de Abafa */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">
              2º Tempo • O Ponto de Virada & O Peso da Bancada
            </span>
            <p>{result.narrative[1]}</p>
          </div>

          {/* Parágrafo 3: O Desfecho e Veredito */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <span className="inline-block text-[11px] font-black uppercase tracking-wider text-amber-400 mb-1">
              Apito Final • Placar e o Impacto no Campeonato
            </span>
            <p>{result.narrative[2]}</p>
          </div>
        </div>
      </div>

      {/* Linha do Tempo de Lances */}
      <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 shadow-md">
        <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-300 mb-3">
          ⏱️ Momentos Marcantes do Duelo
        </h4>
        <div className="space-y-2">
          {result.keyEvents.map((evt, idx) => (
            <div
              key={`evt-${idx}`}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/50 border border-slate-800/60 text-xs sm:text-sm"
            >
              <span className="font-mono font-bold text-amber-400 shrink-0 w-8">
                {evt.minute}'
              </span>
              <span className="text-slate-300">
                {evt.type === 'goal_home' && '⚽ '}
                {evt.type === 'goal_away' && '🚨 '}
                {evt.type === 'chant' && '📢 '}
                {evt.type === 'chance' && '🔥 '}
                {evt.description}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ações / Botões */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          id="btn-edit-teams"
          onClick={onEditTeams}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition"
        >
          Configurar Outro Confronto
        </button>

        <button
          type="button"
          id="btn-play-again"
          onClick={onPlayAgain}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm uppercase tracking-wide flex items-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Jogar Novamente a Bancada</span>
        </button>
      </div>
    </div>
  );
};
