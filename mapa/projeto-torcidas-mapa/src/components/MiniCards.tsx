import React from 'react';
import { SpotlightCard } from '../types';
import { Shield, Flame, Zap, Award, Compass, Sparkles, ChevronRight } from 'lucide-react';

interface MiniCardsProps {
  cards: SpotlightCard[];
  onSelectTorcidaByName?: (name: string) => void;
}

const getIcon = (name: string) => {
  switch (name) {
    case 'Shield':
      return <Shield className="w-4 h-4 text-cyan-400" />;
    case 'Flame':
      return <Flame className="w-4 h-4 text-rose-400" />;
    case 'Zap':
      return <Zap className="w-4 h-4 text-amber-400" />;
    case 'Award':
      return <Award className="w-4 h-4 text-emerald-400" />;
    case 'Compass':
      return <Compass className="w-4 h-4 text-sky-400" />;
    case 'Sparkles':
    default:
      return <Sparkles className="w-4 h-4 text-purple-400" />;
  }
};

export const MiniCards: React.FC<MiniCardsProps> = ({ cards, onSelectTorcidaByName }) => {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <h2 className="text-xs font-black tracking-widest text-slate-300 uppercase font-['Syne',sans-serif]">
            Destaques e Eixos Regionais
          </h2>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">6 Fatos Editoriais</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-slate-900/70 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-3.5 flex flex-col justify-between transition-all duration-200 group hover:shadow-xl hover:shadow-cyan-950/20"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60">
                    {getIcon(card.iconName)}
                  </div>
                  <div>
                    <span className="text-[9px] font-extrabold text-cyan-400 tracking-wider uppercase block">
                      {card.tag}
                    </span>
                    <h3 className="text-xs font-black text-white uppercase tracking-tight">
                      {card.title}
                    </h3>
                  </div>
                </div>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/40">
                  {card.uf}
                </span>
              </div>

              {/* Card Description */}
              <p className="text-[11px] text-slate-300 leading-relaxed font-normal mb-3">
                {card.description}
              </p>
            </div>

            {/* Featured Badges / Tags */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-1">
              {card.featuredTorcidas.slice(0, 3).map((torcidaName, i) => (
                <button
                  key={i}
                  onClick={() => onSelectTorcidaByName?.(torcidaName)}
                  className="text-[9.5px] font-medium px-2 py-0.5 rounded-md bg-slate-800/90 hover:bg-cyan-950 hover:text-cyan-300 text-slate-400 border border-slate-700/40 transition-colors truncate max-w-full"
                >
                  {torcidaName}
                </button>
              ))}
              {card.featuredTorcidas.length > 3 && (
                <span className="text-[9px] font-semibold text-slate-500 self-center">
                  +{card.featuredTorcidas.length - 3}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
