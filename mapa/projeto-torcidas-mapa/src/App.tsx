import React, { useState, useMemo } from 'react';
import { 
  TORCIDAS_DATABASE, 
  NETWORK_CONNECTIONS, 
  DERBIES_DATABASE, 
  SPOTLIGHT_CARDS 
} from './data/torcidasData';
import { 
  loadSavedTorcidas, 
  loadSavedConnections, 
  saveTorcidasToStorage, 
  saveConnectionsToStorage, 
  resetCustomTorcidasStorage, 
  hasCustomStorage,
  BLOC_INFO 
} from './utils/torcidasStorage';
import { TorcidaNode, NetworkConnection, AllianceBloc, ConnectionType, Derby } from './types';
import { Header, LineFilterMode } from './components/Header';
import { BrazilMapVector } from './components/BrazilMapVector';
import { SideDrawerCatalog } from './components/SideDrawerCatalog';
import { LeftPanel } from './components/LeftPanel';
import { RightPanel } from './components/RightPanel';
import { MiniCards } from './components/MiniCards';
import { LegendAndFooter } from './components/LegendAndFooter';
import { TorcidaDetailModal } from './components/TorcidaDetailModal';
import { TorcidaRelationEditorModal } from './components/TorcidaRelationEditorModal';
import { PresentationCanvas } from './components/PresentationCanvas';
import { CollaboratorAuthModal } from './components/CollaboratorAuthModal';
import { SearchModal } from './components/SearchModal';
import { 
  isCollaboratorAuthenticated, 
  fetchMapDataOnline, 
  updateTorcidaBlocOnline, 
  addConnectionOnline 
} from './utils/torcidasApi';
import { ChevronDown, ChevronUp, Layers, Search } from 'lucide-react';

