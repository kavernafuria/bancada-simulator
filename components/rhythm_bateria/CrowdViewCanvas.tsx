import React from 'react';
import { Flame, Volume2, VolumeX, Music } from 'lucide-react';
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
  primaryColor?: string;
  secondaryColor?: string;
}

interface FanPersonProps {
  seed: number;
  isUp: boolean;
  isMissed: boolean;
  row: 'back' | 'mid' | 'front';
  primaryColor?: string;
  secondaryColor?: string;
}

const FanPersonFigure: React.FC<FanPersonProps> = ({ seed, isUp, isMissed, row, primaryColor, secondaryColor }) => {
  const skinTones = ['#5c3a21', '#8d5524', '#c68642', '#e0ac69', '#f1c27d'];
  const skinColor = skinTones[seed % skinTones.length];

  const pColor = primaryColor || '#f59e0b';
  const sColor = secondaryColor || '#18181b';
  const jerseyColors = [pColor, sColor, pColor, sColor, '#ffffff'];
  const jerseyColor = jerseyColors[seed % jerseyColors.length];
  const accentColor = seed % 2 === 0 ? pColor : '#ffffff';

  const hasCap = seed % 3 === 0;
  const capColor = seed % 2 === 0 ? '#18181b' : '#f59e0b';
  const hasSunglasses = seed % 4 === 1;
  const holdsFlag = seed % 3 === 0 && row === 'front';

  return (
    <div
      className={`relative transition-all duration-100 ease-out flex flex-col items-center justify-end select-none pointer-events-none ${
        row === 'front'
          ? 'w-8 sm:w-11 h-24 sm:h-28'
          : row === 'mid'
          ? 'w-7 sm:w-9 h-20 sm:h-24 opacity-90'
          : 'w-6 sm:w-7 h-16 sm:h-20 opacity-70'
      } ${isUp ? '-translate-y-5 sm:-translate-y-7' : 'translate-y-0'} ${
        isMissed ? 'translate-y-2 opacity-40 grayscale' : ''
      }`}
    >
      <svg viewBox="0 0 100 130" className="w-full h-full drop-shadow-md">
        {/* Braços Erguidos Pulando */}
        {isUp ? (
          <g>
            <path d="M 30,55 Q 18,30 12,12" stroke={skinColor} strokeWidth="12" strokeLinecap="round" fill="none" />
            <circle cx="10" cy="10" r="7" fill={skinColor} />

            <path d="M 70,55 Q 82,30 88,12" stroke={skinColor} strokeWidth="12" strokeLinecap="round" fill="none" />
            <circle cx="90" cy="10" r="7" fill={skinColor} />

            {holdsFlag && (
              <g className="animate-pulse">
                <line x1="90" y1="10" x2="90" y2="-20" stroke="#d97706" strokeWidth="4" />
                <polygon points="90,-20 115,-10 90,0" fill="#f59e0b" />
              </g>
            )}
          </g>
        ) : (
          <g>
            <path d="M 30,58 Q 20,70 35,78" stroke={skinColor} strokeWidth="11" strokeLinecap="round" fill="none" />
            <path d="M 70,58 Q 80,70 65,78" stroke={skinColor} strokeWidth="11" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Tronco / Regata de Torcida */}
        <path d="M 24,52 L 76,52 L 70,125 L 30,125 Z" fill={jerseyColor} />
        <path d="M 45,52 L 55,52 L 55,125 L 45,125 Z" fill={accentColor} opacity="0.85" />

        {/* Pescoço */}
        <rect x="42" y="36" width="16" height="18" fill={skinColor} rx="3" />

        {/* Cabeça */}
        <circle cx="50" cy="30" r="17" fill={skinColor} />

        {/* Olhos ou Juliet (Óculos Escuros) */}
        {hasSunglasses ? (
          <path d="M 38,28 Q 50,30 62,28" stroke="#f59e0b" strokeWidth="5" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <circle cx="43" cy="29" r="2.2" fill="#18181b" />
            <circle cx="57" cy="29" r="2.2" fill="#18181b" />
          </>
        )}

        {/* Boca Cantando / Gritando na Torcida */}
        <ellipse cx="50" cy="37" rx={isUp ? "5" : "3.5"} ry={isUp ? "4" : "2"} fill="#18181b" />

        {/* Cabelo ou Boné */}
        {hasCap ? (
          <g>
            <path d="M 31,27 Q 50,11 69,27 Z" fill={capColor} />
            <path d="M 62,27 L 78,30 L 62,33 Z" fill={capColor} />
          </g>
        ) : (
          <path d="M 33,26 Q 50,12 67,26 Q 50,22 33,26 Z" fill="#18181b" />
        )}
      </svg>
    </div>
  );
};

export const CrowdViewCanvas: React.FC<CrowdViewCanvasProps> = ({
  feedback,
  combo,
  isMuted,
  onToggleMute,
  beatTick,
  bpm,
  isPlaying,
  torcidaName = 'BANCA DAS ARQUIBANCADAS',
  primaryColor,
  secondaryColor,
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

      {/* REALISTIC HUMAN TORCIDA ANIMATION - JUMPING FANS */}
      <div className="absolute bottom-0 inset-x-0 h-44 flex flex-col justify-end px-4 overflow-hidden pointer-events-none z-10">
        
        {/* Back Row */}
        <div className="flex justify-between items-end opacity-75 transform scale-90 -mb-3">
          {backRow.map((idx) => {
            const isUp = isJumping || (isPlaying && (beatTick + idx) % 4 === 2);
            return (
              <FanPersonFigure
                key={`back-${idx}`}
                seed={idx + 10}
                isUp={isUp}
                isMissed={isMissed}
                row="back"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            );
          })}
        </div>

        {/* Mid Row */}
        <div className="flex justify-around items-end opacity-90 transform scale-95 -mb-3">
          {midRow.map((idx) => {
            const isUp = isJumping || (isPlaying && (beatTick % 4 === 0 || (beatTick + idx) % 4 === 0));
            return (
              <FanPersonFigure
                key={`mid-${idx}`}
                seed={idx + 25}
                isUp={isUp}
                isMissed={isMissed}
                row="mid"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            );
          })}
        </div>

        {/* Front Row */}
        <div className="flex justify-between items-end px-2">
          {frontRow.map((idx) => {
            const isUp = isJumping || (isPlaying && beatTick % 4 === 0);
            return (
              <FanPersonFigure
                key={`front-${idx}`}
                seed={idx + 50}
                isUp={isUp}
                isMissed={isMissed}
                row="front"
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
