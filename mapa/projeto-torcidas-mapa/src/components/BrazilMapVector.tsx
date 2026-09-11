import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { TorcidaNode, NetworkConnection, Derby, AllianceBloc } from '../types';
import { BRAZIL_OUTLINE_PATH, BRAZIL_ICON_STROKE_SEGMENTS, CITY_COORDINATES } from '../data/brazilMapSilhouette';
import { BLOC_INFO } from '../utils/torcidasStorage';
import { LineFilterMode } from './Header';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  HeartHandshake, 
  Swords, 
  MapPin, 
  Sparkles,
  X,
  Edit3,
  ChevronDown,
  Layers,
  MousePointer,
  Compass
} from 'lucide-react';

interface BrazilMapVectorProps {
  torcidas: TorcidaNode[];
  connections: NetworkConnection[];
  selectedTorcidaId: string | null;
  hoveredTorcidaId: string | null;
  selectedDerby: Derby | null;
  selectedBloc: AllianceBloc | 'all' | 'rivalries';
  lineFilterMode?: LineFilterMode;
  searchQuery: string;
  selectedUfFilter?: string | null;
  hasCustomChanges?: boolean;
  onSelectTorcida: (id: string) => void;
  onHoverTorcida: (id: string | null) => void;
  onSelectUfFilter?: (uf: string | null) => void;
  onChangeBloc?: (torcidaId: string, newBloc: AllianceBloc) => void;
  onOpenEditorModal?: (torcidaId: string) => void;
  onResetCustomStorage?: () => void;
  onOpenDrawer?: () => void;
}

interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

interface PlacedLabel {
  torcidaId: string;
  pillX: number;
  pillY: number;
  pillWidth: number;
  pillHeight: number;
  textX: number;
  textY: number;
  textAnchor: 'start' | 'middle' | 'end';
  fontSize: number;
  isHoveredOrSelected: boolean;
}

