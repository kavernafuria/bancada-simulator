import React from 'react';
import { TorcidaNode, NetworkConnection, Derby, SpotlightCard } from '../types';
import { BrazilMapVector } from './BrazilMapVector';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { MiniCards } from './MiniCards';
import { LegendAndFooter } from './LegendAndFooter';
import { Shield, Sparkles, Download, Printer, X, Maximize2 } from 'lucide-react';

interface PresentationCanvasProps {
  torcidas: TorcidaNode[];
  connections: NetworkConnection[];
  derbies: Derby[];
  spotlightCards: SpotlightCard[];
  selectedTorcidaId: string | null;
  hoveredTorcidaId: string | null;
  selectedDerby: Derby | null;
  onSelectTorcida: (id: string) => void;
  onHoverTorcida: (id: string | null) => void;
  onSelectDerby: (derby: Derby) => void;
  onExit: () => void;
}

export const PresentationCanvas: React.FC<PresentationCanvasProps> = ({
  torcidas,
  connections,
  derbies,
  spotlightCards,
  selectedTorcidaId,
  hoveredTorcidaId,
  selectedDerby,
  onSelectTorcida,
  onHoverTorcida,
  onSelectDerby,
  onExit,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#080c14] text-slate-100 overflow-y-auto xl:overflow-hidden flex flex-col items-center justify-start p-2 sm:p-4 lg:p-6 select-none font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 16:9 Aspect Frame Container (1920x1080 scale) */}
      <div className="w-full max-w-[1920px] aspect-auto xl:aspect-[16/9] bg-[#0c101a] border border-slate-800 rounded-3xl p-4 lg:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden">
        
        {/* Top Bar for Presentation Mode */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-2 bg-gradient-to-b from-cyan-400 via-sky-500 to-rose-500 rounded-full"></div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-tight font-['Syne',sans-serif] text-white">
                  AMIZADES E RIVALIDADES DAS TORCIDAS NO BRASIL
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-500/40">
                  Panorama • Agosto de 2026
                </span>
              </div>
              <p className="text-xs lg:text-sm text-slate-400 font-medium">
                Panorama visual de alianças entre organizadas, rivalidades tradicionais e clássicos regionais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700"
              title="Imprimir ou Salvar em PDF"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              onClick={onExit}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700"
            >
              <X className="w-4 h-4" />
              <span>Voltar</span>
            </button>
          </div>
        </div>

        {/* 3-Column Core Grid Layout (Left Panel, Central Map, Right Panel) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 items-stretch min-h-0">
          
          {/* Left: Blocos de Amizade (3 cols) */}
          <div className="xl:col-span-3 h-full overflow-y-auto custom-scrollbar">
            <LeftPanel
              torcidas={torcidas}
              selectedTorcidaId={selectedTorcidaId}
              onSelectTorcida={onSelectTorcida}
              selectedBloc="all"
              onSelectBloc={() => {}}
            />
          </div>

          {/* Center: Stylized Vector Map of Brazil (6 cols) */}
          <div className="xl:col-span-6 h-full flex flex-col min-h-[460px] lg:min-h-[520px]">
            <BrazilMapVector
              torcidas={torcidas}
              connections={connections}
              selectedTorcidaId={selectedTorcidaId}
              hoveredTorcidaId={hoveredTorcidaId}
              selectedDerby={selectedDerby}
              selectedBloc="all"
              searchQuery=""
              onSelectTorcida={onSelectTorcida}
              onHoverTorcida={onHoverTorcida}
            />
          </div>

          {/* Right: Rivalidades & Clássicos (3 cols) */}
          <div className="xl:col-span-3 h-full overflow-y-auto custom-scrollbar">
            <RightPanel
              derbies={derbies}
              selectedDerbyId={selectedDerby ? selectedDerby.id : null}
              onSelectDerby={onSelectDerby}
            />
          </div>

        </div>

        {/* Bottom Section: 6 Mini-Cards + Footer & Legend */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
          <MiniCards
            cards={spotlightCards}
            onSelectTorcidaByName={(name) => {
              const match = torcidas.find(
                (t) => t.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.shortName?.toLowerCase() || '---')
              );
              if (match) onSelectTorcida(match.id);
            }}
          />
          <LegendAndFooter />
        </div>

      </div>
    </div>
  );
};
