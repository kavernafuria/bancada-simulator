import React, { useState } from 'react';
import { PATH_PATTERNS } from './utils/mathPath';
import { GameSettings, RoundResult, GameState } from './types';
import { PathTraceCanvas } from './components/PathTraceCanvas';
import { RoundSummaryModal } from './components/RoundSummaryModal';
import { GameResultsView } from './components/GameResultsView';
import { soundEngine } from './utils/audio';
import { downloadProjectZip } from './utils/exportZip';
import {
  Flame,
  Volume2,
  VolumeX,
  Sliders,
  Flag,
  Sparkles,
  Info,
  RotateCcw,
  Layers,
  Download,
  Check,
  Loader2,
} from 'lucide-react';

export default function App() {
  // Game Configuration & Settings
  const [settings, setSettings] = useState<GameSettings>({
    errorThresholdPx: 42,
    showGuideZone: true,
    hapticFeedback: true,
    audioEnabled: true,
    flagTheme: 'rubronegro',
  });

  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0); // 0, 1, 2 for 3 rounds
  const [roundResults, setRoundResults] = useState<RoundResult[]>([]);
  const [activeModalResult, setActiveModalResult] = useState<RoundResult | null>(null);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownloadZip = async () => {
    try {
      setIsDownloadingZip(true);
      await downloadProjectZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao gerar zip:', err);
    } finally {
      setIsDownloadingZip(false);
    }
  };

  // Audio mute toggle
  const toggleAudio = () => {
    const next = !settings.audioEnabled;
    soundEngine.enabled = next;
    setSettings((prev) => ({ ...prev, audioEnabled: next }));
  };

  // Called when a round completes
  const handleRoundComplete = (result: RoundResult) => {
    const updatedResults = [...roundResults, result];
    setRoundResults(updatedResults);
    setActiveModalResult(result);
  };

  // Move from modal to next round or final screen
  const handleNextFromModal = () => {
    setActiveModalResult(null);
    if (currentRoundIndex < PATH_PATTERNS.length - 1) {
      setCurrentRoundIndex((prev) => prev + 1);
      setGameState('playing');
    } else {
      setGameState('game_over');
    }
  };

  // Restart entire 3-round game
  const handleRestartAll = () => {
    setCurrentRoundIndex(0);
    setRoundResults([]);
    setActiveModalResult(null);
    setGameState('playing');
  };

  // Calculate final score: integer variable `pontuacaoBandeira` (0 to 100)
  const pontuacaoBandeira: number =
    roundResults.length > 0
      ? Math.min(
          100,
          Math.max(
            0,
            Math.round(
              roundResults.reduce((acc, r) => acc + r.score, 0) / roundResults.length
            )
          )
        )
      : 0;

  const currentPattern = PATH_PATTERNS[currentRoundIndex];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-start p-3 sm:p-6 select-none font-sans">
      {/* 1. Header Navigation */}
      <header
        id="app-header"
        className="w-full max-w-5xl flex items-center justify-between py-3 px-4 bg-neutral-900/80 backdrop-blur-md rounded-2xl border border-neutral-800 shadow-xl mb-4"
      >
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center text-neutral-950 shadow-md">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-2">
              <span>Tremular Bandeirão</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30">
                Bancada Simulator
              </span>
            </h1>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Controle por toque: arraste a faísca do sinalizador no traçado alvo
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Download ZIP button for direct export to Antigravity */}
          <a
            id="download-zip-btn"
            href="/bancada-simulator-bandeirao.zip"
            download="bancada-simulator-bandeirao.zip"
            onClick={(e) => {
              // Also trigger our generator if needed
              if (!isDownloadingZip) {
                handleDownloadZip();
              }
            }}
            title="Baixar Projeto (.ZIP) para Antigravity"
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-bold text-xs flex items-center space-x-1.5 transition cursor-pointer shadow-md decoration-transparent"
          >
            {isDownloadingZip ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Baixando...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-neutral-950" />
                <span className="hidden sm:inline">ZIP Baixado!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Baixar ZIP</span>
              </>
            )}
          </a>

          <button
            id="toggle-audio-btn"
            onClick={toggleAudio}
            title={settings.audioEnabled ? 'Desativar Som' : 'Ativar Som'}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer border border-neutral-700/60"
          >
            {settings.audioEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-neutral-500" />}
          </button>

          <button
            id="toggle-settings-btn"
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            title="Configurações e Margem de Erro"
            className={`p-2 rounded-xl transition cursor-pointer border ${
              showSettingsDrawer
                ? 'bg-amber-500 text-neutral-950 border-amber-400'
                : 'bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border-neutral-700/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
          </button>

          {gameState === 'playing' && (
            <button
              id="restart-current-btn"
              onClick={handleRestartAll}
              title="Reiniciar Minigame"
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer border border-neutral-700/60"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Settings Drawer (Collapsible) */}
      {showSettingsDrawer && (
        <div
          id="settings-drawer"
          className="w-full max-w-5xl bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 mb-4 shadow-xl animate-in slide-in-from-top-2 duration-150"
        >
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Ajustes do Minigame & Margem de Erro</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">
              Threshold: {settings.errorThresholdPx}px
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Margem de Erro (Threshold) Slider */}
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-semibold text-neutral-200">Margem de Erro (Tolerância)</span>
                <span className="font-mono font-bold text-amber-400">
                  {settings.errorThresholdPx} px
                </span>
              </div>
              <input
                id="error-threshold-slider"
                type="range"
                min="24"
                max="65"
                value={settings.errorThresholdPx}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, errorThresholdPx: Number(e.target.value) }))
                }
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Distância máxima permitida entre o dedo e o caminho alvo.
              </span>
            </div>

            {/* Corredor de Guia Visual */}
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-200">Exibir Corredor Alvo</span>
                <input
                  type="checkbox"
                  checked={settings.showGuideZone}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, showGuideZone: e.target.checked }))
                  }
                  className="accent-amber-500 w-4 h-4 cursor-pointer"
                />
              </div>
              <span className="text-[10px] text-neutral-400 mt-1 block">
                Desenha o limite da margem semitransparente na tela.
              </span>
            </div>

            {/* Tema do Bandeirão */}
            <div className="bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
              <span className="font-semibold text-neutral-200 block mb-1.5">Cores do Bandeirão</span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'rubronegro', label: 'Rubro-Negro' },
                  { id: 'tricolor', label: 'Tricolor' },
                  { id: 'alvinegro', label: 'Alvinegro' },
                  { id: 'verdao', label: 'Verdão' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        flagTheme: t.id as GameSettings['flagTheme'],
                      }))
                    }
                    className={`px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer border ${
                      settings.flagTheme === t.id
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Play Arena or Final Results */}
      <main className="w-full max-w-5xl flex-1 flex flex-col items-center">
        {gameState === 'playing' ? (
          <div className="w-full space-y-3">
            {/* Pattern Progress Tracker */}
            <div
              id="pattern-tracker"
              className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/60 rounded-xl border border-neutral-800 text-xs"
            >
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-neutral-200">{currentPattern.subtitle}</span>
              </div>

              {/* 3 Step Dots */}
              <div className="flex items-center space-x-2">
                {PATH_PATTERNS.map((p, idx) => (
                  <div
                    key={`step-dot-${p.id}`}
                    className={`flex items-center space-x-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold transition-all ${
                      idx === currentRoundIndex
                        ? 'bg-amber-500 text-neutral-950 ring-2 ring-amber-400/40'
                        : idx < currentRoundIndex
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    <span className="hidden sm:inline">{p.name.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Touch/Drag Game Canvas */}
            <PathTraceCanvas
              key={`round-canvas-${currentPattern.id}`}
              pattern={currentPattern}
              currentRound={currentRoundIndex + 1}
              totalRounds={PATH_PATTERNS.length}
              settings={settings}
              onRoundComplete={handleRoundComplete}
            />

            {/* Instruction Card */}
            <div
              id="quick-instructions"
              className="p-3.5 bg-neutral-900/50 rounded-xl border border-neutral-800/80 flex items-start space-x-3 text-xs text-neutral-400"
            >
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <b className="text-neutral-200">Como Jogar:</b> Toque no ponto verde e arraste o dedo
                até a bandeira vermelha sem soltar a tela. Mantenha a faísca do sinalizador dentro da
                margem de erro para evitar Misses. Complete os 3 padrões para calcular a{' '}
                <span className="text-amber-400 font-mono font-bold">pontuacaoBandeira</span>.
              </div>
            </div>
          </div>
        ) : (
          /* Game Over / Final 3-Round Results Screen */
          <GameResultsView
            roundResults={roundResults}
            pontuacaoBandeira={pontuacaoBandeira}
            onRestart={handleRestartAll}
          />
        )}
      </main>

      {/* 3. Modal between rounds */}
      {activeModalResult && (
        <RoundSummaryModal
          result={activeModalResult}
          isLastRound={currentRoundIndex === PATH_PATTERNS.length - 1}
          onNext={handleNextFromModal}
        />
      )}
    </div>
  );
}
