import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Flame, Volume2, VolumeX, Music } from 'lucide-react';
import { FeedbackType } from '../types';

interface CrowdViewProps {
  feedback: FeedbackType;
  combo: number;
  isMuted: boolean;
  onToggleMute: () => void;
  beatTick: number; // pulses with the music beat
  bpm: number;
  isPlaying: boolean;
  teamColors: {
    primary: string;
    secondary: string;
    name: string;
  };
}

export const CrowdView: React.FC<CrowdViewProps> = ({
  feedback,
  combo,
  isMuted,
  onToggleMute,
  beatTick,
  bpm,
  isPlaying,
  teamColors,
}) => {
  const isJumping = feedback === 'perfect' || feedback === 'good';
  const isMissed = feedback === 'miss';

  // Jump animation duration scales with BPM: higher BPM = snappier, faster jumps!
  const jumpDuration = Math.max(0.12, 60 / bpm * 0.45);

  const backRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const midRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const frontRow = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative w-full h-64 sm:h-72 md:h-80 bg-stone-900 rounded-2xl overflow-hidden border border-stone-800 shadow-xl select-none">
      {/* Stadium Floodlights & Atmosphere Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950">
        {/* Light Cones pulsing with beat */}
        <motion.div
          animate={{ opacity: isPlaying ? [0.15, 0.35, 0.15] : 0.1 }}
          transition={{ duration: 60 / bpm, repeat: Infinity }}
          className="absolute -top-10 left-1/4 w-48 h-80 bg-amber-200/10 blur-3xl transform -rotate-12 pointer-events-none"
        />
        <motion.div
          animate={{ opacity: isPlaying ? [0.15, 0.35, 0.15] : 0.1 }}
          transition={{ duration: 60 / bpm, repeat: Infinity, delay: (60 / bpm) * 0.5 }}
          className="absolute -top-10 right-1/4 w-48 h-80 bg-amber-200/10 blur-3xl transform rotate-12 pointer-events-none"
        />

        {/* Stadium Roof Truss Silhouette */}
        <svg className="absolute top-0 inset-x-0 w-full h-8 opacity-20 text-stone-600" preserveAspectRatio="none" viewBox="0 0 400 30">
          <path d="M0 0 L400 0 L400 10 L0 10 Z" fill="currentColor" />
          <path d="M10 10 L30 30 L50 10 L70 30 L90 10 L110 30 L130 10 L150 30 L170 10 L190 30 L210 10 L230 30 L250 10 L270 30 L290 10 L310 30 L330 10 L350 30 L370 10 L390 30" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Top Bar with stadium info & Sound toggle */}
      <div className="absolute top-3 inset-x-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide bg-stone-800/90 text-stone-200 border border-stone-700/60 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teamColors.primary }} />
            SETOR BANCADA: {teamColors.name.toUpperCase()}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-stone-800/90 text-amber-300 border border-stone-700/60 backdrop-blur-sm">
            <Music className="w-3 h-3 text-amber-400" />
            {Math.round(bpm)} BPM
          </span>

          {combo >= 5 && (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              PRESSÃO TOTAL!
            </motion.span>
          )}
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-stone-800/80 hover:bg-stone-700/80 text-stone-300 transition-colors border border-stone-700/60 backdrop-blur-sm cursor-pointer"
          title={isMuted ? 'Ativar Efeitos Sonoros' : 'Silenciar'}
          aria-label="Controle de Áudio"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Smoke and Flares effect during high combo */}
      {combo >= 3 && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(0.25 + combo * 0.03, 0.6) }}
            className="absolute -bottom-10 left-10 w-44 h-44 rounded-full blur-3xl"
            style={{ backgroundColor: teamColors.primary }}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: Math.min(0.25 + combo * 0.03, 0.6) }}
            className="absolute -bottom-10 right-10 w-44 h-44 rounded-full blur-3xl"
            style={{ backgroundColor: teamColors.secondary }}
          />
        </div>
      )}

      {/* Visual Stadium Concrete Terraces */}
      <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-stone-800 to-stone-850 flex flex-col justify-end border-t border-stone-700/50">
        <div className="w-full h-12 bg-stone-800/80 border-t border-stone-700/30" />
        <div className="w-full h-14 bg-stone-800/90 border-t border-stone-700/40" />
        <div className="w-full h-16 bg-stone-850 border-t border-stone-700/60" />
      </div>

      {/* CROWD TIER 1 (Back Row) */}
      <div className="absolute bottom-28 inset-x-0 flex justify-around px-4 pointer-events-none z-0">
        {backRow.map((idx) => {
          // Automatic pulse with music beat or user hit
          const yOffset = isJumping
            ? -(15 + (idx % 3) * 4)
            : isMissed
            ? 4
            : isPlaying && beatTick % 2 === 0
            ? -6
            : 0;

          return (
            <motion.div
              key={`back-${idx}`}
              animate={{ y: yOffset }}
              transition={{
                duration: jumpDuration,
                ease: 'easeOut',
              }}
              className="flex flex-col items-center opacity-70"
            >
              {idx % 4 === 1 && (
                <motion.div
                  animate={{ rotate: isJumping ? [-20, 20, -20] : 0 }}
                  transition={{ repeat: Infinity, duration: jumpDuration * 2 }}
                  className="w-5 h-3 rounded-xs mb-0.5"
                  style={{ backgroundColor: teamColors.primary }}
                />
              )}
              <div className="w-4 h-4 rounded-full bg-amber-200/90 border border-stone-800" />
              <div
                className="w-5 h-7 rounded-t-md"
                style={{ backgroundColor: idx % 2 === 0 ? teamColors.primary : teamColors.secondary }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* CROWD TIER 2 (Middle Row) */}
      <div className="absolute bottom-16 inset-x-0 flex justify-around px-6 pointer-events-none z-10">
        {midRow.map((idx) => {
          const yOffset = isJumping
            ? -(22 + (idx % 2) * 5)
            : isMissed
            ? 6
            : isPlaying && beatTick % 2 === 1
            ? -8
            : 0;

          return (
            <motion.div
              key={`mid-${idx}`}
              animate={{
                y: yOffset,
                rotate: isJumping ? (idx % 2 === 0 ? 3 : -3) : 0,
              }}
              transition={{
                duration: jumpDuration,
                ease: 'easeOut',
              }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    scaleY: isJumping ? 1.4 : 1,
                    y: isJumping ? -4 : 0,
                  }}
                  transition={{ duration: jumpDuration }}
                  className="absolute -top-3 -inset-x-1 flex justify-between px-0.5"
                >
                  <div className="w-1.5 h-3 bg-amber-200/90 rounded-full" />
                  <div className="w-1.5 h-3 bg-amber-200/90 rounded-full" />
                </motion.div>
                <div className="w-5 h-5 rounded-full bg-amber-200 border-2 border-stone-900" />
              </div>
              <div
                className="w-7 h-9 rounded-t-lg shadow-sm"
                style={{ backgroundColor: idx % 2 === 0 ? teamColors.primary : '#ffffff' }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* CROWD TIER 3 (Front Row - Active Leaders & Drummers) */}
      <div className="absolute bottom-3 inset-x-0 flex justify-around px-8 pointer-events-none z-20">
        {frontRow.map((idx) => {
          const isDrummer = idx === 3 || idx === 4;
          const yOffset = isJumping
            ? -32
            : isMissed
            ? 8
            : isPlaying && beatTick % 2 === 0
            ? -12
            : 0;

          return (
            <motion.div
              key={`front-${idx}`}
              animate={{
                y: yOffset,
                scale: isJumping ? 1.12 : 1,
              }}
              transition={{
                duration: jumpDuration,
                ease: 'easeOut',
              }}
              className="flex flex-col items-center"
            >
              {isDrummer && (
                <div className="relative mb-1">
                  <motion.div
                    animate={{ scale: isJumping ? [1, 1.35, 1] : 1 }}
                    transition={{ duration: jumpDuration }}
                    className="w-8 h-6 rounded-md bg-stone-200 border-2 border-amber-600 flex items-center justify-center shadow-md"
                  >
                    <div className="w-5 h-0.5 bg-stone-400" />
                  </motion.div>
                </div>
              )}

              <div className="relative">
                <div className="w-6 h-6 rounded-full bg-amber-100 border-2 border-stone-950 flex items-center justify-center overflow-hidden">
                  <div
                    className="w-full h-1.5 absolute top-0.5"
                    style={{ backgroundColor: teamColors.primary }}
                  />
                </div>
              </div>

              <div
                className="w-9 h-11 rounded-t-xl border-t-2 border-x-2 border-stone-950 flex flex-col justify-between shadow-lg"
                style={{ backgroundColor: teamColors.primary }}
              >
                <div className="w-full h-2 bg-white/30" />
                <div className="text-[9px] font-black text-center text-white/80 pb-1">
                  {idx + 10}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Feedback Label overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
        {feedback === 'perfect' && (
          <motion.div
            key="fb-perfect"
            initial={{ scale: 0.5, y: 20, opacity: 0 }}
            animate={{ scale: [0.5, 1.25, 1], y: -20, opacity: [0, 1, 0] }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center"
          >
            <div className="px-5 py-2 rounded-2xl bg-amber-400 text-stone-950 font-black text-2xl tracking-wider shadow-2xl flex items-center gap-2 border-2 border-amber-200">
              <Sparkles className="w-6 h-6 fill-stone-950" />
              PULOU NO RITMO! PERFEITO!
            </div>
          </motion.div>
        )}

        {feedback === 'good' && (
          <motion.div
            key="fb-good"
            initial={{ scale: 0.6, y: 15, opacity: 0 }}
            animate={{ scale: [0.6, 1.15, 1], y: -15, opacity: [0, 1, 0] }}
            transition={{ duration: 0.3 }}
            className="px-4 py-1.5 rounded-xl bg-emerald-400 text-stone-950 font-black text-xl tracking-wide shadow-xl border-2 border-emerald-200"
          >
            ACERTOU!
          </motion.div>
        )}

        {feedback === 'miss' && (
          <motion.div
            key="fb-miss"
            initial={{ scale: 0.8, opacity: 0, rotate: -4 }}
            animate={{ scale: [0.8, 1.1, 1], opacity: [0, 1, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 0.35 }}
            className="px-4 py-1.5 rounded-xl bg-rose-600 text-white font-black text-xl tracking-wide shadow-xl border-2 border-rose-400"
          >
            ERROU O TEMPO! (MISS)
          </motion.div>
        )}
      </div>
    </div>
  );
};
