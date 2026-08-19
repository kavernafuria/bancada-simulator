"use client";

import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { PlayerCard, PlayerData } from "@/components/PlayerCard";
import { ConnectionBadge } from "@/components/ConnectionBadge";
import { Autocomplete } from "@/components/Autocomplete";
import { WinModal } from "@/components/WinModal";
import { RulesModal } from "@/components/RulesModal";
import { Loader2, AlertTriangle, CornerDownRight, RotateCcw, Target, CheckCircle2, ChevronRight, Layers } from "lucide-react";
import confetti from "canvas-confetti";

interface ChainNode {
  player: PlayerData;
  connectionToNext?: {
    matchInfo: string;
    year?: number | null;
  };
}

interface RoundData {
  round: number;
  minDegrees: number;
  startPlayer: PlayerData;
  targetPlayer: PlayerData;
}

interface DailyChallengeData {
  date: string;
  rounds: RoundData[];
}

const roundLabels: { [r: number]: { label: string; tag: string; color: string } } = {
  1: { label: "Aquecimento", tag: "2-3 elos", color: "text-emerald-500" },
  2: { label: "Médio", tag: "3-4 elos", color: "text-amber-500" },
  3: { label: "Desafio do Dia", tag: "4-5 elos", color: "text-purple-500" },
};

