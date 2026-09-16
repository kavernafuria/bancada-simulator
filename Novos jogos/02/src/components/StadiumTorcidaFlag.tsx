import React, { useEffect, useRef } from 'react';
import { Point } from '../types';

interface StadiumTorcidaFlagProps {
  activityLevel: number; // 0 (idle) to 1 (high energy)
  fingerPos: Point | null;
  isDragging: boolean;
  isMiss: boolean;
  theme?: 'rubronegro' | 'tricolor' | 'alvinegro' | 'verdao';
  crowdHype: number; // 0 to 100
}

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

interface PaperConfetti {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  width: number;
  height: number;
  color: string;
}

export const StadiumTorcidaFlag: React.FC<StadiumTorcidaFlagProps> = ({
  activityLevel,
  fingerPos,
  isDragging,
  isMiss,
  theme = 'rubronegro',
  crowdHype,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Inertial physics for the flagpole angle
  const poleAngleRef = useRef<number>(0);
  const poleTargetAngleRef = useRef<number>(0);
  const wavePhaseRef = useRef<number>(0);

  // Stadium atmosphere particles
  const smokeParticlesRef = useRef<SmokeParticle[]>([]);
  const confettiParticlesRef = useRef<PaperConfetti[]>([]);

  // Update target pole tilt from finger position
  useEffect(() => {
    if (fingerPos && isDragging && canvasRef.current) {
      const w = canvasRef.current.width;
      // Center is w / 2. Normalize -1 (far left) to +1 (far right)
      const normX = (fingerPos.x - w * 0.5) / (w * 0.45);
      // Tilt pole up to +-26 degrees (+-0.45 rad)
      poleTargetAngleRef.current = Math.max(-0.45, Math.min(0.45, normX * 0.45));
    } else {
      poleTargetAngleRef.current = 0.05 * Math.sin(Date.now() * 0.002);
    }
  }, [fingerPos, isDragging]);

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

    // Color definitions
    const getThemeColors = () => {
      switch (theme) {
        case 'rubronegro':
          return {
            stripe1: '#c81e1e', // Red
            stripe2: '#121216', // Black
            accent: '#f59e0b',  // Gold
            smoke: ['rgba(239, 68, 68, 0.4)', 'rgba(245, 158, 11, 0.35)', 'rgba(30, 20, 20, 0.3)'],
            text: '#ffffff',
          };
        case 'tricolor':
          return {
            stripe1: '#b91c1c', // Red
            stripe2: '#f8fafc', // White
            accent: '#0f172a',  // Black
            smoke: ['rgba(239, 68, 68, 0.4)', 'rgba(255, 255, 255, 0.3)', 'rgba(15, 23, 42, 0.3)'],
            text: '#ffffff',
          };
        case 'verdao':
          return {
            stripe1: '#15803d', // Green
            stripe2: '#ffffff', // White
            accent: '#eab308',  // Gold
            smoke: ['rgba(34, 197, 94, 0.4)', 'rgba(255, 255, 255, 0.3)', 'rgba(234, 179, 8, 0.3)'],
            text: '#ffffff',
          };
        case 'alvinegro':
        default:
          return {
            stripe1: '#09090b', // Deep Black
            stripe2: '#f8fafc', // White
            accent: '#94a3b8',
            smoke: ['rgba(255, 255, 255, 0.35)', 'rgba(40, 40, 45, 0.35)', 'rgba(245, 158, 11, 0.25)'],
            text: '#ffffff',
          };
      }
    };

    // Seed initial confetti
    if (confettiParticlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        confettiParticlesRef.current.push({
          x: Math.random() * 800,
          y: Math.random() * 600,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.8 + Math.random() * 2,
          rotation: Math.random() * Math.PI * 2,
          rotSpeed: (Math.random() - 0.5) * 0.1,
          width: 8 + Math.random() * 6,
          height: 4 + Math.random() * 4,
          color: ['#ef4444', '#f59e0b', '#ffffff', '#22c55e'][Math.floor(Math.random() * 4)],
        });
      }
    }

    let frameCount = 0;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) {
        animId = requestAnimationFrame(render);
        return;
      }

      frameCount++;
      const colors = getThemeColors();

      // Smooth damp pole angle towards target
      poleAngleRef.current += (poleTargetAngleRef.current - poleAngleRef.current) * 0.12;
      const poleAngle = poleAngleRef.current;

      // Advance cloth wave phase faster when waving actively
      const waveSpeed = 0.05 + activityLevel * 0.14;
      wavePhaseRef.current += waveSpeed;
      const phase = wavePhaseRef.current;

      // Clear dark night stadium sky
      ctx.fillStyle = '#060609';
      ctx.fillRect(0, 0, w, h);

      // 1. Stadium Floodlights & Night Atmosphere
      ctx.save();
      // Light cones from top-left and top-right towers
      const beamL = ctx.createRadialGradient(w * 0.08, h * 0.05, 5, w * 0.45, h * 0.6, w * 0.65);
      beamL.addColorStop(0, 'rgba(255, 255, 230, 0.28)');
      beamL.addColorStop(0.5, 'rgba(255, 255, 240, 0.08)');
      beamL.addColorStop(1, 'transparent');
      ctx.fillStyle = beamL;
      ctx.fillRect(0, 0, w, h);

      const beamR = ctx.createRadialGradient(w * 0.92, h * 0.05, 5, w * 0.55, h * 0.6, w * 0.65);
      beamR.addColorStop(0, 'rgba(255, 240, 200, 0.24)');
      beamR.addColorStop(0.5, 'rgba(255, 235, 180, 0.07)');
      beamR.addColorStop(1, 'transparent');
      ctx.fillStyle = beamR;
      ctx.fillRect(0, 0, w, h);
      ctx.restore();

      // 2. Bleachers (Arquibancada) with Packed Torcedores
      const bleacherY = h * 0.72;
      ctx.save();

      // Bleacher concrete tiers
      const tiers = 5;
      for (let t = 0; t < tiers; t++) {
        const ty = bleacherY + t * (h * 0.06);
        ctx.fillStyle = t % 2 === 0 ? '#13131a' : '#0c0c12';
        ctx.fillRect(0, ty, w, h * 0.06);

        // Subtle step highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.fillRect(0, ty, w, 2);
      }

      // Animated Fan Silhouettes jumping on the tiers
      const fanBpm = 0.008 + (crowdHype / 100) * 0.012;
      const fanBounce = Math.sin(Date.now() * fanBpm);
      const fanRows = 3;

      for (let r = 0; r < fanRows; r++) {
        const rowY = bleacherY + r * (h * 0.075);
        const fanCount = Math.floor(w / 28);

        for (let i = 0; i < fanCount; i++) {
          const fx = i * 28 + (r % 2) * 14 + ((i * 17) % 7);
          // Individual fan offset
          const individualJump = Math.max(0, Math.sin(Date.now() * fanBpm + i * 0.6 + r * 1.2)) * (6 + (crowdHype / 100) * 8);
          const fy = rowY - individualJump;

          // Fan body & raised arms
          ctx.fillStyle = r === 0 ? '#1b1b26' : r === 1 ? '#151520' : '#0f0f18';

          // Head
          ctx.beginPath();
          ctx.arc(fx, fy - 18, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Torso
          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(fx - 5, fy - 13, 10, 15, 2);
          } else {
            ctx.rect(fx - 5, fy - 13, 10, 15);
          }
          ctx.fill();

          // Raised arms waving in celebration
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const armWave = Math.sin(Date.now() * 0.01 + i) * 5;
          ctx.moveTo(fx - 5, fy - 8);
          ctx.lineTo(fx - 10, fy - 22 + armWave);
          ctx.moveTo(fx + 5, fy - 8);
          ctx.lineTo(fx + 10, fy - 22 - armWave);
          ctx.stroke();

          // Occasionally a fan holds a small waving flag or flare in the crowd
          if (i % 7 === 0 && r === 1) {
            // Little flare light
            const flareX = fx + 10;
            const flareY = fy - 24;
            ctx.beginPath();
            ctx.arc(flareX, flareY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#ffedd5';
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 10;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Stadium Fence / Alambrado Barrier at the front
      const fenceY = h * 0.88;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      // Horizontal fence rails
      ctx.beginPath();
      ctx.moveTo(0, fenceY);
      ctx.lineTo(w, fenceY);
      ctx.moveTo(0, fenceY + 18);
      ctx.lineTo(w, fenceY + 18);
      ctx.stroke();

      // Fence cross mesh
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      for (let x = 0; x < w; x += 16) {
        ctx.beginPath();
        ctx.moveTo(x, fenceY);
        ctx.lineTo(x + 12, h);
        ctx.moveTo(x + 12, fenceY);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      ctx.restore();

      // 3. Smoke Bombs (Sinalizadores de Fumaça) in the crowd
      // Emit colored smoke from sides of bleachers
      if (frameCount % 4 === 0) {
        const leftX = w * 0.15 + (Math.random() - 0.5) * 40;
        const rightX = w * 0.85 + (Math.random() - 0.5) * 40;
        const smokeSources = [leftX, rightX];

        smokeSources.forEach((sx) => {
          smokeParticlesRef.current.push({
            x: sx,
            y: bleacherY + 15,
            vx: (Math.random() - 0.5) * 1.6 + (sx > w * 0.5 ? -0.4 : 0.4),
            vy: -1.2 - Math.random() * 2,
            radius: 12 + Math.random() * 15,
            alpha: 0.35,
            color: colors.smoke[Math.floor(Math.random() * colors.smoke.length)],
            life: 0,
            maxLife: 60 + Math.random() * 40,
          });
        });
      }

      // Draw and update smoke
      const smokes = smokeParticlesRef.current;
      for (let i = smokes.length - 1; i >= 0; i--) {
        const s = smokes[i];
        s.life++;
        s.x += s.vx;
        s.y += s.vy;
        s.radius += 0.5;
        s.alpha *= 0.975;

        if (s.life >= s.maxLife || s.alpha <= 0.01) {
          smokes.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, s.alpha);
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
        ctx.restore();
      }

      // 4. THE GIANT WAVING FLAG & POLE (O BANDEIRÃO TREMULANDO)
      // Anchor of pole: bottom center of the fence
      const anchorX = w * 0.5;
      const anchorY = h * 0.92;
      const poleLength = h * 0.86;

      // Pole top position based on pole tilt angle
      const poleTopX = anchorX + Math.sin(poleAngle) * poleLength;
      const poleTopY = anchorY - Math.cos(poleAngle) * poleLength;

      // Flag dimensions
      const flagWidth = Math.min(w * 0.68, 520);
      const flagHeight = Math.min(h * 0.54, 380);

      // Cloth Simulation Mesh: 24 columns x 14 rows
      const cols = 24;
      const rows = 14;

      // Flag direction points roughly rightwards or follows pole swing
      const rightVectorX = Math.cos(poleAngle);
      const rightVectorY = Math.sin(poleAngle);
      const downVectorX = -Math.sin(poleAngle);
      const downVectorY = Math.cos(poleAngle);

      // Compute mesh vertex positions with physical cloth wave
      // Amplitude increases with activity level and finger movement
      const waveAmplitude = 18 + activityLevel * 32;
      const rippleFrequency = 5.2;

      const getMeshPoint = (c: number, r: number) => {
        const u = c / cols; // 0 (at pole) to 1 (free trailing tip)
        const v = r / rows; // 0 (top of flag) to 1 (bottom of flag)

        // Wave travels along u (away from pole)
        const primaryWave = Math.sin(u * rippleFrequency - phase * 2.8 + v * 1.5);
        const secondaryWave = Math.cos(u * 9.0 - phase * 4.2) * 0.4;
        const totalZ = (primaryWave + secondaryWave) * waveAmplitude * u; // Zero displacement at pole (u=0)

        // Vertical sagging and billow
        const sag = Math.sin(u * Math.PI) * (14 + activityLevel * 18);
        const flutter = Math.sin(phase * 3.5 + u * 8) * (6 * u);

        // Base 2D position in flag coordinate frame
        const baseX = poleTopX + u * flagWidth * rightVectorX + v * flagHeight * downVectorX;
        const baseY = poleTopY + u * flagWidth * rightVectorY + v * flagHeight * downVectorY;

        // Apply normal displacement for 3D illusion
        const dispX = -downVectorX * totalZ * 0.6;
        const dispY = sag + flutter + totalZ * 0.8;

        return {
          x: baseX + dispX,
          y: baseY + dispY,
          z: totalZ,
          u,
          v,
        };
      };

      // Draw the Flag Pole first (behind the cloth or partly through)
      ctx.save();
      // Pole shadow on bleachers
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(anchorX + Math.sin(poleAngle * 1.2) * poleLength * 0.9, anchorY + 15);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.lineWidth = 14;
      ctx.stroke();

      // The Sturdy Bamboo / Fiber Flagpole
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(poleTopX, poleTopY);
      ctx.strokeStyle = '#d4a373'; // Warm bamboo wood
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.stroke();

      // Pole dark ridges/bands
      ctx.strokeStyle = '#331a06';
      ctx.lineWidth = 8;
      ctx.setLineDash([4, 18]);
      ctx.beginPath();
      ctx.moveTo(anchorX, anchorY);
      ctx.lineTo(poleTopX, poleTopY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Golden Finial / Tip on top of flagpole
      ctx.beginPath();
      ctx.arc(poleTopX, poleTopY, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Fluttering ribbons at top of pole
      const ribbonWave1 = Math.sin(phase * 3) * 14;
      const ribbonWave2 = Math.cos(phase * 3.5) * 16;
      ctx.strokeStyle = colors.stripe1;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(poleTopX, poleTopY);
      ctx.quadraticCurveTo(poleTopX + 20, poleTopY + 10 + ribbonWave1, poleTopX + 35, poleTopY + 35 + ribbonWave1);
      ctx.moveTo(poleTopX, poleTopY);
      ctx.quadraticCurveTo(poleTopX - 15, poleTopY + 12 + ribbonWave2, poleTopX - 25, poleTopY + 38 + ribbonWave2);
      ctx.stroke();
      ctx.restore();

      // Render the Cloth Quads with Authentic Stripes and 3D Silk Shading
      for (let r = 0; r < rows; r++) {
        // Striped pattern based on row index
        const isStripe1 = Math.floor(r / (rows / 4)) % 2 === 0;
        const stripeColor = isStripe1 ? colors.stripe1 : colors.stripe2;

        for (let c = 0; c < cols; c++) {
          const p1 = getMeshPoint(c, r);
          const p2 = getMeshPoint(c + 1, r);
          const p3 = getMeshPoint(c + 1, r + 1);
          const p4 = getMeshPoint(c, r + 1);

          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.lineTo(p3.x, p3.y);
          ctx.lineTo(p4.x, p4.y);
          ctx.closePath();

          // Base team color
          ctx.fillStyle = stripeColor;
          ctx.fill();

          // Silk 3D Light & Shadow calculation
          // Gradient of Z creates realistic specular folds
          const slope = (p2.z - p1.z) / waveAmplitude;
          if (slope > 0.15) {
            // Highlight / Sheen crest
            const highlight = Math.min(0.42, slope * 0.5);
            ctx.fillStyle = `rgba(255, 255, 255, ${highlight})`;
            ctx.fill();
          } else if (slope < -0.15) {
            // Shadow trough
            const shadow = Math.min(0.55, -slope * 0.65);
            ctx.fillStyle = `rgba(0, 0, 0, ${shadow})`;
            ctx.fill();
          }

          // Subtle mesh crease for fabric texture
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // Render Torcida Emblem & Badge centered on the waving flag
      // We sample points around the center of the cloth (u: 0.35 to 0.65, v: 0.3 to 0.7)
      const centerP = getMeshPoint(Math.floor(cols * 0.45), Math.floor(rows * 0.5));
      ctx.save();
      ctx.translate(centerP.x, centerP.y);
      ctx.rotate(poleAngle * 0.4 + (centerP.z / waveAmplitude) * 0.18);

      // Outer Golden Shield Badge
      ctx.beginPath();
      ctx.arc(0, 0, flagHeight * 0.22, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fill();
      ctx.strokeStyle = colors.accent;
      ctx.lineWidth = 4;
      ctx.stroke();

      // Emblem Star
      ctx.fillStyle = colors.accent;
      ctx.font = `bold ${Math.round(flagHeight * 0.14)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, -4);

      // Torcida Ribbon Banner Text
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 ${Math.round(flagHeight * 0.055)}px sans-serif`;
      ctx.fillText('BANCADA 1980', 0, flagHeight * 0.12);

      ctx.restore();

      // 5. Confetti and Paper Ribbons (Papel picado de torcida)
      const confetti = confettiParticlesRef.current;
      for (let i = 0; i < confetti.length; i++) {
        const cp = confetti[i];
        cp.x += cp.vx + Math.sin(phase + i) * 0.8;
        cp.y += cp.vy + activityLevel * 0.8;
        cp.rotation += cp.rotSpeed;

        if (cp.y > h + 20) {
          cp.y = -20;
          cp.x = Math.random() * w;
        }

        ctx.save();
        ctx.translate(cp.x, cp.y);
        ctx.rotate(cp.rotation);
        ctx.fillStyle = cp.color;
        ctx.globalAlpha = 0.65;
        ctx.fillRect(-cp.width / 2, -cp.height / 2, cp.width, cp.height);
        ctx.restore();
      }

      // 6. Capomafia / Torcedor Silhouettes holding the mastro at the bottom
      ctx.save();
      ctx.fillStyle = '#0a0a12';
      // Torcedor body
      ctx.beginPath();
      ctx.arc(anchorX - 12, anchorY + 12, 14, 0, Math.PI * 2); // Head
      ctx.fill();

      // Strong muscular arms gripping the base of the flagpole
      ctx.strokeStyle = '#0e0e18';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(anchorX - 18, anchorY + 28);
      ctx.lineTo(anchorX - 4, anchorY + 8);
      ctx.moveTo(anchorX + 16, anchorY + 30);
      ctx.lineTo(anchorX + 4, anchorY + 8);
      ctx.stroke();

      ctx.restore();

      // Red flare lighting on borders if player is active
      if (isDragging && !isMiss) {
        ctx.save();
        ctx.globalAlpha = 0.15;
        const flareGlow = ctx.createRadialGradient(anchorX, anchorY, 10, anchorX, anchorY, w * 0.6);
        flareGlow.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        flareGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = flareGlow;
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [activityLevel, theme, crowdHype, isDragging, isMiss]);

  return (
    <canvas
      ref={canvasRef}
      id="stadium-torcida-canvas"
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
};
