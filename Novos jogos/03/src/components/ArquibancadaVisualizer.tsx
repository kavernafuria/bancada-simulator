import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamInfo } from '../types';
import { Flag, Flame, Music, Coffee, Zap } from 'lucide-react';

export interface ActionDef {
  id: string;
  name: string;
  shortLabel: string;
  cost: number;
  icon: string | React.ReactNode;
  costBadge: string;
  description: string;
}

interface ArquibancadaVisualizerProps {
  homeTeam: TeamInfo;
  isBannerUp: boolean;
  hasVerticalStripes: boolean;
  hasFlares: boolean;
  isChanting: boolean;
  isDrumming: boolean;
  hasMosaic: boolean;
  activeChantText: string | null;
  crowdEnergy: number; // 0 to 100
  pressure: number; // 0 to 100
  decibels: number;
  isAbove85: boolean;
  isGameOver: boolean;
  onAction: (actionId: string) => void;
  cooldowns?: Record<string, number>;
}

export const ArquibancadaVisualizer: React.FC<ArquibancadaVisualizerProps> = ({
  homeTeam,
  isBannerUp,
  hasVerticalStripes,
  hasFlares,
  isChanting,
  isDrumming,
  hasMosaic,
  activeChantText,
  crowdEnergy,
  pressure,
  decibels,
  isAbove85,
  isGameOver,
  onAction,
  cooldowns = {},
}) => {
  const actions: ActionDef[] = [
    {
      id: 'grito',
      name: 'Grito de Guerra',
      shortLabel: 'Grito',
      cost: 14,
      icon: '📢',
      costBadge: '-14 EN',
      description: 'Canta o hino e eleva decibéis',
    },
    {
      id: 'bandeirao',
      name: 'Subir Bandeirão',
      shortLabel: 'Bandeirão',
      cost: 28,
      icon: <Flag className="w-4 h-4 text-rose-400" />,
      costBadge: '-28 EN',
      description: 'Impede a visão rival e intimida',
    },
    {
      id: 'faixas',
      name: 'Esticar Faixas',
      shortLabel: 'Faixas',
      cost: 16,
      icon: '🎗️',
      costBadge: '-16 EN',
      description: 'Faixas verticais tradicionais',
    },
    {
      id: 'sinalizadores',
      name: 'Sinalizadores',
      shortLabel: 'Sinalizador',
      cost: 24,
      icon: <Flame className="w-4 h-4 text-amber-400" />,
      costBadge: '-24 EN',
      description: 'Fumaça e fogo no caldeirão',
    },
    {
      id: 'bateria',
      name: 'Puxar Bateria',
      shortLabel: 'Bateria',
      cost: 10,
      icon: <Music className="w-4 h-4 text-purple-400" />,
      costBadge: '-10 EN',
      description: 'Ritmo rápido para frear a queda de pressão',
    },
    {
      id: 'descanso',
      name: 'Hidratar Bancada',
      shortLabel: 'Hidratar',
      cost: 0,
      icon: <Coffee className="w-4 h-4 text-emerald-400" />,
      costBadge: '+30 EN | -12% Pressão',
      description: 'Pausa para beber água (+30 energia). Custa pressão da torcida e tem cooldown de 6s.',
    },
  ];

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-2xl bg-gradient-to-b from-slate-900 via-slate-800 to-slate-950 ${
        isAbove85
          ? 'border-amber-400/90 shadow-amber-500/30 ring-2 ring-amber-400/40'
          : 'border-slate-700/60'
      }`}
      style={{ minHeight: '430px' }}
    >
      {/* Céu noturno do estádio com refletores */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-10 left-10 w-48 h-72 bg-amber-100/10 blur-3xl rotate-25 transform" />
        <div className="absolute -top-10 right-10 w-48 h-72 bg-amber-100/10 blur-3xl -rotate-25 transform" />
        <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Top Bar: Setor, Decibéis e Status de Caldeirão */}
      <div className="relative z-20 flex items-center justify-between px-3 sm:px-4 py-2.5 bg-black/60 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full animate-ping"
            style={{ backgroundColor: homeTeam.primaryColor }}
          />
          <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase drop-shadow">
            Bancada: {homeTeam.name}
          </span>
          <span className="hidden sm:inline-block text-[10px] text-slate-300 font-mono bg-white/10 px-2 py-0.5 rounded">
            {homeTeam.stadium}
          </span>
        </div>

        {/* Indicador de Pressão & Ruidômetro */}
        <div className="flex items-center gap-2">
          {isAbove85 && (
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 0.6 }}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600 text-amber-200 text-[10px] font-black uppercase tracking-wider border border-amber-400/80 shadow-lg"
            >
              <Flame className="w-3 h-3 text-amber-300" />
              <span>CALDEIRÃO ATIVADO!</span>
            </motion.div>
          )}

          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="text-[10px] text-slate-400 font-semibold hidden xs:inline">SOM:</span>
            <span
              className={`text-xs font-black font-mono ${
                decibels > 105
                  ? 'text-rose-400 animate-pulse'
                  : decibels > 85
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {Math.round(decibels)} dB
            </span>
          </div>
        </div>
      </div>

      {/* Banner flutuante de canto em tempo real */}
      <AnimatePresence>
        {activeChantText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="absolute top-12 inset-x-3 mx-auto z-30 max-w-sm sm:max-w-md px-3 sm:px-4 py-1.5 bg-black/90 backdrop-blur-md border border-amber-400/60 rounded-full text-center shadow-2xl flex items-center justify-center gap-2"
          >
            <span className="text-amber-400 text-xs sm:text-sm">📢</span>
            <p className="text-[11px] sm:text-xs font-black tracking-wide text-amber-300 uppercase truncate">
              "{activeChantText}"
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A Arquibancada (Cenário de Degraus e Torcedores) */}
      <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-end pt-8 pb-2">
        {/* Nuvens de fumaça / Sinalizadores */}
        <AnimatePresence>
          {hasFlares && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
            >
              <div
                className="absolute inset-0 mix-blend-screen opacity-70 animate-pulse"
                style={{
                  background: `radial-gradient(circle at 50% 80%, ${homeTeam.primaryColor}ee, rgba(245, 158, 11, 0.5) 40%, transparent 70%)`,
                }}
              />
              <div className="absolute bottom-16 left-1/4 w-3 h-3 rounded-full bg-amber-300 shadow-[0_0_15px_#f59e0b] animate-bounce" />
              <div className="absolute bottom-24 left-1/2 w-4 h-4 rounded-full bg-rose-400 shadow-[0_0_20px_#ef4444] animate-ping" />
              <div className="absolute bottom-20 right-1/3 w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_15px_#f59e0b] animate-bounce" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Degraus da arquibancada */}
        <div className="relative w-full h-32 sm:h-40 z-10 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent">
          {/* Degrau 3 (Superior) */}
          <div className="relative w-full h-8 border-b border-slate-700/30 flex items-end justify-around px-3 overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={`d3-${i}`}
                animate={{
                  y: isChanting || isDrumming || isAbove85 ? [0, -4, 0] : [0, -1, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isAbove85 ? 0.28 : isChanting ? 0.35 : 0.7,
                  delay: (i % 4) * 0.08,
                }}
                className="w-3 h-5 rounded-t-full relative"
                style={{
                  backgroundColor: i % 2 === 0 ? homeTeam.primaryColor : homeTeam.secondaryColor,
                  border: `1px solid ${homeTeam.accentColor}44`,
                }}
              >
                <div className="w-2 h-2 rounded-full bg-amber-200/90 mx-auto -mt-1.5" />
              </motion.div>
            ))}
          </div>

          {/* Degrau 2 (Médio) */}
          <div className="relative w-full h-10 border-b border-slate-700/40 flex items-end justify-around px-2 overflow-hidden">
            {Array.from({ length: 22 }).map((_, i) => (
              <motion.div
                key={`d2-${i}`}
                animate={{
                  y: isChanting || isDrumming || isAbove85 ? [0, -6, 0] : [0, -2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isAbove85 ? 0.26 : isChanting ? 0.35 : 0.65,
                  delay: (i % 3) * 0.1,
                }}
                className="w-3.5 h-6 rounded-t-full relative"
                style={{
                  backgroundColor:
                    i % 3 === 0
                      ? homeTeam.primaryColor
                      : i % 3 === 1
                      ? homeTeam.secondaryColor
                      : homeTeam.accentColor,
                }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-amber-100 mx-auto -mt-2" />
                {i % 4 === 0 && (
                  <motion.div
                    animate={{ rotate: [-20, 20, -20] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="absolute -top-2.5 -right-2 w-2.5 h-2 rounded-xs"
                    style={{ backgroundColor: homeTeam.primaryColor }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Degrau 1 (Linha de frente / Alambrado) */}
          <div className="relative w-full h-12 border-b border-slate-600/50 flex items-end justify-around px-1 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={`d1-${i}`}
                animate={{
                  y: isChanting || isDrumming || isAbove85 ? [0, -7, 0] : [0, -2, 0],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isAbove85 ? 0.24 : isChanting ? 0.32 : 0.6,
                  delay: (i % 5) * 0.07,
                }}
                className="w-4 h-8 rounded-t-md relative"
                style={{
                  backgroundColor: i % 2 === 0 ? homeTeam.primaryColor : homeTeam.secondaryColor,
                  boxShadow: `0 0 8px ${homeTeam.primaryColor}66`,
                }}
              >
                <div className="w-3 h-3 rounded-full bg-amber-200 mx-auto -mt-2.5 shadow-inner" />
                {i === 12 && isDrumming && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ repeat: Infinity, duration: 0.35 }}
                    className="absolute -top-5 -left-2 w-5 h-5 rounded-full bg-amber-400 border border-slate-900 flex items-center justify-center text-[8px] font-black text-slate-900 shadow-lg"
                  >
                    🥁
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Mosaico 3D da torcida */}
          <AnimatePresence>
            {hasMosaic && (
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                className="absolute inset-x-4 top-2 bottom-6 z-15 grid grid-cols-12 gap-1 p-2 bg-black/75 rounded-lg border border-amber-400/50 shadow-2xl origin-bottom"
              >
                {Array.from({ length: 24 }).map((_, idx) => (
                  <div
                    key={`mos-${idx}`}
                    className="h-full rounded-xs flex items-center justify-center text-[7px] font-black text-white shadow-sm"
                    style={{
                      backgroundColor: idx % 2 === 0 ? homeTeam.primaryColor : homeTeam.secondaryColor,
                      color: homeTeam.accentColor,
                    }}
                  >
                    {idx === 10 ? 'R' : idx === 11 ? 'A' : idx === 12 ? 'Ç' : idx === 13 ? 'A' : '★'}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Faixas Verticais Esticadas */}
          <AnimatePresence>
            {hasVerticalStripes && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: '100%', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="absolute inset-0 z-16 pointer-events-none flex justify-around px-6 overflow-hidden"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={`stripe-${i}`}
                    animate={{ x: [-1.5, 1.5, -1.5] }}
                    transition={{ repeat: Infinity, duration: 1.4 + i * 0.2, ease: 'easeInOut' }}
                    className="w-4 sm:w-5 h-full shadow-lg opacity-90"
                    style={{
                      backgroundColor: i % 2 === 0 ? homeTeam.primaryColor : homeTeam.secondaryColor,
                      borderLeft: `2px solid ${homeTeam.accentColor}`,
                      borderRight: `2px solid ${homeTeam.accentColor}`,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bandeirão Gigante Subindo */}
          <AnimatePresence>
            {isBannerUp && (
              <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ duration: 0.55, type: 'spring', damping: 18 }}
                className="absolute inset-x-4 top-2 bottom-2 z-25 rounded-xl shadow-2xl border-2 overflow-hidden flex flex-col items-center justify-center text-center backdrop-blur-xs"
                style={{
                  background: `linear-gradient(135deg, ${homeTeam.primaryColor}, ${homeTeam.secondaryColor})`,
                  borderColor: homeTeam.accentColor,
                  boxShadow: `0 0 35px ${homeTeam.primaryColor}cc`,
                }}
              >
                <div className="w-12 h-12 rounded-full border-3 border-white flex items-center justify-center font-black text-xl shadow-xl bg-black/40 text-white mb-1">
                  ⚽
                </div>
                <div className="font-black text-sm sm:text-base uppercase tracking-widest text-white drop-shadow-md">
                  {homeTeam.name}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 drop-shadow">
                  O CALDEIRÃO FERVE!
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================
          CONSOLE DE ESCOLHAS NA TELA VISUAL (BOTÕES INTEGRADOS)
         ======================================================== */}
      <div className="relative z-30 p-2.5 sm:p-3 bg-slate-950/95 border-t border-slate-800 backdrop-blur-md">
        {/* Subheader do Console dentro da tela */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2 px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wide text-white">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Comandos da Torcida</span>
          </span>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-400">Fôlego:</span>
            <span
              className={`font-black ${
                crowdEnergy < 25 ? 'text-rose-400 animate-pulse' : 'text-amber-400'
              }`}
            >
              {Math.round(crowdEnergy)}%
            </span>
          </div>
        </div>

        {/* Grade de Botões de Ação na Tela Visual */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          {actions.map((act) => {
            const cd = cooldowns[act.id] || 0;
            const isRest = act.id === 'descanso';
            // Hidratar só pode ser usado se a energia estiver abaixo de 80% e não estiver em cooldown
            const cannotRest = isRest && (crowdEnergy >= 80 || cd > 0);
            const cannotAct = !isRest && (crowdEnergy < act.cost || cd > 0);
            const isDisabled = isGameOver || cannotRest || cannotAct;

            return (
              <button
                key={act.id}
                type="button"
                id={`btn-visual-${act.id}`}
                disabled={isDisabled}
                onClick={() => onAction(act.id)}
                title={act.description}
                className={`group relative p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-between text-center transition-all active:scale-95 select-none ${
                  isRest
                    ? isDisabled
                      ? 'border-slate-800 bg-slate-900/40 text-slate-600 opacity-50 cursor-not-allowed'
                      : 'border-emerald-500/70 bg-emerald-950/50 hover:bg-emerald-900/60 hover:border-emerald-400 text-emerald-200 shadow-md shadow-emerald-950/50'
                    : isDisabled
                    ? 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-40 cursor-not-allowed'
                    : 'border-slate-700/80 bg-slate-800/85 hover:bg-slate-700/90 hover:border-amber-400/80 text-white shadow-md hover:shadow-amber-500/10'
                }`}
              >
                {/* Indicador de Cooldown se ativo */}
                {cd > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-rose-600 text-white text-[9px] font-black rounded-full border border-slate-900 shadow">
                    {cd}s
                  </div>
                )}

                {/* Ícone da Ação */}
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-sm sm:text-base mb-1 bg-black/40 border border-white/10 group-hover:scale-110 transition-transform">
                  {act.icon}
                </div>

                {/* Nome Curto */}
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-tight line-clamp-1">
                  {act.shortLabel}
                </span>

                {/* Badge de Custo de Energia ou Cooldown */}
                <span
                  className={`mt-1 text-[8.5px] sm:text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    cd > 0
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                      : isRest
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-black/60 text-amber-300 border border-slate-700'
                  }`}
                >
                  {cd > 0 ? `Espera ${cd}s` : isRest ? (crowdEnergy >= 80 ? 'Cheio' : '+30 EN') : act.costBadge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
