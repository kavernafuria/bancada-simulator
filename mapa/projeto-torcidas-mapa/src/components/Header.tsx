import React, { useState, useRef, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Filter, 
  Search, 
  Maximize2, 
  RefreshCw, 
  Eye, 
  MapPin, 
  RotateCcw,
  Layers,
  Menu,
  HeartHandshake,
  Swords,
  EyeOff,
  ChevronDown,
  Download
} from 'lucide-react';
import { AllianceBloc } from '../types';
import { BLOC_INFO } from '../utils/torcidasStorage';
import { DownloadModal } from './DownloadModal';

export type LineFilterMode = 'all' | 'amizades' | 'rivalidades' | 'none';

interface HeaderProps {
  selectedBloc: AllianceBloc | 'all' | 'rivalries';
  onSelectBloc: (bloc: AllianceBloc | 'all' | 'rivalries') => void;
  selectedUfFilter: string | null;
  onSelectUfFilter: (uf: string | null) => void;
  availableUfs: string[];
  lineFilterMode: LineFilterMode;
  onChangeLineFilterMode: (mode: LineFilterMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  presentationMode: boolean;
  onTogglePresentation: () => void;
  onResetView: () => void;
  selectedTorcidaId: string | null;
  hasCustomChanges?: boolean;
  onResetCustomStorage?: () => void;
  onOpenDrawer: () => void;
  totalTorcidasCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedBloc,
  onSelectBloc,
  selectedUfFilter,
  onSelectUfFilter,
  availableUfs,
  lineFilterMode,
  onChangeLineFilterMode,
  searchQuery,
  onSearchChange,
  presentationMode,
  onTogglePresentation,
  onResetView,
  selectedTorcidaId,
  hasCustomChanges = false,
  onResetCustomStorage,
  onOpenDrawer,
  totalTorcidasCount,
}) => {
  const [showMoreBlocs, setShowMoreBlocs] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const moreBlocsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moreBlocsRef.current && !moreBlocsRef.current.contains(event.target as Node)) {
        setShowMoreBlocs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isOtherBlocActive =
    selectedBloc !== 'all' &&
    selectedBloc !== 'rivalries' &&
    selectedBloc !== 'punho_cruzado' &&
    selectedBloc !== 'dedo_pro_alto';

  const otherBlocInfo = isOtherBlocActive && selectedBloc !== 'rivalries' && selectedBloc !== 'all' 
    ? BLOC_INFO[selectedBloc] 
    : null;
  return (
    <header className="border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-xl sticky top-0 z-30 px-3 sm:px-6 py-3 transition-all shadow-xl">
      <div className="max-w-[1920px] mx-auto flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 sm:gap-4">
        
        {/* Title and Badge */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <div className="h-9 w-1.5 bg-gradient-to-b from-cyan-400 via-sky-500 to-rose-500 rounded-full hidden sm:block"></div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-['Syne',sans-serif] uppercase">
                  Mapa das Torcidas do Brasil
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  Alianças & Rivalidades
                </span>

                {hasCustomChanges && onResetCustomStorage && (
                  <button
                    onClick={onResetCustomStorage}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40 hover:bg-amber-900 transition-all cursor-pointer"
                    title="Clique para restaurar a base de dados original"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Personalizado (Restaurar)</span>
                  </button>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-medium">
                <span>Clique em qualquer torcida para destacar conexões e gerenciar alianças</span>
              </p>
            </div>
          </div>

          {/* Quick Drawer trigger on small screens */}
          <button
            onClick={onOpenDrawer}
            className="xl:hidden flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold"
          >
            <Menu className="w-4 h-4" />
            <span>Listas</span>
          </button>
        </div>

        {/* Filters and Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full xl:w-auto">
          
          {/* Main Bloc Filters */}
          <div className="flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => onSelectBloc('all')}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap ${
                selectedBloc === 'all'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Geral
            </button>

            <button
              onClick={() => onSelectBloc('punho_cruzado')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedBloc === 'punho_cruzado'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                  : 'text-blue-400/90 hover:text-blue-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Punho Cruzado
            </button>

            <button
              onClick={() => onSelectBloc('dedo_pro_alto')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedBloc === 'dedo_pro_alto'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25'
                  : 'text-emerald-400/90 hover:text-emerald-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Dedo pro Alto
            </button>

            <button
              onClick={() => onSelectBloc('rivalries')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                selectedBloc === 'rivalries'
                  ? 'bg-rose-600 text-white shadow-sm shadow-rose-500/25'
                  : 'text-rose-400/90 hover:text-rose-300'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400"></span>
              Rivalidades
            </button>

            {/* Outras Alianças Dropdown */}
            <div className="relative" ref={moreBlocsRef}>
              <button
                onClick={() => setShowMoreBlocs(!showMoreBlocs)}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isOtherBlocActive
                    ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title="Filtrar por outros blocos e alianças"
              >
                {otherBlocInfo && (
                  <span 
                    className="w-2 h-2 rounded-full shrink-0" 
                    style={{ backgroundColor: otherBlocInfo.color }}
                  />
                )}
                <span>{otherBlocInfo ? otherBlocInfo.shortName : 'Outros Blocos'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreBlocs ? 'rotate-180' : ''}`} />
              </button>

              {showMoreBlocs && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-[#0d1322] border border-slate-700/80 rounded-2xl p-2.5 shadow-2xl z-50 animate-in fade-in max-h-[420px] overflow-y-auto custom-scrollbar">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1">
                    Eixos Nacionais
                  </div>
                  <button
                    onClick={() => {
                      onSelectBloc('punho_colado');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'punho_colado' ? 'bg-purple-950/80 text-purple-200 border border-purple-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">União Punho Colado</div>
                      <div className="text-[10px] text-slate-400">Young Flu, Fúria Guarani, Raça Tricolor</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectBloc('alianca_alvinegra');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'alianca_alvinegra' ? 'bg-slate-800 text-white border border-slate-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">Aliança Alvinegra</div>
                      <div className="text-[10px] text-slate-400">Gaviões da Fiel × Fúria Jovem</div>
                    </div>
                  </button>

                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mt-2 pt-2 border-t border-slate-800">
                    Geopolítica Nordeste & Norte
                  </div>
                  <button
                    onClick={() => {
                      onSelectBloc('nordeste_lado_a');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'nordeste_lado_a' ? 'bg-amber-950/80 text-amber-200 border border-amber-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">Nordeste Lado A</div>
                      <div className="text-[10px] text-slate-400">TUF, Máfia Vermelha, Mancha CSA, Trovão</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectBloc('nordeste_lado_b');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'nordeste_lado_b' ? 'bg-pink-950/80 text-pink-200 border border-pink-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">Nordeste Lado B</div>
                      <div className="text-[10px] text-slate-400">Comando CRB, Cearamor, Terror Bicolor, Tubarões</div>
                    </div>
                  </button>

                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider px-2 py-1 mt-2 pt-2 border-t border-slate-800">
                    Interior de SP & ABC
                  </div>
                  <button
                    onClick={() => {
                      onSelectBloc('sp_familia_interior');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'sp_familia_interior' ? 'bg-cyan-950/80 text-cyan-200 border border-cyan-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">Família Interior (Bloco 1)</div>
                      <div className="text-[10px] text-slate-400">Leões Fabulosa, Fúria Andreense, FRV</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectBloc('sp_punho_seguro');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'sp_punho_seguro' ? 'bg-teal-950/80 text-teal-200 border border-teal-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-teal-400 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">União Punho Seguro (Bloco 2)</div>
                      <div className="text-[10px] text-slate-400">Gladiadores, Guerreiros do Tigre, Esquadrão XV</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onSelectBloc('sp_irmandade');
                      setShowMoreBlocs(false);
                    }}
                    className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center gap-2 transition-all ${
                      selectedBloc === 'sp_irmandade' ? 'bg-indigo-950/80 text-indigo-200 border border-indigo-500/40 font-bold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
                    <div className="flex-1 truncate">
                      <div className="font-bold">Irmandade (Bloco 3)</div>
                      <div className="text-[10px] text-slate-400">Jovem Ponte, Mancha São José, Afeganistão</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* UF State Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedUfFilter || ''}
              onChange={(e) => onSelectUfFilter(e.target.value ? e.target.value : null)}
              aria-label="Filtrar por Estado (UF)"
              className="bg-slate-950/90 text-xs font-bold text-slate-200 border border-slate-800 rounded-xl px-3 py-2 pr-7 focus:outline-none focus:border-cyan-500 cursor-pointer appearance-none"
            >
              <option value="">Todos Estados (UF)</option>
              {availableUfs.map((uf) => (
                <option key={uf} value={uf}>
                  Estado: {uf}
                </option>
              ))}
            </select>
            <MapPin className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Line Filter Modes (Declutter Mode) */}
          <div className="hidden md:flex items-center bg-slate-950/90 p-1 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              onClick={() => onChangeLineFilterMode('all')}
              title="Exibir todas as linhas de amizades e rivalidades"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                lineFilterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linhas: Todas
            </button>
            <button
              onClick={() => onChangeLineFilterMode('amizades')}
              title="Exibir apenas linhas de amizades e alianças"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                lineFilterMode === 'amizades' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5 text-cyan-400" />
              <span>Alianças</span>
            </button>
            <button
              onClick={() => onChangeLineFilterMode('rivalidades')}
              title="Exibir apenas linhas de rivalidades"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                lineFilterMode === 'rivalidades' ? 'bg-rose-950 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-400" />
              <span>Rivais</span>
            </button>
            <button
              onClick={() => onChangeLineFilterMode('none')}
              title="Ocultar linhas para visualização ultra limpa (mostra apenas ao clicar)"
              className={`px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                lineFilterMode === 'none' ? 'bg-amber-950 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5 text-amber-400" />
              <span>Sem Linhas</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[160px] sm:min-w-[200px] flex-1 sm:flex-initial">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar torcida, clube..."
              className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-8 pr-7 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs px-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Reset Filter Button */}
          {(selectedTorcidaId || selectedBloc !== 'all' || selectedUfFilter || searchQuery || lineFilterMode !== 'all') && (
            <button
              onClick={onResetView}
              className="px-2.5 py-2 rounded-xl text-xs font-bold bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700/60 flex items-center gap-1.5 transition-all"
              title="Limpar todos os filtros e seleções"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpar</span>
            </button>
          )}

          {/* Button to Open the Side Drawer with All Lists & Derbies */}
          <button
            onClick={onOpenDrawer}
            className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-900/30 transition-all cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Catálogo & Listas</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-950/70 text-[10px] font-black text-cyan-200">
              {totalTorcidasCount}
            </span>
          </button>

          {/* ZIP Download Modal Trigger */}
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold bg-emerald-950/90 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer"
            title="Baixar ZIP completo do projeto para importar no Antigravity"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Baixar ZIP</span>
          </button>

        </div>

      </div>

      {/* Export / Download Modal */}
      <DownloadModal 
        isOpen={isDownloadModalOpen} 
        onClose={() => setIsDownloadModalOpen(false)} 
      />
    </header>
  );
};
