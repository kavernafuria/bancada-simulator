"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  VolumeX,
  Flame,
  Trophy,
  Clock,
  Activity,
  Zap,
  Megaphone,
  Flag,
  FlameIcon,
  Music,
  Coffee,
  Info,
  Award,
} from "lucide-react";
import { caldeiraoSound } from "./caldeiraoAudio";
import { ArquibancadaVisualizer } from "./ArquibancadaVisualizer";
import { TacticalPitch, TeamPitchInfo } from "./TacticalPitch";
import { MiniGameResult } from "@/components/MatchTacticalResolver";

interface ArquibancadaMinigameProps {
  homeTeam: TeamPitchInfo;
  awayTeam: TeamPitchInfo;
  initialScore?: number;
  onFinish: (result: MiniGameResult) => void;
}

export const ArquibancadaMinigame: React.FC<ArquibancadaMinigameProps> = ({
  homeTeam,
  awayTeam,
  initialScore = 50,
  onFinish,
}) => {
  // Game states
  const [energy, setEnergy] = useState<number>(85); // 0 to 100% (Fôlego)
  const [pressure, setPressure] = useState<number>(31); // 0 to 100% (Pressão)
  const [decibels, setDecibels] = useState<number>(63);
  const [matchMinute, setMatchMinute] = useState<number>(16);
  const [standScore, setStandScore] = useState<number>(88);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Central metric: Seconds maintained in Zone >85%
  const [timeInZone85, setTimeInZone85] = useState<number>(0);
  const [chancesCreated, setChancesCreated] = useState<number>(0);

  // Cooldowns (in seconds)
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});

  // Visual state flags
  const [isBannerUp, setIsBannerUp] = useState<boolean>(false);
  const [hasVerticalStripes, setHasVerticalStripes] = useState<boolean>(true);
  const [hasFlares, setHasFlares] = useState<boolean>(false);
  const [isChanting, setIsChanting] = useState<boolean>(false);
  const [isDrumming, setIsDrumming] = useState<boolean>(false);
  const [hasMosaic, setHasMosaic] = useState<boolean>(false);
  const [activeChantText, setActiveChantText] = useState<string | null>(null);

  // Action Live Notification Feed (matches Google AI Studio screenshot footer banner)
  const [liveActionFeed, setLiveActionFeed] = useState<{
    icon: string;
    message: string;
  }>({
    icon: "🎗️",
    message: "Faixas verticais descendo! Arquibancada em festa constante.",
  });

  const [recentAttackEvent, setRecentAttackEvent] = useState<string | null>(null);

  const pressureRef = useRef(pressure);
  pressureRef.current = pressure;
  const isAbove85 = pressure >= 85;

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    caldeiraoSound.enabled = next;
  };

  // Cooldown countdown timer
  useEffect(() => {
    if (isGameOver) return;
    const cdTimer = setInterval(() => {
      setCooldowns((prev) => {
        const nextCd: Record<string, number> = {};
        let changed = false;
        for (const key of Object.keys(prev)) {
          const val = prev[key];
          if (typeof val === "number" && val > 1) {
            nextCd[key] = val - 1;
            changed = true;
          } else if (val === 1) {
            changed = true;
          }
        }
        return changed ? nextCd : prev;
      });
    }, 1000);

    return () => clearInterval(cdTimer);
  }, [isGameOver]);

  // Main match tick timer (90 match minutes in ~45 real seconds)
  useEffect(() => {
    if (isGameOver) return;

    const gameTimer = setInterval(() => {
      setMatchMinute((prev) => {
        const nextMin = prev + 2;
        if (nextMin >= 90) {
          setIsGameOver(true);
          return 90;
        }
        return nextMin;
      });

      // Natural energy recovery (+2.5% fôlego)
      setEnergy((prev) => Math.min(100, Math.round(prev + 2.5)));

      // Pressure decay: -5.0%/s if >85%, -2.0%/s otherwise
      const currPress = pressureRef.current;
      const decay = currPress >= 85 ? 5.0 : currPress >= 60 ? 3.0 : 2.0;

      setPressure((prev) => {
        const nextPress = Math.max(10, Math.round(prev - decay));
        const avg = (nextPress + currPress) / 2;
        setStandScore(Math.round(40 + avg * 0.6));
        return nextPress;
      });

      // Zone 85% tracker
      if (currPress >= 85) {
        setTimeInZone85((t) => t + 1);

        if (Math.random() < 0.45) {
          setChancesCreated((c) => c + 1);
          const attackLogs = [
            "💥 CHUTE NA TRAVE! O goleiro se esticou todo!",
            "🔥 BOLA PASSOU RASPANDO A TRAVE DIREITA!",
            "⚡ BLITZ TOTAL! Cabeceio forte no travessão!",
            "🚀 BOMBA DA INTERMEDIÁRIA! Escanteio cedido pela zaga!",
            "🧤 MILAGRE DO GOLEIRO RIVAL! Espalmada no susto!",
          ];
          const randomEv = attackLogs[Math.floor(Math.random() * attackLogs.length)];
          setRecentAttackEvent(randomEv);
          setTimeout(() => setRecentAttackEvent(null), 1800);
        }
      }
    }, 1000);

    return () => clearInterval(gameTimer);
  }, [isGameOver]);

  // Handle player actions
  const handleAction = (actionId: string) => {
    if (isGameOver) return;
    if (cooldowns[actionId] && cooldowns[actionId] > 0) return;

    if (actionId === "grito") {
      if (energy < 14) return;
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.max(0, prev - 14));
      setPressure((prev) => Math.min(100, prev + 12));
      setDecibels((prev) => Math.min(125, prev + 8));
      setIsChanting(true);
      setTimeout(() => setIsChanting(false), 2500);

      const hinoText = `${homeTeam.name.toUpperCase()} ATÉ O FIM! CANTA A TORCIDA!`;
      setActiveChantText(hinoText);
      setTimeout(() => setActiveChantText(null), 3000);

      setLiveActionFeed({
        icon: "📢",
        message: "Grito de Guerra puxado! A massa canta o hino e a pressão sobe +12%!",
      });
      setCooldowns((cd) => ({ ...cd, grito: 3 }));
    } else if (actionId === "bandeirao") {
      if (energy < 28) return;
      caldeiraoSound.playWhistle();
      setEnergy((prev) => Math.max(0, prev - 28));
      setPressure((prev) => Math.min(100, prev + 22));
      setDecibels((prev) => Math.min(125, prev + 12));
      setIsBannerUp(true);
      setTimeout(() => setIsBannerUp(false), 4500);

      setLiveActionFeed({
        icon: "🚩",
        message: "Pavilhão gigante desfraldado no setor principal! (+22% de pressão)",
      });
      setCooldowns((cd) => ({ ...cd, bandeirao: 6 }));
    } else if (actionId === "faixas") {
      if (energy < 16) return;
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.max(0, prev - 16));
      setPressure((prev) => Math.min(100, prev + 14));
      setHasVerticalStripes(true);

      setLiveActionFeed({
        icon: "🎗️",
        message: "Faixas verticais descendo! Arquibancada em festa constante.",
      });
      setCooldowns((cd) => ({ ...cd, faixas: 2 }));
    } else if (actionId === "sinalizadores") {
      if (energy < 24) return;
      caldeiraoSound.playFlare();
      setEnergy((prev) => Math.max(0, prev - 24));
      setPressure((prev) => Math.min(100, prev + 20));
      setDecibels((prev) => Math.min(125, prev + 15));
      setHasFlares(true);
      setTimeout(() => setHasFlares(false), 3800);

      setLiveActionFeed({
        icon: "🔥",
        message: "Sinalizadores acesos! Fumaça no setor incendeia a arquibancada (+20%).",
      });
      setCooldowns((cd) => ({ ...cd, sinalizadores: 5 }));
    } else if (actionId === "bateria") {
      if (energy < 10) return;
      caldeiraoSound.playDrum();
      setEnergy((prev) => Math.max(0, prev - 10));
      setPressure((prev) => Math.min(100, prev + 9));
      setIsDrumming(true);
      setTimeout(() => setIsDrumming(false), 2000);

      setLiveActionFeed({
        icon: "🥁",
        message: "Bateria no ritmo rápido! Surdos e repiques mantêm o embalo da torcida.",
      });
      setCooldowns((cd) => ({ ...cd, bateria: 2 }));
    } else if (actionId === "descanso") {
      caldeiraoSound.playClap();
      setEnergy((prev) => Math.min(100, prev + 30));
      setPressure((prev) => Math.max(10, prev - 8));

      setLiveActionFeed({
        icon: "☕",
        message: "Pausa para hidratação! A torcida recupera +30% de fôlego.",
      });
      setCooldowns((cd) => ({ ...cd, descanso: 6 }));
    }
  };

  const handleFinishMinigame = () => {
    let rank: "S" | "B" | "C" | "F" = "F";
    let modifier = -0.15;
    let desc = "A torcida não conseguiu incendiar a arquibancada (-15% PEC).";

    if (timeInZone85 >= 18 || standScore >= 80) {
      rank = "S";
      modifier = 0.25;
      desc = `Caldeirão fervendo! Torcida sustentou ${timeInZone85}s acima dos 85% e incendiou o time no campo (+25% PEC)!`;
    } else if (timeInZone85 >= 8 || standScore >= 65) {
      rank = "B";
      modifier = 0.15;
      desc = `Boa pressão de arquibancada! ${timeInZone85}s de caldeirão garantiram bom apoio ao time (+15% PEC).`;
    } else if (standScore >= 45) {
      rank = "C";
      modifier = 0.05;
      desc = "Apoio regular de bancada sem grande pressão no adversário (+5% PEC).";
    }

    onFinish({
      gameType: "caldeirao_pitch",
      modifier,
      rank,
      description: desc,
    });
  };

  const currentDecayText = pressure >= 85 ? "-5.0%/s" : "-2.0%/s";

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 bg-[#090d16] p-4 sm:p-6 rounded-3xl border border-zinc-800 text-white shadow-2xl font-sans select-none">
      {/* 1. TOP HEADER BAR (Exata como a Imagem do Google AI Studio) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-zinc-950/80 border border-zinc-800/80 shadow-lg">
        {/* Left Team Badge Info */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-sky-500 shadow-sm" />
          <span className="text-sm font-black text-white tracking-wide">
            {homeTeam.name}
          </span>
          <span className="text-xs font-bold text-zinc-500 lowercase">vs</span>
          <span className="text-sm font-black text-white tracking-wide">
            {awayTeam.name}
          </span>
          <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />

          <span className="text-[11px] font-mono text-zinc-300 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-md ml-1">
            Estádio Monumental
          </span>
        </div>

        {/* Right Status Controls (Time, Score, Mute) */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono text-xs font-bold text-white">
            <Clock className="w-3.5 h-3.5 text-pink-500 animate-pulse" />
            <span>{matchMinute}&apos; TEMPO</span>
          </div>

          <div className="flex items-center gap-2 bg-zinc-900 px-3.5 py-1.5 rounded-xl border border-zinc-800 font-mono text-xs font-bold text-white">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              Nota: <span className="text-cyan-400">{standScore} pts</span>
            </span>
          </div>

          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800 transition-all hover:bg-zinc-800"
            title={soundEnabled ? "Mutar Sons" : "Ativar Sons"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-zinc-600" />
            )}
          </button>
        </div>
      </div>

      {/* 2. BARRA DE PRESSÃO & ENTUSIASMO DA BANCADA (Full Width - Réplica Exata do AI Studio) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 shadow-xl flex flex-col gap-3">
        {/* Title Row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400/20" />
              <h3 className="text-sm font-black uppercase text-white tracking-wide">
                PRESSÃO & ENTUSIASMO DA BANCADA
              </h3>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Sustente a barra acima dos 85%. Acima dos 85% a pressão decai rapidamente (-5%/s) e o adversário tenta esfriar!
            </p>
          </div>

          <span className="text-2xl font-black font-mono text-white tracking-wider">
            {pressure}%
          </span>
        </div>

        {/* Progress Bar Container with 85% Pin Marker */}
        <div className="relative w-full mt-1">
          {/* 85% Zone Pin Pointer */}
          <div
            className="absolute -top-6 -translate-x-1/2 flex flex-col items-center z-20 pointer-events-none"
            style={{ left: "85%" }}
          >
            <div className="text-[10px] font-black font-mono text-amber-400 bg-amber-950/90 border border-amber-500/80 px-2 py-0.5 rounded shadow-md whitespace-nowrap">
              ZONA CALDEIRÃO (&gt;85%)
            </div>
            <div className="w-1.5 h-2.5 bg-amber-400 clip-triangle" />
          </div>

          {/* Bar Track */}
          <div className="w-full h-4 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400"
              style={{ width: `${pressure}%` }}
            />
            {/* Vertical Marker Line inside Bar */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-md z-10 -translate-x-1/2"
              style={{ left: "85%" }}
            />
          </div>
        </div>

        {/* Progress Bar Footer Indicators */}
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mt-1">
          <div className="flex items-center gap-1 text-amber-400/90 font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>Desgaste atual: {currentDecayText}</span>
          </div>

          <div className="flex items-center gap-1 font-semibold">
            <span>Tempo mantido &gt;85%:</span>
            <span className="text-amber-400 font-bold">{timeInZone85} segundos</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE GRID DUPLO: Arquibancada + Campinho Tático */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* COLUNA ESQUERDA: Visualizador da Arquibancada & Comandos da Torcida */}
        <div className="flex flex-col gap-4">
          <ArquibancadaVisualizer
            homeTeam={homeTeam}
            isBannerUp={isBannerUp}
            hasVerticalStripes={hasVerticalStripes}
            hasFlares={hasFlares}
            isChanting={isChanting}
            isDrumming={isDrumming}
            hasMosaic={hasMosaic}
            activeChantText={activeChantText}
            decibels={decibels}
            isAbove85={isAbove85}
          />

          {/* COMANDOS DA TORCIDA (Exatamente como na Imagem) */}
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-wider text-white">
                  COMANDOS DA TORCIDA
                </h4>
              </div>

              <div className="text-xs font-mono font-bold text-zinc-300">
                Fôlego: <span className="text-amber-400">{energy}%</span>
              </div>
            </div>

            {/* 6 Action Cards */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* 1. GRITO */}
              <button
                onClick={() => handleAction("grito")}
                disabled={energy < 14 || (cooldowns.grito ? cooldowns.grito > 0 : false)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.grito && cooldowns.grito > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : energy < 14
                    ? "bg-zinc-900/40 border-zinc-850 opacity-40 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.grito && cooldowns.grito > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.grito}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-pink-950/40 border border-pink-500/30 flex items-center justify-center text-pink-400 text-sm mb-1">
                  📢
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">GRITO</span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">
                  -14 EN
                </span>
              </button>

              {/* 2. BANDEIRÃO */}
              <button
                onClick={() => handleAction("bandeirao")}
                disabled={energy < 28 || (cooldowns.bandeirao ? cooldowns.bandeirao > 0 : false)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.bandeirao && cooldowns.bandeirao > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : energy < 28
                    ? "bg-zinc-900/40 border-zinc-850 opacity-40 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.bandeirao && cooldowns.bandeirao > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.bandeirao}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center justify-center text-red-400 text-sm mb-1">
                  🚩
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">
                  BANDEIRÃO
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">
                  -28 EN
                </span>
              </button>

              {/* 3. FAIXAS */}
              <button
                onClick={() => handleAction("faixas")}
                disabled={energy < 16 || (cooldowns.faixas ? cooldowns.faixas > 0 : false)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.faixas && cooldowns.faixas > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : energy < 16
                    ? "bg-zinc-900/40 border-zinc-850 opacity-40 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.faixas && cooldowns.faixas > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.faixas}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400 text-sm mb-1">
                  🎗️
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">FAIXAS</span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 mt-0.5">
                  {cooldowns.faixas && cooldowns.faixas > 0
                    ? `Espera ${cooldowns.faixas}s`
                    : "-16 EN"}
                </span>
              </button>

              {/* 4. SINALIZADOR */}
              <button
                onClick={() => handleAction("sinalizadores")}
                disabled={energy < 24 || (cooldowns.sinalizadores ? cooldowns.sinalizadores > 0 : false)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.sinalizadores && cooldowns.sinalizadores > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : energy < 24
                    ? "bg-zinc-900/40 border-zinc-850 opacity-40 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.sinalizadores && cooldowns.sinalizadores > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.sinalizadores}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-orange-950/40 border border-orange-500/30 flex items-center justify-center text-orange-400 text-sm mb-1">
                  🔥
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">
                  SINALIZADOR
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">
                  -24 EN
                </span>
              </button>

              {/* 5. BATERIA */}
              <button
                onClick={() => handleAction("bateria")}
                disabled={energy < 10 || (cooldowns.bateria ? cooldowns.bateria > 0 : false)}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.bateria && cooldowns.bateria > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : energy < 10
                    ? "bg-zinc-900/40 border-zinc-850 opacity-40 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-amber-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.bateria && cooldowns.bateria > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.bateria}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-sm mb-1">
                  🎵
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">
                  BATERIA
                </span>
                <span className="text-[9px] font-mono font-bold text-amber-400 mt-0.5">
                  -10 EN
                </span>
              </button>

              {/* 6. HIDRATAR */}
              <button
                onClick={() => handleAction("descanso")}
                disabled={cooldowns.descanso ? cooldowns.descanso > 0 : false}
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all ${
                  cooldowns.descanso && cooldowns.descanso > 0
                    ? "bg-zinc-900/50 border-zinc-800 opacity-60 cursor-not-allowed"
                    : "bg-zinc-900 border-zinc-800 hover:border-emerald-400/60 hover:bg-zinc-850 active:scale-95"
                }`}
              >
                {cooldowns.descanso && cooldowns.descanso > 0 && (
                  <span className="absolute top-1 right-1 px-1 py-0.5 rounded-md bg-pink-950/90 border border-pink-600 text-pink-300 text-[9px] font-bold font-mono">
                    {cooldowns.descanso}s
                  </span>
                )}
                <div className="w-8 h-8 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-sm mb-1">
                  ☕
                </div>
                <span className="text-[10px] font-black uppercase text-zinc-200">
                  HIDRATAR
                </span>
                <span className="text-[9px] font-mono font-bold text-emerald-400 mt-0.5">
                  {energy >= 95 ? "Cheio" : "+30 EN"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: Simulador de Ataque (Campinho Tático) + Live Action Feed */}
        <div className="flex flex-col gap-4">
          <TacticalPitch
            homeTeam={homeTeam}
            awayTeam={awayTeam}
            pressure={pressure}
            isAbove85={isAbove85}
            timeInZone85={timeInZone85}
            recentAttackEvent={recentAttackEvent}
            chancesCreated={chancesCreated}
          />

          {/* BARRA DE NOTIFICAÇÃO DAS AÇÕES DA TORCIDA (Exata do Google AI Studio) */}
          <div className="p-3.5 rounded-2xl bg-zinc-950/90 border border-zinc-800/90 shadow-xl flex items-center justify-between transition-all">
            <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-200">
              <div className="w-7 h-7 rounded-lg bg-pink-950/70 border border-pink-500/40 flex items-center justify-center text-pink-400 shrink-0">
                📢
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{liveActionFeed.icon}</span>
                <span className="text-zinc-300">{liveActionFeed.message}</span>
              </div>
            </div>

            {isGameOver && (
              <button
                onClick={handleFinishMinigame}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider shadow-lg animate-pulse shrink-0 ml-2"
              >
                FIM DO JOGO • VER RESULTADO →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