export default function Home() {
  const [dailyData, setDailyData] = useState<DailyChallengeData | null>(null);
  const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);

  // Active round index: 1, 2, or 3
  const [currentRoundNum, setCurrentRoundNum] = useState<number>(1);
  const [completedRounds, setCompletedRounds] = useState<number[]>([]);

  // Chain state for each round
  const [roundChains, setRoundChains] = useState<{ [round: number]: ChainNode[] }>({});

  const [isLoadingValidation, setIsLoadingValidation] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showRoundSuccessModal, setShowRoundSuccessModal] = useState(false);

  // Fetch 3-round daily challenge on mount
  useEffect(() => {
    async function loadChallenge() {
      try {
        const res = await fetch("/api/challenge/today");
        if (res.ok) {
          const data: DailyChallengeData = await res.json();
          setDailyData(data);

          // Restore progress from localStorage
          const savedProgressKey = `elo_perdido_3rounds_${data.date}`;
          const savedProgress = localStorage.getItem(savedProgressKey);

          if (savedProgress) {
            try {
              const parsed = JSON.parse(savedProgress);
              if (parsed && parsed.chains && parsed.completed) {
                setRoundChains(parsed.chains);
                setCompletedRounds(parsed.completed);

                const nextRound = [1, 2, 3].find((r) => !parsed.completed.includes(r)) || 3;
                setCurrentRoundNum(nextRound);

                if (parsed.completed.length === 3) {
                  setShowWinModal(true);
                }
                setIsLoadingChallenge(false);
                return;
              }
            } catch (e) {
              console.error("Erro ao carregar progresso:", e);
            }
          }

          // Initial chains setup
          const initialChains: { [r: number]: ChainNode[] } = {};
          data.rounds.forEach((rd) => {
            initialChains[rd.round] = [{ player: rd.startPlayer }];
          });

          setRoundChains(initialChains);
        }
      } catch (err) {
        console.error("Erro ao carregar desafio:", err);
      } finally {
        setIsLoadingChallenge(false);
      }
    }

    loadChallenge();
  }, []);

  // Save progress to localStorage
  useEffect(() => {
    if (dailyData && Object.keys(roundChains).length > 0) {
      localStorage.setItem(
        `elo_perdido_3rounds_${dailyData.date}`,
        JSON.stringify({
          chains: roundChains,
          completed: completedRounds,
        })
      );
    }
  }, [roundChains, completedRounds, dailyData]);

  const activeRoundData = dailyData?.rounds.find((r) => r.round === currentRoundNum);
  const activeChain = roundChains[currentRoundNum] || [];
  const isCurrentRoundCompleted = completedRounds.includes(currentRoundNum);

  // Handle player selection
  const handleSelectPlayer = async (selectedPlayer: PlayerData) => {
    if (!dailyData || !activeRoundData || isCurrentRoundCompleted || isLoadingValidation) return;

    const lastNode = activeChain[activeChain.length - 1];
    setIsLoadingValidation(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/validate-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromPlayerId: lastNode.player.id,
          toPlayerId: selectedPlayer.id,
        }),
      });

      const data = await res.json();

      if (data.valid && data.connection) {
        const updatedChain = [...activeChain];
        updatedChain[updatedChain.length - 1] = {
          ...lastNode,
          connectionToNext: {
            matchInfo: data.connection.matchInfo,
            year: data.connection.year,
          },
        };

        const newChainNode: ChainNode = { player: selectedPlayer };
        updatedChain.push(newChainNode);

        setRoundChains((prev) => ({
          ...prev,
          [currentRoundNum]: updatedChain,
        }));

        // Check if round target reached
        if (selectedPlayer.id === activeRoundData.targetPlayer.id) {
          const newCompleted = [...completedRounds, currentRoundNum];
          setCompletedRounds(newCompleted);

          confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

          if (newCompleted.length === 3) {
            setTimeout(() => {
              setShowWinModal(true);
            }, 600);
          } else {
            setShowRoundSuccessModal(true);
          }
        }
      } else {
        setErrorMessage(
          data.message || "Estes jogadores não atuaram juntos na mesma partida!"
        );
        setIsShaking(true);
        if (typeof window !== "undefined" && "vibrate" in navigator) {
          navigator.vibrate(200);
        }
        setTimeout(() => setIsShaking(false), 500);
      }
    } catch (err) {
      console.error("Erro ao validar conexão:", err);
      setErrorMessage("Erro de conexão ao validar o elo.");
    } finally {
      setIsLoadingValidation(false);
    }
  };

  const handleRemoveLastNode = () => {
    if (activeChain.length <= 1 || isCurrentRoundCompleted) return;

    const updatedChain = activeChain.slice(0, activeChain.length - 1);
    delete updatedChain[updatedChain.length - 1].connectionToNext;

    setRoundChains((prev) => ({
      ...prev,
      [currentRoundNum]: updatedChain,
    }));
    setErrorMessage(null);
  };

  const handleResetCurrentRound = () => {
    if (!dailyData || !activeRoundData) return;

    setRoundChains((prev) => ({
      ...prev,
      [currentRoundNum]: [{ player: activeRoundData.startPlayer }],
    }));

    setCompletedRounds((prev) => prev.filter((r) => r !== currentRoundNum));
    setErrorMessage(null);
  };

  const handleProceedToNextRound = () => {
    setShowRoundSuccessModal(false);
    const nextRound = currentRoundNum < 3 ? currentRoundNum + 1 : 1;
    setCurrentRoundNum(nextRound);
  };

  if (isLoadingChallenge) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-kavers-purple dark:text-purple-400 mb-3" />
        <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
          Carregando as 3 Fases Diárias...
        </p>
      </div>
    );
  }

  if (!dailyData || !dailyData.rounds || dailyData.rounds.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-12 h-12 text-kavers-magenta mb-3" />
        <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase">Nenhum desafio ativo</h2>
        <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs font-semibold">
          Não foi possível carregar o desafio de hoje. Verifique sua conexão.
        </p>
      </div>
    );
  }

  const usedPlayerIds = activeChain.map((node) => node.player.id);
  const degreesCount = activeChain.length - 1;
  const isAllRoundsWon = completedRounds.length === 3;

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header
        dateStr={dailyData.date}
        onOpenRules={() => setShowRules(true)}
        onReset={handleResetCurrentRound}
        isWon={isAllRoundsWon}
      />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 flex flex-col">
        {/* 3-Phase Status Header */}
        <div className="mb-4 glass-panel rounded-3xl p-3.5 shadow-xl border border-kavers-light-border dark:border-kavers-border">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[10px] uppercase font-black tracking-widest text-kavers-purple dark:text-purple-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> 3 FASES DIÁRIAS
            </span>
            <span className="text-xs font-black text-zinc-900 dark:text-white">
              {completedRounds.length} / 3 Fases Concluídas
            </span>
          </div>

          {/* Phase Indicators: [ 🟢 Fase 1 ] — [ 🟡 Fase 2 ] — [ 🟣 Fase 3 ] */}
          <div className="grid grid-cols-3 gap-2">
            {dailyData.rounds.map((rd) => {
              const isDone = completedRounds.includes(rd.round);
              const isActive = rd.round === currentRoundNum;
              const meta = roundLabels[rd.round] || { label: `Fase ${rd.round}`, tag: `${rd.minDegrees} elos`, color: "text-kavers-purple" };

              return (
                <button
                  key={`round_tab_${rd.round}`}
                  onClick={() => setCurrentRoundNum(rd.round)}
                  className={`py-2.5 px-2.5 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${
                    isActive
                      ? "bg-kavers-purple text-white shadow-lg scale-105"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                      : "bg-kavers-light/60 dark:bg-kavers-dark/60 text-zinc-500 hover:text-zinc-800 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1 font-black text-xs uppercase tracking-tight">
                    <span>{isDone ? "🟢" : isActive ? "🟡" : "⚪"}</span>
                    <span>Fase {rd.round}</span>
                  </div>
                  <span className={`text-[9px] font-bold mt-0.5 ${isActive ? "text-purple-200" : isDone ? "text-emerald-300" : "text-zinc-400"}`}>
                    {meta.label} ({rd.minDegrees}º)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Round Info Box */}
        {activeRoundData && (
          <div className="mb-4 glass-panel rounded-3xl p-4 flex items-center justify-between border border-kavers-purple/30 shadow-xl">
            <div className="text-xs text-zinc-700 dark:text-zinc-300">
              <span className="text-kavers-purple dark:text-purple-400 block text-[10px] uppercase font-black tracking-widest">
                FASE {currentRoundNum}: {roundLabels[currentRoundNum]?.label.toUpperCase()} (MÁX 5 ELOS)
              </span>
              Conectar <strong className="text-zinc-900 dark:text-white font-black">{activeRoundData.startPlayer.name}</strong> a{" "}
              <strong className="text-kavers-magenta font-black">{activeRoundData.targetPlayer.name}</strong>
            </div>
            <div className="bg-kavers-light/90 dark:bg-kavers-dark/90 px-3.5 py-2 rounded-2xl border border-kavers-light-border dark:border-kavers-border text-center shadow-inner">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block font-black">
                Elos Usados
              </span>
              <span className="text-base font-black text-kavers-purple dark:text-purple-300">
                {degreesCount} / {activeRoundData.minDegrees}
              </span>
            </div>
          </div>
        )}

        {/* Error Alert Box */}
        {errorMessage && (
          <div
            className={`mb-4 p-3.5 rounded-2xl bg-red-500/10 dark:bg-red-950/80 border border-red-500/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 shadow-lg ${
              isShaking ? "animate-shake" : ""
            }`}
          >
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="flex-1 font-bold">{errorMessage}</span>
          </div>
        )}

        {/* Tactical Connection Chain */}
        <div className="flex-1 flex flex-col relative">
          {activeChain.map((node, index) => {
            const isStart = index === 0;
            const isLast = index === activeChain.length - 1;
            const isTargetReached = isLast && isCurrentRoundCompleted;

            return (
              <React.Fragment key={`chain_fragment_${node.player.id}`}>
                <PlayerCard
                  player={node.player}
                  type={
                    isStart
                      ? "start"
                      : isTargetReached
                      ? "target"
                      : "intermediate"
                  }
                  stepIndex={index}
                  onRemove={
                    isLast && !isStart && !isCurrentRoundCompleted ? handleRemoveLastNode : undefined
                  }
                />

                {node.connectionToNext && (
                  <ConnectionBadge
                    matchInfo={node.connectionToNext.matchInfo}
                    year={node.connectionToNext.year}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Autocomplete Input */}
          {!isCurrentRoundCompleted && (
            <div className="mt-2 mb-4">
              <div className="flex items-center justify-between px-1 mb-1.5 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-kavers-purple stroke-[2.5]" />
                  Próximo Elo ({activeChain.length}ª carta)
                </span>
                {activeChain.length > 1 && (
                  <button
                    onClick={handleRemoveLastNode}
                    className="text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 flex items-center gap-1 underline transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" /> Desfazer
                  </button>
                )}
              </div>

              <Autocomplete
                onSelectPlayer={handleSelectPlayer}
                disabled={isCurrentRoundCompleted}
                usedPlayerIds={usedPlayerIds}
                isLoadingValidation={isLoadingValidation}
              />
            </div>
          )}

          {/* Target Player Card */}
          {!isCurrentRoundCompleted && activeRoundData && (
            <div className="mt-2 pt-3 border-t-2 border-dashed border-kavers-purple/30">
              <div className="text-[10px] text-kavers-magenta uppercase font-black tracking-widest mb-2 flex items-center gap-1.5 justify-center">
                <Target className="w-3.5 h-3.5" /> CARTA ALVO DA FASE {currentRoundNum}
              </div>
              <PlayerCard player={activeRoundData.targetPlayer} type="target" />
            </div>
          )}
        </div>
      </main>

      {/* Round Transition Modal */}
      {showRoundSuccessModal && activeRoundData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-sm glass-panel-glow rounded-3xl p-6 text-center shadow-2xl relative border border-emerald-500/50">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mb-3 shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase block">
              FASE {currentRoundNum} CONCLUÍDA!
            </span>

            <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase mt-0.5">
              Mandou bem no elo!
            </h3>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 mt-1 font-semibold">
              Você conectou {activeRoundData.startPlayer.name} a {activeRoundData.targetPlayer.name} em {degreesCount} elos!
            </p>

            <button
              onClick={handleProceedToNextRound}
              className="w-full mt-5 py-3.5 px-4 rounded-xl bg-kavers-purple text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
            >
              Ir para Fase {currentRoundNum < 3 ? currentRoundNum + 1 : 1} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Grand Daily Victory Modal */}
      {dailyData && dailyData.rounds.length >= 3 && (
        <WinModal
          isOpen={showWinModal}
          degreesCount={Object.values(roundChains).reduce((acc, chain) => acc + (chain.length - 1), 0)}
          minDegrees={dailyData.rounds.reduce((acc, r) => acc + r.minDegrees, 0)}
          startPlayer={dailyData.rounds[0].startPlayer}
          targetPlayer={dailyData.rounds[2].targetPlayer}
          dateStr={dailyData.date}
          onPlayAgain={() => {
            setShowWinModal(false);
          }}
        />
      )}

      <RulesModal isOpen={showRules} onClose={() => setShowRules(false)} />
    </div>
  );
}
