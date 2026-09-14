import React, { useEffect, useRef } from 'react';
import { Point } from './types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'spark' | 'smoke' | 'miss_burst' | 'perfect_burst';
}

interface FlareParticlesCanvasProps {
  currentPos: Point | null;
  isDragging: boolean;
  isMiss: boolean;
  isPerfect: boolean;
}

export const FlareParticlesCanvas: React.FC<FlareParticlesCanvasProps> = ({
  currentPos,
  isDragging,
  isMiss,
  isPerfect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const missTriggeredRef = useRef<boolean>(false);
  const perfectTriggeredRef = useRef<boolean>(false);

  useEffect(() => {
    if (isMiss && !missTriggeredRef.current && currentPos) {
      missTriggeredRef.current = true;
      for (let i = 0; i < 35; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 2 + Math.random() * 6;
        particlesRef.current.push({
          x: currentPos.x,
          y: currentPos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1,
          life: 0,
          maxLife: 25 + Math.random() * 20,
          size: 3 + Math.random() * 4,
          color: Math.random() > 0.4 ? '#ef4444' : '#f97316',
          type: 'miss_burst',
        });
      }
    } else if (!isMiss) {
      missTriggeredRef.current = false;
    }
  }, [isMiss, currentPos]);

  useEffect(() => {
    if (isPerfect && !perfectTriggeredRef.current && currentPos) {
      perfectTriggeredRef.current = true;
      for (let i = 0; i < 60; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 8;
        particlesRef.current.push({
          x: currentPos.x,
          y: currentPos.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
          size: 4 + Math.random() * 5,
          color: ['#fbbf24', '#f59e0b', '#10b981', '#ffffff'][Math.floor(Math.random() * 4)],
          type: 'perfect_burst',
        });
      }
    } else if (!isPerfect) {
      perfectTriggeredRef.current = false;
    }
  }, [isPerfect, currentPos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      if (currentPos && isDragging) {
        const px = currentPos.x;
        const py = currentPos.y;

        const sparkCount = isMiss ? 1 : 4;
        for (let i = 0; i < sparkCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 4;
          particlesRef.current.push({
            x: px + (Math.random() - 0.5) * 6,
            y: py + (Math.random() - 0.5) * 6,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 1.2,
            life: 0,
            maxLife: 20 + Math.random() * 18,
            size: 2 + Math.random() * 3,
            color: isMiss
              ? '#dc2626'
              : Math.random() > 0.3
              ? '#fbbf24'
              : '#f97316',
            type: 'spark',
          });
        }

        if (Math.random() > 0.4) {
          particlesRef.current.push({
            x: px + (Math.random() - 0.5) * 10,
            y: py,
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.2 - Math.random() * 1.5,
            life: 0,
            maxLife: 35 + Math.random() * 25,
            size: 8 + Math.random() * 10,
            color: isMiss ? 'rgba(50, 20, 20, 0.4)' : 'rgba(240, 80, 50, 0.35)',
            type: 'smoke',
          });
        }
      }

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.type === 'spark') {
          p.vy += 0.08;
          p.vx *= 0.96;
        } else if (p.type === 'smoke') {
          p.size += 0.4;
          p.vx *= 0.98;
          p.vy *= 0.97;
        } else {
          p.vy += 0.12;
          p.vx *= 0.95;
        }

        const alpha = 1 - p.life / p.maxLife;

        ctx.save();
        ctx.globalAlpha = Math.max(0, alpha);

        if (p.type === 'smoke') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }
        ctx.restore();
      }

      if (currentPos && isDragging) {
        const px = currentPos.x;
        const py = currentPos.y;

        ctx.save();
        const outerGrad = ctx.createRadialGradient(px, py, 2, px, py, isMiss ? 35 : 45);
        if (isMiss) {
          outerGrad.addColorStop(0, 'rgba(255, 100, 100, 0.8)');
          outerGrad.addColorStop(0.3, 'rgba(220, 38, 38, 0.5)');
          outerGrad.addColorStop(1, 'transparent');
        } else {
          outerGrad.addColorStop(0, 'rgba(255, 255, 220, 0.95)');
          outerGrad.addColorStop(0.25, 'rgba(251, 191, 36, 0.7)');
          outerGrad.addColorStop(0.6, 'rgba(239, 68, 68, 0.35)');
          outerGrad.addColorStop(1, 'transparent');
        }
        ctx.fillStyle = outerGrad;
        ctx.beginPath();
        ctx.arc(px, py, isMiss ? 35 : 45, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(px, py, isMiss ? 6 : 8, 0, Math.PI * 2);
        ctx.fillStyle = isMiss ? '#fca5a5' : '#ffffff';
        ctx.shadowColor = isMiss ? '#ef4444' : '#fbbf24';
        ctx.shadowBlur = 15;
        ctx.fill();

        const rayLen = isMiss ? 14 : 22;
        ctx.strokeStyle = isMiss ? 'rgba(254, 202, 202, 0.8)' : 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - rayLen, py);
        ctx.lineTo(px + rayLen, py);
        ctx.moveTo(px, py - rayLen);
        ctx.lineTo(px, py + rayLen);
        ctx.stroke();

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [currentPos, isDragging, isMiss]);

  return (
    <canvas
      ref={canvasRef}
      id="flare-particles-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none z-30"
    />
  );
};
