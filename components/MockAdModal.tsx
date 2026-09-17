"use client";

import React, { useState, useEffect, useRef } from "react";
import { Tv, Sparkles, X, CheckCircle2, ExternalLink, Volume2, VolumeX, Lock, Play } from "lucide-react";

interface MockAdModalProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const MockAdModal: React.FC<MockAdModalProps> = ({ onComplete, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [duration, setDuration] = useState(20);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const shopeeUrl = "https://shopee.com.br/product/336227879/22899347329/";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Explicitly load video for mobile compatibility
    try {
      video.load();
    } catch {}

    const handleLoadedMetadata = () => {
      if (video.duration && !isNaN(video.duration)) {
        setDuration(video.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime || 0);
      if (video.duration && video.currentTime >= video.duration - 0.3) {
        setIsFinished(true);
      }
    };

    const handleEnded = () => {
      setIsFinished(true);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    // Muted autoplay attempt for mobile Safari/Chrome
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPaused(false);
        })
        .catch(() => {
          setIsPaused(true);
        });
    }

    // Fallback timer interval (ticks every 1s)
    const timer = setInterval(() => {
      if (video.currentTime) {
        setCurrentTime(video.currentTime);
        if (video.duration && !isNaN(video.duration)) setDuration(video.duration);
        if (video.currentTime >= (video.duration || 20) - 0.5) {
          setIsFinished(true);
        }
      } else {
        setCurrentTime((prev) => {
          const next = prev + 1;
          if (next >= 20) setIsFinished(true);
          return next;
        });
      }
    }, 1000);

    return () => {
      clearInterval(timer);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  const handleStartPlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = false;
      setIsMuted(false);
      videoRef.current.play().then(() => setIsPaused(false)).catch(() => {});
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleAdClick = () => {
    window.open(shopeeUrl, "_blank");
  };

  const totalSeconds = duration > 0 ? duration : 20;
  const remainingSeconds = Math.max(0, Math.ceil(totalSeconds - currentTime));
  const progressPct = totalSeconds > 0 ? Math.min(100, (currentTime / totalSeconds) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in overflow-y-auto">
      <div className="bg-zinc-950 border-2 border-amber-500/80 rounded-2xl sm:rounded-3xl w-full max-w-[360px] h-[92vh] max-h-[720px] p-3 shadow-2xl flex flex-col justify-between text-center relative overflow-hidden my-auto">
        {/* Ad Header Banner */}
        <div className="flex items-center justify-between bg-amber-950/90 border border-amber-500/50 rounded-xl px-3 py-2 text-left z-10 shrink-0">
          <div className="flex items-center gap-1.5">
            <Tv className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
              ANÚNCIO RECOMPENSADO (2x CONTINGENTE)
            </span>
          </div>
          <span className="text-[10px] font-black text-amber-400 bg-zinc-900 px-2 py-0.5 rounded border border-amber-500/30">
            {isFinished ? "CONCLUÍDO" : `${remainingSeconds}s`}
          </span>
        </div>

        {/* Vertical Portrait Video Container (TikTok / Reels Style 9:16 Aspect Ratio) */}
        <div
          onClick={handleAdClick}
          className="group relative flex-1 w-full bg-black rounded-xl border border-zinc-800 overflow-hidden cursor-pointer shadow-2xl transition-all hover:border-amber-400/80 flex items-center justify-center my-2 min-h-0 aspect-[9/16]"
          title="Clique em qualquer lugar do anúncio para abrir na Shopee"
        >
          <video
            ref={videoRef}
            src="/videos/videoanuncio.mp4"
            autoPlay
            playsInline
            muted={isMuted}
            preload="auto"
            className="w-full h-full object-cover rounded-xl bg-black"
          >
            <source src="/videos/videoanuncio.mp4" type="video/mp4" />
          </video>

          {/* Pause / Autoplay Play Trigger Button Overlay */}
          {isPaused && (
            <button
              onClick={handleStartPlay}
              className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 text-white font-black z-30 cursor-pointer p-4 text-center"
            >
              <div className="w-14 h-14 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transform transition group-hover:scale-110">
                <Play className="w-7 h-7 ml-1 fill-black" />
              </div>
              <span className="text-xs uppercase tracking-wider bg-amber-500 text-black px-3 py-1.5 rounded-full shadow font-bold">
                ▶ TOQUE PARA ASSISTIR COM SOM
              </span>
            </button>
          )}

          {/* Click Shopee Watermark Overlay */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none z-10">
            <span className="bg-orange-600/95 text-white text-[9px] font-black uppercase px-2 py-1 rounded border border-orange-400 shadow flex items-center gap-1">
              <ExternalLink className="w-2.5 h-2.5" /> Shopee • Clique para abrir produto
            </span>
          </div>

          {/* Audio Mute/Unmute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="absolute bottom-3 right-3 bg-black/80 hover:bg-black text-white p-2 rounded-full border border-amber-500/50 z-20 transition shadow cursor-pointer"
            title={isMuted ? "Ativar som" : "Desativar som"}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Progress Bar overlay at bottom of video */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-zinc-900 pointer-events-none z-20">
            <div
              className="h-full bg-amber-500 transition-all duration-200"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Shopee Click Callout Banner */}
        <div className="shrink-0 space-y-2">
          <button
            onClick={handleAdClick}
            className="w-full bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 hover:from-orange-500 hover:to-yellow-500 text-white p-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Abrir Produto na Shopee
          </button>

          {/* Lock / Advance Status Explanation */}
          <p className="text-[10px] text-zinc-300 leading-tight font-medium">
            {isFinished ? (
              <span className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Anúncio concluído! Recompensa liberada.
              </span>
            ) : (
              <span>
                Assista até o fim para liberar a <strong>Segunda Chance (2x Contingente)</strong>.
              </span>
            )}
          </p>

          {/* Action Buttons */}
          <div>
            {isFinished ? (
              <button
                onClick={onComplete}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-400 hover:from-emerald-400 hover:to-green-300 text-black font-black text-xs uppercase tracking-wider transition-all shadow-xl active:scale-95 cursor-pointer flex items-center justify-center gap-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4 text-black" /> RESGATAR 2x CONTINGENTE & REFAZER DUELO
              </button>
            ) : (
              <div className="space-y-1.5">
                <button
                  disabled
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 font-black text-[11px] uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Lock className="w-3.5 h-3.5 text-amber-500/60" /> AGUARDE O FIM DO VÍDEO ({remainingSeconds}s)
                </button>

                <button
                  onClick={onCancel}
                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" /> Sair sem Recompensa
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
