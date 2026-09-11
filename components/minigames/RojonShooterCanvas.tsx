"use client";

import React, { useEffect, useRef, useState } from "react";
import { soundManager } from "@/lib/runner_audio";
import { RunnerTeam } from "@/lib/runner_types";

export interface WeaponUpgrade {
  level: number;
  name: string;
  fireRate: number; // Interval in ms
  projectileCount: number; // Rockets per volley
  damage: number;
  color: string;
  icon: string;
}

export const WEAPON_LEVELS: WeaponUpgrade[] = [
  { level: 1, name: "Rojão Padrão", fireRate: 350, projectileCount: 1, damage: 5, color: "#f59e0b", icon: "🚀" },
  { level: 2, name: "Rojão 12 Tiros 🎆", fireRate: 260, projectileCount: 3, damage: 8, color: "#38bdf8", icon: "🎆" },
  { level: 3, name: "Rojão Trovão ⚡", fireRate: 180, projectileCount: 4, damage: 12, color: "#facc15", icon: "⚡" },
  { level: 4, name: "Morteiro de Torcida 💣", fireRate: 120, projectileCount: 5, damage: 18, color: "#ef4444", icon: "💣" },
];

export interface RojonShooterProps {
  playerTeam: RunnerTeam;
  rivalTeam: RunnerTeam;
  opponentTier: "S" | "A" | "B";
  onFinish: (result: {
    gameType: "whack" | "rojon" | "rhythm" | "dodge" | "punch" | "memory" | "runner_3d";
    modifier: number;
    rank: "S" | "B" | "C" | "F";
    description: string;
  }) => void;
}

interface GateBlock {
  id: string;
  x: number;
  z: number;
  type: "member" | "weapon";
  val: number;
  label: string;
  passed: boolean;
  hp: number;
  maxHp: number;
}

interface RivalBlock {
  id: string;
  x: number;
  z: number;
  count: number;
  maxCount: number;
  defeated: boolean;
}

