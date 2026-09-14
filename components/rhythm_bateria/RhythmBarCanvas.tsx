import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Target, Zap, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { FeedbackType } from './types';

interface RhythmBarCanvasProps {
  combo: number;
  onHit: (isPerfect: boolean) => void;
  onMiss: (reason: 'clicked_outside' | 'passed_without_click') => void;
  feedback: FeedbackType;
  bpm: number;
  isPlaying: boolean;
}

export const RhythmBarCanvas: React.FC<RhythmBarCanvasProps> = ({
  combo,
  onHit,
  onMiss,
  feedback,
  bpm,
  isPlaying,
}) => {
  const TARGET_START = 40;
  const TARGET_END = 60;
  const PERFECT_START = 46;
  const PERFECT_END = 54;
  const POINTER_HALF_WIDTH = 1.8;

  const posRef = useRef<number>(10);
  const dirRef = useRef<number>(1);
  const wasInsideZoneRef = useRef<boolean>(false);
  const hasHitInCurrentPassRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [cursorPos, setCursorPos] = useState<number>(10);
  const [isOverlapping, setIsOverlapping] = useState<boolean>(false);

  const comboMultiplier = Math.min(Math.pow(1.1, combo), 4.5);
  const speed = (bpm * 0.95) * comboMultiplier;

  const handleInteraction = useCallback(() => {
    if (!isPlaying) return;

    const p = posRef.current;
    const pointerLeft = p - POINTER_HALF_WIDTH;
    const pointerRight = p + POINTER_HALF_WIDTH;

    const overlaps = pointerRight >= TARGET_START && pointerLeft <= TARGET_END;

    if (overlaps) {
      if (!hasHitInCurrentPassRef.current) {
        hasHitInCurrentPassRef.current = true;
        const isPerfect = p >= PERFECT_START && p <= PERFECT_END;
        onHit(isPerfect);
      }
    } else {
      onMiss('clicked_outside');
    }
  }, [onHit, onMiss, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    let active = true;

    const loop = (time: number) => {
      if (!active) return;

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const dt = Math.min((time - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = time;

      let p = posRef.current + dirRef.current * speed * dt;

      if (p >= 100) {
        p = 100;
        dirRef.current = -1;
      } else if (p <= 0) {
        p = 0;
        dirRef.current = 1;
      }
      posRef.current = p;

      const pointerLeft = p - POINTER_HALF_WIDTH;
      const pointerRight = p + POINTER_HALF_WIDTH;
      const insideZone = pointerRight >= TARGET_START && pointerLeft <= TARGET_END;

      if (insideZone && !wasInsideZoneRef.current) {
        wasInsideZoneRef.current = true;
        hasHitInCurrentPassRef.current = false;
      } else if (!insideZone && wasInsideZoneRef.current) {
        wasInsideZoneRef.current = false;
        if (!hasHitInCurrentPassRef.current) {
          onMiss('passed_without_click');
        }
      }

      setCursorPos(p);
      setIsOverlapping(insideZone);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      lastTimeRef.current = null;
    };
  }, [speed, onMiss, isPlaying]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleInteraction();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInteraction]);

  return (
    <div className="w-full select-none flex flex-col items-center">
      {/* Status Bar */}
      <div className="w-full flex items-center justify-between mb-2 text-xs font-bold text-zinc-400">
        <div className="flex items-center gap-1.5">
          <ChevronLeft className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="font-mono text-[11px] uppercase tracking-wider">MARCADOR DO SURDO</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-zinc-900 text-amber-300 border border-zinc-700 font-mono text-[11px] flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-400" />
            {Math.round(bpm)} BPM ({comboMultiplier.toFixed(1)}x)
          </span>
          <ChevronRight className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>
      </div>

      {/* Main Track */}
      <div
        onClick={handleInteraction}
        className="relative w-full h-20 sm:h-24 bg-zinc-950 rounded-2xl p-2.5 border-2 border-zinc-800 shadow-2xl cursor-pointer hover:border-amber-500/50 active:scale-[0.99] flex items-center overflow-hidden"
      >
        <div className="relative w-full h-10 sm:h-12 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 flex items-center">
          {/* Target Zone (Center 40%-60%) */}
          <div
            style={{
              left: `${TARGET_START}%`,
              width: `${TARGET_END - TARGET_START}%`,
            }}
            className={`absolute top-0 bottom-0 rounded-lg transition-colors duration-75 flex items-center justify-center border-x-2 ${
              feedback === 'miss'
                ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                : isOverlapping
                ? 'bg-amber-400/40 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                : 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}
          >
            {/* Center Perfect Sweet Spot */}
            <div style={{ width: '40%' }} className="h-full bg-emerald-500/30 flex items-center justify-center border-x border-emerald-400/60">
              <div className="w-1 h-full bg-emerald-300 shadow-[0_0_8px_#34d399]" />
            </div>

            <span className="absolute -bottom-4 text-[9px] font-black uppercase tracking-widest text-emerald-400 pointer-events-none">
              ZONA DE ACERTO
            </span>
          </div>

          {/* Rhythm Cursor Pointer */}
          <div
            style={{
              left: `${cursorPos}%`,
              transform: 'translateX(-50%)',
            }}
            className="absolute top-0 bottom-0 z-20 pointer-events-none transition-transform will-change-transform flex flex-col items-center justify-center"
          >
            <div className={`w-3 h-3 rotate-45 mb-0.5 border ${isOverlapping ? 'bg-amber-300 border-amber-100 shadow-[0_0_12px_#fde047]' : 'bg-white border-zinc-300'}`} />
            <div
              className={`w-3.5 h-full rounded-full shadow-lg transition-colors ${
                isOverlapping
                  ? 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-300 shadow-[0_0_20px_#f59e0b]'
                  : 'bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
              }`}
            />
            <div className={`w-3 h-3 rotate-45 mt-0.5 border ${isOverlapping ? 'bg-amber-300 border-amber-100 shadow-[0_0_12px_#fde047]' : 'bg-white border-zinc-300'}`} />
          </div>
        </div>

        <div className="absolute right-4 text-xs text-zinc-500 pointer-events-none hidden sm:flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700 text-[10px] font-mono">
            ESPAÇO
          </kbd>
        </div>
      </div>

      {/* Main Interactive Button */}
      <button
        onClick={handleInteraction}
        disabled={!isPlaying}
        className="mt-3 w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-base sm:text-lg tracking-wider uppercase shadow-xl hover:shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-amber-300/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="w-5 h-5 fill-zinc-950 animate-pulse" />
        <span>BATER SURDO NO RITMO!</span>
        <Target className="w-5 h-5" />
      </button>
    </div>
  );
};
