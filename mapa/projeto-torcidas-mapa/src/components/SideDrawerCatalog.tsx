import React, { useState } from 'react';
import { 
  X, 
  Search, 
  HeartHandshake, 
  Swords, 
  MapPin, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Shield,
  Flame,
  Award,
  BookOpen
} from 'lucide-react';
import { TorcidaNode, AllianceBloc, Derby } from '../types';
import { BLOC_INFO } from '../utils/torcidasStorage';

interface SideDrawerCatalogProps {
  isOpen: boolean;
  onClose: () => void;
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

type TabKey = 'torcidas' | 'blocos' | 'classicos' | 'destaques';

export const SideDrawerCatalog: React.FC<SideDrawerCatalogProps> = ({
  isOpen,
  onClose,
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
  const [activeTab, setActiveTab] = useState<TabKey>('torcidas');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Filter torcidas
  const filteredTorcidas = torcidas.filter((t) => {
    if (selectedUfFilter && t.uf !== selectedUfFilter) return false;
    if (selectedBloc !== 'all' && selectedBloc !== 'rivalries' && t.bloc !== selectedBloc) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      t.club.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.uf.toLowerCase().includes(q)
    );
  });

  // Filter derbies
  const filteredDerbies = derbies.filter((d) => {
    if (selectedUfFilter && d.uf !== selectedUfFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.torcida1.toLowerCase().includes(q) ||
      d.torcida2.toLowerCase().includes(q) ||
      d.club1.toLowerCase().includes(q) ||
      d.club2.toLowerCase().includes(q) ||
      d.uf.toLowerCase().includes(q)
    );
  });

  // Unique UFs
  const uniqueUfs = Array.from(new Set(torcidas.map((t) => t.uf))).sort();

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-Over Drawer Container */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-[#0b0f17] text-slate-100 h-full border-l border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide text-white uppercase font-['Syne',sans-serif]">
                Catálogo e Listas
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                {torcidas.length} torcidas mapeadas • {derbies.length} clássicos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="grid grid-cols-4 gap-1 p-2 bg-slate-950/80 border-b border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('torcidas')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'torcidas'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Torcidas</span>
          </button>

          <button
            onClick={() => setActiveTab('blocos')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'blocos'
                ? 'bg-blue-950 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Alianças</span>
          </button>

          <button
            onClick={() => setActiveTab('classicos')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'classicos'
                ? 'bg-rose-950 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Clássicos</span>
          </button>

          <button
            onClick={() => setActiveTab('destaques')}
            className={`py-2 px-1 rounded-xl flex flex-col items-center gap-1 transition-all ${
              activeTab === 'destaques'
                ? 'bg-amber-950 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Destaques</span>
          </button>
        </div>

        {/* Search & State Filter Bar (Available on Torcidas and Classicos tabs) */}
        {(activeTab === 'torcidas' || activeTab === 'classicos') && (
          <div className="p-3 bg-slate-900/60 border-b border-slate-800/80 flex flex-col gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={activeTab === 'torcidas' ? 'Filtrar por torcida, clube ou cidade...' : 'Filtrar por clássico ou clube...'}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick State Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-thin">
              <button
                onClick={() => onSelectUfFilter(null)}
                className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                  selectedUfFilter === null
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                }`}
              >
                Todas UFs
              </button>
              {uniqueUfs.map((uf) => (
                <button
                  key={uf}
                  onClick={() => onSelectUfFilter(selectedUfFilter === uf ? null : uf)}
                  className={`px-2 py-0.5 rounded-lg whitespace-nowrap font-bold transition-all ${
                    selectedUfFilter === uf
                      ? 'bg-cyan-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800'
                  }`}
                >
                  {uf}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          
          {/* TAB 1: TORCIDAS */}
          {activeTab === 'torcidas' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>Mostrando <strong>{filteredTorcidas.length}</strong> torcidas</span>
                {selectedTorcidaId && (
                  <button 
                    onClick={() => onSelectTorcida('')} 
                    className="text-cyan-400 hover:underline"
                  >
                    Desmarcar seleção
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {filteredTorcidas.map((t) => {
                  const isSelected = selectedTorcidaId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTorcida(t.id);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: t.clubColors.primary, border: `1.5px solid ${t.clubColors.secondary || '#fff'}` }}
                        />
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-black text-slate-100 font-['Syne',sans-serif]">
                              {t.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {t.uf}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {t.club} • {t.city}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span 
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border whitespace-nowrap"
                          style={{
                            color: BLOC_INFO[t.bloc]?.color || '#94a3b8',
                            borderColor: `${BLOC_INFO[t.bloc]?.color || '#94a3b8'}40`,
                            backgroundColor: `${BLOC_INFO[t.bloc]?.color || '#94a3b8'}15`
                          }}
                        >
                          {BLOC_INFO[t.bloc]?.name || t.blocName}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: BLOCOS E ALIANÇAS */}
          {activeTab === 'blocos' && (
            <div className="space-y-4">
              {/* Punho Cruzado */}
              <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <h3 className="text-sm font-black text-blue-300 uppercase font-['Syne',sans-serif]">
                      União Punho Cruzado
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      onSelectBloc('punho_cruzado');
                      onClose();
                    }}
                    className="text-xs font-bold text-blue-400 bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-500/40 hover:bg-blue-900"
                  >
                    Filtrar no Mapa
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Uma das maiores alianças interestaduais do país, unindo torcidas de São Paulo, Rio de Janeiro, Minas Gerais, Rio Grande do Sul e Nordeste com forte pacto de recepção e arquibancada.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {torcidas.filter((t) => t.bloc === 'punho_cruzado').map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTorcida(t.id);
                        onClose();
                      }}
                      className="text-left p-2 rounded-xl bg-slate-900/80 border border-blue-500/20 hover:border-blue-400 text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold">{t.shortName || t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.uf}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dedo pro Alto */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h3 className="text-sm font-black text-emerald-300 uppercase font-['Syne',sans-serif]">
                      União Dedo pro Alto
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      onSelectBloc('dedo_pro_alto');
                      onClose();
                    }}
                    className="text-xs font-bold text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-500/40 hover:bg-emerald-900"
                  >
                    Filtrar no Mapa
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Bloco nacional histórico que rivaliza diretamente com o Punho Cruzado, congregando forças de peso em diversos estados com histórico de apoio mútuo em caravanas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {torcidas.filter((t) => t.bloc === 'dedo_pro_alto').map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTorcida(t.id);
                        onClose();
                      }}
                      className="text-left p-2 rounded-xl bg-slate-900/80 border border-emerald-500/20 hover:border-emerald-400 text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold">{t.shortName || t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.uf}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Regionais e Independentes */}
              <div className="bg-purple-950/40 border border-purple-500/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <h3 className="text-sm font-black text-purple-300 uppercase font-['Syne',sans-serif]">
                      Alianças Regionais & Tradicionais
                    </h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                  {torcidas.filter((t) => t.bloc === 'regional_historica' || t.bloc === 'independente').map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        onSelectTorcida(t.id);
                        onClose();
                      }}
                      className="text-left p-2 rounded-xl bg-slate-900/80 border border-purple-500/20 hover:border-purple-400 text-xs text-slate-200 flex items-center justify-between"
                    >
                      <span className="font-bold">{t.shortName || t.name}</span>
                      <span className="text-[10px] text-slate-400">{t.uf}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CLÁSSICOS E RIVALIDADES */}
          {activeTab === 'classicos' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span>{filteredDerbies.length} clássicos históricos</span>
              </div>

              <div className="space-y-2">
                {filteredDerbies.map((d) => {
                  const isSelected = selectedDerby?.id === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        onSelectDerby(d);
                        onClose();
                      }}
                      className={`w-full text-left p-3 rounded-2xl border transition-all ${
                        isSelected
                          ? 'bg-rose-950/80 border-rose-500 shadow-lg'
                          : 'bg-slate-900/70 border-slate-800/80 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-black text-white font-['Syne',sans-serif] uppercase flex items-center gap-1.5">
                          <Swords className="w-3.5 h-3.5 text-rose-400" />
                          {d.name}
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/40">
                          {d.uf}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-200">
                        {d.club1} vs {d.club2}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {d.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: DESTAQUES REGIONAIS */}
          {activeTab === 'destaques' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
                <h4 className="text-xs font-black text-cyan-300 uppercase font-['Syne',sans-serif] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  Eixo Rio-São Paulo
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  A rivalidade interestadual mais forte do futebol brasileiro, conectando torcidas paulistas e cariocas em pactos de torcida visitante.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5">
                <h4 className="text-xs font-black text-amber-300 uppercase font-['Syne',sans-serif] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" />
                  Pacto Sul-Sudeste
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  As torcidas de Grêmio e Internacional reproduzem as alianças do centro do país nos clássicos Gre-Nal e nos confrontos pelo Brasileirão.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1.5">
                <h4 className="text-xs font-black text-emerald-300 uppercase font-['Syne',sans-serif] flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  Força Nordeste
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ceará, Fortaleza, Bahia, Vitória, Sport e Santa Cruz com torcidas massivas aliadas aos blocos Punho Cruzado e Dedo pro Alto.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
