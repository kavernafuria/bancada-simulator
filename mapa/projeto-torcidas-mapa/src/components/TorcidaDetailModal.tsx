import React from 'react';
import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType } from '../types';
import { BLOC_INFO } from '../utils/torcidasStorage';
import { Shield, Users, HeartHandshake, Swords, Calendar, MapPin, X, ArrowRight, Edit3, Trash2 } from 'lucide-react';

interface TorcidaDetailModalProps {
  torcida: TorcidaNode | null;
  allTorcidas: TorcidaNode[];
  connections: NetworkConnection[];
  onClose: () => void;
  onSelectTorcida: (id: string) => void;
  onOpenEditorModal?: (torcidaId: string) => void;
  onRemoveConnection?: (connectionId: string) => void;
}

export const TorcidaDetailModal: React.FC<TorcidaDetailModalProps> = ({
  torcida,
  allTorcidas,
  connections,
  onClose,
  onSelectTorcida,
  onOpenEditorModal,
  onRemoveConnection,
}) => {
  if (!torcida) return null;

  // Find all alliances
  const alliances = connections
    .filter(
      (c) =>
        c.type === 'amizade' && (c.source === torcida.id || c.target === torcida.id)
    )
    .map((c) => {
      const partnerId = c.source === torcida.id ? c.target : c.source;
      return {
        torcida: allTorcidas.find((t) => t.id === partnerId),
        connection: c,
      };
    })
    .filter((item): item is { torcida: TorcidaNode; connection: NetworkConnection } => Boolean(item.torcida));

  // Find all rivalries
  const rivalries = connections
    .filter(
      (c) =>
        (c.type === 'rivalidade' || c.type === 'historica' || c.type === 'classico') &&
        (c.source === torcida.id || c.target === torcida.id)
    )
    .map((c) => {
      const rivalId = c.source === torcida.id ? c.target : c.source;
      return {
        torcida: allTorcidas.find((t) => t.id === rivalId),
        connection: c,
      };
    })
    .filter((item): item is { torcida: TorcidaNode; connection: NetworkConnection } => Boolean(item.torcida));

  const blocInfo = BLOC_INFO[torcida.bloc] || {
    name: torcida.blocName,
    color: '#3b82f6',
    badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon with Club Colors */}
        <div 
          className="absolute top-0 left-0 right-0 h-3"
          style={{
            background: `linear-gradient(90deg, ${torcida.clubColors.primary} 0%, ${torcida.clubColors.secondary || torcida.clubColors.primary} 100%)`
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title and Club Info */}
        <div className="flex items-start gap-4 mt-2 mb-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-lg shrink-0 text-white"
            style={{ 
              backgroundColor: torcida.clubColors.primary,
              borderColor: blocInfo.color
            }}
          >
            <Shield className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                {torcida.uf} • {torcida.city}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${blocInfo.badgeClass}`}>
                {blocInfo.name}
              </span>
            </div>
            
            <h3 className="text-xl font-extrabold text-white mt-1 uppercase font-['Syne',sans-serif]">
              {torcida.name}
            </h3>
            <p className="text-sm font-semibold text-slate-300">
              Clube: <span className="text-white">{torcida.club}</span>
              {torcida.founded && (
                <span className="text-slate-400 font-normal ml-3">
                  • Fundação: {torcida.founded}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Quick Edit Action Banner */}
        {onOpenEditorModal && (
          <div className="flex items-center justify-between bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl mb-3">
            <span className="text-xs text-slate-300">
              Deseja modificar a aliança, adicionar ou remover amizades/rivais?
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenEditorModal(torcida.id);
              }}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-extrabold shadow transition-all shrink-0 ml-2"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Gerenciar Relações</span>
            </button>
          </div>
        )}

        {/* Informative description */}
        {torcida.description && (
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/50 p-3 rounded-xl border border-slate-800 mb-4">
            {torcida.description}
          </p>
        )}

        <div className="overflow-y-auto pr-1 space-y-4 flex-1 custom-scrollbar">
          {/* Alliances Network */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-black tracking-wider text-cyan-300 uppercase">
                  Alianças e Amizades no Mapa ({alliances.length})
                </h4>
              </div>
            </div>

            {alliances.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg">
                Rede de relações autônoma ou conexões locais independentes.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {alliances.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-center justify-between group"
                  >
                    <button
                      onClick={() => {
                        if (item.torcida) {
                          onSelectTorcida(item.torcida.id);
                        }
                      }}
                      className="text-left flex-1 truncate pr-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 truncate">
                          {item.torcida?.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                          {item.torcida?.uf}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {item.torcida?.club}
                      </p>
                    </button>

                    {onRemoveConnection && (
                      <button
                        onClick={() => onRemoveConnection(item.connection.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-all shrink-0"
                        title={`Remover amizade`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Rivalries & Derbies */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400" />
                <h4 className="text-xs font-black tracking-wider text-rose-300 uppercase">
                  Rivalidades Tradicionais e Clássicos ({rivalries.length})
                </h4>
              </div>
            </div>

            {rivalries.length === 0 ? (
              <p className="text-xs text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg">
                Sem rivalidade de alta escala cadastrada no infográfico geral.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {rivalries.map((item, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/50 transition-all flex items-center justify-between group"
                  >
                    <button
                      onClick={() => {
                        if (item.torcida) {
                          onSelectTorcida(item.torcida.id);
                        }
                      }}
                      className="text-left flex-1 truncate pr-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200 group-hover:text-rose-300 truncate">
                          {item.torcida?.name}
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 shrink-0 ml-1">
                          {item.torcida?.uf}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                        {item.torcida?.club} • {item.connection.label || 'Clássico Regional'}
                      </p>
                    </button>

                    {onRemoveConnection && (
                      <button
                        onClick={() => onRemoveConnection(item.connection.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-all shrink-0"
                        title={`Remover rivalidade`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Relacionamento esportivo e histórico</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            Voltar ao Mapa
          </button>
        </div>
      </div>
    </div>
  );
};