interface RocketProjectile {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  damage: number;
  color: string;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

interface KnockoutFan {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rotation: number;
  vRot: number;
  life: number;
  maxLife: number;
  facingDown: boolean;
}

export const RojonShooterCanvas: React.FC<RojonShooterProps> = ({
  playerTeam,
  rivalTeam,
  opponentTier,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isTutorial, setIsTutorial] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
  const [crowdCount, setCrowdCount] = useState(30);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [score, setScore] = useState(0);

  const stateRef = useRef({
    playerX: 0,
    targetX: 0,
    crowdCount: 30,
    score: 0,
    weaponLevel: 1,
    lastShotTime: 0,
    projectiles: [] as RocketProjectile[],
    gates: [] as GateBlock[],
    rivals: [] as RivalBlock[],
    particles: [] as Particle[],
    knockoutFans: [] as KnockoutFan[],
    trackZ: 0,
    trackLength: 3200,
    isDragging: false,
    dragStartX: 0,
    dragStartPlayerX: 0,
    gameEnded: false,
  });

  // Project 3D coordinates to 2D screen
  const project = (
    worldX: number,
    worldY: number,
    worldZ: number,
    canvasWidth: number,
    canvasHeight: number,
    camZ: number
  ) => {
    const relZ = worldZ - camZ;
    if (relZ <= 10) return null;

    const focalLength = 340;
    const scale = focalLength / relZ;
    const horizonY = canvasHeight * 0.22;
    const screenX = canvasWidth / 2 + worldX * (canvasWidth * 0.44) * scale;
    const screenY = horizonY + (140 - worldY) * scale * 0.95;

    return { x: screenX, y: screenY, scale, depth: relZ };
  };

  // Render Fan Avatar with full diversity
  const renderFanAvatar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    team: RunnerTeam,
    runnerIdx = 0,
    facingDown = false
  ) => {
    const s = scale;
    if (s <= 0.03) return;

    const runCycle = performance.now() * 0.012 + runnerIdx * 1.35;
    const stride = Math.sin(runCycle);

    const skinTones = ["#3c2415", "#5c3a21", "#8d5524", "#c68642", "#e0ac69", "#f1c27d"];
    const skinColor = skinTones[runnerIdx % skinTones.length];
    const hairColors = ["#1e1b18", "#382216", "#18181b", "#451a03", "#0f172a"];
    const hairColor = hairColors[runnerIdx % hairColors.length];

    const bodyType = runnerIdx % 4;
    let bodyW = 13.5 * s;
    let bodyH = 14 * s;
    let headR = 5.8 * s;
    let armThickness = 3.2 * s;

    if (bodyType === 0) {
      bodyW = 16.5 * s;
      bodyH = 14.5 * s;
      armThickness = 4.6 * s;
    } else if (bodyType === 1) {
      bodyW = 17.5 * s;
      bodyH = 15.0 * s;
      armThickness = 4.2 * s;
    } else if (bodyType === 3) {
      bodyW = 11.5 * s;
      bodyH = 15.5 * s;
      armThickness = 2.8 * s;
    }

    const groundY = y;
    const hipY = y - 13 * s;
    const torsoY = hipY - bodyH;
    const headY = torsoY - headR - 2 * s;

    // Contact shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.42)";
    ctx.beginPath();
    ctx.ellipse(x, groundY + 1 * s, Math.max(6 * s, bodyW * 0.7 * s), 4.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = armThickness;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.25, hipY);
    ctx.lineTo(x - bodyW * 0.25 + stride * 3 * s, groundY);
    ctx.moveTo(x + bodyW * 0.25, hipY);
    ctx.lineTo(x + bodyW * 0.25 - stride * 3 * s, groundY);
    ctx.stroke();

    // Torso (Regata)
    ctx.fillStyle = team.primaryColor;
    ctx.beginPath();
    ctx.roundRect(x - bodyW / 2, torsoY, bodyW, bodyH, 3 * s);
    ctx.fill();

    // Accent Stripe
    ctx.fillStyle = team.secondaryColor;
    ctx.fillRect(x - bodyW * 0.14, torsoY, bodyW * 0.28, bodyH);

    // Bare Arms
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = armThickness;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.48, torsoY + 3 * s);
    ctx.lineTo(x - bodyW * 0.6, torsoY + 12 * s);
    ctx.moveTo(x + bodyW * 0.48, torsoY + 3 * s);
    ctx.lineTo(x + bodyW * 0.6, torsoY + 5 * s); // Holding rocket
    ctx.stroke();

    // Tattoo on arm for fortões
    if (bodyType === 0) {
      ctx.strokeStyle = "rgba(30, 41, 59, 0.65)";
      ctx.lineWidth = armThickness * 0.45;
      ctx.beginPath();
      ctx.moveTo(x - bodyW * 0.48, torsoY + 4 * s);
      ctx.lineTo(x - bodyW * 0.55, torsoY + 9 * s);
      ctx.stroke();
    }

    // Rocket in hand
    ctx.fillStyle = "#d97706";
    ctx.fillRect(x + bodyW * 0.55, torsoY - 8 * s, 2 * s, 14 * s);
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(x + bodyW * 0.5, torsoY - 14 * s, 4 * s, 6 * s);

