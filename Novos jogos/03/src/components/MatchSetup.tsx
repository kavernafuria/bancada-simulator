import React, { useState } from 'react';
import { PRESET_TEAMS } from '../data/teams';
import { TeamInfo } from '../types';
import { Shield, Sparkles, Play, Flame, Trophy, Sliders, Palette, Download, Code2 } from 'lucide-react';

interface MatchSetupProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  onUpdateHomeTeam: (team: TeamInfo) => void;
  onUpdateAwayTeam: (team: TeamInfo) => void;
  homeBaseStrength: number;
  awayBaseStrength: number;
  onChangeHomeBaseStrength: (val: number) => void;
  onChangeAwayBaseStrength: (val: number) => void;
  busScore: number;
  standScore: number;
  onChangeBusScore: (val: number) => void;
  onChangeStandScore: (val: number) => void;
  onStartArquibancadaGame: () => void;
  onStartBusGame: () => void;
  onSimulateDirectly: () => void;
  onOpenColorModal?: () => void;
  onDownloadZip?: () => void;
}

export const MatchSetup: React.FC<MatchSetupProps> = ({
  homeTeam,
  awayTeam,
  onUpdateHomeTeam,
  onUpdateAwayTeam,
  homeBaseStrength,
  awayBaseStrength,
  onChangeHomeBaseStrength,
  onChangeAwayBaseStrength,
  busScore,
  standScore,
  onChangeBusScore,
  onChangeStandScore,
  onStartArquibancadaGame,
  onStartBusGame,
  onSimulateDirectly,
  onOpenColorModal,
  onDownloadZip,
}) => {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Banner de Boas-Vindas e Explicação */}
      <div className="p-6 rounded-3xl border border-slate-700 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Motor de Simulação Bancada Simulator
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Festa na Arquibancada & O Poder da Torcida
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            Aqui a torcida não é mera espectadora: o desempenho das organizadas vale <strong className="text-amber-400">25% da Força Final</strong> do time mandante, somados aos <strong className="text-emerald-400">75% da Força Base</strong>. Use gritos de guerra, suba o bandeirão e estique as faixas para empurrar a bola pro gol!
          </p>

          {/* Botões de Integração com o Jogo e Baixar ZIP */}
          <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-4 border-t border-slate-700/60">
            {onOpenColorModal && (
              <button
                type="button"
                id="btn-open-game-colors"
                onClick={onOpenColorModal}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-amber-500/10 active:scale-95 transition"
              >
                <Palette className="w-4 h-4" />
                <span>Cores do Seu Jogo</span>
              </button>
            )}

            {onDownloadZip && (
              <button
                type="button"
                id="btn-download-project-zip"
                onClick={onDownloadZip}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wide flex items-center gap-1.5 shadow-lg shadow-emerald-500/10 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Projeto (.ZIP)</span>
              </button>
            )}

            <span className="text-[11px] text-slate-400 font-medium">
              Pronto para embutir via iframe, URL ou exportar o código completo.
            </span>
          </div>
        </div>
      </div>

      {/* Seleção e Configuração dos Times */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Time Mandante (Casa) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TIME MANDANTE (CASA)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Recebe buff da torcida</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Escolha o Time:
            </label>
            <select
              id="select-home-team"
              value={homeTeam.id}
              onChange={(e) => {
                const found = PRESET_TEAMS.find((t) => t.id === e.target.value);
                if (found) {
                  onUpdateHomeTeam(found);
                  onChangeHomeBaseStrength(found.baseStrength);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {PRESET_TEAMS.map((t) => (
                <option key={`home-${t.id}`} value={t.id}>
                  {t.name} ({t.nickname}) - Base: {t.baseStrength} pts
                </option>
              ))}
            </select>
          </div>

          {/* Slider de Força Base do Mandante */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">[Força do Time da Casa] (0 a 100):</span>
              <span className="font-mono text-emerald-400 font-black text-sm">{homeBaseStrength} pts</span>
            </div>
            <input
              type="range"
              id="slider-home-strength"
              min="20"
              max="100"
              value={homeBaseStrength}
              onChange={(e) => onChangeHomeBaseStrength(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Vale 75% da nota no cálculo final.
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏟️</span>
              <div>
                <div className="font-bold text-white">{homeTeam.stadium}</div>
                <div className="text-[11px] text-slate-400">"{homeTeam.chants[0]}"</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: homeTeam.primaryColor }}
                title={`Cor Principal: ${homeTeam.primaryColor}`}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: homeTeam.secondaryColor }}
                title={`Cor Secundária: ${homeTeam.secondaryColor}`}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: homeTeam.accentColor }}
                title={`Destaque: ${homeTeam.accentColor}`}
              />
              {onOpenColorModal && (
                <button
                  type="button"
                  onClick={onOpenColorModal}
                  className="ml-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-amber-400 border border-slate-700"
                >
                  Editar Cores
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Time Visitante (Adversário) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-lg flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span>TIME VISITANTE (ADVERSÁRIO)</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Joga sem torcida</span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">
              Escolha o Adversário:
            </label>
            <select
              id="select-away-team"
              value={awayTeam.id}
              onChange={(e) => {
                const found = PRESET_TEAMS.find((t) => t.id === e.target.value);
                if (found) {
                  onUpdateAwayTeam(found);
                  onChangeAwayBaseStrength(found.baseStrength);
                }
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
            >
              {PRESET_TEAMS.map((t) => (
                <option key={`away-${t.id}`} value={t.id}>
                  {t.name} ({t.nickname}) - Base: {t.baseStrength} pts
                </option>
              ))}
            </select>
          </div>

          {/* Slider de Força Base do Adversário */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-300">[Força do Adversário] (0 a 100):</span>
              <span className="font-mono text-rose-400 font-black text-sm">{awayBaseStrength} pts</span>
            </div>
            <input
              type="range"
              id="slider-away-strength"
              min="20"
              max="100"
              value={awayBaseStrength}
              onChange={(e) => onChangeAwayBaseStrength(Number(e.target.value))}
              className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
            />
            <span className="text-[10px] text-slate-400 block mt-1">
              Sua Força Final será exatamente igual à sua Força Base.
            </span>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛡️</span>
              <div>
                <div className="font-bold text-white">{awayTeam.name}</div>
                <div className="text-[11px] text-slate-400">Adversário em campo neutro/visitante</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: awayTeam.primaryColor }}
                title={`Cor Adversário: ${awayTeam.primaryColor}`}
              />
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/30"
                style={{ backgroundColor: awayTeam.secondaryColor }}
                title={`Cor Secundária: ${awayTeam.secondaryColor}`}
              />
              {onOpenColorModal && (
                <button
                  type="button"
                  onClick={onOpenColorModal}
                  className="ml-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-rose-300 border border-slate-700"
                >
                  Editar Cores
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Minigames da Torcida (Festa na Arquibancada e Recepção do Ônibus) */}
      <div className="p-5 rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-base sm:text-lg text-white uppercase tracking-wider">
              Desempenho da Torcida Mandante (Vale 25%)
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">
            Média Atual: {Math.round(((busScore + standScore) / 2) * 10) / 10} pts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cartão Minigame 1: Recepção do Ônibus */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" /> [Recepção do Ônibus]
                </span>
                <span className="text-xs font-mono font-black text-amber-400">{busScore} / 100</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Ruas de fogo e chegada da delegação. Você pode jogar o minigame ou ajustar a nota manualmente.
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={busScore}
                onChange={(e) => onChangeBusScore(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
              <button
                type="button"
                id="btn-open-bus-game"
                onClick={onStartBusGame}
                className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 flex items-center justify-center gap-1.5 transition"
              >
                <span>🔥 Jogar Recepção do Ônibus</span>
              </button>
            </div>
          </div>

          {/* Cartão Minigame 2: Festa na Arquibancada (O Pedido do Usuário) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/20 via-slate-950 to-slate-900 border border-amber-500/40 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <span className="text-base">🏟️</span> [Festa na Arquibancada]
                </span>
                <span className="text-xs font-mono font-black text-amber-400">{standScore} / 100</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Grito de guerra, subir bandeirão, esticar faixas verticais e barrinha de energia levando a bola pro gol!
              </p>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={standScore}
                onChange={(e) => onChangeStandScore(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-2 bg-slate-900 rounded-lg"
              />
              <button
                type="button"
                id="btn-open-arquibancada-game"
                onClick={onStartArquibancadaGame}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-98"
              >
                <span>🚀 Jogar Festa na Arquibancada</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Disparo do Motor de Cálculo e Narrativa */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="text-xs text-slate-400">
          <div>Fórmula: <strong>(Força Casa * 0.75) + (Média Torcida * 0.25) vs Força Rival</strong></div>
          <div className="text-slate-500 text-[11px]">Gera cálculo matemático + crônica de 3 parágrafos + placar final.</div>
        </div>

        <button
          type="button"
          id="btn-simulate-match"
          onClick={onSimulateDirectly}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 transition active:scale-95"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Calcular & Narrar Partida</span>
        </button>
      </div>
    </div>
  );
};
