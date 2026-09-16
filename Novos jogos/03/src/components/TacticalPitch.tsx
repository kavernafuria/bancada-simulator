import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TeamInfo } from '../types';
import { Flame, ShieldAlert, Crosshair } from 'lucide-react';

interface TacticalPitchProps {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  pressure: number; // 0 to 100
  isAbove85: boolean;
  timeInZone85: number;
  recentAttackEvent: string | null;
  chancesCreated: number;
}

export const TacticalPitch: React.FC<TacticalPitchProps> = ({
  homeTeam,
  awayTeam,
  pressure,
  isAbove85,
  timeInZone85,
  recentAttackEvent,
  chancesCreated,
}) => {
  // Simulação de animação da bola e jogadores
  const [ballCoords, setBallCoords] = useState<{ x: number; y: number }>({ x: 45, y: 50 });
  const [shotTrail, setShotTrail] = useState<boolean>(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (isAbove85) {
        // Pressão máxima: bola dentro da grande área adversária (x: 75 a 95%)
        const targetX = 75 + Math.random() * 18;
        const targetY = 25 + Math.random() * 50;
        setBallCoords({ x: targetX, y: targetY });
        setShotTrail(true);
        setTimeout(() => setShotTrail(false), 500);
      } else if (pressure >= 60) {
        // Campo de ataque / intermediária (x: 55 a 75%)
        setBallCoords({
          x: 55 + Math.random() * 18,
          y: 20 + Math.random() * 60,
        });
      } else if (pressure >= 35) {
        // Meio campo (x: 35 a 55%)
        setBallCoords({
          x: 35 + Math.random() * 18,
          y: 20 + Math.random() * 60,
        });
      } else {
        // Recuado / Defesa mandante (x: 15 a 35%)
        setBallCoords({
          x: 15 + Math.random() * 18,
          y: 20 + Math.random() * 60,
        });
      }
    }, 1100);

    return () => clearInterval(interval);
  }, [isAbove85, pressure]);

  // Status dinâmico da fase de ataque
  const getPhaseText = () => {
    if (isAbove85) {
      return 'BLITZ TOTAL NA ÁREA! (PRESSÃO SUFOCANTE)';
    }
    if (pressure >= 70) {
      return 'Pressão constante na intermediária rival';
    }
    if (pressure >= 50) {
      return 'Ataque articulando jogadas pelos lados';
    }
    if (pressure >= 30) {
      return 'Jogo truncado e disputado no círculo central';
    }
    return 'Defesa recuada sob marcação rival';
  };

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col justify-between shadow-2xl ${
        isAbove85
          ? 'border-amber-400/80 bg-slate-950 ring-2 ring-amber-500/50 shadow-amber-500/20'
          : 'border-slate-800 bg-slate-950'
      }`}
    >
      {/* Top Header do Campinho */}
      <div className="relative z-20 px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
            <span>⚽ SIMULADOR DE ATAQUE</span>
            <span className="text-[10px] font-mono text-slate-400 font-normal">
              ({homeTeam.name} atacando →)
            </span>
          </span>
        </div>

        {/* Indicador de Status 85% */}
        <div className="flex items-center gap-2">
          {isAbove85 ? (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-bounce shadow-md">
              <Flame className="w-3 h-3 text-red-700" />
              <span>Caldeirão (&gt;85%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-mono">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Meta: &gt;85%</span>
            </div>
          )}
        </div>
      </div>

      {/* O Gramado Oficial */}
      <div className="relative w-full h-56 sm:h-64 p-3 bg-gradient-to-b from-emerald-950 via-emerald-900 to-emerald-950 overflow-hidden flex items-center justify-center select-none">
        {/* Faixas de grama alternadas */}
        <div className="absolute inset-0 flex opacity-40 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`grass-${i}`}
              className={`flex-1 h-full ${i % 2 === 0 ? 'bg-emerald-800/40' : 'bg-transparent'}`}
            />
          ))}
        </div>

        {/* Efeito de calor / fumaça sobre o campo quando > 85% */}
        <AnimatePresence>
          {isAbove85 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent via-amber-500/30 to-rose-600/40 mix-blend-screen animate-pulse z-10"
            />
          )}
        </AnimatePresence>

        {/* Retângulo do Campo com Linhas Brancas */}
        <div className="relative w-full h-full border-2 border-white/60 rounded-sm flex items-center justify-center">
          {/* Linha de Meio Campo */}
          <div className="absolute inset-y-0 left-1/2 w-0.5 bg-white/60 -translate-x-1/2" />

          {/* Círculo Central */}
          <div className="absolute w-20 h-20 rounded-full border-2 border-white/60 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />
          <div className="absolute w-2 h-2 rounded-full bg-white/80 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2" />

          {/* Área de Defesa Mandante (Esquerda) */}
          <div className="absolute inset-y-10 left-0 w-16 border-r-2 border-y-2 border-white/60 rounded-r-xs bg-white/5" />
          <div className="absolute inset-y-16 left-0 w-7 border-r-2 border-y-2 border-white/60 rounded-r-xs" />
          <div className="absolute left-1 inset-y-20 w-3 border-l-2 border-y-2 border-white/70 bg-white/10" />

          {/* Grande Área Adversária (Direita - O Alvo do Ataque) */}
          <div
            className={`absolute inset-y-10 right-0 w-20 sm:w-24 border-l-2 border-y-2 rounded-l-xs transition-colors duration-300 ${
              isAbove85 ? 'border-amber-400 bg-amber-500/15' : 'border-white/60 bg-white/5'
            }`}
          >
            {/* Meia lua da grande área */}
            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-14 rounded-l-full border-l-2 border-white/60 pointer-events-none" />
          </div>

          {/* Pequena Área Adversária */}
          <div className="absolute inset-y-16 right-0 w-8 border-l-2 border-y-2 border-white/60 rounded-l-xs" />

          {/* Traves / Meta Adversária */}
          <div
            className={`absolute right-0 inset-y-18 w-4 border-2 border-r-0 border-white rounded-l-xs flex items-center justify-center text-[8px] font-bold transition-colors ${
              isAbove85 ? 'bg-amber-400/70 text-slate-950 animate-pulse' : 'bg-white/20 text-white'
            }`}
          >
            META
          </div>

          {/* Jogadores Mandantes (Atacantes - avançam conforme a pressão) */}
          {/* Atacante Central */}
          <motion.div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${Math.min(92, Math.max(20, pressure * 0.85))}%`,
              top: '46%',
            }}
            transition={{ type: 'spring', damping: 14, stiffness: 80 }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[9px] font-black text-white"
              style={{ backgroundColor: homeTeam.primaryColor }}
            >
              9
            </div>
            <span className="text-[8px] font-bold text-white drop-shadow -mt-0.5">ATA</span>
          </motion.div>

          {/* Ponta Direita Mandante */}
          <motion.div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${Math.min(90, Math.max(25, pressure * 0.78))}%`,
              top: '20%',
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 75 }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-black text-white"
              style={{ backgroundColor: homeTeam.primaryColor }}
            >
              7
            </div>
            <span className="text-[8px] font-bold text-white drop-shadow -mt-0.5">PD</span>
          </motion.div>

          {/* Ponta Esquerda Mandante */}
          <motion.div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${Math.min(90, Math.max(25, pressure * 0.78))}%`,
              top: '72%',
            }}
            transition={{ type: 'spring', damping: 15, stiffness: 75 }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full border-2 border-white shadow-md flex items-center justify-center text-[8px] font-black text-white"
              style={{ backgroundColor: homeTeam.primaryColor }}
            >
              11
            </div>
            <span className="text-[8px] font-bold text-white drop-shadow -mt-0.5">PE</span>
          </motion.div>

          {/* Meia Armador Mandante */}
          <motion.div
            className="absolute z-20 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${Math.min(75, Math.max(15, pressure * 0.62))}%`,
              top: '48%',
            }}
            transition={{ type: 'spring', damping: 18, stiffness: 70 }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full border-2 border-amber-300 shadow-md flex items-center justify-center text-[8px] font-black text-white"
              style={{ backgroundColor: homeTeam.secondaryColor }}
            >
              10
            </div>
            <span className="text-[8px] font-bold text-white drop-shadow -mt-0.5">MEI</span>
          </motion.div>

          {/* Defensores do Visitante */}
          <motion.div
            className="absolute z-15 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${isAbove85 ? 80 : 70}%`,
              top: '38%',
            }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full border border-white/80 shadow-md flex items-center justify-center text-[8px] font-bold text-white"
              style={{ backgroundColor: awayTeam.primaryColor }}
            >
              3
            </div>
            <span className="text-[7px] text-slate-300 drop-shadow">ZAG</span>
          </motion.div>

          <motion.div
            className="absolute z-15 flex flex-col items-center pointer-events-none"
            animate={{
              left: `${isAbove85 ? 82 : 72}%`,
              top: '58%',
            }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div
              className="w-4.5 h-4.5 rounded-full border border-white/80 shadow-md flex items-center justify-center text-[8px] font-bold text-white"
              style={{ backgroundColor: awayTeam.primaryColor }}
            >
              4
            </div>
            <span className="text-[7px] text-slate-300 drop-shadow">ZAG</span>
          </motion.div>

          {/* Goleiro Rival */}
          <motion.div
            className="absolute z-15 right-2 top-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
            animate={{
              y: isAbove85 ? [-8, 8, -8] : [-2, 2, -2],
            }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <div className="w-5 h-5 rounded-full border-2 border-amber-300 bg-slate-900 shadow-lg flex items-center justify-center text-[9px] font-black text-amber-300">
              🧤
            </div>
            <span className="text-[7px] font-mono text-amber-200">GOL</span>
          </motion.div>

          {/* A Bola (⚽) com Movimento Dinâmico */}
          <motion.div
            className="absolute z-30 pointer-events-none"
            animate={{
              left: `${ballCoords.x}%`,
              top: `${ballCoords.y}%`,
            }}
            transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          >
            <div className="relative -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
              {shotTrail && (
                <div className="absolute w-8 h-8 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
              )}
              <span className="text-sm sm:text-base drop-shadow-md">⚽</span>
            </div>
          </motion.div>

          {/* Alerta Visual de Lance Perigoso */}
          <AnimatePresence>
            {recentAttackEvent && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-x-4 top-2 z-40 mx-auto max-w-xs px-3 py-1.5 bg-black/85 backdrop-blur-md rounded-full border border-amber-400/70 text-center shadow-xl flex items-center justify-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-[11px] font-black text-amber-300 uppercase tracking-wide truncate">
                  {recentAttackEvent}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar: Estatísticas e Termômetro de Ataque */}
      <div className="relative z-20 px-3.5 py-2.5 bg-slate-950/95 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="text-[11px] font-bold text-slate-300">
            Fase:{' '}
            <span className={isAbove85 ? 'text-amber-400 font-black' : 'text-slate-200'}>
              {getPhaseText()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <span>Chances de perigo:</span>
            <span className="text-amber-400 font-bold">{chancesCreated}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Tempo &gt;85%:</span>
            <span className={`font-bold ${timeInZone85 > 15 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {timeInZone85}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