export const BrazilMapVector: React.FC<BrazilMapVectorProps> = ({
  torcidas,
  connections,
  selectedTorcidaId,
  hoveredTorcidaId,
  selectedDerby,
  selectedBloc,
  lineFilterMode = 'all',
  searchQuery,
  selectedUfFilter = null,
  hasCustomChanges = false,
  onSelectTorcida,
  onHoverTorcida,
  onSelectUfFilter,
  onChangeBloc,
  onOpenEditorModal,
  onResetCustomStorage,
  onOpenDrawer,
}) => {
  // Zoom & Pan state supporting up to 20x zoom with smooth wheel and precision
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showBlocDropdown, setShowBlocDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Active torcida (clicked or hovered)
  const activeTorcidaId = selectedTorcidaId || hoveredTorcidaId;
  const selectedTorcida = useMemo(() => {
    return torcidas.find((t) => t.id === selectedTorcidaId) || null;
  }, [torcidas, selectedTorcidaId]);

  // Alliances and Rivals connected to active torcida
  const activeAlliances = useMemo(() => {
    if (!activeTorcidaId) return [];
    return connections
      .filter((c) => c.type === 'amizade' && (c.source === activeTorcidaId || c.target === activeTorcidaId))
      .map((c) => {
        const otherId = c.source === activeTorcidaId ? c.target : c.source;
        return {
          torcida: torcidas.find((t) => t.id === otherId),
          connection: c
        };
      })
      .filter((item): item is { torcida: TorcidaNode; connection: NetworkConnection } => Boolean(item.torcida));
  }, [activeTorcidaId, connections, torcidas]);

  const activeRivalries = useMemo(() => {
    if (!activeTorcidaId) return [];
    return connections
      .filter((c) => (c.type === 'rivalidade' || c.type === 'historica' || c.type === 'classico') && (c.source === activeTorcidaId || c.target === activeTorcidaId))
      .map((c) => {
        const otherId = c.source === activeTorcidaId ? c.target : c.source;
        return {
          torcida: torcidas.find((t) => t.id === otherId),
          connection: c
        };
      })
      .filter((item): item is { torcida: TorcidaNode; connection: NetworkConnection } => Boolean(item.torcida));
  }, [activeTorcidaId, connections, torcidas]);

  // Set of connected Torcida IDs (allies + rivals)
  const connectedTorcidaIds = useMemo(() => {
    const set = new Set<string>();
    activeAlliances.forEach((a) => set.add(a.torcida.id));
    activeRivalries.forEach((r) => set.add(r.torcida.id));
    return set;
  }, [activeAlliances, activeRivalries]);

  // Set of Torcida IDs that belong to the active selected Bloc
  const blocTorcidaIds = useMemo(() => {
    if (selectedBloc === 'all' || selectedBloc === 'rivalries') return null;
    return new Set(
      torcidas
        .filter((t) => t.bloc === selectedBloc || (t.secondaryBlocs && t.secondaryBlocs.includes(selectedBloc)))
        .map((t) => t.id)
    );
  }, [selectedBloc, torcidas]);

  // Derby Torcida IDs if a derby is selected
  const derbyTorcidaIds = useMemo(() => {
    if (!selectedDerby) return null;
    const match1 = torcidas.find((t) => t.club.toLowerCase().includes(selectedDerby.club1.toLowerCase()) || selectedDerby.club1.toLowerCase().includes(t.club.toLowerCase()));
    const match2 = torcidas.find((t) => t.club.toLowerCase().includes(selectedDerby.club2.toLowerCase()) || selectedDerby.club2.toLowerCase().includes(t.club.toLowerCase()));
    const set = new Set<string>();
    if (match1) set.add(match1.id);
    if (match2) set.add(match2.id);
    return set;
  }, [selectedDerby, torcidas]);

  // Visible Torcidas with Search and UF filter
  const visibleTorcidas = useMemo(() => {
    return torcidas.filter((t) => {
      if (selectedUfFilter && t.uf !== selectedUfFilter) return false;
      if (blocTorcidaIds && !blocTorcidaIds.has(t.id)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase().trim();
        return (
          t.name.toLowerCase().includes(q) ||
          t.club.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.uf.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [torcidas, selectedUfFilter, blocTorcidaIds, searchQuery]);

  // ================= PRECISE REAL GEOGRAPHIC COORDINATES =================
  // Keeps torcidas exactly locked in their real geographic state & city position inside the silhouette.
  // Group torcidas by city to calculate micro-offsets when multiple clubs share the same city
  const cityClusterMap = useMemo(() => {
    const map = new Map<string, string[]>();
    torcidas.forEach((t) => {
      const key = `${t.city}, ${t.uf}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t.id);
    });
    return map;
  }, [torcidas]);

  const getNodeCoordinates = useCallback((torcida: TorcidaNode, currentZoom: number) => {
    const key = `${torcida.city}, ${torcida.uf}`;
    const cityBase = CITY_COORDINATES[key];

    const baseX = cityBase ? cityBase.x : (torcida.mapX / 100) * 880 + 60;
    const baseY = cityBase ? cityBase.y : (torcida.mapY / 100) * 860 + 45;

    const cluster = cityClusterMap.get(key);
    if (!cluster || cluster.length <= 1) {
      return { x: baseX, y: baseY };
    }

    const index = cluster.indexOf(torcida.id);
    if (index === -1) return { x: baseX, y: baseY };

    const total = cluster.length;
    // Micro-radial offset: tight and controlled at base zoom, expands smoothly when zoomed in
    const spreadRadius = Math.min(6 + Math.max(0, currentZoom - 1) * 2.2, 16);
    const angle = (2 * Math.PI * index) / total;

    return {
      x: baseX + Math.cos(angle) * spreadRadius,
      y: baseY + Math.sin(angle) * spreadRadius,
    };
  }, [cityClusterMap]);

  // Calculate dynamic node scale compensation so nodes remain sharp and appropriately sized at 1x to 20x zoom
  const nodeScaleFactor = useMemo(() => {
    // As zoom goes from 1x to 20x, keep node circle radius visually comfortable
    return Math.max(0.22, 1 / Math.pow(zoom, 0.55));
  }, [zoom]);

  // ================= DYNAMIC VISIBILITY & ZERO OVERLAP LABEL PLACEMENT =================
  // Rule:
  // 1. Hovered or Selected torcidas ALWAYS show their label clearly at any zoom.
  // 2. Torcidas only show persistent labels if:
  //    - Zoom is sufficiently high (or it's a primary national torcida at medium zoom)
  //    - The label has ENOUGH space without overlapping any other visible label.
  // 3. As you zoom in up to 20x, the spatial distance in SVG coordinates expands and more names smoothly appear!
  const placedLabels = useMemo(() => {
    const results: PlacedLabel[] = [];
    const occupiedBoxes: BoundingBox[] = [];

    const doBoxesOverlap = (b1: BoundingBox, b2: BoundingBox, margin: number = 2) => {
      return !(
        b1.maxX + margin < b2.minX ||
        b1.minX - margin > b2.maxX ||
        b1.maxY + margin < b2.minY ||
        b1.minY - margin > b2.maxY
      );
    };

    // Calculate priority for each visible torcida
    const scoredTorcidas = visibleTorcidas.map((t) => {
      const isSelected = selectedTorcidaId === t.id;
      const isHovered = hoveredTorcidaId === t.id;
      const isConnected = connectedTorcidaIds.has(t.id);
      const isDerbyNode = derbyTorcidaIds?.has(t.id);
      const isSearchMatch = Boolean(searchQuery && searchQuery.trim().length > 0);

      let priority = 0;
      if (isHovered) priority += 10000;
      if (isSelected) priority += 9000;
      if (isDerbyNode) priority += 7000;
      if (isSearchMatch) priority += 6000;
      if (isConnected) priority += 5000;

      if (t.tier === 'nacional') priority += 400;
      else if (t.tier === 'regional') priority += 200;
      else priority += 100;

      return {
        torcida: t,
        priority,
        isHoveredOrSelected: isHovered || isSelected,
        isSearchMatch,
        isConnected,
        isDerbyNode
      };
    });

    // Sort by priority descending: user interacted items get placed first
    scoredTorcidas.sort((a, b) => b.priority - a.priority);

    scoredTorcidas.forEach(({ torcida, priority, isHoveredOrSelected, isSearchMatch, isConnected, isDerbyNode }) => {
      // Determine if this torcida is eligible to show a label at current zoom level
      // Zoom thresholds:
      // - Hover/Select: Zoom >= 1 (Always!)
      // - Search/Derby: Zoom >= 1.2
      // - Connected nodes: Zoom >= 1.8
      // - Tier Nacional: Zoom >= 2.4
      // - Tier Regional: Zoom >= 4.0
      // - Local/Other: Zoom >= 6.5
      let isEligible = isHoveredOrSelected;

      if (!isEligible) {
        if (isSearchMatch || isDerbyNode) {
          isEligible = zoom >= 1.2;
        } else if (isConnected) {
          isEligible = zoom >= 1.6;
        } else if (torcida.tier === 'nacional') {
          isEligible = zoom >= 2.2;
        } else if (torcida.tier === 'regional') {
          isEligible = zoom >= 3.8;
        } else {
          isEligible = zoom >= 6.0;
        }
      }

      if (!isEligible) return;

      const { x, y } = getNodeCoordinates(torcida, zoom);
      const labelText = torcida.shortName || torcida.name;
      
      // Calculate font size and pill dimensions in SVG coordinate space
      // Font size adapts with zoom scale to stay crisp and readable without dominating the map
      const baseFontSize = isHoveredOrSelected ? 12 : 10.5;
      const svgFontSize = baseFontSize * nodeScaleFactor;
      const charWidth = svgFontSize * 0.58;
      const pillHeight = svgFontSize * 1.6 + 4 * nodeScaleFactor;
      const pillWidth = labelText.length * charWidth + (18 * nodeScaleFactor);
      const nodeRadius = (torcida.tier === 'nacional' ? 8 : 6) * nodeScaleFactor;
      const gap = nodeRadius + (3 * nodeScaleFactor);

      // Candidate positions around the node (Top, Bottom, Right, Left)
      const candidateDirections = [
        {
          name: 'top',
          pillX: x - pillWidth / 2,
          pillY: y - gap - pillHeight,
          textX: x + (5 * nodeScaleFactor),
          textY: y - gap - pillHeight / 2 + (0.5 * nodeScaleFactor),
          textAnchor: 'middle' as const,
        },
        {
          name: 'bottom',
          pillX: x - pillWidth / 2,
          pillY: y + gap,
          textX: x + (5 * nodeScaleFactor),
          textY: y + gap + pillHeight / 2 + (0.5 * nodeScaleFactor),
          textAnchor: 'middle' as const,
        },
        {
          name: 'right',
          pillX: x + gap,
          pillY: y - pillHeight / 2,
          textX: x + gap + (12 * nodeScaleFactor),
          textY: y + (0.5 * nodeScaleFactor),
          textAnchor: 'start' as const,
        },
        {
          name: 'left',
          pillX: x - gap - pillWidth,
          pillY: y - pillHeight / 2,
          textX: x - gap - pillWidth + (12 * nodeScaleFactor),
          textY: y + (0.5 * nodeScaleFactor),
          textAnchor: 'start' as const,
        },
      ];

      let chosenCandidate = null;
      let chosenBox: BoundingBox | null = null;

      for (const cand of candidateDirections) {
        const box: BoundingBox = {
          minX: cand.pillX,
          maxX: cand.pillX + pillWidth,
          minY: cand.pillY,
          maxY: cand.pillY + pillHeight,
        };

        const hasOverlap = occupiedBoxes.some((occ) => doBoxesOverlap(box, occ, 2 * nodeScaleFactor));
        if (!hasOverlap) {
          chosenCandidate = cand;
          chosenBox = box;
          break;
        }
      }

      // If it's explicitly hovered or selected by user, force display even if slight overlap
      if (!chosenCandidate && isHoveredOrSelected) {
        chosenCandidate = candidateDirections[0];
        chosenBox = {
          minX: chosenCandidate.pillX,
          maxX: chosenCandidate.pillX + pillWidth,
          minY: chosenCandidate.pillY,
          maxY: chosenCandidate.pillY + pillHeight,
        };
      }

      if (chosenCandidate && chosenBox) {
        occupiedBoxes.push(chosenBox);
        results.push({
          torcidaId: torcida.id,
          pillX: chosenCandidate.pillX,
          pillY: chosenCandidate.pillY,
          pillWidth,
          pillHeight,
          textX: chosenCandidate.textX,
          textY: chosenCandidate.textY,
          textAnchor: chosenCandidate.textAnchor,
          fontSize: svgFontSize,
          isHoveredOrSelected,
        });
      }
    });

    return results;
  }, [
    visibleTorcidas, 
    selectedTorcidaId, 
    hoveredTorcidaId, 
    connectedTorcidaIds, 
    derbyTorcidaIds, 
    searchQuery, 
    zoom, 
    nodeScaleFactor, 
    getNodeCoordinates
  ]);

  // Connection visibility check
  const isConnectionVisible = (conn: NetworkConnection) => {
    if (lineFilterMode === 'none' && !activeTorcidaId) {
      return false;
    }
    if (lineFilterMode === 'amizades' && conn.type !== 'amizade') {
      return false;
    }
    if (lineFilterMode === 'rivalidades' && conn.type === 'amizade') {
      return false;
    }
    if (blocTorcidaIds) {
      if (!blocTorcidaIds.has(conn.source) || !blocTorcidaIds.has(conn.target)) {
        return false;
      }
    }
    if (selectedTorcidaId) {
      const involvesSelected = conn.source === selectedTorcidaId || conn.target === selectedTorcidaId;
      if (!involvesSelected) return false;
    }
    return true;
  };

  const createCurvedPath = (x1: number, y1: number, x2: number, y2: number, offsetFactor: number = 0.16) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    const perpX = -dy / (dist || 1);
    const perpY = dx / (dist || 1);
    const curvature = Math.min(dist * offsetFactor, 75);
    const ctrlX = midX + perpX * curvature;
    const ctrlY = midY + perpY * curvature;
    return `M ${x1} ${y1} Q ${ctrlX} ${ctrlY} ${x2} ${y2}`;
  };

  // Zoom handlers (up to 20x)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.5, 20));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.5, 0.9));
  };

  const handleResetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Smooth mouse wheel zoom anchored towards cursor position
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const cursorX = e.clientX - rect.left - rect.width / 2;
    const cursorY = e.clientY - rect.top - rect.height / 2;

    const zoomFactor = e.deltaY < 0 ? 1.25 : 0.8;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.9), 20);

    if (newZoom !== zoom) {
      const scaleRatio = newZoom / zoom;
      setPan((prevPan) => ({
        x: cursorX - (cursorX - prevPan.x) * scaleRatio,
        y: cursorY - (cursorY - prevPan.y) * scaleRatio,
      }));
      setZoom(newZoom);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Focus zoom into a specific torcida or state
  const focusOnCoordinates = (mapX: number, mapY: number, targetZoom: number = 4.5) => {
    const targetSvgX = (mapX / 100) * 880 + 60;
    const targetSvgY = (mapY / 100) * 860 + 45;
    
    // Center of the 1000x1000 viewBox
    const centerX = 500;
    const centerY = 500;

    const newPanX = (centerX - targetSvgX) * targetZoom;
    const newPanY = (centerY - targetSvgY) * targetZoom;

    setZoom(targetZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  return (
    <div 
      ref={containerRef}
      onWheel={handleWheel}
      className="relative w-full h-[74vh] min-h-[640px] max-h-[960px] flex flex-col bg-[#070b12] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden select-none"
    >
      {/* Top Left: Informative Pills & Zoom Indicator */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-300">
            {visibleTorcidas.length} Torcidas
          </span>
        </div>

        {/* Current Zoom Indicator */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 shadow-xl">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-black text-cyan-300">
            {zoom.toFixed(1)}x
          </span>
          <span className="text-[10px] text-slate-400 ml-1">
            (Até 20x)
          </span>
        </div>

        {/* Helper Hint */}
        <div className="hidden md:flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400">
          <MousePointer className="w-3 h-3 text-amber-400" />
          <span>Passe o mouse ou use a roda para dar zoom até 20x e ver nomes sem cobrir</span>
        </div>

        {selectedBloc !== 'all' && (
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/40 shadow-xl">
            <span className="text-xs font-black text-cyan-300 font-['Syne',sans-serif] uppercase">
              {selectedBloc === 'rivalries'
                ? 'Rivalidades & Clássicos'
                : (BLOC_INFO[selectedBloc]?.name || selectedBloc)}
            </span>
          </div>
        )}
        {/* Reset / Recenter to Silhouette */}
        <button
          onClick={handleResetZoom}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-cyan-400 rounded-2xl border border-slate-800 transition-all text-xs font-semibold shadow-xl cursor-pointer"
          title="Alinhar mapa com a silhueta fixa no fundo"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">Silhueta Fixa</span>
        </button>
      </div>

      {/* Floating Zoom Controls (Top Right) with 20x maximum */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-800 shadow-2xl">
        <button
          onClick={handleZoomIn}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Aproximar Zoom (até 20x)"
        >
          <ZoomIn className="w-4 h-4 text-cyan-400" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Afastar Zoom"
        >
          <ZoomOut className="w-4 h-4 text-slate-400" />
        </button>
        <button
          onClick={handleResetZoom}
          className="p-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
          title="Resetar Zoom (Visão Geral 1x)"
        >
          <RotateCcw className="w-4 h-4 text-amber-400" />
        </button>
      </div>

      {/* ================= FIXED SILHOUETTE IN THE BACKGROUND (1477996.png) ================= */}
      <div 
        className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none"
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1000 1000"
          className="w-full h-full max-h-[960px] opacity-40 transition-opacity duration-300 drop-shadow-[0_0_35px_rgba(14,165,233,0.15)]"
        >
          <defs>
            <linearGradient id="fixed-silhouette-glow-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#082f49" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Fixed Base Contour Fill */}
          <path
            d={BRAZIL_OUTLINE_PATH}
            fill="url(#fixed-silhouette-glow-grad)"
            stroke="#0369a1"
            strokeWidth="2"
            strokeOpacity="0.5"
          />

          {/* Fixed Broken / Dashed Iconic Stroke Segments (1477996.png) */}
          {BRAZIL_ICON_STROKE_SEGMENTS.map((segPath, idx) => (
            <path
              key={`fixed-bg-seg-${idx}`}
              d={segPath}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="16"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.35"
            />
          ))}
        </svg>
      </div>

      {/* Main SVG Map Canvas */}
      <div 
        className="relative z-10 w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox="0 0 1000 1000"
          className="w-full h-full max-h-[960px] transition-transform duration-75 ease-out"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Glow Filters */}
            <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="rose-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
            </filter>

            {/* Subtle Grid Pattern */}
            <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.08)" strokeWidth="1" />
            </pattern>

            {/* Brazil Gradient Fills */}
            <linearGradient id="brazil-silhouette-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#131b2c" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#0c1322" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#060913" stopOpacity="0.98" />
            </linearGradient>
          </defs>

          {/* Grid Background */}
          <rect width="1000" height="1000" fill="url(#grid-pattern)" />

          {/* Brazil Outline Vector - Matching reference icon 1477996.png */}
          <g className="brazil-silhouette-layer">
            <path
              d={BRAZIL_OUTLINE_PATH}
              fill="url(#brazil-silhouette-grad)"
              stroke="#0284c7"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-2xl"
            />
            {/* Iconic Broken/Dashed Stroke Segments from reference 1477996.png */}
            {BRAZIL_ICON_STROKE_SEGMENTS.map((segPath, idx) => (
              <path
                key={`interactive-seg-${idx}`}
                d={segPath}
                fill="none"
                stroke="#38bdf8"
                strokeWidth={14 * nodeScaleFactor}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeOpacity="0.85"
                filter="url(#glow-light)"
              />
            ))}
          </g>

          {/* ================= NETWORK CONNECTIONS (ARCS) ================= */}
          <g className="connections-layer">
            {connections.map((conn) => {
              const sourceTorcida = torcidas.find((t) => t.id === conn.source);
              const targetTorcida = torcidas.find((t) => t.id === conn.target);

              if (!sourceTorcida || !targetTorcida) return null;
              if (!isConnectionVisible(conn)) return null;

              const p1 = getNodeCoordinates(sourceTorcida, zoom);
              const p2 = getNodeCoordinates(targetTorcida, zoom);

              const isDirectlyActive =
                activeTorcidaId === conn.source || activeTorcidaId === conn.target;

              const isDerbyActive =
                derbyTorcidaIds &&
                derbyTorcidaIds.has(conn.source) &&
                derbyTorcidaIds.has(conn.target);

              const isHighlighted = isDirectlyActive || isDerbyActive;

              let strokeColor = '#06b6d4';
              let strokeWidth = 1.5 * nodeScaleFactor;
              let strokeDasharray = undefined;
              let filter = undefined;

              if (conn.type === 'amizade') {
                if (conn.label?.includes('Aliança Alvinegra') || conn.label?.includes('Alvinegra')) strokeColor = '#cbd5e1';
                else if (conn.label?.includes('Punho Colado')) strokeColor = '#a855f7';
                else if (conn.label?.includes('Lado A')) strokeColor = '#f59e0b';
                else if (conn.label?.includes('Lado B')) strokeColor = '#ec4899';
                else if (conn.label?.includes('Família Interior')) strokeColor = '#06b6d4';
                else if (conn.label?.includes('Punho Seguro')) strokeColor = '#14b8a6';
                else if (conn.label?.includes('Irmandade')) strokeColor = '#8b5cf6';
                else if (conn.label?.includes('Dedo pro Alto') || conn.label?.includes('Alviverde')) strokeColor = '#10b981';
                else strokeColor = '#3b82f6';
                strokeWidth = (isHighlighted ? 3.5 : 1.5) * nodeScaleFactor;
                filter = isHighlighted ? 'url(#cyan-glow)' : undefined;
              } else if (conn.type === 'rivalidade') {
                strokeColor = '#f43f5e';
                strokeWidth = (isHighlighted ? 3.5 : 1.5) * nodeScaleFactor;
                filter = isHighlighted ? 'url(#rose-glow)' : undefined;
              } else if (conn.type === 'historica') {
                strokeColor = '#f59e0b';
                strokeWidth = (isHighlighted ? 3.0 : 1.2) * nodeScaleFactor;
                strokeDasharray = `${4 * nodeScaleFactor} ${3 * nodeScaleFactor}`;
              } else if (conn.type === 'classico') {
                strokeColor = '#94a3b8';
                strokeWidth = (isHighlighted ? 2.2 : 1.0) * nodeScaleFactor;
                strokeDasharray = `${3 * nodeScaleFactor} ${2.5 * nodeScaleFactor}`;
              }

              const idleOpacity = activeTorcidaId ? 0.08 : (lineFilterMode === 'none' ? 0 : 0.45);
              const strokeOpacity = isHighlighted ? 1 : idleOpacity;

              const curvedD = createCurvedPath(p1.x, p1.y, p2.x, p2.y, 0.16);

              return (
                <g key={conn.id} className="transition-opacity duration-300">
                  <path
                    d={curvedD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={strokeDasharray}
                    strokeLinecap="round"
                    strokeOpacity={strokeOpacity}
                    filter={filter}
                    className="transition-all duration-300 cursor-pointer hover:stroke-white hover:stroke-opacity-100"
                    onClick={() => {
                      onSelectTorcida(sourceTorcida.id);
                    }}
                  >
                    <title>{conn.label || `${sourceTorcida.name} ↔ ${targetTorcida.name} (${conn.type})`}</title>
                  </path>

                  {isHighlighted && conn.type === 'amizade' && (
                    <circle r={3.5 * nodeScaleFactor} fill="#22d3ee" filter="url(#cyan-glow)">
                      <animateMotion path={curvedD} dur="2.2s" repeatCount="indefinite" />
                    </circle>
                  )}
                  {isHighlighted && (conn.type === 'rivalidade' || conn.type === 'historica') && (
                    <circle r={3.5 * nodeScaleFactor} fill="#fb7185" filter="url(#rose-glow)">
                      <animateMotion path={curvedD} dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  )}
                </g>
              );
            })}
          </g>

          {/* ================= TORCIDAS NODES (EXACT POSITION IN STATE) ================= */}
          <g className="nodes-layer">
            {visibleTorcidas.map((torcida) => {
              const { x, y } = getNodeCoordinates(torcida, zoom);
              const isSelected = selectedTorcidaId === torcida.id;
              const isHovered = hoveredTorcidaId === torcida.id;
              const isActive = isSelected || isHovered;
              const isDerbyNode = derbyTorcidaIds?.has(torcida.id);
              const isConnected = connectedTorcidaIds.has(torcida.id);

              let baseRadius = 5.5;
              if (torcida.tier === 'nacional') baseRadius = 8.5;
              else if (torcida.tier === 'regional') baseRadius = 6.8;
              else baseRadius = 5.0;

              const radius = baseRadius * nodeScaleFactor;

              const blocColor = BLOC_INFO[torcida.bloc]?.color || '#3b82f6';

              return (
                <g
                  key={torcida.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer transition-transform duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTorcida(torcida.id);
                  }}
                  onMouseEnter={() => onHoverTorcida(torcida.id)}
                  onMouseLeave={() => onHoverTorcida(null)}
                >
                  {/* Ping effect when hovered/selected */}
                  {isActive && (
                    <circle
                      r={radius + (8 * nodeScaleFactor)}
                      fill="none"
                      stroke={blocColor}
                      strokeWidth={2 * nodeScaleFactor}
                      className="animate-ping opacity-75"
                    />
                  )}

                  {/* Active / Connected Halo */}
                  {(isActive || isSelected || isDerbyNode || isConnected) && (
                    <circle
                      r={radius + (4 * nodeScaleFactor)}
                      fill="none"
                      stroke={isConnected ? '#22d3ee' : blocColor}
                      strokeWidth={(isActive ? 2.5 : 1.5) * nodeScaleFactor}
                      strokeOpacity={0.95}
                    />
                  )}

                  {/* Main Circle with Club Color */}
                  <circle
                    r={radius}
                    fill={torcida.clubColors.primary}
                    stroke={blocColor}
                    strokeWidth={(torcida.tier === 'nacional' ? 2.5 : 1.8) * nodeScaleFactor}
                    filter="url(#node-shadow)"
                  />

                  {/* Inner Secondary Color Dot */}
                  <circle
                    r={Math.max(radius - (2.8 * nodeScaleFactor), 1.2 * nodeScaleFactor)}
                    fill={torcida.clubColors.secondary || '#ffffff'}
                  />
                </g>
              );
            })}
          </g>

          {/* ================= LABELS LAYER (SMART NON-OVERLAPPING AT HIGH ZOOM OR HOVER) ================= */}
          <g className="labels-layer">
            {placedLabels.map((pl) => {
              const torcida = torcidas.find((t) => t.id === pl.torcidaId);
              if (!torcida) return null;

              const isSelected = selectedTorcidaId === torcida.id;
              const isHovered = hoveredTorcidaId === torcida.id;
              const isActive = isSelected || isHovered;
              const isConnected = connectedTorcidaIds.has(torcida.id);

              let blocColor = '#3b82f6';
              if (torcida.bloc === 'dedo_pro_alto') blocColor = '#10b981';
              else if (torcida.bloc === 'regional_historica') blocColor = '#f59e0b';
              else if (torcida.bloc === 'independente') blocColor = '#94a3b8';

              const displayName = torcida.shortName || torcida.name;

              return (
                <g
                  key={`label-${torcida.id}`}
                  className="cursor-pointer transition-opacity duration-150"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTorcida(torcida.id);
                  }}
                  onMouseEnter={() => onHoverTorcida(torcida.id)}
                  onMouseLeave={() => onHoverTorcida(null)}
                >
                  {/* Label Pill Box */}
                  <rect
                    x={pl.pillX}
                    y={pl.pillY}
                    width={pl.pillWidth}
                    height={pl.pillHeight}
                    rx={3.5 * nodeScaleFactor}
                    fill={isActive ? '#0f172a' : '#090d16'}
                    fillOpacity={isActive ? '0.98' : '0.92'}
                    stroke={isActive ? '#22d3ee' : (isConnected ? blocColor : '#334155')}
                    strokeWidth={(isActive ? 1.5 : 0.8) * nodeScaleFactor}
                    filter="url(#node-shadow)"
                  />

                  {/* Club Color Dot inside Pill */}
                  <circle
                    cx={pl.pillX + (6.5 * nodeScaleFactor)}
                    cy={pl.pillY + pl.pillHeight / 2}
                    r={2.5 * nodeScaleFactor}
                    fill={torcida.clubColors.primary}
                    stroke={torcida.clubColors.secondary || '#ffffff'}
                    strokeWidth={0.6 * nodeScaleFactor}
                  />

                  {/* Text */}
                  <text
                    x={pl.textX}
                    y={pl.textY}
                    textAnchor={pl.textAnchor}
                    dominantBaseline="middle"
                    fontSize={pl.fontSize}
                    className={`font-black tracking-tight select-none pointer-events-none ${
                      isActive 
                        ? 'fill-cyan-300 font-extrabold' 
                        : (isConnected ? 'fill-slate-100 font-bold' : 'fill-slate-300')
                    }`}
                  >
                    {displayName}
                  </text>
                </g>
              );
            })}
          </g>

        </svg>
      </div>

      {/* ================= FLOATING INSPECTOR CARD (NON-INTRUSIVE) ================= */}
      {selectedTorcida && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[380px] z-30 bg-[#0d1322]/95 backdrop-blur-xl border border-cyan-500/50 rounded-2xl p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs text-white border shrink-0 shadow-md"
                style={{ 
                  backgroundColor: selectedTorcida.clubColors.primary,
                  borderColor: selectedTorcida.clubColors.secondary || '#ffffff'
                }}
              >
                {selectedTorcida.uf}
              </div>

              <div>
                <h3 className="text-sm font-black text-white uppercase font-['Syne',sans-serif] leading-tight">
                  {selectedTorcida.name}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {selectedTorcida.club} • {selectedTorcida.city} ({selectedTorcida.uf})
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectTorcida('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
              title="Fechar painel da torcida"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Details & Bloc Switcher */}
          <div className="py-2.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Bloco de Aliança:</span>
              
              <div className="relative">
                <button
                  onClick={() => setShowBlocDropdown(!showBlocDropdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                    BLOC_INFO[selectedTorcida.bloc]?.badgeClass || 'bg-slate-800 text-white'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: BLOC_INFO[selectedTorcida.bloc]?.color || '#fff' }}
                  />
                  <span>{selectedTorcida.blocName}</span>
                  <ChevronDown className="w-3 h-3 ml-0.5 opacity-70" />
                </button>

                {showBlocDropdown && onChangeBloc && (
                  <div className="absolute right-0 top-full mt-1.5 w-52 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl z-40 animate-in fade-in">
                    {(Object.keys(BLOC_INFO) as AllianceBloc[]).map((blocKey) => (
                      <button
                        key={blocKey}
                        onClick={() => {
                          onChangeBloc(selectedTorcida.id, blocKey);
                          setShowBlocDropdown(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-all ${
                          selectedTorcida.bloc === blocKey ? 'text-cyan-300 font-bold bg-slate-800/80' : 'text-slate-300'
                        }`}
                      >
                        <span 
                          className="w-2 h-2 rounded-full shrink-0" 
                          style={{ backgroundColor: BLOC_INFO[blocKey].color }}
                        />
                        <span>{BLOC_INFO[blocKey].name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Allies and Rivals Count Chips */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                  <HeartHandshake className="w-3.5 h-3.5" />
                  <span>Aliadas:</span>
                </div>
                <span className="font-extrabold text-white text-xs">{activeAlliances.length}</span>
              </div>

              <div className="p-2 rounded-xl bg-rose-950/60 border border-rose-500/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <Swords className="w-3.5 h-3.5" />
                  <span>Rivais:</span>
                </div>
                <span className="font-extrabold text-white text-xs">{activeRivalries.length}</span>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
            {onOpenEditorModal && (
              <button
                onClick={() => onOpenEditorModal(selectedTorcida.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Relações & Amizades</span>
              </button>
            )}

            {onOpenDrawer && (
              <button
                onClick={onOpenDrawer}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
                title="Abrir no catálogo completo"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* Floating Bottom Quick Action on Mobile / Small screens to open Drawer */}
      <div className="absolute bottom-4 left-4 z-20 xl:hidden">
        <button
          onClick={onOpenDrawer}
          className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-950/90 backdrop-blur-md text-cyan-300 border border-cyan-500/40 text-xs font-black shadow-2xl"
        >
          <Layers className="w-4 h-4" />
          <span>Ver Catálogo Completo</span>
        </button>
      </div>

    </div>
  );
};
