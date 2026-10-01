"use client";

import React, { useEffect, useState } from "react";
import { Music, Volume2, VolumeX, SkipForward, Play, Pause, Disc } from "lucide-react";
import { MusicService, MusicServiceState } from "@/lib/music_service";

export function BackgroundMusicPlayer() {
  const [state, setState] = useState<MusicServiceState>(MusicService.getState());
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    // Initialize audio service
    MusicService.init();

    // Subscribe to state updates
    const unsubscribe = MusicService.subscribe((newState) => {
      setState(newState);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const { isPlaying, isMuted, volume, currentTrack, isMinigameActive } = state;

  return (
    <div className="flex items-center gap-2 bg-zinc-900/90 dark:bg-zinc-950/90 border border-amber-500/30 rounded-full px-3 py-1.5 backdrop-blur-md shadow-lg text-xs select-none">
      {/* Equalizer Icon / Disc Spinner */}
      <div className="flex items-center gap-1.5 text-amber-400">
        <Disc className={`w-4 h-4 text-amber-400 ${isPlaying ? "animate-spin" : "opacity-60"}`} />
      </div>

      {/* Current Track Title & Info */}
      <div className="flex flex-col min-w-0 max-w-[150px] sm:max-w-[200px]">
        <div className="flex items-center gap-1">
          <Music className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="font-extrabold text-[11px] text-white truncate">
            {isMinigameActive
              ? "Minigame Ativo"
              : currentTrack
              ? currentTrack.title
              : "Trilha Sonora"}
          </span>
        </div>

        <span className="text-[9px] text-zinc-400 truncate">
          {isMinigameActive
            ? "Música pausada no minigame"
            : currentTrack?.isTheme
            ? "Tema Oficial"
            : isPlaying
            ? "Modo Aleatório"
            : "Pausado"}
        </span>
      </div>

      {/* Controls: Play/Pause, Next, Volume */}
      <div className="flex items-center gap-1 pl-1 border-l border-zinc-800">
        {/* Play/Pause Button */}
        <button
          onClick={() => MusicService.togglePlay()}
          title={isPlaying ? "Pausar Música" : "Tocar Música"}
          className="p-1 rounded-full hover:bg-amber-500/20 text-amber-400 transition-colors active:scale-95 cursor-pointer"
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>

        {/* Next Track Button */}
        <button
          onClick={() => MusicService.nextTrack()}
          title="Próxima Música (Aleatório)"
          className="p-1 rounded-full hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 transition-colors active:scale-95 cursor-pointer"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        {/* Volume & Mute Toggle */}
        <div className="relative flex items-center">
          <button
            onClick={() => MusicService.toggleMute()}
            onMouseEnter={() => setShowVolumeSlider(true)}
            title={isMuted ? "Ativar Som" : "Mudar Volume / Mutar"}
            className="p-1 rounded-full hover:bg-amber-500/20 text-zinc-300 hover:text-amber-400 transition-colors active:scale-95 cursor-pointer"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            )}
          </button>

          {/* Popover Volume Slider */}
          {showVolumeSlider && (
            <div
              onMouseLeave={() => setShowVolumeSlider(false)}
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-zinc-900 border border-amber-500/30 rounded-xl shadow-xl flex items-center gap-2 z-50 animate-fade-in"
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => MusicService.setVolume(parseFloat(e.target.value))}
                className="w-20 accent-amber-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <span className="text-[10px] font-bold text-amber-400 w-6 text-right">
                {isMuted ? "0%" : `${Math.round(volume * 100)}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
