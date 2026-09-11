import React from 'react';
import { Info, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export const LegendAndFooter: React.FC = () => {
  return (
    <footer className="w-full flex flex-col xl:flex-row items-stretch justify-between gap-4 mt-2">
      
      {/* Editorial Disclaimer / Footnote */}
      <div className="flex-1 bg-slate-900/70 border border-slate-800/80 rounded-2xl p-4 flex items-start gap-3 shadow-md">
        <div className="p-2 rounded-xl bg-slate-800/90 text-cyan-400 shrink-0 mt-0.5 border border-slate-700/60">
          <BookOpen className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black tracking-wider text-slate-200 uppercase font-['Syne',sans-serif] mb-1">
            Nota Editorial e Responsabilidade Informativa
          </h4>
          <p className="text-[11.5px] text-slate-400 leading-relaxed">
            “Mapa informativo baseado em referências públicas e históricas. Alianças e rivalidades podem mudar ao longo do tempo. Este material não representa todos os grupos, nem sugere relações permanentes entre clubes inteiros.”
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[10.5px] text-slate-500 font-medium">
            <span>• Dados e pesquisas estruturadas de referência: Agosto de 2026</span>
            <span>• Finalidade estritamente jornalística e sociológica</span>
            <span>• Torcidas organizadas e clubes são entidades jurídicas distintas</span>
          </div>
        </div>
      </div>

      {/* Legend Box (Canto Inferior Direito) */}
      <div className="w-full xl:w-[460px] 2xl:w-[480px] bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-lg shrink-0">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
          <span className="text-xs font-extrabold tracking-wider text-slate-200 uppercase font-['Syne',sans-serif]">
            Legenda e Hierarquia Visual
          </span>
          <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded">
            Convenção Cartográfica
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
          
          {/* Connection Lines Legend */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]"></span>
              <span className="text-[11px] font-semibold text-cyan-200">
                AMIZADE / ALIANÇA
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-6 h-1 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.8)]"></span>
              <span className="text-[11px] font-semibold text-rose-300">
                RIVALIDADE PRINCIPAL
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-6 h-0 border-t-2 border-dashed border-amber-400"></span>
              <span className="text-[11px] font-semibold text-amber-300">
                RIVALIDADE HISTÓRICA / REGIONAL
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="w-6 h-0 border-t border-slate-500"></span>
              <span className="text-[11px] font-medium text-slate-400">
                CONEXÃO DE CLÁSSICO
              </span>
            </div>
          </div>

          {/* Node Sizing Legend */}
          <div className="space-y-2 sm:border-l sm:border-slate-800 sm:pl-3">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-slate-700 border-2 border-cyan-400 flex items-center justify-center shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              </div>
              <span className="text-[11px] text-slate-300">
                Torcidas de alcance nacional
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700 border-1.5 border-emerald-400 flex items-center justify-center shrink-0">
                <div className="w-1 h-1 rounded-full bg-white"></div>
              </div>
              <span className="text-[11px] text-slate-300">
                Torcidas regionais relevantes
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></div>
              <span className="text-[11px] text-slate-400">
                Organizadas locais ou interior
              </span>
            </div>
          </div>

        </div>
      </div>

    </footer>
  );
};
