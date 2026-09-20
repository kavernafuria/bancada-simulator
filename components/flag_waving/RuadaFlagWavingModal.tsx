import React, { useState } from 'react';
import { PATH_PATTERNS } from './mathPath';
import { PathTraceCanvas } from './PathTraceCanvas';
import { RoundResult, GameSettings } from './types';
import { soundEngine } from './audio';
import { Flame, Trophy, Award, Sparkles, X, CheckCircle2, RefreshCw, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export interface RuadaFlagWavingModalProps {
  onClose: () => void;
  onFinish: (result: {
    score: number;
    rank: 'S' | 'A' | 'B' | 'C' | 'F';
    modifier: number;
    cashReward: number;
    moralReward: number;
    description: string;
  }) => void;
  torcidaName?: string;
  clubName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const RuadaFlagWavingModal: React.FC<RuadaFlagWavingModalProps> = ({
  onClose,
  onFinish,
  torcidaName = 'Torcida Organizada',
  clubName = 'Nosso Clube',
  primaryColor,
  secondaryColor,
}) => {
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [showRoundSummary, setShowRoundSummary] = useState<boolean>(false);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(null);
  const [isGameFinished, setIsGameFinished] = useState<boolean>(false);

  const [settings, setSettings] = useState<GameSettings>({
    errorThresholdPx: 45,
    showGuideZone: true,
    hapticFeedback: true,
    audioEnabled: true,
    flagTheme: 'tricolor',
  });

  const currentPattern = PATH_PATTERNS[currentRoundIndex] || PATH_PATTERNS[0];
  const totalRounds = PATH_PATTERNS.length;

  const handleRoundComplete = (result: RoundResult) => {
    setLastRoundResult(result);
    const updatedResults = [...roundResults, result];
    setRoundResults(updatedResults);

    if (currentRoundIndex + 1 < totalRounds) {
      setShowRoundSummary(true);
    } else {
      setIsGameFinished(true);
    }
  };

  const handleNextRound = () => {
    setShowRoundSummary(false);
    setCurrentRoundIndex((prev) => prev + 1);
  };

  const handleRetryGame = () => {
    setCurrentRoundIndex(0);
    setRoundResults([]);
    setShowRoundSummary(false);
    setLastRoundResult(null);
    setIsGameFinished(false);
  };

  // Calculate final metrics
  const calculateFinalStats = () => {
    if (roundResults.length === 0) {
      return { finalScore: 0, rank: 'F' as const, modifier: 0, cashReward: 0, moralReward: 0, description: 'Desistência do cortejo.' };
    }
    const sumScore = roundResults.reduce((acc, r) => acc + r.score, 0);
    const finalScore = Math.round(sumScore / roundResults.length);

    let rank: 'S' | 'A' | 'B' | 'C' | 'F' = 'F';
    let modifier = 0.05;
    let cashReward = 500;
    let moralReward = 3;

    if (finalScore >= 85) {
      rank = 'S';
      modifier = 0.20; // 20% bonus
      cashReward = 1500;
      moralReward = 10;
    } else if (finalScore >= 70) {
      rank = 'A';
      modifier = 0.15; // 15% bonus
      cashReward = 1200;
      moralReward = 8;
    } else if (finalScore >= 50) {
      rank = 'B';
      modifier = 0.10;
      cashReward = 800;
      moralReward = 5;
    } else if (finalScore >= 30) {
      rank = 'C';
      modifier = 0.05;
      cashReward = 500;
      moralReward = 3;
    } else {
      rank = 'F';
      modifier = -0.05;
      cashReward = 200;
      moralReward = 0;
    }

    const description = `Ruada de Recepção executada com ${finalScore}% de precisão! (+R$ ${cashReward.toLocaleString()} Caixinha | +${moralReward} Moral | +${Math.round(modifier * 100)}% Poder de Pista).`;

    return { finalScore, rank, modifier, cashReward, moralReward, description };
  };

  const toggleAudio = () => {
    const nextState = !settings.audioEnabled;
    soundEngine.setMuted(!nextState);
    setSettings((s) => ({ ...s, audioEnabled: nextState }));
  };

  const finalStats = calculateFinalStats();

  const handleClaimRewards = () => {
    onFinish({
      score: finalStats.finalScore,
      rank: finalStats.rank,
      modifier: finalStats.modifier,
      cashReward: finalStats.cashReward,
      moralReward: finalStats.moralReward,
      description: finalStats.description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[120] animate-fade-in select-none">
      <div className="bg-zinc-950 border border-amber-500/60 rounded-3xl w-full max-w-4xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* MODAL HEADER */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner">
              <Flame className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  CORTEJO DE CHEGADA DA TORCIDA
                </span>
                <span className="text-[10px] text-zinc-400 font-bold hidden sm:inline">
                  {torcidaName} • {clubName}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                Ruada de Recepção do Ônibus do Time
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleAudio}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
              title={settings.audioEnabled ? "Desativar Áudio" : "Ativar Áudio"}
            >
              {settings.audioEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
              title="Fechar Minigame"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN GAME CONTAINER */}
        <div className="flex-1 relative overflow-hidden flex flex-col bg-zinc-950">
          {!isGameFinished ? (
            <PathTraceCanvas
              key={`round-${currentRoundIndex}`}
              pattern={currentPattern}
              currentRound={currentRoundIndex + 1}
              totalRounds={totalRounds}
              settings={settings}
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onRoundComplete={handleRoundComplete}
            />
          ) : (
            /* FINAL GAME OVER / REWARDS SCREEN */
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in bg-zinc-950">
              <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30">
                  <Trophy className="w-12 h-12 text-amber-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                  RANK {finalStats.rank}
                </div>
              </div>

              <div className="space-y-1 max-w-lg">
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Cortejo de Chegada Concluído!
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300">
                  A fumaça viva tomou a avenida e o elenco desceu do ônibus sob o rugido da torcida!
                </p>
              </div>

              {/* OVERALL SCORE & REWARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase block">Precisão do Mastro</span>
                  <div className="text-2xl font-black text-amber-400 mt-1">
                    {finalStats.finalScore}%
                  </div>
                  <span className="text-[9px] text-zinc-500 font-mono">Média das 2 Etapas</span>
                </div>

                <div className="bg-zinc-900/90 border border-emerald-500/40 rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase block">Caixinha da Torcida</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">
                    +R$ {finalStats.cashReward.toLocaleString()}
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">Lucro de Vendas da Ruada</span>
                </div>

                <div className="bg-zinc-900/90 border border-blue-500/40 rounded-2xl p-3.5 text-center shadow">
                  <span className="text-[10px] font-bold text-blue-400 uppercase block">Poder de Pista (PEC)</span>
                  <div className="text-2xl font-black text-blue-400 mt-1">
                    +{Math.round(finalStats.modifier * 100)}%
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono">+10 Moral do Contingente</span>
                </div>
              </div>

              {/* DETAILED ROUND BREAKDOWN */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 w-full max-w-xl text-left space-y-2">
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                  Desempenho por Etapa do Cortejo:
                </span>
                <div className="space-y-1.5">
                  {roundResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-zinc-950/80 px-3 py-2 rounded-xl border border-zinc-800/80">
                      <span className="font-bold text-zinc-300">
                        {i + 1}. {r.patternName}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-zinc-400 text-[11px] font-mono">{r.accuracy}% Precisão</span>
                        <span className="font-black text-amber-400 font-mono">{r.score} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl">
                <button
                  onClick={handleRetryGame}
                  className="flex-1 py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
                <button
                  onClick={handleClaimRewards}
                  className="flex-[2] py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Confirmar & Entrar no Caldeirão
                </button>
              </div>
            </div>
          )}

          {/* BETWEEN ROUNDS OVERLAY SUMMARY */}
          {showRoundSummary && lastRoundResult && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm z-30 flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-zinc-900 border border-amber-500/50 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-400">
                  <CheckCircle2 className="w-7 h-7 animate-bounce text-amber-400" />
                </div>

                <div>
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
                    ETAPA {currentRoundIndex + 1} DE {totalRounds} CONCLUÍDA
                  </span>
                  <h3 className="text-base font-black text-white uppercase mt-1">
                    {lastRoundResult.patternName}
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block">Precisão de Traço</span>
                    <span className="text-lg font-black text-amber-400 font-mono">{lastRoundResult.accuracy}%</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 font-bold block">Pontos na Etapa</span>
                    <span className="text-lg font-black text-emerald-400 font-mono">{lastRoundResult.score} pts</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300">
                  {currentRoundIndex + 1 < totalRounds
                    ? `Prepare o mastro para a próxima etapa: "${PATH_PATTERNS[currentRoundIndex + 1]?.name}"!`
                    : "Etapa final concluída! Apurando o resultado do cortejo..."}
                </p>

                <button
                  onClick={handleNextRound}
                  className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Continuar Cortejo ({currentRoundIndex + 2}/{totalRounds}) ▶
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
