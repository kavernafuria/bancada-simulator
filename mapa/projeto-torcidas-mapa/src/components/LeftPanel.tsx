import React from 'react';
import { Shield, Users, Info, ArrowUpRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { TorcidaNode, AllianceBloc } from '../types';

interface LeftPanelProps {
  torcidas: TorcidaNode[];
  selectedTorcidaId: string | null;
  onSelectTorcida: (id: string) => void;
  selectedBloc: AllianceBloc | 'all' | 'rivalries';
  onSelectBloc: (bloc: AllianceBloc) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  torcidas,
  selectedTorcidaId,
  onSelectTorcida,
  selectedBloc,
  onSelectBloc,
}) => {
  const punhoCruzadoTorcidas = torcidas.filter((t) => t.bloc === 'punho_cruzado');
  const dedoProAltoTorcidas = torcidas.filter((t) => t.bloc === 'dedo_pro_alto');
  const historicasTorcidas = torcidas.filter((t) => t.bloc === 'regional_historica' || t.bloc === 'independente');

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Panel Header */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase font-['Syne',sans-serif]">
                Blocos e Redes de Amizade
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Pactos de fraternidade interestadual
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
            Painel A
          </span>
        </div>
      </div>

      {/* BLOC A: UNIÃO PUNHO CRUZADO */}
      <div
        className={`rounded-2xl p-4 transition-all border ${
          selectedBloc === 'punho_cruzado'
            ? 'bg-blue-950/50 border-blue-500/60 shadow-lg shadow-blue-950/40 ring-1 ring-blue-500/30'
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span>
            <h3 className="text-xs font-black tracking-wide text-blue-300 uppercase">
              A) União Punho Cruzado
            </h3>
          </div>
          <button
            onClick={() => onSelectBloc('punho_cruzado')}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
              selectedBloc === 'punho_cruzado'
                ? 'bg-blue-500 text-white'
                : 'text-blue-400 hover:text-blue-200 bg-blue-950/40 border border-blue-800/40'
            }`}
          >
            {selectedBloc === 'punho_cruzado' ? 'Filtrado' : 'Focar Bloco'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Histórico pacto de apoio mútuo, logística e respeito entre tradicionais torcidas de diferentes estados brasileiros.
        </p>

        {/* List of torcidas */}
        <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1 custom-scrollbar">
          {punhoCruzadoTorcidas.slice(0, 9).map((t) => {
            const isSelected = selectedTorcidaId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTorcida(t.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-blue-600/30 border-blue-400 text-white font-semibold'
                    : 'bg-slate-950/50 border-slate-800/60 hover:border-blue-500/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="text-[10px] text-slate-500">/ {t.club}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                  {t.uf}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOC B: UNIÃO DEDO PRO ALTO */}
      <div
        className={`rounded-2xl p-4 transition-all border ${
          selectedBloc === 'dedo_pro_alto'
            ? 'bg-emerald-950/50 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
            : 'bg-slate-900/60 hover:bg-slate-900/80 border-slate-800/80'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
            <h3 className="text-xs font-black tracking-wide text-emerald-300 uppercase">
              B) União Dedo pro Alto
            </h3>
          </div>
          <button
            onClick={() => onSelectBloc('dedo_pro_alto')}
            className={`text-[10px] font-semibold px-2 py-0.5 rounded transition-all ${
              selectedBloc === 'dedo_pro_alto'
                ? 'bg-emerald-500 text-white'
                : 'text-emerald-400 hover:text-emerald-200 bg-emerald-950/40 border border-emerald-800/40'
            }`}
          >
            {selectedBloc === 'dedo_pro_alto' ? 'Filtrado' : 'Focar Bloco'}
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
          Ampla rede interestadual de amizade simbolizada pelo gesto característico, integrando Norte, Nordeste, Centro-Oeste, Sudeste e Sul.
        </p>

        {/* List of torcidas */}
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
          {dedoProAltoTorcidas.slice(0, 12).map((t) => {
            const isSelected = selectedTorcidaId === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTorcida(t.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center justify-between border ${
                  isSelected
                    ? 'bg-emerald-600/30 border-emerald-400 text-white font-semibold'
                    : 'bg-slate-950/50 border-slate-800/60 hover:border-emerald-500/40 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span className="truncate font-medium">{t.name}</span>
                  <span className="text-[10px] text-slate-500">/ {t.club}</span>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                  {t.uf}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* BLOC C: REDES REGIONAIS E RELAÇÕES HISTÓRICAS */}
      <div className="bg-slate-900/60 rounded-2xl p-4 border border-amber-500/20 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span>
          <h3 className="text-xs font-black tracking-wide text-amber-300 uppercase">
            C) Redes Regionais & Relações Históricas
          </h3>
        </div>

        <p className="text-[11px] text-slate-300 leading-relaxed font-normal bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
          “Há alianças e rivalidades locais que variam conforme estado, cidade, geração e contexto histórico.”
        </p>

        <div className="mt-3 flex items-start gap-2 text-[10px] text-slate-400 leading-tight">
          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Relação entre Torcidas:</strong> As alianças são pactos estabelecidos entre entidades civis específicas de torcedores, e não representam a totalidade dos torcedores ou a administração dos clubes de futebol.
          </span>
        </div>
      </div>
    </div>
  );
};
