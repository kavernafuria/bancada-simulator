import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Drum, Flame, Trophy, Sparkles, X, Volume2, VolumeX, RefreshCw, Timer, Target, CheckCircle2 } from 'lucide-react';
import { FeedbackType, RhythmResult } from './types';
import { soundSynthesizer } from './audioSynthesizer';
import { CrowdViewCanvas } from './CrowdViewCanvas';
import { RhythmBarCanvas } from './RhythmBarCanvas';

export interface RhythmBateriaModalProps {
  onClose: () => void;
  onFinish: (result: RhythmResult) => void;
  torcidaName?: string;
  clubName?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export const RhythmBateriaModal: React.FC<RhythmBateriaModalProps> = ({
  onClose,
  onFinish,
  torcidaName = 'BATERIA DA TORCIDA',
  clubName = 'NOSSO CLUBE',
  primaryColor,
  secondaryColor,
}) => {
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [totalMisses, setTotalMisses] = useState<number>(0);
  const [feedback, setFeedback] = useState<FeedbackType>('idle');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [beatTick, setBeatTick] = useState<number>(0);

  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const currentBpm = Math.min(100 + combo * 4, 190);
  const feedbackTimeoutRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    soundSynthesizer.setBpm(currentBpm);
  }, [currentBpm]);

  const startSession = useCallback(() => {
    setCombo(0);
    setMaxCombo(0);
    setTotalHits(0);
    setTotalMisses(0);
    setTimeLeft(20);
    setIsFinished(false);
    setIsPlaying(true);

    soundSynthesizer.setBpm(100);
    soundSynthesizer.startMusic((beat) => {
      setBeatTick(beat);
    });

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    const startTime = Date.now();
    const duration = 20 * 1000;

    timerIntervalRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        setIsPlaying(false);
        setIsFinished(true);
        soundSynthesizer.stopMusic();
        soundSynthesizer.playWhistleFinish();
      }
    }, 50);
  }, []);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      soundSynthesizer.stopMusic();
    };
  }, []);

  const triggerFeedback = useCallback((type: FeedbackType, currentCombo: number) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    setFeedback(type);

    if (type === 'perfect' || type === 'good') {
      soundSynthesizer.playHit(type === 'perfect', currentCombo);
    } else if (type === 'miss') {
      soundSynthesizer.playMiss();
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback('idle');
    }, 350);
  }, []);

  const handleHit = useCallback(
    (isPerfect: boolean) => {
      if (!isPlaying) return;

      setCombo((prevCombo) => {
        const nextCombo = prevCombo + 1;
        setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));
        triggerFeedback(isPerfect ? 'perfect' : 'good', nextCombo);
        return nextCombo;
      });

      setTotalHits((prev) => prev + 1);
    },
    [isPlaying, triggerFeedback]
  );

  const handleMiss = useCallback(
    () => {
      if (!isPlaying) return;

      setCombo(0);
      setTotalMisses((prev) => prev + 1);
      triggerFeedback('miss', 0);
    },
    [isPlaying, triggerFeedback]
  );

  // Performance calculation
  const calculateCrowdScore = (): number => {
    const total = totalHits + totalMisses;
    if (total === 0) return 60;
    const accuracy = totalHits / total;
    const comboBonus = Math.min(maxCombo * 5, 45);
    const score = Math.round(accuracy * 65 + comboBonus);
    return Math.min(Math.max(score, 20), 100);
  };

  const finalScore = calculateCrowdScore();

  const calculateRewards = () => {
    let rank: 'S' | 'A' | 'B' | 'C' | 'F' = 'F';
    let modifier = 0.05;
    let cashReward = 300;
    let moralReward = 2;

    if (finalScore >= 85) {
      rank = 'S';
      modifier = 0.25; // +25% Poder de Bancada
      cashReward = 1500;
      moralReward = 15;
    } else if (finalScore >= 70) {
      rank = 'A';
      modifier = 0.15;
      cashReward = 1000;
      moralReward = 10;
    } else if (finalScore >= 50) {
      rank = 'B';
      modifier = 0.08;
      cashReward = 600;
      moralReward = 5;
    } else if (finalScore >= 30) {
      rank = 'C';
      modifier = 0.03;
      cashReward = 300;
      moralReward = 2;
    } else {
      rank = 'F';
      modifier = -0.05;
      cashReward = 100;
      moralReward = 0;
    }

    const description = `Bateria da torcida deu show com ${finalScore}% de sincronia! (+R$ ${cashReward.toLocaleString()} Caixinha | +${moralReward} Moral | +${Math.round(modifier * 100)}% Pressão de Bancada).`;

    return { rank, modifier, cashReward, moralReward, description };
  };

  const rewards = calculateRewards();

  const toggleMute = () => {
    soundSynthesizer.isMuted = !soundSynthesizer.isMuted;
    setIsMuted(soundSynthesizer.isMuted);
  };

  const handleClaim = () => {
    onFinish({
      score: finalScore,
      rank: rewards.rank,
      modifier: rewards.modifier,
      cashReward: rewards.cashReward,
      moralReward: rewards.moralReward,
      description: rewards.description,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[120] animate-fade-in select-none">
      <div className="bg-zinc-950 border border-amber-500/60 rounded-3xl w-full max-w-3xl max-h-[96vh] flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* HEADER */}
        <div className="bg-zinc-900/90 border-b border-zinc-800 px-4 py-3 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shadow-inner">
              <Drum className="w-5 h-5 animate-pulse text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                ARQUIBANCADA & SAMBA DE TORCIDA
              </span>
              <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-tight flex items-center gap-1.5 mt-0.5">
                Bateria & Mosaico de Papelão (Ritmo)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleMute}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col space-y-4 bg-zinc-950">
          {!isPlaying && !isFinished ? (
            /* START SCREEN TUTORIAL */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-4 my-auto">
              <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 shadow-2xl">
                <Drum className="w-10 h-10 animate-bounce" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-white uppercase">
                  Ditando o Ritmo do Caldeirão
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 max-w-md mt-1">
                  Mantenha as baquetas batendo no ritmo exato do surdo de marcação! Quanto maior o combo, mais quente fica a bancada e mais rápido o ritmo acelera.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md text-left text-xs bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Duração</span>
                  <span className="font-black text-amber-400">20 Segundos</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Zona de Acerto</span>
                  <span className="font-black text-emerald-400">40% a 60%</span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block">Controle</span>
                  <span className="font-black text-white">Espaço / Toque</span>
                </div>
              </div>

              <button
                onClick={startSession}
                className="w-full max-w-md py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-sm uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                🥁 INICIAR BATUCADA DA BATERIA (20s)
              </button>
            </div>
          ) : isFinished ? (
            /* RESULTS SCREEN */
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-5 p-4 my-auto animate-fade-in">
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto shadow-2xl">
                  <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500 text-zinc-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow">
                  RANK {rewards.rank}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-white uppercase">
                  Espetáculo Concluído na Arquibancada!
                </h3>
                <p className="text-xs text-zinc-300 max-w-md mt-1">
                  A bateria ditou o ritmo durante os 90 minutos e inflamou o setor com cânticos e bandeirões!
                </p>
              </div>

              {/* STATS GRID */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-lg">
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Pontuação</span>
                  <span className="text-xl font-black text-amber-400 font-mono">{finalScore} pts</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Maior Combo</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">{maxCombo}x</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Acertos</span>
                  <span className="text-xl font-black text-blue-400 font-mono">{totalHits}</span>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] text-zinc-400 uppercase font-bold block">Erros</span>
                  <span className="text-xl font-black text-red-400 font-mono">{totalMisses}</span>
                </div>
              </div>

              {/* REWARDS SUMMARY */}
              <div className="bg-zinc-900/90 border border-amber-500/40 p-4 rounded-2xl w-full max-w-lg text-left flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider block">Bônus da Festa de Arquibancada</span>
                  <span className="text-xs text-zinc-200 font-bold block mt-0.5">
                    +R$ {rewards.cashReward.toLocaleString()} Caixinha | +{rewards.moralReward} Moral | +{Math.round(rewards.modifier * 100)}% Bancada
                  </span>
                </div>
                <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-lg">
                <button
                  onClick={startSession}
                  className="flex-1 py-3 px-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Tentar Novamente
                </button>
                <button
                  onClick={handleClaim}
                  className="flex-[2] py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" /> Confirmar & Entrar no Caldeirão
                </button>
              </div>
            </div>
          ) : (
            /* ACTIVE GAME SESSION */
            <>
              {/* LIVE HUD */}
              <div className="grid grid-cols-3 gap-2 bg-zinc-900 p-2.5 rounded-2xl border border-zinc-800 text-center">
                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center justify-center gap-1">
                    <Timer className="w-3 h-3 text-amber-400" /> TEMPO
                  </span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-emerald-400" /> COMBO
                  </span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {combo}x <span className="text-[10px] text-zinc-500 font-normal">({maxCombo}x máx)</span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase block flex items-center justify-center gap-1">
                    <Target className="w-3 h-3 text-blue-400" /> PONTOS
                  </span>
                  <span className="text-lg font-black text-blue-400 font-mono">
                    {finalScore} pts
                  </span>
                </div>
              </div>

              {/* CROWD VIEW CANVAS */}
              <CrowdViewCanvas
                feedback={feedback}
                combo={combo}
                isMuted={isMuted}
                onToggleMute={toggleMute}
                beatTick={beatTick}
                bpm={currentBpm}
                isPlaying={isPlaying}
                torcidaName={torcidaName}
                primaryColor={primaryColor}
                secondaryColor={secondaryColor}
              />

              {/* RHYTHM BAR CANVAS */}
              <RhythmBarCanvas
                combo={combo}
                onHit={handleHit}
                onMiss={handleMiss}
                feedback={feedback}
                bpm={currentBpm}
                isPlaying={isPlaying}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
};
