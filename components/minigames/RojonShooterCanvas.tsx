"use client";

import React, { useEffect, useRef, useState } from "react";
import { soundManager } from "@/lib/runner_audio";
import { RunnerTeam } from "@/lib/runner_types";

export interface WeaponUpgrade {
  level: number;
  name: string;
  fireRate: number;
  projectileCount: number;
  damage: number;
  color: string;
  icon: string;
}

export const WEAPON_LEVELS: WeaponUpgrade[] = [
  { level: 1, name: "Rojão Padrão", fireRate: 240, projectileCount: 1, damage: 9, color: "#f59e0b", icon: "🚀" },
  { level: 2, name: "Rojão 12 Tiros 🎆", fireRate: 170, projectileCount: 3, damage: 13, color: "#38bdf8", icon: "🎆" },
  { level: 3, name: "Rojão Trovão ⚡", fireRate: 120, projectileCount: 4, damage: 18, color: "#facc15", icon: "⚡" },
  { level: 4, name: "Morteiro de Torcida 💣", fireRate: 90, projectileCount: 5, damage: 26, color: "#ef4444", icon: "💣" },
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

interface VerticalGate3D {
  id: string;
  x: number;
  z: number;
  type: "member" | "weapon";
  val: number;
  weaponLevel?: number;
  label: string;
  passed: boolean;
}

interface RivalMob {
  id: string;
  x: number;
  z: number;
  speed: number;
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
  team: RunnerTeam;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  z: number;
  color: string;
  alpha: number;
}

export const RojonShooterCanvas: React.FC<RojonShooterProps> = ({
  playerTeam,
  rivalTeam,
  opponentTier,
  onFinish,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isTutorial, setIsTutorial] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [crowdCount, setCrowdCount] = useState(25);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [gameResult, setGameResult] = useState<{
    rank: "S" | "B" | "C" | "F";
    modifier: number;
    score: number;
    crowdCount: number;
    weaponName: string;
  } | null>(null);

  const stateRef = useRef({
    playerX: 0,
    targetX: 0,
    crowdCount: 25,
    weaponLevel: 1,
    score: 0,
    lastShotTime: 0,
    lastSpawnTime: 0,
    projectiles: [] as RocketProjectile[],
    gates: [] as VerticalGate3D[],
    rivals: [] as RivalMob[],
    particles: [] as Particle[],
    knockoutFans: [] as KnockoutFan[],
    floatingTexts: [] as FloatingText[],
    trackZ: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartPlayerX: 0,
    gameEnded: false,
  });

  // Visão Aérea de Cima (Top-Down Bird's Eye Projection)
  const project = (
    worldX: number,
    worldY: number,
    worldZ: number,
    canvasWidth: number,
    canvasHeight: number,
    camZ: number
  ) => {
    const relZ = worldZ - camZ;
    if (relZ <= 5) return null;

    const focalLength = 320;
    const scale = focalLength / relZ;
    const horizonY = canvasHeight * 0.08;
    const screenX = canvasWidth / 2 + worldX * (canvasWidth * 0.42) * scale;
    // Map relZ = 160 (player position) cleanly at lower 78% of canvas height
    const screenY = horizonY + (170 - worldY) * scale * (canvasHeight / 480);

    return { x: screenX, y: screenY, scale, depth: relZ };
  };

  // Render Fan Avatar
  const renderFanAvatar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    team: RunnerTeam,
    runnerIdx = 0,
    facingDown = false
  ) => {
    const s = scale * 0.62;
    if (s <= 0.015) return;

    ctx.save();
    ctx.translate(x, y);

    if (facingDown) {
      ctx.rotate(Math.PI * 0.85);
    }

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinTones = ["#3c2415", "#5c3a21", "#8d5524", "#c68642", "#e0ac69", "#f1c27d"];
    const skinColor = skinTones[runnerIdx % skinTones.length];
    const jerseyColor = team.primaryColor || "#16a34a";
    const accentColor = team.secondaryColor || "#ffffff";

    // Shorts
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-5 * s, -11 * s, 4 * s, 11 * s);
    ctx.fillRect(1 * s, -11 * s, 4 * s, 11 * s);

    // Torso / Regata
    ctx.fillStyle = jerseyColor;
    ctx.beginPath();
    ctx.roundRect(-9 * s, -31 * s, 18 * s, 21 * s, 3 * s);
    ctx.fill();

    // Accent Stripe
    ctx.fillStyle = accentColor;
    ctx.fillRect(-2.5 * s, -31 * s, 5 * s, 21 * s);

    // Arms
    ctx.fillStyle = skinColor;
    ctx.fillRect(-13 * s, -29 * s, 4 * s, 14 * s);
    ctx.fillRect(9 * s, -29 * s, 4 * s, 14 * s);

    // Head
    ctx.fillRect(-3.5 * s, -36 * s, 7 * s, 6 * s);
    ctx.beginPath();
    ctx.arc(0, -42 * s, 7.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Cap / Hair
    ctx.fillStyle = runnerIdx % 2 === 0 ? "#1c1917" : team.accentColor || "#15803d";
    ctx.beginPath();
    ctx.arc(0, -44 * s, 8 * s, Math.PI, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  // Spawn Knockout Fans
  const spawnKnockoutFans = (count: number, baseX: number, baseY: number, baseZ: number, team: RunnerTeam) => {
    const s = stateRef.current;
    const num = Math.min(8, Math.max(1, count));
    for (let k = 0; k < num; k++) {
      s.knockoutFans.push({
        x: baseX + (Math.random() - 0.5) * 0.8,
        y: baseY + Math.random() * 4,
        z: baseZ + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -(4 + Math.random() * 5),
        vz: -(2.0 + Math.random() * 4),
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.4,
        life: 0,
        maxLife: 2.5,
        facingDown: Math.random() > 0.4,
        team,
      });
    }
  };

  const addFloatingText = (text: string, x: number, y: number, z: number, color: string) => {
    stateRef.current.floatingTexts.push({
      id: "ft_" + Math.random(),
      text,
      x,
      y,
      z,
      color,
      alpha: 1.0,
    });
  };

  // Initialize Track Gates & Rival Mobs
  const initTrack = () => {
    const s = stateRef.current;
    s.playerX = 0;
    s.targetX = 0;
    s.crowdCount = 25;
    s.weaponLevel = 1;
    s.score = 0;
    s.lastShotTime = 0;
    s.lastSpawnTime = 0;
    s.projectiles = [];
    s.gates = [];
    s.rivals = [];
    s.particles = [];
    s.knockoutFans = [];
    s.floatingTexts = [];
    s.trackZ = 0;
    s.gameEnded = false;

    // Sequenced Vertical 3D Gates along track
    const zSpacing = 250;
    for (let i = 1; i <= 22; i++) {
      const gateZ = i * zSpacing;

      // Left: Green 3D Vertical Gate (+5 MEMBROS)
      const memberVal = i % 4 === 0 ? 15 : i % 2 === 0 ? 10 : 5;
      s.gates.push({
        id: `gate_green_${i}`,
        x: -0.65,
        z: gateZ,
        type: "member",
        val: memberVal,
        label: i % 4 === 0 ? "x2 BONDE 🔥" : `+${memberVal} MEMBROS`,
        passed: false,
      });

      // Right: Yellow 3D Vertical Gate (+ROJÕES)
      const wLvl = Math.min(4, Math.floor(i / 2.2) + 1);
      const wInfo = WEAPON_LEVELS[wLvl - 1];
      s.gates.push({
        id: `gate_yellow_${i}`,
        x: 0.65,
        z: gateZ,
        type: "weapon",
        val: wLvl,
        weaponLevel: wLvl,
        label: wInfo.name,
        passed: false,
      });
    }

    // Initial Rival Mobs Stream
    for (let j = 1; j <= 10; j++) {
      const rZ = j * 260 + 150;
      const count = (opponentTier === "S" ? 24 : opponentTier === "A" ? 18 : 12) + j * 2.5;
      s.rivals.push({
        id: `rival_${j}`,
        x: (Math.random() - 0.5) * 0.35,
        z: rZ,
        speed: 16 + j * 1.5,
        count: Math.round(count),
        maxCount: Math.round(count),
        defeated: false,
      });
    }
  };

  // Dynamically Spawn incoming Rival Waves
  const spawnRivalWaveIfNeeded = (now: number) => {
    const s = stateRef.current;
    if (now - s.lastSpawnTime < 2200) return;

    s.lastSpawnTime = now;
    const waveIndex = Math.floor(s.trackZ / 220);
    const baseCount = (opponentTier === "S" ? 30 : opponentTier === "A" ? 22 : 16) + waveIndex * 2;
    const spawnZ = s.trackZ + 720;

    s.rivals.push({
      id: `wave_${Date.now()}`,
      x: (Math.random() - 0.5) * 0.35,
      z: spawnZ,
      speed: 18 + Math.min(15, waveIndex * 1.2),
      count: Math.round(baseCount),
      maxCount: Math.round(baseCount),
      defeated: false,
    });
  };

  // Continuous Auto Firework Rockets Spawner
  const fireRockets = (now: number) => {
    const s = stateRef.current;
    const wConfig = WEAPON_LEVELS[s.weaponLevel - 1];
    if (now - s.lastShotTime < wConfig.fireRate) return;

    s.lastShotTime = now;
    soundManager.playFireworkLaunch();

    const count = wConfig.projectileCount;
    for (let p = 0; p < count; p++) {
      const spreadX = count === 1 ? 0 : (p - (count - 1) / 2) * 0.14;
      s.projectiles.push({
        id: `rocket_${Date.now()}_${p}`,
        x: s.playerX + spreadX,
        y: 18,
        z: s.trackZ + 25,
        vx: spreadX * 0.05,
        vy: 0.04,
        vz: 38,
        damage: wConfig.damage,
        color: wConfig.color,
      });
    }
  };

  // Main Canvas Game Loop
  useEffect(() => {
    if (isTutorial) return;

    initTrack();
    setCrowdCount(25);
    setWeaponLevel(1);
    setScore(0);
    setTimeLeft(30);
    setGameResult(null);

    let animationFrameId: number;
    let lastTime = performance.now();

    const timerInterval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          endGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const endGame = () => {
      const s = stateRef.current;
      if (s.gameEnded) return;
      s.gameEnded = true;

      const finalScore = s.score;
      const finalCrowd = s.crowdCount;
      const finalW = WEAPON_LEVELS[s.weaponLevel - 1].name;

      let rank: "S" | "B" | "C" | "F" = "C";
      let modifier = 0;

      if (finalCrowd <= 0) {
        rank = "F";
        modifier = -0.20;
      } else if (finalScore >= 1100 && finalCrowd >= 40) {
        rank = "S";
        modifier = 0.25;
      } else if (finalScore >= 650 && finalCrowd >= 25) {
        rank = "B";
        modifier = 0.12;
      } else if (finalScore >= 300) {
        rank = "C";
        modifier = 0.05;
      } else {
        rank = "F";
        modifier = -0.15;
      }

      setGameResult({
        rank,
        modifier,
        score: finalScore,
        crowdCount: Math.max(0, finalCrowd),
        weaponName: finalW,
      });

      onFinish({
        gameType: "rojon",
        modifier,
        rank,
        description: `Bateria de Rojões: ${finalScore} pts | ${Math.max(0, finalCrowd)} Torcedores | Armamento: ${finalW}`,
      });
    };

    const render = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const s = stateRef.current;

      if (canvas && !s.gameEnded) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const w = (canvas.width = canvas.clientWidth || 400);
          const h = (canvas.height = canvas.clientHeight || 320);

          // Update Track Forward Movement & Player Smooth X Lerp
          s.trackZ += 90 * dt;
          s.playerX += (s.targetX - s.playerX) * 0.20;

          // Auto Fire Rockets & Spawn Incoming Rival Waves
          fireRockets(currentTime);
          spawnRivalWaveIfNeeded(currentTime);

          // Update Red Rivals Marching Downward
          s.rivals.forEach((r) => {
            if (!r.defeated) {
              r.z -= r.speed * dt * 0.6;
            }
          });

          // --- UPDATE PROJECTILES & HIT COLLISIONS ---
          for (let i = s.projectiles.length - 1; i >= 0; i--) {
            const proj = s.projectiles[i];
            proj.x += proj.vx;
            proj.z += proj.vz;

            // Tail Flame Spark
            if (Math.random() < 0.7) {
              s.particles.push({
                x: proj.x,
                y: proj.y - 3,
                z: proj.z - 5,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                vz: -2,
                color: "#f97316",
                size: 3 + Math.random() * 3,
                alpha: 0.8,
                life: 0,
                maxLife: 0.35,
              });
            }

            // Hit check on Red Rival Mobs
            const hitRival = s.rivals.find(
              (r) => !r.defeated && Math.abs(r.z - proj.z) < 32 && Math.abs(r.x - proj.x) < 0.65
            );
            if (hitRival) {
              s.projectiles.splice(i, 1);

              const eliminated = Math.min(hitRival.count, Math.max(2, Math.floor(proj.damage / 3)));
              hitRival.count -= eliminated;

              soundManager.playFireworkExplosion();
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: hitRival.x + (Math.random() - 0.5) * 0.4,
                  y: 12 + Math.random() * 8,
                  z: hitRival.z,
                  vx: (Math.random() - 0.5) * 0.3,
                  vy: Math.random() * 0.3,
                  vz: -1,
                  color: "#ef4444",
                  size: 4 + Math.random() * 4,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.4,
                });
              }

              if (hitRival.count <= 0) {
                hitRival.defeated = true;
                const pts = hitRival.maxCount * 12;
                s.score += pts;
                setScore(s.score);
                addFloatingText(`+${pts} PTS!`, hitRival.x, 28, hitRival.z, "#facc15");
                spawnKnockoutFans(5, hitRival.x, 8, hitRival.z, rivalTeam);
              }
              continue;
            }

            if (proj.z > s.trackZ + 750) {
              s.projectiles.splice(i, 1);
            }
          }

          // --- UPDATE KNOCKOUT FANS PHYSICS ---
          for (let k = s.knockoutFans.length - 1; k >= 0; k--) {
            const kf = s.knockoutFans[k];
            kf.life += dt;
            if (kf.y > 0) {
              kf.y += kf.vy * dt * 25;
              kf.vy += 9.8 * dt * 2;
            } else {
              kf.y = 0;
            }
            kf.x += kf.vx;
            kf.z += kf.vz * dt * 15;
            kf.rotation += kf.vRot;

            if (kf.life >= kf.maxLife) {
              s.knockoutFans.splice(k, 1);
            }
          }

          // --- CHECK 3D GATE PASSING ---
          s.gates.forEach((g) => {
            if (!g.passed && Math.abs(g.z - s.trackZ) < 26 && Math.abs(g.x - s.playerX) < 0.55) {
              g.passed = true;
              soundManager.playGateSound(true);

              if (g.type === "member") {
                const added = g.label.includes("x2") ? s.crowdCount : g.val;
                s.crowdCount = Math.min(100, s.crowdCount + added);
                setCrowdCount(s.crowdCount);
                addFloatingText(`+${added} MEMBROS!`, s.playerX, 32, s.trackZ, "#22c55e");
              } else if (g.type === "weapon" && g.weaponLevel) {
                if (g.weaponLevel > s.weaponLevel) {
                  s.weaponLevel = g.weaponLevel;
                  setWeaponLevel(s.weaponLevel);
                  const wName = WEAPON_LEVELS[g.weaponLevel - 1].name;
                  addFloatingText(`UPGRADE: ${wName}!`, s.playerX, 36, s.trackZ, "#facc15");
                }
              }
            }
          });

          // --- CHECK RIVAL MOB OVERRUNNING PLAYER BONDE ---
          s.rivals.forEach((r) => {
            if (!r.defeated) {
              const touchesBonde = r.z <= s.trackZ + 35 && r.z >= s.trackZ - 30 && Math.abs(r.x - s.playerX) < 0.65;
              const slippedPast = r.z < s.trackZ - 35;

              if (touchesBonde) {
                r.defeated = true;
                const loss = Math.min(s.crowdCount, Math.max(6, Math.ceil(r.count * 0.6)));
                s.crowdCount -= loss;
                setCrowdCount(Math.max(0, s.crowdCount));
                soundManager.playGateSound(false);
                addFloatingText(`-${loss} TORCEDORES!`, s.playerX, 32, s.trackZ, "#ef4444");
                spawnKnockoutFans(loss, s.playerX, 6, s.trackZ, playerTeam);

                if (s.crowdCount <= 0) {
                  endGame();
                }
              } else if (slippedPast) {
                r.defeated = true;
                const loss = Math.min(s.crowdCount, 5);
                s.crowdCount -= loss;
                setCrowdCount(Math.max(0, s.crowdCount));
                soundManager.playGateSound(false);
                addFloatingText(`-${loss} PERDIDOS!`, s.playerX, 32, s.trackZ, "#ef4444");
                spawnKnockoutFans(loss, s.playerX, 6, s.trackZ, playerTeam);

                if (s.crowdCount <= 0) {
                  endGame();
                }
              }
            }
          });

          // --- RENDER SCENE PASS ---
          ctx.clearRect(0, 0, w, h);

          const camZ = s.trackZ - 160;
          const horizonY = h * 0.12;

          // 1. Stadium & Sky Backdrop
          const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 20);
          skyGrad.addColorStop(0, "#020617");
          skyGrad.addColorStop(0.7, "#0f172a");
          skyGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, horizonY + 20);

          // Stadium Floodlights
          const floodLights = [
            { x: w * 0.12, y: horizonY - 15 },
            { x: w * 0.88, y: horizonY - 15 },
          ];
          floodLights.forEach((fl) => {
            const glow = ctx.createRadialGradient(fl.x, fl.y, 2, fl.x, fl.y, 45);
            glow.addColorStop(0, "rgba(254, 240, 138, 0.85)");
            glow.addColorStop(0.4, "rgba(253, 224, 71, 0.3)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(fl.x, fl.y, 45, 0, Math.PI * 2);
            ctx.fill();
          });

          // 2. Clean Graphite Asphalt Road
          const farZ = s.trackZ + 750;
          const nearZ = Math.max(0, camZ + 40);

          const pRoadNearL = project(-1.40, 0, nearZ, w, h, camZ);
          const pRoadNearR = project(1.40, 0, nearZ, w, h, camZ);
          const pRoadFarL = project(-1.40, 0, farZ, w, h, camZ);
          const pRoadFarR = project(1.40, 0, farZ, w, h, camZ);

          if (pRoadNearL && pRoadNearR && pRoadFarL && pRoadFarR) {
            const nearY = Math.min(h, pRoadNearL.y);

            ctx.beginPath();
            ctx.moveTo(pRoadNearL.x, nearY);
            ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
            ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
            ctx.lineTo(pRoadNearR.x, nearY);
            ctx.closePath();

            const roadGrad = ctx.createLinearGradient(0, pRoadFarL.y, 0, nearY);
            roadGrad.addColorStop(0, "#1e293b");
            roadGrad.addColorStop(0.5, "#334155");
            roadGrad.addColorStop(1, "#475569");
            ctx.fillStyle = roadGrad;
            ctx.fill();

            // Side Handrails / Fences
            ctx.strokeStyle = "#64748b";
            ctx.lineWidth = Math.max(2, 4 * pRoadNearL.scale);
            ctx.beginPath();
            ctx.moveTo(pRoadNearL.x, nearY);
            ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
            ctx.moveTo(pRoadNearR.x, nearY);
            ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
            ctx.stroke();

            // White dashed center line
            const pCenterNear = project(0, 0, nearZ, w, h, camZ);
            const pCenterFar = project(0, 0, farZ, w, h, camZ);
            if (pCenterNear && pCenterFar) {
              ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
              ctx.lineWidth = 1.5;
              ctx.setLineDash([14, 14]);
              ctx.beginPath();
              ctx.moveTo(pCenterNear.x, pCenterNear.y);
              ctx.lineTo(pCenterFar.x, pCenterFar.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }

          // 3. Draw Vertical 3D Hologram Gates
          s.gates.forEach((g) => {
            if (g.passed || g.z < camZ + 20 || g.z > camZ + 750) return;

            const pGate = project(g.x, 20, g.z, w, h, camZ);
            if (!pGate) return;

            const isGreen = g.type === "member";
            const gateW = Math.max(40, 105 * pGate.scale);
            const gateH = Math.max(45, 115 * pGate.scale);

            ctx.save();
            ctx.translate(pGate.x, pGate.y);

            // Vertical Glass Panel
            ctx.fillStyle = isGreen ? "rgba(34, 197, 94, 0.35)" : "rgba(234, 179, 8, 0.35)";
            ctx.fillRect(-gateW / 2, -gateH / 2, gateW, gateH);

            // Neon Glowing Pillars on Left & Right of Gate
            ctx.strokeStyle = isGreen ? "#22c55e" : "#eab308";
            ctx.lineWidth = Math.max(2, 4 * pGate.scale);
            ctx.strokeRect(-gateW / 2, -gateH / 2, gateW, gateH);

            // Top Label Text
            ctx.fillStyle = "#ffffff";
            const fontPx = Math.max(9, Math.floor(13 * pGate.scale));
            ctx.font = `bold ${fontPx}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(g.label, 0, -gateH / 2 - 10 * pGate.scale);

            // Icon inside glass panel
            if (isGreen) {
              ctx.fillStyle = "#86efac";
              ctx.beginPath();
              ctx.arc(-8 * pGate.scale, 0, 6 * pGate.scale, 0, Math.PI * 2);
              ctx.arc(8 * pGate.scale, 0, 6 * pGate.scale, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillStyle = "#fef08a";
              ctx.beginPath();
              ctx.arc(0, 0, 7 * pGate.scale, 0, Math.PI * 2);
              ctx.fill();
            }

            ctx.restore();
          });

          // 4. Draw Red Rival Mobs Stream
          s.rivals.forEach((r) => {
            if (r.defeated || r.z < camZ + 20 || r.z > camZ + 750) return;

            const pRival = project(r.x, 0, r.z, w, h, camZ);
            if (!pRival) return;

            const rivalCountDrawn = Math.min(16, Math.ceil(r.count / 2));
            for (let rc = 0; rc < rivalCountDrawn; rc++) {
              const rx = pRival.x + ((rc % 4) - 1.5) * 14 * pRival.scale;
              const ry = pRival.y + Math.floor(rc / 4) * 10 * pRival.scale;
              renderFanAvatar(ctx, rx, ry, pRival.scale, rivalTeam, rc + 1, false);
            }
          });

          // 5. Draw 3D Rocket Projectile Streaks
          s.projectiles.forEach((proj) => {
            const pProj = project(proj.x, proj.y, proj.z, w, h, camZ);
            if (!pProj) return;

            const rSize = Math.max(5, 14 * pProj.scale);

            ctx.strokeStyle = proj.color;
            ctx.lineWidth = Math.max(1.5, 3 * pProj.scale);
            ctx.beginPath();
            ctx.moveTo(pProj.x, pProj.y);
            ctx.lineTo(pProj.x, pProj.y - rSize);
            ctx.stroke();

            ctx.fillStyle = "#fef08a";
            ctx.beginPath();
            ctx.arc(pProj.x, pProj.y - rSize, Math.max(2, 3.5 * pProj.scale), 0, Math.PI * 2);
            ctx.fill();
          });

          // Particles
          s.particles.forEach((pt, pIdx) => {
            pt.life += dt;
            pt.x += pt.vx;
            pt.y += pt.vy;
            pt.z += pt.vz;

            const pPt = project(pt.x, pt.y, pt.z, w, h, camZ);
            if (pPt) {
              const alpha = Math.max(0, 1 - pt.life / pt.maxLife);
              ctx.fillStyle = pt.color;
              ctx.globalAlpha = alpha;
              ctx.beginPath();
              ctx.arc(pPt.x, pPt.y, pt.size * pPt.scale, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1.0;
            }

            if (pt.life >= pt.maxLife) {
              s.particles.splice(pIdx, 1);
            }
          });

          // 6. Draw Knockout Fans on Asphalt
          s.knockoutFans.forEach((kf) => {
            const pKF = project(kf.x, kf.y, kf.z, w, h, camZ);
            if (pKF) {
              renderFanAvatar(ctx, pKF.x, pKF.y, pKF.scale, kf.team, 1, kf.facingDown);
            }
          });

          // 7. Draw Player Torcida Bonde Marching on Foot (WITH GREEN HIGHLIGHT BASE & BADGE)
          const pPlayer = project(s.playerX, 0, s.trackZ, w, h, camZ);
          if (pPlayer) {
            const sP = pPlayer.scale;

            // Green Pulsing Highlight Aura under Player Bonde on Asphalt
            const pulse = 0.5 + Math.sin(performance.now() * 0.01) * 0.35;
            ctx.fillStyle = `rgba(34, 197, 94, ${0.35 + pulse * 0.25})`;
            ctx.beginPath();
            ctx.ellipse(pPlayer.x, pPlayer.y, 45 * sP, 18 * sP, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = `rgba(134, 239, 172, ${0.8 + pulse * 0.2})`;
            ctx.lineWidth = 2 * sP;
            ctx.stroke();

            // Draw Torcedores in Bonde Swarm
            const maxFansDrawn = Math.min(s.crowdCount, 26);
            const fanPositions: { x: number; z: number }[] = [];

            for (let i = 0; i < maxFansDrawn; i++) {
              const angle = i * 2.39996;
              const dist = Math.sqrt((i + 1) / maxFansDrawn) * 0.70;
              const fx = s.playerX + Math.cos(angle) * dist * 0.32;
              const fz = s.trackZ + Math.sin(angle) * dist * 14;
              fanPositions.push({ x: fx, z: fz });
            }

            fanPositions.sort((a, b) => b.z - a.z);

            fanPositions.forEach((fan, idx) => {
              const pFan = project(fan.x, 0, fan.z, w, h, camZ);
              if (pFan) {
                renderFanAvatar(ctx, pFan.x, pFan.y, pFan.scale * 1.1, playerTeam, idx, false);
              }
            });

            // Prominent "MEU BONDE" Badge Tag above player crowd
            ctx.fillStyle = "#15803d";
            ctx.beginPath();
            ctx.roundRect(pPlayer.x - 48 * sP, pPlayer.y - 58 * sP, 96 * sP, 18 * sP, 4 * sP);
            ctx.fill();
            ctx.strokeStyle = "#4ade80";
            ctx.lineWidth = 1.5 * sP;
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(9, Math.floor(11 * sP))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`👥 MEU BONDE (${s.crowdCount})`, pPlayer.x, pPlayer.y - 45 * sP);

            // Rocket Muzzle Spark
            if (performance.now() - s.lastShotTime < 100) {
              const fGlow = ctx.createRadialGradient(pPlayer.x, pPlayer.y - 25 * sP, 2, pPlayer.x, pPlayer.y - 25 * sP, 20 * sP);
              fGlow.addColorStop(0, "#fef08a");
              fGlow.addColorStop(0.5, "#f97316");
              fGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
              ctx.fillStyle = fGlow;
              ctx.beginPath();
              ctx.arc(pPlayer.x, pPlayer.y - 25 * sP, 20 * sP, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // 8. Floating Combat Texts
          s.floatingTexts.forEach((ft, fIdx) => {
            ft.y += 12 * dt;
            ft.alpha -= 0.6 * dt;

            const pFt = project(ft.x, ft.y, ft.z, w, h, camZ);
            if (pFt && ft.alpha > 0) {
              ctx.fillStyle = ft.color;
              ctx.globalAlpha = ft.alpha;
              ctx.font = `bold ${Math.max(10, Math.floor(14 * pFt.scale))}px sans-serif`;
              ctx.textAlign = "center";
              ctx.fillText(ft.text, pFt.x, pFt.y);
              ctx.globalAlpha = 1.0;
            }

            if (ft.alpha <= 0) {
              s.floatingTexts.splice(fIdx, 1);
            }
          });
        }
      }

      if (!s.gameEnded) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(timerInterval);
    };
  }, [isTutorial]);

  // Touch Drag Handler
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
    const normDelta = (deltaX / (canvasW * 0.38)) * 1.5;
    s.targetX = Math.max(-0.85, Math.min(0.85, s.dragStartPlayerX + normDelta));
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  const currentW = WEAPON_LEVELS[weaponLevel - 1];

  if (isTutorial) {
    return (
      <div className="flex flex-col items-center bg-zinc-950 p-6 rounded-2xl border border-amber-500 text-white max-w-sm w-full select-none shadow-2xl space-y-4 text-center">
        <div className="border-b border-zinc-800 pb-2 w-full">
          <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block">
            🎆 BATERIA DE ROJÕES 3D (BONDE EM DESTAQUE)
          </span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">
            Visão De Cima & Bonde Visível Na Tela
          </h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Seu bonde verde aparece destacado na parte inferior da tela!
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>
            <span className="text-emerald-400 font-bold">👥 MEU BONDE</span>: Destacado com indicador verde no asfalto e badge de identificação.
          </li>
          <li>
            <span className="text-red-400 font-bold">⚠️ Dano Imediato</span>: Se os rivais encostarem no bonde, causam baixas instantâneas.
          </li>
          <li>
            <span className="text-amber-400 font-bold">Visão de Cima</span>: Projeção corrigida para visibilidade perfeita de toda a pista.
          </li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 30s • Bonde Destacado & 100% Visível
        </div>

        <button
          onClick={() => setIsTutorial(false)}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider transition-all shadow-lg active:scale-95 cursor-pointer"
        >
          ▶️ INICIAR JOGO COM BONDE VISÍVEL
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center bg-zinc-950 p-4 rounded-2xl border border-amber-500/50 text-white max-w-md w-full select-none shadow-2xl space-y-3">
      {/* Top HUD Pill */}
      <div className="flex justify-between items-center w-full bg-zinc-900/90 border border-zinc-800 px-4 py-2 rounded-2xl text-xs font-black uppercase shadow-lg">
        <div className="flex items-center gap-1.5 text-amber-400">
          <span>{currentW.icon}</span>
          <span>{currentW.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sky-400 font-mono">👥 {crowdCount} MEMBROS</span>
          <span className="text-yellow-400 font-mono text-sm">⏱️ {timeLeft}s</span>
        </div>
      </div>

      {/* 3D Shooter Canvas */}
      <div
        className="relative w-full h-96 rounded-2xl overflow-hidden border border-zinc-800 cursor-grab active:cursor-grabbing touch-none select-none shadow-2xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Game Over Result Overlay */}
        {gameResult && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center space-y-2 animate-fade-in">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              FIM DA BATERIA DE ROJÕES!
            </span>
            <div className="text-3xl font-black text-white">
              RANK <span className={gameResult.rank === "S" ? "text-emerald-400" : gameResult.rank === "B" ? "text-sky-400" : gameResult.rank === "C" ? "text-amber-400" : "text-red-500"}>{gameResult.rank}</span>
            </div>
            <p className="text-xs text-zinc-300">
              Pontuação: <strong className="text-amber-400">{gameResult.score} Pts</strong> | Bonde: <strong className="text-sky-400">{gameResult.crowdCount} Torcedores</strong>
            </p>
            <p className="text-[11px] text-zinc-400">
              Armamento Alcançado: <strong>{gameResult.weaponName}</strong>
            </p>
          </div>
        )}
      </div>

      {/* Bottom HUD Footer */}
      <div className="flex justify-between items-center w-full text-[10px] text-zinc-400 font-semibold px-2">
        <span>Deslize o dedo na tela para mover o bonde</span>
        <span className="text-amber-400 font-mono font-bold text-xs">{score} pts</span>
      </div>
    </div>
  );
};