    // Head & Hair
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    const hairStyle = runnerIdx % 5;
    if (hairStyle === 1) {
      ctx.fillStyle = "#1e1b18";
      ctx.beginPath();
      ctx.arc(x, headY - 1.5 * s, headR * 1.25, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === 2) {
      ctx.fillStyle = team.secondaryColor || "#ef4444";
      ctx.beginPath();
      ctx.arc(x, headY - 1.2 * s, headR * 1.05, Math.PI * 0.8, Math.PI * 2.2);
      ctx.fill();
    } else {
      ctx.fillStyle = hairColor;
      ctx.beginPath();
      ctx.arc(x, headY - 1.2 * s, headR * 0.98, Math.PI * 0.9, Math.PI * 2.1);
      ctx.closePath();
      ctx.fill();
    }

    if (facingDown) {
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(x - 2.5 * s, headY - 0.5 * s, 1.5 * s, 1.4 * s);
      ctx.fillRect(x + 1.0 * s, headY - 0.5 * s, 1.5 * s, 1.4 * s);
      ctx.fillStyle = "#7f1d1d";
      ctx.beginPath();
      ctx.ellipse(x, headY + 2.4 * s, 2 * s, 1.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Initialize track objects
  const initTrack = () => {
    const s = stateRef.current;
    s.gates = [];
    s.rivals = [];
    s.projectiles = [];
    s.particles = [];
    s.knockoutFans = [];
    s.trackZ = 0;
    s.crowdCount = 30;
    s.weaponLevel = 1;
    s.gameEnded = false;

    // Generate tracks with left member blocks and right weapon upgrade blocks
    for (let z = 350; z < s.trackLength - 200; z += 320) {
      // Left Member Block (+1, +3, +5, +10)
      const memVal = Math.random() > 0.5 ? 5 : 3;
      s.gates.push({
        id: `mem_${z}`,
        x: -0.72,
        z,
        type: "member",
        val: memVal,
        label: `+${memVal} BONDE`,
        passed: false,
        hp: memVal * 10,
        maxHp: memVal * 10,
      });

      // Right Weapon Upgrade Block
      const wLvl = Math.min(4, Math.floor(z / 700) + 2);
      const wInfo = WEAPON_LEVELS[wLvl - 1];
      s.gates.push({
        id: `weap_${z}`,
        x: 0.72,
        z,
        type: "weapon",
        val: wLvl,
        label: wInfo.name,
        passed: false,
        hp: 40,
        maxHp: 40,
      });

      // Rival Red Mob advancing in center/sides
      if (z % 640 === 0) {
        const rCount = 20 + Math.floor(Math.random() * 25);
        s.rivals.push({
          id: `riv_${z}`,
          x: (Math.random() - 0.5) * 0.9,
          z: z + 150,
          count: rCount,
          maxCount: rCount,
          defeated: false,
        });
      }
    }
  };

  useEffect(() => {
    initTrack();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (isTutorial) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          evaluateGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTutorial]);

  const evaluateGameEnd = () => {
    const s = stateRef.current;
    if (s.gameEnded) return;
    s.gameEnded = true;

    const finalScore = s.crowdCount * 10 + s.weaponLevel * 50;
    if (finalScore >= 450) {
      onFinish({
        gameType: "rojon",
        modifier: 0.25,
        rank: "S",
        description: "Bateria de rojões atropelou a pista com rajadas de fogos (+25% PEC)!",
      });
    } else if (finalScore >= 280) {
      onFinish({
        gameType: "rojon",
        modifier: 0.10,
        rank: "B",
        description: "Rajadas de rojão mantiveram o domínio da avenida (+10% PEC).",
      });
    } else if (finalScore >= 150) {
      onFinish({
        gameType: "rojon",
        modifier: 0.0,
        rank: "C",
        description: "Fogo de rojão constante sem grandes avanços (0% PEC).",
      });
    } else {
      onFinish({
        gameType: "rojon",
        modifier: -0.2,
        rank: "F",
        description: "Bateria de rojões recuou sob pressão rival (-20% PEC).",
      });
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastTime = performance.now();

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.save();
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, w, h);

      if (!isTutorial && !s.gameEnded) {
        // Track moves forward
        s.trackZ += 3.8 * (dt * 60);

        // Smooth player lateral movement
        s.playerX += (s.targetX - s.playerX) * 0.25;

        // Auto-fire fireworks from player bonde
        const currentWeapon = WEAPON_LEVELS[s.weaponLevel - 1];
        if (now - s.lastShotTime >= currentWeapon.fireRate) {
          s.lastShotTime = now;
          soundManager.playFireworkLaunch();

          for (let p = 0; p < currentWeapon.projectileCount; p++) {
            const spreadX = (p - (currentWeapon.projectileCount - 1) / 2) * 0.18;
            s.projectiles.push({
              id: `proj_${now}_${p}`,
              x: s.playerX + spreadX,
              y: 16,
              z: s.trackZ + 35,
              vx: spreadX * 0.05,
              vy: 0.05,
              vz: 16,
              damage: currentWeapon.damage,
              color: currentWeapon.color,
            });
          }
        }

        // Update Projectiles & Check Collisions
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const proj = s.projectiles[i];
          proj.z += proj.vz * (dt * 60);
          proj.x += proj.vx * (dt * 60);

          // Sparks trailing rocket
          if (Math.random() < 0.6) {
            s.particles.push({
              x: proj.x,
              y: proj.y,
              z: proj.z - 6,
              vx: (Math.random() - 0.5) * 0.04,
              vy: (Math.random() - 0.5) * 0.04,
              vz: -2,
              color: proj.color,
              size: 3.5,
              alpha: 0.9,
              life: 0,
              maxLife: 0.35,
            });
          }

          // Check hit on Gate Blocks (Left Member Blocks & Right Weapon Upgrades)
          const hitGate = s.gates.find(
            (g) => !g.passed && Math.abs(g.z - proj.z) < 28 && Math.abs(g.x - proj.x) < 0.55
          );
          if (hitGate) {
            proj.z = s.trackLength + 999; // Remove projectile
            hitGate.hp -= proj.damage;

            // Spark explosion on block
            for (let k = 0; k < 6; k++) {
              s.particles.push({
                x: hitGate.x + (Math.random() - 0.5) * 0.3,
                y: 12,
                z: hitGate.z + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
                vz: 2,
                color: hitGate.type === "member" ? "#38bdf8" : "#facc15",
                size: 4,
                alpha: 1,
                life: 0,
                maxLife: 0.45,
              });
            }

            if (hitGate.hp <= 0 && !hitGate.passed) {
              hitGate.passed = true;
              if (hitGate.type === "member") {
                s.crowdCount = Math.min(100, s.crowdCount + hitGate.val);
                setCrowdCount(s.crowdCount);
                soundManager.playGateSound(true);
              } else {
                s.weaponLevel = Math.min(4, hitGate.val);
                setWeaponLevel(s.weaponLevel);
                soundManager.playGateSound(true);
              }
            }
          }

          // Check hit on Rival Mob
          const hitRival = s.rivals.find(
            (r) => !r.defeated && Math.abs(r.z - proj.z) < 30 && Math.abs(r.x - proj.x) < 0.65
          );
          if (hitRival) {
            proj.z = s.trackLength + 999;
            hitRival.count -= Math.ceil(proj.damage / 3);

            if (hitRival.count <= 0) {
              hitRival.defeated = true;
              s.score += hitRival.maxCount * 5;
              setScore(s.score);
              soundManager.playFireworkExplosion();
            }
          }

          if (proj.z > s.trackZ + 750) {
            s.projectiles.splice(i, 1);
          }
        }

        // Check Direct Collision of Player Mob with Gate Blocks
        s.gates.forEach((g) => {
          if (!g.passed && Math.abs(g.z - s.trackZ) < 32 && Math.abs(g.x - s.playerX) < 0.55) {
            g.passed = true;
            if (g.type === "member") {
              s.crowdCount = Math.min(100, s.crowdCount + g.val);
              setCrowdCount(s.crowdCount);
              soundManager.playGateSound(true);
            } else {
              s.weaponLevel = Math.min(4, g.val);
              setWeaponLevel(s.weaponLevel);
              soundManager.playGateSound(true);
            }
          }
        });

        // Check Collision of Player Mob with Rival Mob
        s.rivals.forEach((r) => {
          if (!r.defeated && Math.abs(r.z - s.trackZ) < 32 && Math.abs(r.x - s.playerX) < 0.6) {
            r.defeated = true;
            const lost = Math.min(s.crowdCount - 5, Math.ceil(r.count * 0.4));
            s.crowdCount = Math.max(5, s.crowdCount - lost);
            setCrowdCount(s.crowdCount);
            soundManager.playGateSound(false);

            // Spawn knockout fans falling behind on ground
            for (let k = 0; k < Math.min(6, lost); k++) {
              s.knockoutFans.push({
                x: s.playerX + (Math.random() - 0.5) * 0.8,
                y: 8,
                z: s.trackZ + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 0.14,
                vy: -5,
                vz: -2,
                rotation: Math.random() * Math.PI,
                vRot: 0.3,
                life: 0,
                maxLife: 2.2,
                facingDown: true,
              });
            }
          }
        });
      }

      // DRAW SCENE (2.5D / 3D Canvas Rendering)
      const camZ = s.trackZ - 140;

      // Draw Asphalt Road
      const pRoadNearL = project(-1.65, 0, Math.max(0, camZ + 40), w, h, camZ);
      const pRoadNearR = project(1.65, 0, Math.max(0, camZ + 40), w, h, camZ);
      const pRoadFarL = project(-1.65, 0, camZ + 750, w, h, camZ);
      const pRoadFarR = project(1.65, 0, camZ + 750, w, h, camZ);

      if (pRoadNearL && pRoadNearR && pRoadFarL && pRoadFarR) {
        ctx.fillStyle = "#334155";
        ctx.beginPath();
        ctx.moveTo(pRoadNearL.x, h);
        ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
        ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
        ctx.lineTo(pRoadNearR.x, h);
        ctx.closePath();
        ctx.fill();

        // White Road Lines
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pRoadNearL.x, h);
        ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
        ctx.moveTo(pRoadNearR.x, h);
        ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
        ctx.stroke();
      }

      // Draw Gate Blocks (Left Member Blocks & Right Weapon Upgrade Blocks)
      const visibleGates = s.gates.filter(
        (g) => !g.passed && g.z >= camZ && g.z <= camZ + 750
      );
      visibleGates.sort((a, b) => b.z - a.z);

      visibleGates.forEach((g) => {
        const laneLeftX = g.x - 0.48;
        const laneRightX = g.x + 0.48;
        const pL = project(laneLeftX, 0, g.z, w, h, camZ);
        const pR = project(laneRightX, 0, g.z, w, h, camZ);
        const pTop = project(g.x, 50, g.z, w, h, camZ);
        const pBot = project(g.x, 0, g.z, w, h, camZ);

        if (!pL || !pR || !pTop || !pBot) return;

        const gateW = Math.max(12, pR.x - pL.x);
        const gateH = Math.max(16, (pBot.y - pTop.y) * 0.6);
        const isMem = g.type === "member";

        // Glass Body
        ctx.fillStyle = isMem ? "rgba(14, 165, 233, 0.75)" : "rgba(234, 179, 8, 0.75)";
        ctx.strokeStyle = isMem ? "#38bdf8" : "#fef08a";
        ctx.lineWidth = Math.max(2, 3 * pBot.scale);

        ctx.beginPath();
        ctx.roundRect(pL.x, pTop.y, gateW, gateH, 6 * pBot.scale);
        ctx.fill();
        ctx.stroke();

        // Label Text
        const fontPx = Math.max(11, Math.floor(gateW * 0.28));
        ctx.font = `900 ${fontPx}px sans-serif`;
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(g.label, (pL.x + pR.x) / 2, pTop.y + gateH * 0.48);
      });

      // Draw Oncoming Rival Mobs (Red Mob)
      const visibleRivals = s.rivals.filter(
        (r) => !r.defeated && r.z >= camZ && r.z <= camZ + 750
      );
      visibleRivals.sort((a, b) => b.z - a.z);

      visibleRivals.forEach((r) => {
        const pR = project(r.x, 0, r.z, w, h, camZ);
        if (pR) {
          ctx.fillStyle = "rgba(239, 68, 68, 0.85)";
          const mobW = Math.max(24, 80 * pR.scale);
          const mobH = Math.max(28, 90 * pR.scale);
          ctx.beginPath();
          ctx.roundRect(pR.x - mobW / 2, pR.y - mobH, mobW, mobH, 8);
          ctx.fill();

          ctx.fillStyle = "#ffffff";
          ctx.font = `900 ${Math.max(11, Math.round(18 * pR.scale))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`👥 ${r.count}`, pR.x, pR.y - mobH * 0.5);
        }
      });

      // Draw Flying Fireworks Projectiles
      s.projectiles.forEach((proj) => {
        const p = project(proj.x, proj.y, proj.z, w, h, camZ);
        if (p) {
          ctx.fillStyle = proj.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(4, 10 * p.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Draw Particles
      s.particles.forEach((pt) => {
        const p = project(pt.x, pt.y, pt.z, w, h, camZ);
        if (p) {
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(1.5, pt.size * p.scale), 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      // Draw Knockout Fans (Defeated members lying flat on ground)
      s.knockoutFans.forEach((kf, idx) => {
        kf.life += dt;
        kf.y = Math.max(0, kf.y + kf.vy * (dt * 60));
        kf.vy += 0.45 * (dt * 60);

        const p = project(kf.x, kf.y, kf.z, w, h, camZ);
        if (p) {
          renderFanAvatar(ctx, p.x, p.y, p.scale * 0.65, playerTeam, idx, true);
        }
      });

      // Draw Player Bonde (Positioned at bottom of screen sliding left/right)
      const maxDrawn = Math.min(s.crowdCount, 26);
      for (let i = 0; i < maxDrawn; i++) {
        const angle = i * 2.4;
        const dist = Math.sqrt((i + 1) / maxDrawn) * 0.55;
        const fx = s.playerX + Math.cos(angle) * dist * 0.35;
        const fz = s.trackZ + Math.sin(angle) * dist * 14;

        const p = project(fx, 0, fz, w, h, camZ);
        if (p) {
          renderFanAvatar(ctx, p.x, p.y, p.scale * 0.72, playerTeam, i, false);
        }
      }

      ctx.restore();

      if (!s.gameEnded) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, [isTutorial]);

  // Pointer Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    s.isDragging = true;
    s.dragStartX = e.clientX;
    s.dragStartPlayerX = s.playerX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.isDragging) return;
    const deltaX = e.clientX - s.dragStartX;
    const canvasW = canvasRef.current?.clientWidth || window.innerWidth;
    const normDelta = (deltaX / (canvasW * 0.4)) * 1.4;
    s.targetX = Math.max(-0.95, Math.min(0.95, s.dragStartPlayerX + normDelta));
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-amber-500 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
            🎆 BATERIA DE ROJÕES 3D
          </span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">
            Ataque & Coleta em Pista
          </h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Arraste o bonde para os lados para mirar e coletar!
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>
            <span className="text-sky-400 font-bold">Lado Azul (+Bonde)</span>: Aumenta o número de torcedores!
          </li>
          <li>
            <span className="text-amber-400 font-bold">Lado Amarelo (Evolução)</span>: Evolui os rojões (12 Tiros, Trovão, Morteiro)!
          </li>
          <li>
            <span className="text-red-400 font-bold">Massa Rival (Red Mob)</span>: Dispare rojões para destruir os rivais antes da colisão!
          </li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 15s • Meta Rank S: 450+ Pts
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR ROJÃO 3D
        </button>
      </div>
    );
  }

  const currentW = WEAPON_LEVELS[weaponLevel - 1];

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-4 rounded-2xl border border-amber-500/50 text-white max-w-md w-full select-none shadow-2xl space-y-3">
      {/* HUD Header */}
      <div className="flex justify-between items-center w-full text-xs font-black tracking-wider uppercase border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-1.5 text-amber-400">
          <span>{currentW.icon}</span>
          <span>{currentW.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sky-400 font-mono">👥 {crowdCount}</span>
          <span className="text-yellow-400 font-mono text-sm">{timeLeft}s</span>
        </div>
      </div>

      {/* 3D Shooter Canvas */}
      <div
        className="relative w-full h-72 rounded-xl overflow-hidden border border-zinc-800 cursor-grab active:cursor-grabbing touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      <div className="flex justify-between items-center w-full text-[10px] text-zinc-400 font-semibold px-1">
        <span>Arraste para os lados para guiar o bonde</span>
        <span className="text-amber-400 font-mono font-bold text-xs">{score} pts</span>
      </div>
    </div>
  );
};
