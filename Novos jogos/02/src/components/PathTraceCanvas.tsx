import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Point, PathPattern, GameSettings, RoundResult } from '../types';
import { findClosestPointOnPath } from '../utils/mathPath';
import { soundEngine } from '../utils/audio';
import { FlareParticlesCanvas } from './FlareParticlesCanvas';
import { StadiumTorcidaFlag } from './StadiumTorcidaFlag';
import { AlertTriangle, Sparkles, CheckCircle2, Flame, ShieldAlert, Timer, Users, Eye } from 'lucide-react';

interface TrailSegment {
  points: Point[];
  isBroken: boolean;
}

interface PathTraceCanvasProps {
  pattern: PathPattern;
  currentRound: number;
  totalRounds: number;
  settings: GameSettings;
  onRoundComplete: (result: RoundResult) => void;
}

export const PathTraceCanvas: React.FC<PathTraceCanvasProps> = ({
  pattern,
  currentRound,
  totalRounds,
  settings,
  onRoundComplete,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  const [pathPoints, setPathPoints] = useState<Point[]>([]);
  const [fingerPos, setFingerPos] = useState<Point | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMiss, setIsMiss] = useState(false);
  const [isPerfectRound, setIsPerfectRound] = useState(false);

  // Torcida Hype & View
  const [crowdHype, setCrowdHype] = useState<number>(55);
  const [viewMode, setViewMode] = useState<'game' | 'cinematic'>('game');

  // Gameplay state
  const [missCount, setMissCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(pattern.timeLimit);
  const [hasStarted, setHasStarted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [statusFeedback, setStatusFeedback] = useState<string>('Toque no círculo inicial para tremular o bandeirão');

  // Trail lines (split into segments when broken)
  const [trails, setTrails] = useState<TrailSegment[]>([]);

  // Mathematical accuracy tracking
  const samplesTotalRef = useRef<number>(0);
  const samplesWithinMarginRef = useRef<number>(0);
  const maxSegmentReachedRef = useRef<number>(0);
  const coveredSegmentsSetRef = useRef<Set<number>>(new Set());
  const timerIntervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const finishedRef = useRef<boolean>(false);
  const consecutiveMissFramesRef = useRef<number>(0);

  // Update container dimensions on mount/resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: Math.max(320, clientWidth),
          height: Math.max(300, clientHeight),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      soundEngine.stopCrowdAmbience();
    };
  }, []);

  // Regenerate path points when pattern or dimensions change
  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const pts = pattern.generatePoints(dimensions.width, dimensions.height);
      setPathPoints(pts);
      resetRoundState(pts);
    }
  }, [pattern, dimensions]);

  const resetRoundState = (pts: Point[]) => {
    setFingerPos(null);
    setIsDragging(false);
    setIsMiss(false);
    setIsPerfectRound(false);
    setMissCount(0);
    setTimeLeft(pattern.timeLimit);
    setHasStarted(false);
    setProgressPercent(0);
    setCurrentDistance(0);
    setTrails([]);
    setStatusFeedback('Toque no ponto inicial para acender o sinalizador');

    samplesTotalRef.current = 0;
    samplesWithinMarginRef.current = 0;
    maxSegmentReachedRef.current = 0;
    coveredSegmentsSetRef.current.clear();
    finishedRef.current = false;
    consecutiveMissFramesRef.current = 0;

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleFinishRound = useCallback(
    (reason: 'completed' | 'timeout' | 'interrupted') => {
      if (finishedRef.current) return;
      finishedRef.current = true;

      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      const timeTaken = Math.max(
        0.5,
        Math.min(pattern.timeLimit, (Date.now() - startTimeRef.current) / 1000)
      );

      const totalSegments = Math.max(1, pathPoints.length - 1);
      const coveragePercent = Math.min(
        100,
        Math.round((coveredSegmentsSetRef.current.size / totalSegments) * 100)
      );

      const precisionAccuracy =
        samplesTotalRef.current > 0
          ? Math.round((samplesWithinMarginRef.current / samplesTotalRef.current) * 100)
          : 0;

      // Deduct penalties for misses
      const missPenalty = missCount * 8;
      const rawScore = Math.round(coveragePercent * 0.5 + precisionAccuracy * 0.5 - missPenalty);
      const finalScore = Math.max(0, Math.min(100, rawScore));

      const isPerfect =
        reason === 'completed' &&
        coveragePercent >= 92 &&
        precisionAccuracy >= 88 &&
        missCount === 0 &&
        timeTaken <= pattern.timeLimit;

      if (isPerfect) {
        setIsPerfectRound(true);
        soundEngine.playPerfectCelebration();
      }

      // Small delay for celebration animation before notifying parent
      setTimeout(() => {
        onRoundComplete({
          round: currentRound,
          patternName: pattern.name,
          accuracy: precisionAccuracy,
          coverage: coveragePercent,
          missCount,
          timeTaken: Math.round(timeTaken * 10) / 10,
          timeLimit: pattern.timeLimit,
          isPerfect,
          score: finalScore,
        });
      }, 700);
    },
    [currentRound, missCount, pattern, pathPoints.length, onRoundComplete]
  );

  // Countdown timer when game has started
  useEffect(() => {
    if (hasStarted && !finishedRef.current) {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 0.1) {
            handleFinishRound('timeout');
            return 0;
          }
          return Math.max(0, Math.round((prev - 0.1) * 10) / 10);
        });
      }, 100);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [hasStarted, handleFinishRound]);

  // Handle pointer down (touch/click start)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (finishedRef.current || pathPoints.length === 0) return;

    // Capture pointer so dragging outside container still tracks
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const startPoint = pathPoints[0];
    const distToStart = Math.hypot(x - startPoint.x, y - startPoint.y);

      // Initial touch must be close to the start point (within 1.8x threshold)
    if (distToStart <= settings.errorThresholdPx * 1.8) {
      setIsDragging(true);
      setHasStarted(true);
      setIsMiss(false);
      setFingerPos({ x, y });
      soundEngine.playFlareIgnite();
      soundEngine.startCrowdAmbience();

      // Start new active trail
      setTrails([{ points: [{ x, y }], isBroken: false }]);
      setStatusFeedback('Bandeirão erguido! Siga o caminho até a meta!');
    } else {
      // Tapped too far from start
      setStatusFeedback('Toque exatamente no ponto verde para acender o sinalizador!');
      soundEngine.playMissAlert();
    }
  };

  // Handle pointer move (dragging along path)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || finishedRef.current || pathPoints.length === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const currentP: Point = { x, y };
    setFingerPos(currentP);

    // Calculate closest point on target path and mathematical distance
    const match = findClosestPointOnPath(currentP, pathPoints);
    setCurrentDistance(Math.round(match.minDistance));

    samplesTotalRef.current += 1;

    // Check margin of error threshold
    const isExceedingMargin = match.minDistance > settings.errorThresholdPx;

    if (isExceedingMargin) {
      consecutiveMissFramesRef.current += 1;

      // Trigger Miss when exceeding threshold consistently
      if (consecutiveMissFramesRef.current === 4) {
        setIsMiss(true);
        setMissCount((prev) => prev + 1);
        setCrowdHype((prev) => Math.max(20, prev - 12));
        setStatusFeedback('MISS! A bandeira perdeu o ritmo!');
        soundEngine.playMissAlert();
        soundEngine.playCrowdGroan();

        if (settings.hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(60);
        }

        // Break visual trail
        setTrails((prev) => {
          const updated = [...prev];
          if (updated.length > 0) {
            updated[updated.length - 1].isBroken = true;
          }
          // Start a new disconnected segment
          updated.push({ points: [currentP], isBroken: false });
          return updated;
        });
      }
    } else {
      // Inside safe margin
      consecutiveMissFramesRef.current = 0;
      if (isMiss) {
        setIsMiss(false);
        setStatusFeedback('Tremulada firme! A torcida acompanha...');
      }

      // Boost crowd hype on accurate drag
      setCrowdHype((prev) => Math.min(100, prev + 0.3));

      samplesWithinMarginRef.current += 1;
      coveredSegmentsSetRef.current.add(match.segmentIndex);

      if (match.segmentIndex > maxSegmentReachedRef.current) {
        maxSegmentReachedRef.current = match.segmentIndex;
      }

      const prog = Math.round(match.normalizedProgress * 100);
      setProgressPercent(prog);

      // Play soft whoosh sound
      if (samplesTotalRef.current % 6 === 0) {
        soundEngine.playTraceStep(prog / 100);
      }

      // Append point to current active trail
      setTrails((prev) => {
        if (prev.length === 0) return [{ points: [currentP], isBroken: false }];
        const lastTrail = prev[prev.length - 1];
        const updatedTrail: TrailSegment = {
          ...lastTrail,
          points: [...lastTrail.points, currentP],
        };
        return [...prev.slice(0, -1), updatedTrail];
      });

      // Check if end point is reached
      const endPoint = pathPoints[pathPoints.length - 1];
      const distToEnd = Math.hypot(x - endPoint.x, y - endPoint.y);

      if (distToEnd <= settings.errorThresholdPx * 1.4 && prog >= 88) {
        setStatusFeedback('Festa linda na bancada! Bandeirão completado!');
        soundEngine.stopCrowdAmbience();
        handleFinishRound('completed');
      }
    }
  };

  // Handle pointer up or cancel (player released finger)
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }

    setIsDragging(false);

    if (!finishedRef.current) {
      const endPoint = pathPoints[pathPoints.length - 1];
      const current = fingerPos || { x: 0, y: 0 };
      const distToEnd = Math.hypot(current.x - endPoint.x, current.y - endPoint.y);

      if (distToEnd <= settings.errorThresholdPx * 1.5 && progressPercent >= 85) {
        soundEngine.stopCrowdAmbience();
        handleFinishRound('completed');
      } else {
        // Soltou antes do fim
        setStatusFeedback('Você soltou o mastro antes de completar o percurso!');
        soundEngine.playMissAlert();
        soundEngine.playCrowdGroan();
        soundEngine.stopCrowdAmbience();
        handleFinishRound('interrupted');
      }
    }
  };

  const startPoint = pathPoints[0] || { x: 0, y: 0 };
  const endPoint = pathPoints[pathPoints.length - 1] || { x: 0, y: 0 };

  // Calculate activity level for background flag fluttering
  const activityLevel = isDragging ? (isMiss ? 0.4 : 0.95) : 0.2;

  return (
    <div
      id="path-trace-container"
      className="relative w-full h-[480px] md:h-[560px] bg-neutral-950 rounded-2xl overflow-hidden border-2 border-neutral-800 select-none shadow-2xl flex flex-col"
    >
      {/* 1. Dynamic Stadium Flag & Packed Torcedores in real-time */}
      <StadiumTorcidaFlag
        activityLevel={activityLevel}
        fingerPos={fingerPos}
        isDragging={isDragging}
        isMiss={isMiss}
        theme={settings.flagTheme}
        crowdHype={crowdHype}
      />

      {/* 2. Top HUD Bar */}
      <div
        id="game-hud-top"
        className="relative z-40 flex flex-wrap items-center justify-between px-4 py-2.5 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800 text-white gap-2"
      >
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-600/30 text-red-400 border border-red-500/40">
            Rodada {currentRound} / {totalRounds}
          </span>
          <span className="text-sm font-bold text-neutral-100 hidden sm:inline">
            {pattern.name}
          </span>
        </div>

        {/* Torcida Hype Meter */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-neutral-900/90 rounded-xl border border-neutral-700/60 shadow-inner">
          <Users className="w-3.5 h-3.5 text-amber-400" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-1 text-[10px] uppercase font-bold tracking-wider text-neutral-400">
              <span>Bancada:</span>
              <span className={`font-mono font-black ${crowdHype >= 80 ? 'text-amber-400 animate-pulse' : 'text-neutral-200'}`}>
                {Math.round(crowdHype)}%
              </span>
            </div>
            {/* Miniature energy bar */}
            <div className="w-16 sm:w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-200 rounded-full ${
                  crowdHype >= 80
                    ? 'bg-gradient-to-r from-amber-400 to-red-500'
                    : crowdHype >= 50
                    ? 'bg-emerald-400'
                    : 'bg-neutral-500'
                }`}
                style={{ width: `${crowdHype}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status Center */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 text-xs">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            <span
              className={`font-mono font-bold ${
                timeLeft <= 3 ? 'text-red-400 animate-pulse' : 'text-neutral-200'
              }`}
            >
              {timeLeft.toFixed(1)}s
            </span>
          </div>

          <div className="flex items-center space-x-1 text-xs">
            <ShieldAlert
              className={`w-3.5 h-3.5 ${missCount > 0 ? 'text-red-400' : 'text-neutral-400'}`}
            />
            <span className="font-mono text-neutral-200">
              <b className={missCount > 0 ? 'text-red-400' : 'text-emerald-400'}>{missCount}</b> miss
            </span>
          </div>

          {/* Toggle View button: Game trace vs Flag focus */}
          <button
            id="toggle-view-mode-btn"
            onClick={() => setViewMode(viewMode === 'game' ? 'cinematic' : 'game')}
            title={viewMode === 'game' ? 'Focar na Bandeira' : 'Modo Traçado'}
            className="p-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 text-xs flex items-center space-x-1 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px] font-semibold">
              {viewMode === 'game' ? 'Ver Torcida' : 'Ver Linha'}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Interactive Touch/Drag Field */}
      <div
        id="interactive-touch-area"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="relative flex-1 w-full h-full touch-none cursor-crosshair overflow-hidden"
      >
        {/* SVG Renderers: Guide Corridor and Target Path */}
        <svg
          id="target-path-svg"
          className={`absolute inset-0 w-full h-full pointer-events-none z-10 transition-opacity duration-300 ${
            viewMode === 'cinematic' ? 'opacity-25' : 'opacity-100'
          }`}
          width={dimensions.width}
          height={dimensions.height}
        >
          <defs>
            {/* Glow filters for neon path */}
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Linear gradient for target path */}
            <linearGradient id="targetPathGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#eab308" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.85" />
            </linearGradient>

            {/* Gradient for player trail */}
            <linearGradient id="playerTrailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>

          {/* Guide Zone / Margin of Error Corridor */}
          {settings.showGuideZone && pathPoints.length > 1 && (
            <path
              id="guide-corridor-path"
              d={pattern.svgPathD(dimensions.width, dimensions.height)}
              fill="none"
              stroke="rgba(245, 158, 11, 0.12)"
              strokeWidth={settings.errorThresholdPx * 2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Target Center Line (Semi-transparent Target Path) */}
          {pathPoints.length > 1 && (
            <>
              {/* Outer soft glowing halo */}
              <path
                id="target-halo-path"
                d={pattern.svgPathD(dimensions.width, dimensions.height)}
                fill="none"
                stroke="url(#targetPathGrad)"
                strokeWidth="12"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#neon-glow)"
              />
              {/* Core dashed line with direction rhythm */}
              <path
                id="target-core-path"
                d={pattern.svgPathD(dimensions.width, dimensions.height)}
                fill="none"
                stroke="rgba(255, 255, 255, 0.65)"
                strokeWidth="4"
                strokeDasharray="10 8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Player Active Trails */}
          {trails.map((t, idx) => {
            if (t.points.length < 2) return null;
            let d = `M ${t.points[0].x.toFixed(1)} ${t.points[0].y.toFixed(1)}`;
            for (let i = 1; i < t.points.length; i++) {
              d += ` L ${t.points[i].x.toFixed(1)} ${t.points[i].y.toFixed(1)}`;
            }

            return (
              <g key={`trail-seg-${idx}`}>
                {/* Glowing underlay */}
                <path
                  d={d}
                  fill="none"
                  stroke={t.isBroken ? '#dc2626' : '#f59e0b'}
                  strokeWidth="14"
                  strokeOpacity={t.isBroken ? '0.35' : '0.5'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter="url(#neon-glow)"
                />
                {/* Core bright neon path */}
                <path
                  d={d}
                  fill="none"
                  stroke={t.isBroken ? '#fca5a5' : '#ffffff'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}

          {/* Start Point Marker */}
          {pathPoints.length > 0 && (
            <g id="start-marker-group" transform={`translate(${startPoint.x}, ${startPoint.y})`}>
              {/* Outer pulsing ring */}
              <circle
                r={settings.errorThresholdPx}
                fill="rgba(34, 197, 94, 0.12)"
                stroke="rgba(34, 197, 94, 0.4)"
                strokeWidth="2"
                strokeDasharray="4 4"
                className="animate-spin"
                style={{ transformOrigin: '0 0', animationDuration: '6s' }}
              />
              <circle r="16" fill="#16a34a" stroke="#ffffff" strokeWidth="3" />
              <circle r="6" fill="#ffffff" />
            </g>
          )}

          {/* End Point Marker */}
          {pathPoints.length > 0 && (
            <g id="end-marker-group" transform={`translate(${endPoint.x}, ${endPoint.y})`}>
              <circle
                r={settings.errorThresholdPx}
                fill="rgba(239, 68, 68, 0.1)"
                stroke="rgba(239, 68, 68, 0.35)"
                strokeWidth="2"
                strokeDasharray="4 4"
              />
              <circle r="16" fill="#dc2626" stroke="#ffffff" strokeWidth="3" />
              <polygon
                points="-4,-6 6,0 -4,6"
                fill="#ffffff"
              />
            </g>
          )}
        </svg>

        {/* 4. Flare Particle Effects Canvas (Sparks, Smoke, and Fire) */}
        <FlareParticlesCanvas
          currentPos={fingerPos}
          isDragging={isDragging}
          isMiss={isMiss}
          isPerfect={isPerfectRound}
        />

        {/* Start Label Bubble */}
        {!hasStarted && pathPoints.length > 0 && (
          <div
            id="start-instruction-bubble"
            style={{
              left: `${startPoint.x}px`,
              top: `${Math.max(20, startPoint.y - 48)}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute z-30 pointer-events-none flex flex-col items-center animate-bounce"
          >
            <div className="px-3 py-1.5 bg-emerald-500 text-neutral-950 font-bold text-xs rounded-lg shadow-lg flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>TOQUE E ARRASTE AQUI</span>
            </div>
            <div className="w-2 h-2 bg-emerald-500 rotate-45 -mt-1" />
          </div>
        )}

        {/* End Label Bubble */}
        {pathPoints.length > 0 && (
          <div
            id="end-instruction-bubble"
            style={{
              left: `${endPoint.x}px`,
              top: `${Math.max(20, endPoint.y - 48)}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute z-30 pointer-events-none flex flex-col items-center"
          >
            <div className="px-2.5 py-1 bg-red-600/90 text-white font-bold text-[11px] rounded shadow flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>META</span>
            </div>
            <div className="w-2 h-2 bg-red-600/90 rotate-45 -mt-1" />
          </div>
        )}

        {/* Real-time floating distance indicator near finger */}
        {fingerPos && isDragging && (
          <div
            id="floating-distance-pill"
            style={{
              left: `${fingerPos.x + 22}px`,
              top: `${fingerPos.y - 28}px`,
            }}
            className={`absolute z-40 pointer-events-none px-2 py-0.5 rounded text-[11px] font-mono font-bold flex items-center space-x-1 shadow-md transition-colors ${
              isMiss
                ? 'bg-red-600 text-white animate-pulse'
                : currentDistance > settings.errorThresholdPx * 0.7
                ? 'bg-amber-500 text-neutral-950'
                : 'bg-emerald-600/90 text-white'
            }`}
          >
            {isMiss ? <AlertTriangle className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
            <span>{currentDistance}px</span>
          </div>
        )}
      </div>

      {/* 5. Bottom Status Feedback Bar */}
      <div
        id="game-hud-bottom"
        className="relative z-40 flex items-center justify-between px-4 py-2.5 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800 text-xs text-neutral-300"
      >
        <div className="flex items-center space-x-2 truncate">
          <span
            className={`w-2 h-2 rounded-full ${
              isMiss ? 'bg-red-500 animate-ping' : isDragging ? 'bg-emerald-400' : 'bg-neutral-500'
            }`}
          />
          <span className="font-medium text-neutral-200 truncate">{statusFeedback}</span>
        </div>

        <div className="flex items-center space-x-3 text-neutral-400 shrink-0">
          <span>
            Margem: <b className="text-neutral-200 font-mono">{settings.errorThresholdPx}px</b>
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">
            Tempo: <b className="text-neutral-200 font-mono">{pattern.timeLimit}s</b>
          </span>
        </div>
      </div>
    </div>
  );
};
