import React from 'react';
import { Sparkles, Flame, Volume2, VolumeX, Music } from 'lucide-react';
import { FeedbackType } from './types';

interface CrowdViewCanvasProps {
  feedback: FeedbackType;
  combo: number;
  isMuted: boolean;
  onToggleMute: () => void;
  beatTick: number;
  bpm: number;
  isPlaying: boolean;
  torcidaName?: string;
}

export const CrowdViewCanvas: React.FC<CrowdViewCanvasProps> = ({
  feedback,
  combo,
  isMuted,
  onToggleMute,
  beatTick,
  bpm,
  isPlaying,
  torcidaName = 'BANCA DAS ARQUIBANCADAS',
}) => {
  const isJumping = feedback === 'perfect' || feedback === 'good';
  const isMissed = feedback === 'miss';

  const backRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const midRow = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const frontRow = [0, 1, 2, 3, 4, 5, 6, 7];

  return (
    <div className="relative w-full h-56 sm:h-64 bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-xl select-none">
      {/* Stadium Floodlights & Atmosphere Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950">
        <div
          className={`absolute -top-10 left-1/4 w-48 h-80 bg-amber-200/10 blur-3xl transform -rotate-12 pointer-events-none transition-opacity duration-300 ${
            isPlaying ? 'opacity-30' : 'opacity-10'
          }`}
        />
        <div
          className={`absolute -top-10 right-1/4 w-48 h-80 bg-amber-200/10 blur-3xl transform rotate-12 pointer-events-none transition-opacity duration-300 ${
            isPlaying ? 'opacity-30' : 'opacity-10'
          }`}
        />

        {/* Stadium Roof Silhouette */}
        <svg className="absolute top-0 inset-x-0 w-full h-8 opacity-20 text-zinc-600" preserveAspectRatio="none" viewBox="0 0 400 30">
          <path d="M0 0 L400 0 L400 10 L0 10 Z" fill="currentColor" />
          <path d="M10 10 L30 30 L50 10 L70 30 L90 10 L110 30 L130 10 L150 30 L170 10 L190 30 L210 10 L230 30 L250 10 L270 30 L290 10 L310 30 L330 10 L350 30 L370 10 L390 30" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Top Bar */}
      <div className="absolute top-3 inset-x-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            {torcidaName}
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-zinc-800/90 text-amber-300 border border-zinc-700/60 backdrop-blur-sm">
            <Music className="w-3 h-3 text-amber-400" />
            {Math.round(bpm)} BPM
          </span>

          {combo >= 5 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-sm animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              CALDEIRÃO EM FEBRE!
            </span>
          )}
        </div>

        <button
          onClick={onToggleMute}
          className="p-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-300 transition-colors border border-zinc-700/60 backdrop-blur-sm cursor-pointer"
          title={isMuted ? 'Ativar Som' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>
      </div>

      {/* Smoke and Flares effect during high combo */}
      {combo >= 3 && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute bottom-0 left-10 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 right-10 w-32 h-32 bg-red-500/10 rounded-full blur-2xl animate-pulse" />
        </div>
      )}

      {/* Visual Feedback Popup */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        {feedback === 'perfect' && (
          <div className="px-4 py-2 bg-amber-400 text-zinc-950 font-black text-base sm:text-xl rounded-2xl shadow-2xl border-2 border-white tracking-widest uppercase animate-bounce">
            ⚡ PERFEITO! NO RITMO!
          </div>
        )}
        {feedback === 'good' && (
          <div className="px-4 py-2 bg-emerald-500 text-white font-black text-sm sm:text-lg rounded-2xl shadow-xl border border-emerald-300 tracking-wider uppercase">
            🥁 BOA! MANTEVE O SURDO!
          </div>
        )}
        {feedback === 'miss' && (
          <div className="px-4 py-2 bg-red-600 text-white font-black text-sm sm:text-lg rounded-2xl shadow-xl border border-red-400 tracking-wider uppercase animate-pulse">
            ❌ ATRAVESSOU O RITMO!
          </div>
        )}
      </div>

      {/* TORCIDA ANIMATION - JUMPING FANS SYNCHRONIZED TO BEAT */}
      <div className="absolute bottom-0 inset-x-0 h-44 flex flex-col justify-end px-4 overflow-hidden pointer-events-none z-10">
        
        {/* Back Row - Sync with Upbeat */}
        <div className="flex justify-between items-end opacity-60 transform scale-90 -mb-2">
          {backRow.map((idx) => {
            const isUp = isJumping || (isPlaying && (beatTick + idx) % 4 === 2);
            return (
              <div
                key={`back-${idx}`}
                className={`w-5 sm:w-6 rounded-t-full bg-zinc-700 transition-transform duration-100 ease-out ${
                  isUp ? '-translate-y-5 h-14' : 'h-10'
                } ${isMissed ? 'translate-y-2 opacity-50' : ''}`}
              />
            );
          })}
        </div>

        {/* Mid Row - Sync with Surdo Downbeats */}
        <div className="flex justify-around items-end opacity-85 transform scale-95 -mb-2">
          {midRow.map((idx) => {
            const isUp = isJumping || (isPlaying && (beatTick % 4 === 0 || (beatTick + idx) % 4 === 0));
            return (
              <div
                key={`mid-${idx}`}
                className={`w-6 sm:w-8 rounded-t-full bg-amber-600 border-t-2 border-amber-400 transition-transform duration-100 ease-out ${
                  isUp ? '-translate-y-6 h-16' : 'h-12'
                } ${isMissed ? 'translate-y-2 opacity-50' : ''}`}
              />
            );
          })}
        </div>

        {/* Front Row - Sync on Every Surdo Beat & Hit */}
        <div className="flex justify-between items-end px-2">
          {frontRow.map((idx) => {
            const isUp = isJumping || (isPlaying && beatTick % 4 === 0);
            return (
              <div
                key={`front-${idx}`}
                className={`w-7 sm:w-10 rounded-t-full bg-zinc-100 border-t-4 border-amber-500 shadow-md transition-transform duration-100 ease-out flex flex-col items-center justify-start pt-1 ${
                  isUp ? '-translate-y-7 h-20 shadow-amber-500/50' : 'h-14'
                } ${isMissed ? 'translate-y-2 opacity-40' : ''}`}
              >
                <div className="w-2 h-2 rounded-full bg-zinc-900 mb-1" />
                <div className="w-4 h-1 bg-amber-500 rounded-full" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
