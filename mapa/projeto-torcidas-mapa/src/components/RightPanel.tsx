import React, { useState } from 'react';
import { Flame, Swords, MapPin, ChevronRight, ChevronDown } from 'lucide-react';
import { Derby } from '../types';

interface RightPanelProps {
  derbies: Derby[];
  selectedDerbyId: string | null;
  onSelectDerby: (derby: Derby) => void;
}

type RegionTab = 'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste e Norte' | 'all';

export const RightPanel: React.FC<RightPanelProps> = ({
  derbies,
  selectedDerbyId,
  onSelectDerby,
}) => {
  const [activeRegion, setActiveRegion] = useState<RegionTab>('all');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    Sudeste: true,
    Sul: true,
    Nordeste: true,
    'Centro-Oeste e Norte': true,
  });

  const toggleSection = (region: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [region]: !prev[region],
    }));
  };

  const regions: Array<'Sudeste' | 'Sul' | 'Nordeste' | 'Centro-Oeste e Norte'> = [
    'Sudeste',
    'Sul',
    'Nordeste',
    'Centro-Oeste e Norte',
  ];

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Panel Header */}
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 border border-slate-800 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold tracking-wider text-slate-100 uppercase font-['Syne',sans-serif]">
                Rivalidades que Movem o Mapa
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                Grandes clássicos e polarizações regionais
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50">
            Painel B
          </span>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1 mt-3 overflow-x-auto pb-0.5 custom-scrollbar text-[11px]">
          <button
            onClick={() => setActiveRegion('all')}
            className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
              activeRegion === 'all'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
            }`}
          >
            Todas
          </button>
          {regions.map((reg) => (
            <button
              key={reg}
              onClick={() => setActiveRegion(reg)}
              className={`px-2 py-1 rounded-md transition-all whitespace-nowrap ${
                activeRegion === reg
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-800/50'
              }`}
            >
              {reg === 'Centro-Oeste e Norte' ? 'CO / Norte' : reg}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion / List of Derbies by Region */}
      <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto pr-1 custom-scrollbar">
        {regions
          .filter((reg) => activeRegion === 'all' || activeRegion === reg)
          .map((region) => {
            const regionDerbies = derbies.filter((d) => d.region === region);
            const isExpanded = expandedSections[region] !== false;

            return (
              <div
                key={region}
                className="bg-slate-900/60 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                {/* Section Accordion Header */}
                <button
                  onClick={() => toggleSection(region)}
                  className="w-full px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-850 flex items-center justify-between border-b border-slate-800 text-left transition-all"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                    <span className="text-xs font-black tracking-wider text-rose-300 uppercase">
                      {region}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold px-1.5 py-0.2 rounded bg-slate-800">
                      {regionDerbies.length}
                    </span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Derbies list */}
                {isExpanded && (
                  <div className="p-2 space-y-1.5">
                    {regionDerbies.map((derby) => {
                      const isSelected = selectedDerbyId === derby.id;
                      return (
                        <button
                          key={derby.id}
                          onClick={() => onSelectDerby(derby)}
                          className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border group ${
                            isSelected
                              ? 'bg-rose-950/70 border-rose-500/70 text-white shadow-md shadow-rose-950/30'
                              : 'bg-slate-950/40 border-slate-800/60 hover:border-rose-500/40 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-bold text-slate-100 flex items-center gap-1.5">
                              <Swords className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-rose-500/70 group-hover:text-rose-400'}`} />
                              <span>{derby.name}</span>
                            </span>
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              {derby.uf}
                            </span>
                          </div>

                          <div className="text-[10.5px] text-slate-400 pl-5 flex items-center justify-between">
                            <span className="truncate">{derby.torcida1} × {derby.torcida2}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
};
