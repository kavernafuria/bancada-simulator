import React, { useState } from 'react';
import { 
  Users, 
  Swords, 
  MapPin, 
  HeartHandshake, 
  Flame, 
  Search, 
  ChevronRight, 
  Sparkles,
  Layers,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { TorcidaNode, AllianceBloc, Derby } from '../types';

interface InteractiveSideMenuProps {
  torcidas: TorcidaNode[];
  derbies: Derby[];
  selectedTorcidaId: string | null;
  selectedDerby: Derby | null;
  selectedBloc: AllianceBloc | 'all' | 'rivalries';
  selectedUfFilter: string | null;
  onSelectTorcida: (id: string) => void;
  onSelectDerby: (derby: Derby) => void;
  onSelectBloc: (bloc: AllianceBloc | 'all' | 'rivalries') => void;
  onSelectUfFilter: (uf: string | null) => void;
}

type TabType = 'amizades' | 'rivalidades' | 'estados';

export const InteractiveSideMenu: React.FC<InteractiveSideMenuProps> = ({
  torcidas,
  derbies,
  selectedTorcidaId,
  selectedDerby,
  selectedBloc,
  selectedUfFilter,
  onSelectTorcida,
  onSelectDerby,
  onSelectBloc,
  onSelectUfFilter,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('amizades');
  const [internalSearch, setInternalSearch] = useState<string>('');

  const punhoCruzadoTorcidas = torcidas.filter((t) => t.bloc === 'punho_cruzado');
  const dedoProAltoTorcidas = torcidas.filter((t) => t.bloc === 'dedo_pro_alto');
  const historicasTorcidas = torcidas.filter((t) => t.bloc === 'regional_historica' || t.bloc === 'independente');

  // Filtered by internal search
  const filteredTorcidas = torcidas.filter((t) => {
    if (selectedUfFilter && t.uf !== selectedUfFilter) return false;
    if (!internalSearch) return true;
    const q = internalSearch.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.club.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.uf.toLowerCase().includes(q)
    );
  });

  const filteredDerbies = derbies.filter((d) => {
    if (!internalSearch) return true;
    const q = internalSearch.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.torcida1.toLowerCase().includes(q) ||
      d.torcida2.toLowerCase().includes(q) ||
      d.club1.toLowerCase().includes(q) ||
      d.club2.toLowerCase().includes(q) ||
      d.uf.toLowerCase().includes(q)
    );
  });

  // State grouping
  const ufsMap = new Map<string, TorcidaNode[]>();
  torcidas.forEach((t) => {
    const list = ufsMap.get(t.uf) || [];
    list.push(t);
    ufsMap.set(t.uf, list);
  });
  const ufsList = Array.from(ufsMap.entries()).sort((a, b) => b[1].length - a[1].length);

  return (
    <aside className="w-full h-full min-h-[640px] lg:min-h-[720px] xl:min-h-[780px] bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 p-4 flex flex-col justify-between shadow-2xl overflow-hidden">
      
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-black tracking-wider text-white uppercase font-['Syne',sans-serif]">
                Central de Relações
              </h2>
              <p className="text-[10.5px] text-slate-400 font-medium">
                Navegação e filtros interativos
              </p>
            </div>
          </div>
          
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {torcidas.length} Torcidas
          </span>
        </div>

        {/* Tab Switcher: Amizades, Rivalidades, Estados */}
        <div className="grid grid-cols-3 gap-1 bg-slate-950/80 p-1 rounded-2xl border border-slate-800 mb-3">
          <button
            onClick={() => setActiveTab('amizades')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'amizades'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
            <span>Amizades</span>
          </button>

          <button
            onClick={() => setActiveTab('rivalidades')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rivalidades'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-rose-400" />
            <span>Rivais</span>
          </button>

          <button
            onClick={() => setActiveTab('estados')}
            className={`py-2 px-1 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'estados'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Estados</span>
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'amizades' 
                ? 'Buscar torcida ou clube...' 
                : activeTab === 'rivalidades' 
                ? 'Buscar clássico ou rival...' 
                : 'Buscar estado ou cidade...'
            }
            value={internalSearch}
            onChange={(e) => setInternalSearch(e.target.value)}
            className="w-full bg-slate-950/70 border border-slate-800 focus:border-cyan-400 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none transition-colors"
          />
          {internalSearch && (
            <button
              onClick={() => setInternalSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-3 max-h-[500px]">
        
        {/* ================= TAB 1: AMIZADES & BLOCOS ================= */}
        {activeTab === 'amizades' && (
          <div className="space-y-3">
            
            {/* Bloco Punho Cruzado Section */}
            <div className={`p-3 rounded-2xl border transition-all ${
              selectedBloc === 'punho_cruzado' 
                ? 'bg-blue-950/50 border-blue-500/60 shadow-lg' 
                : 'bg-slate-950/50 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.8)]"></span>
                  <h3 className="text-xs font-black text-blue-300 uppercase">
                    União Punho Cruzado
                  </h3>
                </div>
                <button
                  onClick={() => onSelectBloc(selectedBloc === 'punho_cruzado' ? 'all' : 'punho_cruzado')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800/60 hover:bg-blue-900 hover:text-white transition-colors"
                >
                  {selectedBloc === 'punho_cruzado' ? 'Foco Ativo' : 'Filtrar'}
                </button>
              </div>

              <div className="space-y-1 max-h-36 overflow-y-auto custom-scrollbar pr-0.5">
                {punhoCruzadoTorcidas
                  .filter((t) => !internalSearch || t.name.toLowerCase().includes(internalSearch.toLowerCase()) || t.club.toLowerCase().includes(internalSearch.toLowerCase()))
                  .map((t) => {
                    const isSelected = selectedTorcidaId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelectTorcida(t.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                          isSelected
                            ? 'bg-blue-600/30 border-blue-400 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-blue-500/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.clubColors.primary }}></span>
                          <span className="truncate">{t.name}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {t.uf}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Bloco Dedo pro Alto Section */}
            <div className={`p-3 rounded-2xl border transition-all ${
              selectedBloc === 'dedo_pro_alto' 
                ? 'bg-emerald-950/50 border-emerald-500/60 shadow-lg' 
                : 'bg-slate-950/50 border-slate-800'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.8)]"></span>
                  <h3 className="text-xs font-black text-emerald-300 uppercase">
                    União Dedo pro Alto
                  </h3>
                </div>
                <button
                  onClick={() => onSelectBloc(selectedBloc === 'dedo_pro_alto' ? 'all' : 'dedo_pro_alto')}
                  className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900 hover:text-white transition-colors"
                >
                  {selectedBloc === 'dedo_pro_alto' ? 'Foco Ativo' : 'Filtrar'}
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto custom-scrollbar pr-0.5">
                {dedoProAltoTorcidas
                  .filter((t) => !internalSearch || t.name.toLowerCase().includes(internalSearch.toLowerCase()) || t.club.toLowerCase().includes(internalSearch.toLowerCase()))
                  .map((t) => {
                    const isSelected = selectedTorcidaId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelectTorcida(t.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                          isSelected
                            ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-emerald-500/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.clubColors.primary }}></span>
                          <span className="truncate">{t.name}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {t.uf}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* Redes Históricas & Independentes */}
            <div className="p-3 rounded-2xl border border-slate-800 bg-slate-950/50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.8)]"></span>
                  <h3 className="text-xs font-black text-amber-300 uppercase">
                    Redes Regionais e Autônomas
                  </h3>
                </div>
              </div>

              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-0.5">
                {historicasTorcidas
                  .filter((t) => !internalSearch || t.name.toLowerCase().includes(internalSearch.toLowerCase()) || t.club.toLowerCase().includes(internalSearch.toLowerCase()))
                  .map((t) => {
                    const isSelected = selectedTorcidaId === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => onSelectTorcida(t.id)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between border transition-all ${
                          isSelected
                            ? 'bg-amber-600/30 border-amber-400 text-white font-bold'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-amber-500/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: t.clubColors.primary }}></span>
                          <span className="truncate">{t.name}</span>
                        </div>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {t.uf}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>

          </div>
        )}

        {/* ================= TAB 2: RIVALIDADES & CLÁSSICOS ================= */}
        {activeTab === 'rivalidades' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-rose-300 uppercase">
                {filteredDerbies.length} Grandes Rivalidades
              </span>
              <button
                onClick={() => onSelectBloc(selectedBloc === 'rivalries' ? 'all' : 'rivalries')}
                className="text-[10px] font-bold text-rose-400 hover:text-white px-2 py-0.5 rounded bg-rose-950 border border-rose-800/60"
              >
                {selectedBloc === 'rivalries' ? 'Ver Todas' : 'Só Rivalidades'}
              </button>
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-0.5">
              {filteredDerbies.map((derby) => {
                const isSelected = selectedDerby?.id === derby.id;
                return (
                  <button
                    key={derby.id}
                    onClick={() => onSelectDerby(derby)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all border group ${
                      isSelected
                        ? 'bg-rose-950/80 border-rose-500 text-white font-bold shadow-md'
                        : 'bg-slate-950/50 border-slate-800 hover:border-rose-500/50 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-extrabold text-slate-100 flex items-center gap-1.5">
                        <Swords className={`w-3.5 h-3.5 ${isSelected ? 'text-rose-400' : 'text-rose-500/70 group-hover:text-rose-400'}`} />
                        <span>{derby.name}</span>
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {derby.uf}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-400 pl-5 truncate">
                      {derby.torcida1} × {derby.torcida2}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: ESTADOS & CIDADES ================= */}
        {activeTab === 'estados' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-amber-300 uppercase">
                {ufsList.length} Estados Mapeados
              </span>
              {selectedUfFilter && (
                <button
                  onClick={() => onSelectUfFilter(null)}
                  className="text-[10px] font-bold text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
                >
                  Limpar Filtro
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-[460px] overflow-y-auto custom-scrollbar pr-0.5">
              {ufsList.map(([uf, torcidasInUf]) => {
                const isUfActive = selectedUfFilter === uf;
                return (
                  <div key={uf} className="bg-slate-950/60 rounded-xl border border-slate-800 p-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-black text-slate-200">
                        Estado: <strong className="text-cyan-400">{uf}</strong> ({torcidasInUf.length})
                      </span>
                      <button
                        onClick={() => onSelectUfFilter(isUfActive ? null : uf)}
                        className={`text-[9.5px] font-bold px-2 py-0.5 rounded transition-colors ${
                          isUfActive 
                            ? 'bg-cyan-500 text-slate-950' 
                            : 'bg-slate-800 text-slate-400 hover:text-cyan-300'
                        }`}
                      >
                        {isUfActive ? 'Filtro Ativo' : 'Filtrar UF'}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {torcidasInUf.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => onSelectTorcida(t.id)}
                          className={`text-[10.5px] px-2 py-0.5 rounded-lg border transition-all truncate max-w-full ${
                            selectedTorcidaId === t.id
                              ? 'bg-cyan-950 text-cyan-300 border-cyan-500 font-bold'
                              : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Footer Info of Sidebar */}
      <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Clique em qualquer item p/ focar no mapa</span>
        <button
          onClick={() => {
            onSelectTorcida('');
            onSelectBloc('all');
            onSelectUfFilter(null);
          }}
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          Resetar
        </button>
      </div>

    </aside>
  );
};
