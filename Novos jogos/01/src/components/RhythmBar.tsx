import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'motion/react';
import { Target, Zap, ChevronLeft, ChevronRight, Music } from 'lucide-react';
import { FeedbackType } from '../types';

interface RhythmBarProps {
  combo: number;
  onHit: (isPerfect: boolean) => void;
  onMiss: (reason: 'clicked_outside' | 'passed_without_click') => void;
  feedback: FeedbackType;
  bpm: number;
  isPlaying: boolean;
}

export const RhythmBar: React.FC<RhythmBarProps> = ({
  combo,
  onHit,
  onMiss,
  feedback,
  bpm,
  isPlaying,
}) => {
  // Target Zone bounds (in percentage 0-100)
  const TARGET_START = 40;
  const TARGET_END = 60;
  const PERFECT_START = 46;
  const PERFECT_END = 54;
  const POINTER_HALF_WIDTH = 1.8;

  // Track position and physics
  const posRef = useRef<number>(10);
  const dirRef = useRef<number>(1);
  const wasInsideZoneRef = useRef<boolean>(false);
  const hasHitInCurrentPassRef = useRef<boolean>(false);
  const lastTimeRef = useRef<number | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const [cursorPos, setCursorPos] = useState<number>(10);
  const [isOverlapping, setIsOverlapping] = useState<boolean>(false);

  // Speed is linked to the musical BPM + combo multiplier (1.1^combo)
  // At 100 BPM base, the bar crosses roughly in sync with beats
  const comboMultiplier = Math.min(Math.pow(1.1, combo), 4.5);
  // Speed percentage per second
  const speed = (bpm * 0.95) * comboMultiplier;

  const handleInteraction = useCallback(() => {
    if (!isPlaying) return;

    const p = posRef.current;
    const pointerLeft = p - POINTER_HALF_WIDTH;
    const pointerRight = p + POINTER_HALF_WIDTH;

    // Overlap check
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

  // Keyboard shortcut listener (Spacebar)
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
      {/* Visual Status Indicator above the bar */}
      <div className="w-full flex items-center justify-between mb-3 text-xs font-semibold tracking-wider text-stone-400">
        <div className="flex items-center gap-1.5">
          <ChevronLeft className="w-4 h-4 text-stone-500 animate-pulse" />
          <span className="font-mono">GUITAR HERO / TIMING ZONE</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-stone-800 text-amber-300 border border-stone-700 font-mono flex items-center gap-1">
            <Music className="w-3 h-3 text-amber-400" />
            {Math.round(bpm)} BPM ({comboMultiplier.toFixed(1)}x)
          </span>
          <ChevronRight className="w-4 h-4 text-stone-500 animate-pulse" />
        </div>
      </div>

      {/* 1. Elementos Visuais e Setup (UI) */}
      {/* Painel contendo uma barra horizontal (Fundo) */}
      <div
        id="rhythm-track-container"
        onClick={handleInteraction}
        className="relative w-full h-22 sm:h-26 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-900 rounded-2xl p-3 border-2 border-stone-800 shadow-2xl cursor-pointer transition-all hover:border-stone-700 active:scale-[0.99] flex items-center group overflow-hidden"
      >
        {/* Guitar Hero Style perspective & speed lane lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#333_1px,transparent_1px)] bg-[size:4%_100%] opacity-20 pointer-events-none" />

        {/* The Track (Barra Horizontal / Fundo) */}
        <div className="relative w-full h-10 sm:h-12 bg-stone-950 rounded-xl overflow-hidden border border-stone-800/90 shadow-inner flex items-center">
          {/* Subtle guide tick marks */}
          <div className="absolute inset-0 flex justify-between px-2 pointer-events-none opacity-30">
            {Array.from({ length: 25 }).map((_, i) => (
              <div
                key={i}
                className={`h-full w-px ${i === 12 ? 'bg-amber-400 opacity-90' : 'bg-stone-600'}`}
              />
            ))}
          </div>

          {/* 'Zona de Acerto' (Target Zone) - No centro da barra */}
          <div
            id="target-zone"
            style={{
              left: `${TARGET_START}%`,
              width: `${TARGET_END - TARGET_START}%`,
            }}
            className={`absolute top-0 bottom-0 rounded-lg transition-colors duration-75 flex items-center justify-center border-x-2 ${
              feedback === 'miss'
                ? 'bg-rose-950/80 border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
                : isOverlapping
                ? 'bg-amber-400/40 border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.6)]'
                : 'bg-emerald-950/40 border-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
            }`}
          >
            {/* Center Perfect Sweet Spot (Centro Perfeito) */}
            <div
              style={{ width: '40%' }}
              className="h-full bg-emerald-500/25 flex items-center justify-center border-x border-emerald-400/50"
            >
              <div className="w-1 h-full bg-emerald-300/90 shadow-[0_0_8px_#34d399]" />
            </div>

            <span className="absolute -bottom-5 text-[10px] font-black uppercase tracking-widest text-emerald-400/80 pointer-events-none">
              HIT ZONE
            </span>
          </div>

          {/* 'Ponteiro' (Cursor) - Move-se em ritmo acelerado */}
          <div
            id="rhythm-pointer"
            style={{
              left: `${cursorPos}%`,
              transform: 'translateX(-50%)',
            }}
            className="absolute top-0 bottom-0 z-20 pointer-events-none transition-transform will-change-transform flex flex-col items-center justify-center"
          >
            {/* Top pointer diamond marker */}
            <div
              className={`w-3 h-3 rotate-45 mb-0.5 border ${
                isOverlapping ? 'bg-amber-300 border-amber-100 shadow-[0_0_12px_#fde047]' : 'bg-white border-stone-300'
              }`}
            />

            {/* Glowing Cursor Bar */}
            <div
              className={`w-3 sm:w-3.5 h-full rounded-full shadow-lg transition-colors ${
                isOverlapping
                  ? 'bg-gradient-to-b from-amber-200 via-amber-400 to-amber-300 shadow-[0_0_20px_#f59e0b]'
                  : 'bg-gradient-to-b from-stone-100 via-stone-200 to-stone-100 shadow-[0_0_10px_rgba(255,255,255,0.8)]'
              }`}
            />

            {/* Bottom pointer diamond marker */}
            <div
              className={`w-3 h-3 rotate-45 mt-0.5 border ${
                isOverlapping ? 'bg-amber-300 border-amber-100 shadow-[0_0_12px_#fde047]' : 'bg-white border-stone-300'
              }`}
            />
          </div>
        </div>

        {/* Hover/Tap cue hint */}
        <div className="absolute right-4 text-xs font-medium text-stone-500 pointer-events-none hidden sm:flex items-center gap-1.5">
          <kbd className="px-2 py-0.5 bg-stone-800 text-stone-300 rounded border border-stone-700 text-[11px] font-mono">
            ESPAÇO
          </kbd>
          <span>ou clique</span>
        </div>
      </div>

      {/* Big Action Tap Button */}
      <button
        id="tap-action-button"
        onClick={handleInteraction}
        disabled={!isPlaying}
        className="mt-4 w-full py-4 sm:py-5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-lg sm:text-xl tracking-wider uppercase shadow-xl hover:shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border-2 border-amber-300/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Zap className="w-6 h-6 fill-stone-950 animate-pulse" />
        <span>PULAR NO RITMO! (GUITAR HERO)</span>
        <Target className="w-5 h-5" />
      </button>
    </div>
  );
};
