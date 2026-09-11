import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Shield, MapPin, ChevronRight, Sparkles } from 'lucide-react';
import { TorcidaNode } from '../types';
import { BLOC_INFO } from '../utils/torcidasStorage';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  torcidas: TorcidaNode[];
  onSelectTorcida: (id: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  torcidas,
  onSelectTorcida,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = torcidas.filter((t) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      t.name.toLowerCase().includes(q) ||
      (t.shortName && t.shortName.toLowerCase().includes(q)) ||
      t.club.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.uf.toLowerCase().includes(q) ||
      t.blocName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-[#0b101b] border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-800 bg-[#0e1524] flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar torcida por nome, clube, cidade ou estado (ex: Mancha, SP, Gaviões, Rio)..."
            className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Search Results Count */}
        <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            {query.trim()
              ? `${filtered.length} torcida(s) encontrada(s)`
              : 'Digite algo para pesquisar torcidas no mapa'}
          </span>
          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400">
            Busca Rápida
          </span>
        </div>

        {/* Results List */}
        <div className="p-3 overflow-y-auto space-y-2 custom-scrollbar flex-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Nenhuma torcida encontrada para &quot;{query}&quot;
            </div>
          ) : (
            filtered.map((torcida) => {
              const blocInfo = BLOC_INFO[torcida.bloc];
              return (
                <button
                  key={torcida.id}
                  onClick={() => {
                    onSelectTorcida(torcida.id);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-inner border border-white/20"
                      style={{
                        backgroundColor: torcida.clubColors.primary,
                        color: torcida.clubColors.secondary,
                      }}
                    >
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                          {torcida.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${blocInfo?.badgeClass || 'bg-slate-800 text-slate-300'}`}>
                          {torcida.uf}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="font-semibold text-slate-300">{torcida.club}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          {torcida.city}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      {blocInfo?.shortName || torcida.blocName}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