export default function App() {
  // Dynamic editable data state
  const [torcidas, setTorcidas] = useState<TorcidaNode[]>(() => loadSavedTorcidas());
  const [connections, setConnections] = useState<NetworkConnection[]>(() => loadSavedConnections());
  const [hasCustomChanges, setHasCustomChanges] = useState<boolean>(() => hasCustomStorage());

  // Collaboration and Auth State
  const [isCollaborator, setIsCollaborator] = useState<boolean>(() => isCollaboratorAuthenticated());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isOnlineServer, setIsOnlineServer] = useState<boolean>(false);

  // Quick Search Modal State
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);

  // Load online data on mount
  React.useEffect(() => {
    fetchMapDataOnline().then((data) => {
      if (data.isOnline) {
        setTorcidas(data.torcidas);
        setConnections(data.connections);
        setIsOnlineServer(true);
      }
    });
  }, []);

  // Interactive filters and focus
  const [selectedTorcidaId, setSelectedTorcidaId] = useState<string | null>(null);
  const [hoveredTorcidaId, setHoveredTorcidaId] = useState<string | null>(null);
  const [selectedDerby, setSelectedDerby] = useState<Derby | null>(null);
  const [selectedBloc, setSelectedBloc] = useState<AllianceBloc | 'all' | 'rivalries'>('all');
  const [selectedUfFilter, setSelectedUfFilter] = useState<string | null>(null);
  const [lineFilterMode, setLineFilterMode] = useState<LineFilterMode>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // UI states
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [showExtendedTables, setShowExtendedTables] = useState<boolean>(false);
  const [presentationMode, setPresentationMode] = useState<boolean>(false);
  const [modalTorcidaId, setModalTorcidaId] = useState<string | null>(null);
  const [editorModalTorcidaId, setEditorModalTorcidaId] = useState<string | null>(null);

  // Available UFs list for header dropdown
  const availableUfs = useMemo(() => {
    return Array.from(new Set(torcidas.map((t) => t.uf))).sort();
  }, [torcidas]);

  // Active torcida object for modal
  const modalTorcida = useMemo(() => {
    if (!modalTorcidaId) return null;
    return torcidas.find((t) => t.id === modalTorcidaId) || null;
  }, [modalTorcidaId, torcidas]);

  // Active torcida object for editor modal
  const editorModalTorcida = useMemo(() => {
    if (!editorModalTorcidaId) return null;
    return torcidas.find((t) => t.id === editorModalTorcidaId) || null;
  }, [editorModalTorcidaId, torcidas]);

  const handleOpenEditorModal = (torcidaId: string) => {
    if (!isCollaborator) {
      setIsAuthModalOpen(true);
      return;
    }
    setEditorModalTorcidaId(torcidaId);
  };

  // Handlers for modifying alliances and connections
  const handleChangeBloc = (torcidaId: string, newBloc: AllianceBloc) => {
    if (!isCollaborator) {
      setIsAuthModalOpen(true);
      return;
    }

    const updated = torcidas.map((t) => {
      if (t.id === torcidaId) {
        return {
          ...t,
          bloc: newBloc,
          blocName: BLOC_INFO[newBloc]?.name || t.blocName,
        };
      }
      return t;
    });

    setTorcidas(updated);
    saveTorcidasToStorage(updated);
    setHasCustomChanges(true);

    // Sync online with backend API
    updateTorcidaBlocOnline(torcidaId, newBloc).then((res) => {
      if (res.success && res.torcidas) {
        setTorcidas(res.torcidas);
      }
    });
  };

  const handleAddConnection = (
    sourceId: string,
    targetId: string,
    type: ConnectionType,
    label?: string
  ) => {
    if (!isCollaborator) {
      setIsAuthModalOpen(true);
      return;
    }

    const exists = connections.some(
      (c) =>
        ((c.source === sourceId && c.target === targetId) ||
         (c.source === targetId && c.target === sourceId)) &&
        c.type === type
    );

    if (exists) return;

    const newConnection: NetworkConnection = {
      id: `custom_conn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      source: sourceId,
      target: targetId,
      type,
      label: label || (type === 'amizade' ? 'Aliança / Amizade' : 'Rivalidade Direta'),
    };

    const updated = [...connections, newConnection];
    setConnections(updated);
    saveConnectionsToStorage(updated);
    setHasCustomChanges(true);

    // Sync online with backend API
    addConnectionOnline(sourceId, targetId, type, label).then((res) => {
      if (res.success && res.connections) {
        setConnections(res.connections);
      }
    });
  };

  const handleRemoveConnection = (connectionId: string) => {
    const updated = connections.filter((c) => c.id !== connectionId);
    setConnections(updated);
    saveConnectionsToStorage(updated);
    setHasCustomChanges(true);
  };

  const handleResetCustomStorage = () => {
    resetCustomTorcidasStorage();
    setTorcidas(TORCIDAS_DATABASE);
    setConnections(NETWORK_CONNECTIONS);
    setHasCustomChanges(false);
  };

  // Handle selecting a torcida
  const handleSelectTorcida = (id: string) => {
    if (!id) {
      setSelectedTorcidaId(null);
      return;
    }
    setSelectedTorcidaId(id);
    setSelectedDerby(null);
  };


  // Handle selecting a derby
  const handleSelectDerby = (derby: Derby) => {
    if (selectedDerby?.id === derby.id) {
      setSelectedDerby(null);
    } else {
      setSelectedDerby(derby);
      setSelectedTorcidaId(null);
    }
  };

  // Reset all filters and focus
  const handleResetView = () => {
    setSelectedTorcidaId(null);
    setHoveredTorcidaId(null);
    setSelectedDerby(null);
    setSelectedBloc('all');
    setSelectedUfFilter(null);
    setLineFilterMode('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#060910] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif] selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Editorial Header with Filters, Line Toggles, UF Dropdown and Drawer Trigger */}
      <Header
        selectedBloc={selectedBloc}
        onSelectBloc={(bloc) => {
          setSelectedBloc(bloc);
          setSelectedTorcidaId(null);
          setSelectedDerby(null);
        }}
        selectedUfFilter={selectedUfFilter}
        onSelectUfFilter={setSelectedUfFilter}
        availableUfs={availableUfs}
        lineFilterMode={lineFilterMode}
        onChangeLineFilterMode={setLineFilterMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        presentationMode={presentationMode}
        onTogglePresentation={() => setPresentationMode(!presentationMode)}
        onResetView={handleResetView}
        selectedTorcidaId={selectedTorcidaId}
        hasCustomChanges={hasCustomChanges}
        onResetCustomStorage={handleResetCustomStorage}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        totalTorcidasCount={torcidas.length}
        isCollaborator={isCollaborator}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content Layout: Centered, Focused on the Map */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto p-3 sm:p-4 lg:p-6 flex flex-col gap-5">
        
        {/* ================= HERO SECTION: CLEAN, FULL-WIDTH INTERACTIVE MAP ================= */}
        <section className="w-full">
          <BrazilMapVector
            torcidas={torcidas}
            connections={connections}
            selectedTorcidaId={selectedTorcidaId}
            hoveredTorcidaId={hoveredTorcidaId}
            selectedDerby={selectedDerby}
            selectedBloc={selectedBloc}
            lineFilterMode={lineFilterMode}
            searchQuery={searchQuery}
            selectedUfFilter={selectedUfFilter}
            hasCustomChanges={hasCustomChanges}
            onSelectTorcida={handleSelectTorcida}
            onHoverTorcida={setHoveredTorcidaId}
            onSelectUfFilter={setSelectedUfFilter}
            onChangeBloc={handleChangeBloc}
            onOpenEditorModal={handleOpenEditorModal}
            onResetCustomStorage={handleResetCustomStorage}
            onOpenDrawer={() => setIsDrawerOpen(true)}
          />
        </section>

        {/* ================= OPTIONAL COLLAPSIBLE SECTION: DETAILED TABLES & REGIONAL SPOTLIGHTS ================= */}
        <section className="w-full border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowExtendedTables(!showExtendedTables)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{showExtendedTables ? 'Ocultar Listas & Análises Históricas' : 'Ver Listas Detalhadas & Análises Históricas'}</span>
              {showExtendedTables ? <ChevronUp className="w-4 h-4 ml-1 text-slate-400" /> : <ChevronDown className="w-4 h-4 ml-1 text-slate-400" />}
            </button>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold underline"
            >
              Abrir Catálogo Lateral →
            </button>
          </div>

          {showExtendedTables && (
            <div className="space-y-6 mt-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Left: Complete List of Blocos de Amizade */}
                <div className="w-full">
                  <LeftPanel
                    torcidas={torcidas}
                    selectedTorcidaId={selectedTorcidaId}
                    onSelectTorcida={handleSelectTorcida}
                    selectedBloc={selectedBloc}
                    onSelectBloc={(bloc) => setSelectedBloc(bloc)}
                  />
                </div>

                {/* Right: Complete List of Rivalidades e Clássicos */}
                <div className="w-full">
                  <RightPanel
                    derbies={DERBIES_DATABASE}
                    selectedDerbyId={selectedDerby ? selectedDerby.id : null}
                    onSelectDerby={handleSelectDerby}
                  />
                </div>
              </div>

              {/* 6 Regional Spotlight Mini-Cards */}
              <MiniCards
                cards={SPOTLIGHT_CARDS}
                onSelectTorcidaByName={(name) => {
                  const match = torcidas.find(
                    (t) =>
                      t.name.toLowerCase().includes(name.toLowerCase()) ||
                      name.toLowerCase().includes(t.shortName?.toLowerCase() || '---')
                  );
                  if (match) handleSelectTorcida(match.id);
                }}
              />
            </div>
          )}
        </section>

        {/* Cartographic Legend & Source Reference */}
        <LegendAndFooter />

      </main>

      {/* Slide-Over Side Drawer Catalog (On Demand) */}
      <SideDrawerCatalog
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        torcidas={torcidas}
        derbies={DERBIES_DATABASE}
        selectedTorcidaId={selectedTorcidaId}
        selectedDerby={selectedDerby}
        selectedBloc={selectedBloc}
        selectedUfFilter={selectedUfFilter}
        onSelectTorcida={handleSelectTorcida}
        onSelectDerby={handleSelectDerby}
        onSelectBloc={setSelectedBloc}
        onSelectUfFilter={setSelectedUfFilter}
      />

      {/* Interactive Torcida Deep Detail Modal */}
      {modalTorcida && (
        <TorcidaDetailModal
          torcida={modalTorcida}
          allTorcidas={torcidas}
          connections={connections}
          onClose={() => setModalTorcidaId(null)}
          onSelectTorcida={(id) => {
            setSelectedTorcidaId(id);
            setModalTorcidaId(id);
          }}
          onOpenEditorModal={handleOpenEditorModal}
          onRemoveConnection={handleRemoveConnection}
        />
      )}

      {/* Interactive Relation & Alliance Editor Modal */}
      {editorModalTorcida && (
        <TorcidaRelationEditorModal
          torcida={editorModalTorcida}
          allTorcidas={torcidas}
          connections={connections}
          isOpen={Boolean(editorModalTorcidaId)}
          onClose={() => setEditorModalTorcidaId(null)}
          onChangeBloc={handleChangeBloc}
          onAddConnection={handleAddConnection}
          onRemoveConnection={handleRemoveConnection}
          onSelectTorcida={(id) => {
            setSelectedTorcidaId(id);
            setEditorModalTorcidaId(id);
          }}
        />
      )}

      {/* 16:9 Fullscreen Poster Presentation Mode */}
      {presentationMode && (
        <PresentationCanvas
          torcidas={torcidas}
          connections={connections}
          derbies={DERBIES_DATABASE}
          spotlightCards={SPOTLIGHT_CARDS}
          selectedTorcidaId={selectedTorcidaId}
          hoveredTorcidaId={hoveredTorcidaId}
          selectedDerby={selectedDerby}
          onSelectTorcida={handleSelectTorcida}
          onHoverTorcida={setHoveredTorcidaId}
          onSelectDerby={handleSelectDerby}
          onExit={() => setPresentationMode(false)}
        />
      )}

      {/* Floating Corner Magnifying Glass Search Trigger */}
      <button
        onClick={() => setIsSearchModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-xl shadow-cyan-950/60 border border-cyan-400/40 transition-all hover:scale-110 active:scale-95 group"
        title="Pesquisar torcida no mapa"
      >
        <Search className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
      </button>

      {/* Quick Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        torcidas={torcidas}
        onSelectTorcida={handleSelectTorcida}
      />

      {/* Collaborator Password Auth Modal */}
      <CollaboratorAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsCollaborator(true)}
      />

    </div>
  );
}
