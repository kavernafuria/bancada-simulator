import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Volume2, VolumeX, ShieldAlert, Sparkles, Music, Play, Timer, Flame, Download, Code } from 'lucide-react';
import { CrowdView } from './components/CrowdView';
import { RhythmBar } from './components/RhythmBar';
import { ScoreBoard } from './components/ScoreBoard';
import { MatchSimulatorModal } from './components/MatchSimulatorModal';
import { CodeViewerModal } from './components/CodeViewerModal';
import { FeedbackType, GameStats } from './types';
import { sound } from './utils/audio';

const TEAM_PALETTES = [
  { id: 'alvinegro', name: 'Alvinegro', primary: '#1c1917', secondary: '#ffffff' },
  { id: 'rubronegro', name: 'Rubro-Negro', primary: '#dc2626', secondary: '#1c1917' },
  { id: 'tricolor', name: 'Tricolor', primary: '#dc2626', secondary: '#ffffff' },
  { id: 'alviverde', name: 'Alviverde', primary: '#16a34a', secondary: '#ffffff' },
  { id: 'azulceleste', name: 'Celeste', primary: '#0284c7', secondary: '#ffffff' },
];

export default function App() {
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [totalHits, setTotalHits] = useState<number>(0);
  const [totalMisses, setTotalMisses] = useState<number>(0);
  const [feedback, setFeedback] = useState<FeedbackType>('idle');
  const [screenBounce, setScreenBounce] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedTeam, setSelectedTeam] = useState(TEAM_PALETTES[1]);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState<boolean>(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);

  // 20 Seconds Game Timer & Session State
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [beatTick, setBeatTick] = useState<number>(0);

  // Dynamic BPM: starts at 100 BPM, rises with combo up to 180 BPM
  const currentBpm = Math.min(100 + combo * 4, 190);

  const feedbackTimeoutRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Keep sound BPM synced with game state
  useEffect(() => {
    sound.setBpm(currentBpm);
  }, [currentBpm]);

  // Start 20-second session
  const startSession = useCallback(() => {
    setCombo(0);
    setTotalHits(0);
    setTotalMisses(0);
    setMaxCombo(0);
    setTimeLeft(20);
    setIsFinished(false);
    setIsPlaying(true);

    sound.setBpm(100);
    sound.startMusic((beat) => {
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
        clearInterval(timerIntervalRef.current!);
        timerIntervalRef.current = null;
        setIsPlaying(false);
        setIsFinished(true);
        sound.stopMusic();
        sound.playWhistleFinish();
      }
    }, 50);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      sound.stopMusic();
    };
  }, []);

  // Trigger feedback visual and screen bounce
  const triggerVisualFeedback = useCallback((type: FeedbackType, currentCombo: number) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }

    setFeedback(type);

    if (type === 'perfect' || type === 'good') {
      setScreenBounce(true);
      setTimeout(() => setScreenBounce(false), 180);
      sound.playHit(type === 'perfect', currentCombo);
    } else if (type === 'miss') {
      sound.playMiss();
    }

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback('idle');
    }, 350);
  }, []);

  // 3. Condições de Acerto
  const handleHit = useCallback(
    (isPerfect: boolean) => {
      if (!isPlaying) return;

      setCombo((prevCombo) => {
        const nextCombo = prevCombo + 1;
        setMaxCombo((prevMax) => Math.max(prevMax, nextCombo));
        triggerVisualFeedback(isPerfect ? 'perfect' : 'good', nextCombo);
        return nextCombo;
      });

      setTotalHits((prev) => prev + 1);
    },
    [isPlaying, triggerVisualFeedback]
  );

  // 3. Condições de Erro (Miss)
  const handleMiss = useCallback(
    (_reason: 'clicked_outside' | 'passed_without_click') => {
      if (!isPlaying) return;

      setCombo(0);
      setTotalMisses((prev) => prev + 1);
      triggerVisualFeedback('miss', 0);
    },
    [isPlaying, triggerVisualFeedback]
  );

  // Desempenho da torcida (0 a 100) para o Bancada Simulator
  const calculateCrowdScore = (): number => {
    const total = totalHits + totalMisses;
    if (total === 0) return 60;
    const accuracy = totalHits / total;
    const comboBonus = Math.min(maxCombo * 4, 40);
    const score = Math.round(accuracy * 60 + comboBonus);
    return Math.min(Math.max(score, 10), 100);
  };

  const crowdScore = calculateCrowdScore();

  const gameStats: GameStats = {
    combo,
    maxCombo,
    totalHits,
    totalMisses,
    score: crowdScore,
    speedMultiplier: Math.min(Math.pow(1.1, combo), 4.5),
    timeLeft,
    isPlaying,
    isFinished,
    currentBpm,
  };

  const handleReset = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    sound.stopMusic();
    setIsPlaying(false);
    setIsFinished(false);
    setTimeLeft(20);
    setCombo(0);
    setMaxCombo(0);
    setTotalHits(0);
    setTotalMisses(0);
    setFeedback('idle');
  };

  const toggleMute = () => {
    sound.isMuted = !sound.isMuted;
    setIsMuted(sound.isMuted);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between selection:bg-amber-400 selection:text-stone-950">
      {/* Screen Bounce Wrapper */}
      <motion.div
        animate={
          screenBounce
            ? {
                y: [-8, 4, 0],
                scale: [1.008, 0.996, 1],
              }
            : { y: 0, scale: 1 }
        }
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className="w-full flex-1 flex flex-col items-center px-4 sm:px-6 py-6 max-w-4xl mx-auto"
      >
        {/* Top Header */}
        <header className="w-full flex items-center justify-between pb-6 border-b border-stone-800/80 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
              <Music className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-100 uppercase">
                Bancada Simulator <span className="text-amber-400 font-serif lowercase italic text-lg sm:text-xl font-normal">| Ritmo & Guitar Hero</span>
              </h1>
              <p className="text-xs text-stone-400 font-medium">
                Pule no compasso da música! Desafio de 20 segundos de arquibancada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Direct ZIP Download Link */}
            <a
              href="/bancada-simulator.zip"
              download="bancada-simulator.zip"
              className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              title="Baixar ZIP compatível com Windows"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Baixar ZIP</span>
            </a>

            {/* View & Copy Code Modal Button */}
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 font-bold text-xs tracking-wide border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Ver e Copiar Código dos Arquivos"
            >
              <Code className="w-4 h-4" />
              <span className="hidden sm:inline">Ver Código</span>
            </button>

            <button
              onClick={handleReset}
              className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              title="Reiniciar Desafio"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsMatchModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs tracking-wide shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Simular Partida</span>
            </button>
          </div>
        </header>

        {/* Team Palette Switcher */}
        <div className="w-full flex items-center justify-between pb-4 text-xs">
          <span className="text-stone-400 font-medium hidden sm:inline">Uniforme da Torcida:</span>
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            {TEAM_PALETTES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTeam(t)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 cursor-pointer border ${
                  selectedTeam.id === t.id
                    ? 'bg-stone-800 text-stone-100 border-amber-400/80 shadow-sm'
                    : 'bg-stone-900/60 text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-stone-900"
                  style={{ backgroundColor: t.primary }}
                />
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="w-full space-y-6">
          {/* Animated Grandstand Crowd (Pula no BPM e nos acertos) */}
          <CrowdView
            feedback={feedback}
            combo={combo}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            beatTick={beatTick}
            bpm={currentBpm}
            isPlaying={isPlaying}
            teamColors={selectedTeam}
          />

          {/* Stats Bar with 20s Countdown Timer */}
          <ScoreBoard
            stats={gameStats}
            onOpenMatchModal={() => setIsMatchModalOpen(true)}
            onStartSession={startSession}
          />

          {/* Game Over / Session Finished Banner */}
          <AnimatePresence>
            {isFinished && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full p-5 bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-500/20 border-2 border-amber-400/60 rounded-3xl text-center space-y-3 shadow-2xl"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  Fim dos 20 Segundos! Apito Final!
                </div>
                <h3 className="text-2xl font-black text-stone-100">
                  Desempenho da Bancada: <span className="text-amber-400 font-mono">{crowdScore}/100</span>
                </h3>
                <p className="text-xs text-stone-300 max-w-md mx-auto">
                  Você acertou {totalHits} saltos no ritmo, com recorde de combo de {maxCombo}x. Agora envie a força da torcida para a simulação do jogo!
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={startSession}
                    className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold border border-stone-700 transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Tentar Novamente (20s)
                  </button>
                  <button
                    onClick={() => setIsMatchModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    Simular Partida com Esta Nota ({crowdScore})
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Core Rhythm & Timing Bar Interface */}
          <div className="bg-stone-900/95 p-4 sm:p-6 rounded-3xl border border-stone-800/90 shadow-2xl relative">
            {!isPlaying && !isFinished && (
              <div className="absolute inset-0 z-30 bg-stone-950/80 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
                  <Play className="w-7 h-7 fill-amber-400 ml-1" />
                </div>
                <h3 className="text-xl font-black text-stone-100 uppercase tracking-tight">
                  Desafio de Ritmo (20 Segundos)
                </h3>
                <p className="text-xs text-stone-400 max-w-sm mt-1 mb-4">
                  A música e a bateria vão tocar! Os pulos e a velocidade do ponteiro aumentam a cada acerto como no Guitar Hero.
                </p>
                <button
                  onClick={startSession}
                  className="px-7 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm tracking-wider uppercase shadow-xl hover:shadow-amber-500/25 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-stone-950" />
                  Iniciar Desafio de 20s
                </button>
              </div>
            )}

            <RhythmBar
              combo={combo}
              onHit={handleHit}
              onMiss={handleMiss}
              feedback={feedback}
              bpm={currentBpm}
              isPlaying={isPlaying}
            />
          </div>

          {/* Quick Manual / Regras de Jogo */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-stone-400 text-xs pt-2">
            <div className="p-3 bg-stone-900/40 rounded-xl border border-stone-800/50">
              <span className="font-bold text-stone-300 block mb-1">1. Tempo Limite (20s)</span>
              A sessão dura exatamente 20 segundos com trilha sonora procedural de surdo e bateria.
            </div>
            <div className="p-3 bg-stone-900/40 rounded-xl border border-stone-800/50">
              <span className="font-bold text-stone-300 block mb-1">2. Estilo Guitar Hero</span>
              Os pulos da torcida e o andamento musical (BPM) aceleram continuamente a cada combo.
            </div>
            <div className="p-3 bg-stone-900/40 rounded-xl border border-stone-800/50">
              <span className="font-bold text-stone-300 block mb-1">3. Impacto no Jogo</span>
              A nota da torcida (0-100) compõe 25% da Força Final no Bancada Simulator!
            </div>
          </div>
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-stone-500 border-t border-stone-900">
        Bancada Simulator — Desempenho da Torcida (25%) + Força Base do Time (75%)
      </footer>

      {/* Bancada Simulator Match Engine Modal */}
      <MatchSimulatorModal
        isOpen={isMatchModalOpen}
        onClose={() => setIsMatchModalOpen(false)}
        stadiumPartyScore={crowdScore}
      />

      {/* Code Viewer Modal for direct copy-pasting into Antigravity */}
      <CodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />
    </div>
  );
}
