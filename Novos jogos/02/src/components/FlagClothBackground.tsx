import React, { useEffect, useRef } from 'react';

interface FlagClothBackgroundProps {
  activityLevel: number; // 0 (idle) to 1 (waving vigorously)
  theme?: 'tricolor' | 'rubronegro' | 'alvinegro' | 'verdao';
}

export const FlagClothBackground: React.FC<FlagClothBackgroundProps> = ({
  activityLevel,
  theme = 'rubronegro',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let time = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Color palette based on stadium theme
    const getColors = () => {
      switch (theme) {
        case 'rubronegro':
          return {
            stripe1: '#b91c1c', // deep stadium red
            stripe2: '#171717', // black
            accent: '#f59e0b',  // gold
          };
        case 'tricolor':
          return {
            stripe1: '#b91c1c', // red
            stripe2: '#ffffff', // white
            accent: '#111827',  // dark
          };
        case 'verdao':
          return {
            stripe1: '#15803d', // green
            stripe2: '#ffffff', // white
            accent: '#047857',
          };
        case 'alvinegro':
        default:
          return {
            stripe1: '#09090b', // dark black
            stripe2: '#ffffff', // white
            accent: '#71717a',
          };
      }
    };

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;

      time += 0.02 + activityLevel * 0.05;
      const colors = getColors();

      // Clear dark stadium background
      ctx.fillStyle = '#0a0a0f';
      ctx.fillRect(0, 0, w, h);

      // Render undulating cloth flag in perspective
      const cols = 26;
      const rows = 14;
      const stepX = w / cols;
      const stepY = h / rows;

      const flagWarp = (x: number, y: number) => {
        const normX = x / w;
        const normY = y / h;
        // Flag ripples increase with player motion
        const wave1 = Math.sin(normX * 6 - time * 3 + normY * 2) * (12 + activityLevel * 22);
        const wave2 = Math.cos(normX * 10 - time * 4.5) * (6 + activityLevel * 14);
        const wave3 = Math.sin(normY * 4 + time * 2) * (4 + activityLevel * 8);

        // Perspective sagging
        const sag = Math.sin(normX * Math.PI) * (15 + activityLevel * 20);

        return {
          px: x + wave2 * 0.4,
          py: y + wave1 + wave3 + sag,
          lighting: Math.sin(normX * 6 - time * 3) * 0.25,
        };
      };

      // Draw horizontal flag stripes with cloth mesh deformation
      for (let r = 0; r < rows; r++) {
        const isStripe1 = Math.floor(r / (rows / 4)) % 2 === 0;
        const baseColor = isStripe1 ? colors.stripe1 : colors.stripe2;

        for (let c = 0; c < cols; c++) {
          const x1 = c * stepX;
          const y1 = r * stepY;
          const x2 = (c + 1) * stepX;
          const y2 = (r + 1) * stepY;

          const p1 = flagWarp(x1, y1);
          const p2 = flagWarp(x2, y1);
          const p3 = flagWarp(x2, y2);
          const p4 = flagWarp(x1, y2);

          ctx.beginPath();
          ctx.moveTo(p1.px, p1.py);
          ctx.lineTo(p2.px, p2.py);
          ctx.lineTo(p3.px, p3.py);
          ctx.lineTo(p4.px, p4.py);
          ctx.closePath();

          // Fabric lighting / shadow effect
          ctx.fillStyle = baseColor;
          ctx.globalAlpha = 0.32 + activityLevel * 0.15;
          ctx.fill();

          // Shading overlay
          const light = p1.lighting;
          if (light > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(0.2, light * 0.35)})`;
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(0, 0, 0, ${Math.min(0.4, -light * 0.5)})`;
            ctx.fill();
          }
        }
      }

      // Stadium floodlights beam effect
      ctx.globalAlpha = 0.12;
      const gradLeft = ctx.createRadialGradient(0, 0, 10, w * 0.2, h * 0.2, w * 0.7);
      gradLeft.addColorStop(0, 'rgba(255, 255, 240, 0.45)');
      gradLeft.addColorStop(1, 'transparent');
      ctx.fillStyle = gradLeft;
      ctx.fillRect(0, 0, w, h);

      const gradRight = ctx.createRadialGradient(w, 0, 10, w * 0.8, h * 0.2, w * 0.7);
      gradRight.addColorStop(0, 'rgba(255, 230, 180, 0.35)');
      gradRight.addColorStop(1, 'transparent');
      ctx.fillStyle = gradRight;
      ctx.fillRect(0, 0, w, h);

      // Vignette border
      ctx.globalAlpha = 0.75;
      const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.8);
      vignette.addColorStop(0, 'transparent');
      vignette.addColorStop(1, 'rgba(5, 5, 8, 0.92)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, w, h);

      ctx.globalAlpha = 1.0;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activityLevel, theme]);

  return (
    <canvas
      ref={canvasRef}
      id="flag-cloth-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
