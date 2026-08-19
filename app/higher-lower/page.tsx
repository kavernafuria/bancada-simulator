"use client";

import React, { useEffect, useState, useRef } from "react";
import { ArrowUp, ArrowDown, Trophy, RefreshCw, Share2, Check, Flame, Shield, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface HLPlayer {
  id: number;
  name: string;
  photo: string | null;
  country: string;
  current_team: string;
  value: number;
  formatted_value: string;
}

interface PairResponse {
  metric: string;
  metric_label: string;
  player_left: HLPlayer;
  player_right: HLPlayer;
}

function formatEuros(val: number): string {
  if (val >= 1_000_000) {
    const millions = val / 1_000_000;
    return `€ ${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}M`;
  } else if (val >= 1_000) {
    const thousands = val / 1_000;
    return `€ ${thousands.toFixed(0)} mil`;
  }
  return `€ ${val}`;
}

export default function HigherLowerPage() {
  const [leftPlayer, setLeftPlayer] = useState<HLPlayer | null>(null);
  const [rightPlayer, setRightPlayer] = useState<HLPlayer | null>(null);
  const [metricLabel, setMetricLabel] = useState<string>("Maior Valor de Mercado");
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  
  const [isRevealing, setIsRevealing] = useState<boolean>(false);
  const [revealedValue, setRevealedValue] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const [leftImgError, setLeftImgError] = useState<boolean>(false);
  const [rightImgError, setRightImgError] = useState<boolean>(false);

  const excludeIdsRef = useRef<number[]>([]);

  // Load high score
  useEffect(() => {
    const savedHighScore = localStorage.getItem("hl_high_score");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore, 10) || 0);
    }
  }, []);

  // Fetch initial or next pair
  const fetchNextPair = async (excludeList: number[], currentRight?: HLPlayer) => {
    setIsLoading(true);
    try {
      const excludeParam = excludeList.join(",");
      const res = await fetch(`/api/higher-lower/next-pair?exclude=${excludeParam}`);
      if (res.ok) {
        const data: PairResponse = await res.json();
        setMetricLabel(data.metric_label);

        if (data.player_right.photo && typeof window !== "undefined") {
          const img = new Image();
          img.src = data.player_right.photo;
        }

        if (currentRight) {
          setLeftPlayer(currentRight);
          setRightPlayer(data.player_right);
        } else {
          setLeftPlayer(data.player_left);
          setRightPlayer(data.player_right);

          if (data.player_left.photo && typeof window !== "undefined") {
            const imgLeft = new Image();
            imgLeft.src = data.player_left.photo;
          }
        }

        setLeftImgError(false);
        setRightImgError(false);

        excludeIdsRef.current = [
          ...excludeIdsRef.current,
          data.player_left.id,
          data.player_right.id,
        ].slice(-30);
      }
    } catch (err) {
      console.error("Erro ao buscar próxima dupla:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNextPair([]);
  }, []);

  useEffect(() => {
    setLeftImgError(false);
  }, [leftPlayer?.id, leftPlayer?.photo]);

  useEffect(() => {
    setRightImgError(false);
  }, [rightPlayer?.id, rightPlayer?.photo]);

  // Handle guess
  const handleGuess = (choice: "higher" | "lower") => {
    if (!leftPlayer || !rightPlayer || isRevealing || isGameOver) return;

    setIsRevealing(true);

    const rightVal = rightPlayer.value;
    const leftVal = leftPlayer.value;

    const isRightHigherOrEqual = rightVal >= leftVal;
    const userGuessedHigher = choice === "higher";
    const correct =
      (userGuessedHigher && isRightHigherOrEqual) ||
      (!userGuessedHigher && !isRightHigherOrEqual);

    const duration = 800;
    const steps = 25;
    const increment = rightVal / steps;
    let current = 0;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount++;
      current += increment;
      if (stepCount >= steps) {
        setRevealedValue(rightVal);
        clearInterval(timer);

        if (correct) {
          setIsCorrect(true);
          const newScore = score + 1;
          setScore(newScore);

          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem("hl_high_score", String(newScore));
          }

          if (newScore > 0 && newScore % 5 === 0) {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          }

          setTimeout(() => {
            setIsCorrect(null);
            setIsRevealing(false);
            setRevealedValue(0);
            fetchNextPair(excludeIdsRef.current, rightPlayer);
          }, 1200);
        } else {
          setIsCorrect(false);
          if (typeof window !== "undefined" && "vibrate" in navigator) {
            navigator.vibrate(200);
          }
          setTimeout(() => {
            setIsGameOver(true);
          }, 1200);
        }
      } else {
        setRevealedValue(Math.floor(current));
      }
    }, duration / steps);
  };

  const handleRestart = () => {
    setScore(0);
    setIsGameOver(false);
    setIsCorrect(null);
    setIsRevealing(false);
    setRevealedValue(0);
    excludeIdsRef.current = [];
    fetchNextPair([]);
  };

  const handleShare = () => {
    const text = `⚽ Fiz ${score} pontos seguidos no "Quem Tem Mais?" da Kavers Games! Consegue bater na resenha?\n\nJogue em: eloperdido.com/higher-lower\n#KaversGames`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (isLoading && !leftPlayer) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 animate-spin text-kavers-purple dark:text-purple-400 mb-3" />
        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Embaralhando cartas do futebol mundial...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto p-4 pb-20">
      {/* Top Scorebar Header */}
      <div className="mb-4 glass-panel rounded-3xl p-3.5 flex items-center justify-between shadow-xl border border-kavers-light-border dark:border-kavers-border">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-kavers-purple dark:text-purple-400 block">
            DUELO DE CARTAS INFINITO
          </span>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-1.5 uppercase tracking-tight">
            Quem Tem Mais? <Flame className="w-4 h-4 text-kavers-flame fill-kavers-flame" />
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-bold">
              Pontuação
            </span>
            <span className="text-2xl font-black text-kavers-purple dark:text-purple-300">{score}</span>
          </div>

          <div className="h-6 w-px bg-kavers-light-border dark:bg-kavers-border"></div>

          <div className="text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-bold">
              Recorde
            </span>
            <span className="text-2xl font-black text-kavers-magenta">{highScore}</span>
          </div>
        </div>
      </div>

      {/* Main Split Screen Gameplay Container */}
      {leftPlayer && rightPlayer && (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 relative items-stretch">
          {/* LEFT CARD (Base Player Collectible Card) */}
          <div
            key={`left_card_${leftPlayer.id}`}
            className="glass-panel-glow rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden shadow-2xl transition-all duration-300 border border-kavers-purple/40"
          >
            <div className="absolute top-4 left-4 bg-kavers-purple/15 text-kavers-purple dark:text-purple-300 border border-kavers-purple/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              CARTA BASE
            </div>

            {/* Avatar Header */}
            <div className="my-4 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-kavers-purple bg-kavers-light dark:bg-kavers-dark shadow-2xl flex items-center justify-center">
                {leftPlayer.photo && !leftImgError ? (
                  <img
                    key={`left_img_${leftPlayer.id}_${leftPlayer.photo}`}
                    src={leftPlayer.photo}
                    alt={leftPlayer.name}
                    className="w-full h-full object-cover"
                    onError={() => setLeftImgError(true)}
                  />
                ) : (
                  <span className="font-black text-3xl text-kavers-purple dark:text-purple-300">
                    {getInitials(leftPlayer.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="w-full">
              <h3 className="font-black text-2xl text-zinc-900 dark:text-white tracking-tight leading-tight">
                {leftPlayer.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-kavers-purple shrink-0" />
                  {leftPlayer.current_team}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="font-medium">{leftPlayer.country}</span>
              </div>
            </div>

            {/* Revealed Metric Value Box */}
            <div className="mt-6 w-full bg-kavers-light/80 dark:bg-kavers-dark/90 rounded-2xl p-4 border border-kavers-purple/20 shadow-inner">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-wider block">
                {metricLabel}
              </span>
              <div className="text-3xl font-black text-kavers-purple dark:text-purple-300 mt-1 animate-pulse">
                {leftPlayer.formatted_value}
              </div>
            </div>
          </div>

          {/* VS Divider Badge */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-14 h-14 rounded-2xl bg-gradient-to-br from-kavers-purple to-kavers-magenta text-white font-black text-lg items-center justify-center shadow-2xl border-4 border-kavers-light dark:border-kavers-dark animate-pulse">
            VS
          </div>

          {/* RIGHT CARD (Challenger Player Collectible Card) */}
          <div
            key={`right_card_${rightPlayer.id}`}
            className={`glass-panel rounded-3xl p-6 flex flex-col items-center justify-between text-center relative transition-all duration-500 shadow-2xl ${
              isCorrect === true
                ? "border-4 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/40"
                : isCorrect === false
                ? "border-4 border-red-500 bg-red-500/10 dark:bg-red-950/40 animate-shake"
                : "border border-kavers-magenta/40 hover:border-kavers-magenta"
            }`}
          >
            <div className="absolute top-4 left-4 bg-kavers-magenta/15 text-kavers-magenta border border-kavers-magenta/30 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              DESAFIANTE
            </div>

            {/* Avatar Header */}
            <div className="my-4 relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-kavers-magenta bg-kavers-light dark:bg-kavers-dark shadow-2xl flex items-center justify-center">
                {rightPlayer.photo && !rightImgError ? (
                  <img
                    key={`right_img_${rightPlayer.id}_${rightPlayer.photo}`}
                    src={rightPlayer.photo}
                    alt={rightPlayer.name}
                    className="w-full h-full object-cover"
                    onError={() => setRightImgError(true)}
                  />
                ) : (
                  <span className="font-black text-3xl text-kavers-magenta">
                    {getInitials(rightPlayer.name)}
                  </span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="w-full">
              <h3 className="font-black text-2xl text-zinc-900 dark:text-white tracking-tight leading-tight">
                {rightPlayer.name}
              </h3>
              <div className="flex items-center justify-center gap-2 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1 font-semibold">
                  <Shield className="w-3.5 h-3.5 text-kavers-magenta shrink-0" />
                  {rightPlayer.current_team}
                </span>
                <span className="text-zinc-400">•</span>
                <span className="font-medium">{rightPlayer.country}</span>
              </div>
            </div>

            {/* Metric Value Question Box */}
            <div className="mt-4 w-full bg-kavers-light/80 dark:bg-kavers-dark/90 rounded-2xl p-4 border border-kavers-light-border dark:border-kavers-border shadow-inner">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-black tracking-wider block">
                {metricLabel}
              </span>
              <div className="text-3xl font-black text-kavers-magenta mt-1">
                {isRevealing ? (
                  formatEuros(revealedValue)
                ) : (
                  <span className="text-zinc-400 dark:text-zinc-500 font-mono text-4xl">?</span>
                )}
              </div>
              <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block truncate font-medium">
                tem valor maior ou menor que {leftPlayer.name}?
              </span>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 w-full mt-4">
              <button
                onClick={() => handleGuess("higher")}
                disabled={isRevealing || isGameOver}
                className="py-4 px-4 rounded-2xl bg-kavers-purple hover:bg-kavers-purple-hover text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <ArrowUp className="w-5 h-5 stroke-[3]" /> MAIS
              </button>

              <button
                onClick={() => handleGuess("lower")}
                disabled={isRevealing || isGameOver}
                className="py-4 px-4 rounded-2xl bg-kavers-magenta hover:bg-kavers-magenta-hover text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <ArrowDown className="w-5 h-5 stroke-[3]" /> MENOS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 text-center shadow-2xl border border-red-500/40 relative">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 mb-3 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight uppercase">
              FIM DE DUELO!
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-semibold">
              Você errou o valor na rodada da mesa!
            </p>

            <div className="my-5 bg-kavers-light/90 dark:bg-kavers-dark/90 rounded-2xl p-4 border border-kavers-light-border dark:border-kavers-border grid grid-cols-2 gap-3">
              <div className="border-r border-kavers-light-border dark:border-kavers-border">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                  Pontuação Final
                </span>
                <div className="text-3xl font-black text-kavers-purple dark:text-purple-300 mt-0.5">
                  {score}
                </div>
              </div>

              <div>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-bold">
                  Seu Recorde
                </span>
                <div className="text-3xl font-black text-kavers-magenta mt-0.5">
                  {highScore}
                </div>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                onClick={handleShare}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-kavers-purple to-kavers-magenta text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Desafio Copiado!
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" /> Compartilhar (#KaversGames)
                  </>
                )}
              </button>

              <button
                onClick={handleRestart}
                className="w-full py-3 px-4 rounded-xl bg-kavers-light-border/60 dark:bg-kavers-card text-zinc-800 dark:text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors border border-kavers-light-border dark:border-kavers-border"
              >
                <RefreshCw className="w-4 h-4 text-kavers-purple" /> Jogar Novamente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
