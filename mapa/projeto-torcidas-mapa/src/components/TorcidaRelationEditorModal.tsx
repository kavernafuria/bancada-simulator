import React, { useState, useMemo } from 'react';
import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType } from '../types';
import { BLOC_INFO } from '../utils/torcidasStorage';
import { 
  Shield, 
  HeartHandshake, 
  Swords, 
  Plus, 
  Trash2, 
  X, 
  Check, 
  Search, 
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface TorcidaRelationEditorModalProps {
  torcida: TorcidaNode | null;
  allTorcidas: TorcidaNode[];
  connections: NetworkConnection[];
  isOpen: boolean;
  onClose: () => void;
  onChangeBloc: (torcidaId: string, newBloc: AllianceBloc) => void;
  onAddConnection: (sourceId: string, targetId: string, type: ConnectionType, label?: string) => void;
  onRemoveConnection: (connectionId: string) => void;
  onSelectTorcida?: (id: string) => void;
}

export const TorcidaRelationEditorModal: React.FC<TorcidaRelationEditorModalProps> = ({
  torcida,
  allTorcidas,
  connections,
  isOpen,
  onClose,
  onChangeBloc,
  onAddConnection,
  onRemoveConnection,
  onSelectTorcida,
}) => {
  const [allianceSearch, setAllianceSearch] = useState('');
  const [rivalrySearch, setRivalrySearch] = useState('');
  const [isAddingAlliance, setIsAddingAlliance] = useState(false);
  const [isAddingRivalry, setIsAddingRivalry] = useState(false);
  const [rivalryLabel, setRivalryLabel] = useState('Rivalidade Direta');

  if (!isOpen || !torcida) return null;

  // Active Alliances for this torcida
  const activeAlliances = connections
    .filter(
      (c) =>
        c.type === 'amizade' && (c.source === torcida.id || c.target === torcida.id)
    )
    .map((c) => {
      const otherId = c.source === torcida.id ? c.target : c.source;
      return {
        connection: c,
        torcida: allTorcidas.find((t) => t.id === otherId),
      };
    })
    .filter((item): item is { connection: NetworkConnection; torcida: TorcidaNode } => Boolean(item.torcida));

  // Active Rivalries for this torcida
  const activeRivalries = connections
    .filter(
      (c) =>
        (c.type === 'rivalidade' || c.type === 'historica' || c.type === 'classico') &&
        (c.source === torcida.id || c.target === torcida.id)
    )
    .map((c) => {
      const otherId = c.source === torcida.id ? c.target : c.source;
      return {
        connection: c,
        torcida: allTorcidas.find((t) => t.id === otherId),
      };
    })
    .filter((item): item is { connection: NetworkConnection; torcida: TorcidaNode } => Boolean(item.torcida));

  // Set of IDs already allied or rival
  const alliedIds = new Set(activeAlliances.map((a) => a.torcida.id));
  const rivalIds = new Set(activeRivalries.map((r) => r.torcida.id));

  // Torcidas available to add as alliance
  const availableForAlliance = allTorcidas.filter((t) => {
    if (t.id === torcida.id) return false;
    if (alliedIds.has(t.id)) return false;
    if (!allianceSearch) return true;
    const q = allianceSearch.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      t.club.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.uf.toLowerCase().includes(q)
    );
  });

  // Torcidas available to add as rivalry
  const availableForRivalry = allTorcidas.filter((t) => {
    if (t.id === torcida.id) return false;
    if (rivalIds.has(t.id)) return false;
    if (!rivalrySearch) return true;
    const q = rivalrySearch.toLowerCase().trim();
    return (
      t.name.toLowerCase().includes(q) ||
      t.club.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.uf.toLowerCase().includes(q)
    );
  });

  const handleAddAllianceConfirm = (targetTorcida: TorcidaNode) => {
    onAddConnection(torcida.id, targetTorcida.id, 'amizade', `Aliança: ${torcida.name} & ${targetTorcida.name}`);
    setIsAddingAlliance(false);
    setAllianceSearch('');
  };

  const handleAddRivalryConfirm = (targetTorcida: TorcidaNode) => {
    onAddConnection(torcida.id, targetTorcida.id, 'rivalidade', rivalryLabel || `Rivalidade: ${torcida.club} vs ${targetTorcida.club}`);
    setIsAddingRivalry(false);
    setRivalrySearch('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl overflow-hidden relative max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Color Band */}
        <div 
          className="absolute top-0 left-0 right-0 h-3"
          style={{
            background: `linear-gradient(90deg, ${torcida.clubColors.primary} 0%, ${torcida.clubColors.secondary || torcida.clubColors.primary} 100%)`
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Torcida Header */}
        <div className="flex items-start gap-4 mt-2 mb-4 pb-4 border-b border-slate-800">
          <div 
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-lg shrink-0 text-white"
            style={{ 
              backgroundColor: torcida.clubColors.primary,
              borderColor: torcida.clubColors.secondary || '#ffffff'
            }}
          >
            {torcida.uf}
          </div>

          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                {torcida.club}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                {torcida.city} • {torcida.uf}
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1 uppercase font-['Syne',sans-serif]">
              {torcida.name}
            </h2>
            <p className="text-xs text-slate-400">
              Personalize o bloco de aliança, amizades e rivalidades desta torcida.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1 custom-scrollbar">
          
          {/* ================= 1. ALLIANCE BLOC SELECTOR ================= */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black tracking-wider text-slate-200 uppercase font-['Syne',sans-serif]">
                  1. Aliança / Bloco Principal
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-semibold">
                Clique para alterar
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {(Object.keys(BLOC_INFO) as AllianceBloc[]).map((blocKey) => {
                const info = BLOC_INFO[blocKey];
                const isCurrent = torcida.bloc === blocKey;

                return (
                  <button
                    key={blocKey}
                    onClick={() => onChangeBloc(torcida.id, blocKey)}
                    className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                      isCurrent
                        ? `${info.badgeClass} ring-2 ring-cyan-400 font-bold shadow-lg`
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: info.color }}
                      />
                      <span className="text-xs font-extrabold">{info.name}</span>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-cyan-300" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ================= 2. ALLIANCES MANAGEMENT ================= */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-cyan-900/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-black tracking-wider text-cyan-300 uppercase font-['Syne',sans-serif]">
                  2. Amizades e Aliadas ({activeAlliances.length})
                </h3>
              </div>

              {!isAddingAlliance && (
                <button
                  onClick={() => {
                    setIsAddingAlliance(true);
                    setIsAddingRivalry(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-cyan-300 bg-cyan-950 hover:bg-cyan-900 px-3 py-1.5 rounded-xl border border-cyan-500/50 shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Amizade</span>
                </button>
              )}
            </div>

            {/* Inline Add Alliance Picker */}
            {isAddingAlliance && (
              <div className="mb-4 p-3 bg-slate-900 border border-cyan-500/60 rounded-xl animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-cyan-300">
                    Selecione a torcida para conectar como Amizade:
                  </span>
                  <button
                    onClick={() => setIsAddingAlliance(false)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={allianceSearch}
                    onChange={(e) => setAllianceSearch(e.target.value)}
                    placeholder="Filtrar por torcida, clube ou estado (UF)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    autoFocus
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {availableForAlliance.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2">Nenhuma torcida encontrada.</p>
                  ) : (
                    availableForAlliance.slice(0, 15).map((other) => (
                      <button
                        key={other.id}
                        onClick={() => handleAddAllianceConfirm(other)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-500/50 flex items-center justify-between text-xs transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: other.clubColors.primary }}
                          />
                          <span className="font-bold text-slate-200 group-hover:text-cyan-300">
                            {other.name}
                          </span>
                          <span className="text-[10px] text-slate-400">({other.club})</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {other.uf}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* List of active alliances with delete buttons */}
            {activeAlliances.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-900/50 rounded-xl">
                Nenhuma amizade cadastrada para esta torcida. Clique em "+ Adicionar Amizade" para conectar.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeAlliances.map(({ connection, torcida: ally }) => (
                  <div
                    key={connection.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ally.clubColors.primary }}
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-cyan-300">
                          {ally.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {ally.club} • {ally.uf}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveConnection(connection.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-all shrink-0"
                      title={`Remover amizade com ${ally.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ================= 3. RIVALRIES MANAGEMENT ================= */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-rose-900/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Swords className="w-4 h-4 text-rose-400" />
                <h3 className="text-xs font-black tracking-wider text-rose-300 uppercase font-['Syne',sans-serif]">
                  3. Rivalidades e Clássicos ({activeRivalries.length})
                </h3>
              </div>

              {!isAddingRivalry && (
                <button
                  onClick={() => {
                    setIsAddingRivalry(true);
                    setIsAddingAlliance(false);
                  }}
                  className="flex items-center gap-1 text-xs font-bold text-rose-300 bg-rose-950 hover:bg-rose-900 px-3 py-1.5 rounded-xl border border-rose-500/50 shadow transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar Rivalidade</span>
                </button>
              )}
            </div>

            {/* Inline Add Rivalry Picker */}
            {isAddingRivalry && (
              <div className="mb-4 p-3 bg-slate-900 border border-rose-500/60 rounded-xl animate-in fade-in">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-rose-300">
                    Selecione a torcida para cadastrar como Rival:
                  </span>
                  <button
                    onClick={() => setIsAddingRivalry(false)}
                    className="text-slate-400 hover:text-white text-xs p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={rivalrySearch}
                      onChange={(e) => setRivalrySearch(e.target.value)}
                      placeholder="Filtrar rival por nome, clube ou UF..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                      autoFocus
                    />
                  </div>

                  <input
                    type="text"
                    value={rivalryLabel}
                    onChange={(e) => setRivalryLabel(e.target.value)}
                    placeholder="Rótulo (ex: Clássico Regional, Duelo Interestadual)"
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar pr-1">
                  {availableForRivalry.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-2">Nenhuma torcida encontrada.</p>
                  ) : (
                    availableForRivalry.slice(0, 15).map((other) => (
                      <button
                        key={other.id}
                        onClick={() => handleAddRivalryConfirm(other)}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg bg-slate-950/80 hover:bg-rose-950/80 border border-slate-800 hover:border-rose-500/50 flex items-center justify-between text-xs transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: other.clubColors.primary }}
                          />
                          <span className="font-bold text-slate-200 group-hover:text-rose-300">
                            {other.name}
                          </span>
                          <span className="text-[10px] text-slate-400">({other.club})</span>
                        </div>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                          {other.uf}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* List of active rivalries with delete buttons */}
            {activeRivalries.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-2 bg-slate-900/50 rounded-xl">
                Nenhuma rivalidade cadastrada para esta torcida. Clique em "+ Adicionar Rivalidade" para conectar.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeRivalries.map(({ connection, torcida: rival }) => (
                  <div
                    key={connection.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between hover:border-rose-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: rival.clubColors.primary }}
                      />
                      <div className="truncate">
                        <p className="text-xs font-bold text-slate-200 truncate group-hover:text-rose-300">
                          {rival.name}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {rival.club} • {connection.label || 'Rivalidade'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveConnection(connection.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition-all shrink-0"
                      title={`Remover rivalidade com ${rival.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>As modificações atualizam o mapa e são salvas automaticamente.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
          >
            Concluir Edição
          </button>
        </div>

      </div>
    </div>
  );
};
