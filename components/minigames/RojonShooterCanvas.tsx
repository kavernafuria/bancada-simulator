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
  { level: 1, name: "Rojão Padrão", fireRate: 280, projectileCount: 1, damage: 5, color: "#f59e0b", icon: "🚀" },
  { level: 2, name: "Rojão 12 Tiros 🎆", fireRate: 200, projectileCount: 3, damage: 8, color: "#38bdf8", icon: "🎆" },
  { level: 3, name: "Rojão Trovão ⚡", fireRate: 140, projectileCount: 4, damage: 14, color: "#facc15", icon: "⚡" },
  { level: 4, name: "Morteiro de Torcida 💣", fireRate: 95, projectileCount: 5, damage: 22, color: "#ef4444", icon: "💣" },
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

interface DestructibleBarrier {
  id: string;
  x: number;
  z: number;
  hp: number;
  maxHp: number;
  destroyed: boolean;
}

interface ThinGate {
  id: string;
  x: number;
  z: number;
  type: "member" | "weapon";
  val: number;
  weaponLevel?: number;
  label: string;
  passed: boolean;
  barrierId?: string;
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
  const [isTutorial, setIsTutorial] = useState(true);
  const [timeLeft, setTimeLeft] = useState(15);
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
    projectiles: [] as RocketProjectile[],
    barriers: [] as DestructibleBarrier[],
    gates: [] as ThinGate[],
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

  // Voodoo 3D Third-Person Perspective Camera Projection (Behind & Above Player)
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
    const horizonY = canvasHeight * 0.20;
    const screenX = canvasWidth / 2 + worldX * (canvasWidth * 0.44) * scale;
    const screenY = horizonY + (150 - worldY) * scale * 0.94;

    return { x: screenX, y: screenY, scale, depth: relZ };
  };

  // Render Compact Proportional Fan Avatar
  const renderFanAvatar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    team: RunnerTeam,
    runnerIdx = 0,
    facingDown = false
  ) => {
    const s = scale * 0.58; // Sleek small Voodoo scale
    if (s <= 0.015) return;

    ctx.save();
    ctx.translate(x, y);

    if (facingDown) {
      ctx.rotate(Math.PI * 0.85);
    }

    // Shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 12 * s, 5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    const skinTones = ["#3c2415", "#5c3a21", "#8d5524", "#c68642", "#e0ac69", "#f1c27d"];
    const skinColor = skinTones[runnerIdx % skinTones.length];
    const jerseyColor = team.primaryColor || "#16a34a";
    const accentColor = team.secondaryColor || "#ffffff";

    // Legs
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

    // Bare Arms
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

  // Initialize Track (Destructible Barriers, Thin Hologram Gates, Red Mobs)
  const initTrack = () => {
    const s = stateRef.current;
    s.playerX = 0;
    s.targetX = 0;
    s.crowdCount = 25;
    s.weaponLevel = 1;
    s.score = 0;
    s.lastShotTime = 0;
    s.projectiles = [];
    s.barriers = [];
    s.gates = [];
    s.rivals = [];
    s.particles = [];
    s.knockoutFans = [];
    s.floatingTexts = [];
    s.trackZ = 0;
    s.gameEnded = false;

    // Checkpoints down the asphalt road
    const zSpacing = 280;
    for (let i = 1; i <= 10; i++) {
      const gateZ = i * zSpacing;
      const barrierZ = gateZ - 40;

      // Left Checkpoint: Member Bonus Gate + Barrier
      const memberVal = i === 3 || i === 7 ? 10 : 5;
      const bLeftId = `barr_l_${i}`;
      s.barriers.push({
        id: bLeftId,
        x: -0.55,
        z: barrierZ,
        hp: 12 + i * 3,
        maxHp: 12 + i * 3,
        destroyed: false,
      });

      s.gates.push({
        id: `gate_l_${i}`,
        x: -0.55,
        z: gateZ,
        type: "member",
        val: memberVal,
        label: i === 3 ? "x2 BONDE" : `+${memberVal} MEMBROS`,
        passed: false,
        barrierId: bLeftId,
      });

      // Right Checkpoint: Weapon Upgrade Gate + Barrier
      const wLvl = Math.min(4, Math.floor(i / 2.5) + 1);
      const wInfo = WEAPON_LEVELS[wLvl - 1];
      const bRightId = `barr_r_${i}`;
      s.barriers.push({
        id: bRightId,
        x: 0.55,
        z: barrierZ,
        hp: 16 + i * 4,
        maxHp: 16 + i * 4,
        destroyed: false,
      });

      s.gates.push({
        id: `gate_r_${i}`,
        x: 0.55,
        z: gateZ,
        type: "weapon",
        val: wLvl,
        weaponLevel: wLvl,
        label: wInfo.name,
        passed: false,
        barrierId: bRightId,
      });
    }

    // Red Rival Mobs advancing in Center Lane
    for (let j = 1; j <= 9; j++) {
      const rZ = j * 310 + 180;
      const count = (opponentTier === "S" ? 26 : opponentTier === "A" ? 18 : 12) + j * 2.5;
      s.rivals.push({
        id: `rival_${j}`,
        x: (Math.random() - 0.5) * 0.2,
        z: rZ,
        speed: 12 + j * 2,
        count: Math.round(count),
        maxCount: Math.round(count),
        defeated: false,
      });
    }
  };

  // Small, Clean Firework Rocket Projectiles Spawner
  const fireRockets = (now: number) => {
    const s = stateRef.current;
    const wConfig = WEAPON_LEVELS[s.weaponLevel - 1];
    if (now - s.lastShotTime < wConfig.fireRate) return;

    s.lastShotTime = now;
    soundManager.playFireworkLaunch();

    const count = wConfig.projectileCount;
    for (let p = 0; p < count; p++) {
      const spreadX = count === 1 ? 0 : (p - (count - 1) / 2) * 0.12;
      s.projectiles.push({
        id: `rocket_${Date.now()}_${p}`,
        x: s.playerX + spreadX,
        y: 14,
        z: s.trackZ + 20,
        vx: spreadX * 0.06,
        vy: 0.03,
        vz: 34, // Fast clean streaks
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
    setTimeLeft(15);
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
      if (finalScore >= 500 && finalCrowd >= 40) {
        rank = "S";
        modifier = 0.25;
      } else if (finalScore >= 300) {
        rank = "B";
        modifier = 0.12;
      } else if (finalScore >= 150) {
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
        crowdCount: finalCrowd,
        weaponName: finalW,
      });

      onFinish({
        gameType: "rojon",
        modifier,
        rank,
        description: `Bateria de Rojões: ${finalScore} pts | ${finalCrowd} Torcedores | Armamento: ${finalW}`,
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

          // Update Track Forward Movement & Player Smooth Lerp
          s.trackZ += 82 * dt;
          s.playerX += (s.targetX - s.playerX) * 0.20; // Silky smooth X axis drag

          // Auto Fire Rockets
          fireRockets(currentTime);

          // Update Red Rivals Marching Downward
          s.rivals.forEach((r) => {
            if (!r.defeated) {
              r.z -= r.speed * dt * 0.5;
            }
          });

          // --- UPDATE PROJECTILES & HIT COLLISIONS ---
          for (let i = s.projectiles.length - 1; i >= 0; i--) {
            const proj = s.projectiles[i];
            proj.x += proj.vx;
            proj.z += proj.vz;

            // 1. Check Hit on Destructible Barriers
            const hitBarrier = s.barriers.find(
              (b) => !b.destroyed && Math.abs(b.z - proj.z) < 25 && Math.abs(b.x - proj.x) < 0.45
            );
            if (hitBarrier) {
              s.projectiles.splice(i, 1);
              hitBarrier.hp -= proj.damage;

              // Spark FX
              soundManager.playIronBarPickup();
              for (let p = 0; p < 6; p++) {
                s.particles.push({
                  x: hitBarrier.x + (Math.random() - 0.5) * 0.3,
                  y: 10 + Math.random() * 6,
                  z: hitBarrier.z,
                  vx: (Math.random() - 0.5) * 0.3,
                  vy: Math.random() * 0.3,
                  vz: -1,
                  color: "#facc15",
                  size: 3 + Math.random() * 3,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.35,
                });
              }

              if (hitBarrier.hp <= 0) {
                hitBarrier.destroyed = true;
                soundManager.playFireworkExplosion();
                addFloatingText("DESTRUÍDO!", hitBarrier.x, 25, hitBarrier.z, "#38bdf8");
              }
              continue;
            }

            // 2. Check Hit on Red Rival Mobs
            const hitRival = s.rivals.find(
              (r) => !r.defeated && Math.abs(r.z - proj.z) < 30 && Math.abs(r.x - proj.x) < 0.6
            );
            if (hitRival) {
              s.projectiles.splice(i, 1);
              hitRival.count -= Math.ceil(proj.damage / 3);

              soundManager.playFireworkExplosion();
              for (let p = 0; p < 8; p++) {
                s.particles.push({
                  x: hitRival.x + (Math.random() - 0.5) * 0.4,
                  y: 10 + Math.random() * 8,
                  z: hitRival.z,
                  vx: (Math.random() - 0.5) * 0.3,
                  vy: Math.random() * 0.3,
                  vz: -1,
                  color: proj.color,
                  size: 4 + Math.random() * 4,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.4,
                });
              }

              if (hitRival.count <= 0) {
                hitRival.defeated = true;
                const pts = hitRival.maxCount * 10;
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

          // --- CHECK GATE COLLISIONS (THIN ELEGANT GATES) ---
          s.gates.forEach((g) => {
            if (g.passed || g.z < s.trackZ - 10) return;

            // Check if blocking barrier is still intact
            const barrier = s.barriers.find((b) => b.id === g.barrierId);
            const isBlocked = barrier && !barrier.destroyed;

            if (Math.abs(g.z - s.trackZ) < 22 && Math.abs(g.x - s.playerX) < 0.45) {
              if (isBlocked) {
                // Blocked by intact barrier! Player takes damage!
                soundManager.playGateSound(false);
                const loss = 3;
                s.crowdCount = Math.max(5, s.crowdCount - loss);
                setCrowdCount(s.crowdCount);
                addFloatingText(`BLOQUEADO! -${loss}`, s.playerX, 30, s.trackZ, "#ef4444");
                spawnKnockoutFans(loss, s.playerX, 6, s.trackZ, playerTeam);
                g.passed = true;
              } else {
                // Clean pass through gate!
                g.passed = true;
                soundManager.playGateSound(true);

                if (g.type === "member") {
                  const added = g.label.includes("x2") ? s.crowdCount : g.val;
                  s.crowdCount = Math.min(100, s.crowdCount + added);
                  setCrowdCount(s.crowdCount);
                  addFloatingText(`+${added} MEMBROS!`, s.playerX, 32, s.trackZ, "#38bdf8");
                } else if (g.type === "weapon" && g.weaponLevel) {
                  if (g.weaponLevel > s.weaponLevel) {
                    s.weaponLevel = g.weaponLevel;
                    setWeaponLevel(s.weaponLevel);
                    const wName = WEAPON_LEVELS[g.weaponLevel - 1].name;
                    addFloatingText(`UPGRADE: ${wName}!`, s.playerX, 36, s.trackZ, "#facc15");
                  }
                }
              }
            }
          });

          // --- CHECK RIVAL REACHING PLAYER (DAMAGE MECHANIC) ---
          s.rivals.forEach((r) => {
            if (!r.defeated && Math.abs(r.z - s.trackZ) < 24 && Math.abs(r.x - s.playerX) < 0.5) {
              r.defeated = true;
              const loss = Math.min(s.crowdCount - 5, Math.ceil(r.count * 0.4));
              s.crowdCount = Math.max(5, s.crowdCount - loss);
              setCrowdCount(s.crowdCount);
              soundManager.playGateSound(false);
              addFloatingText(`- ${loss} TORCEDORES!`, s.playerX, 32, s.trackZ, "#ef4444");
              spawnKnockoutFans(loss, s.playerX, 6, s.trackZ, playerTeam);
            }
          });

          // --- DRAWING PASS ---
          ctx.clearRect(0, 0, w, h);

          const camZ = s.trackZ - 130;
          const horizonY = h * 0.20;

          // 1. Dark Sky Backdrop
          const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 20);
          skyGrad.addColorStop(0, "#020617");
          skyGrad.addColorStop(0.7, "#0f172a");
          skyGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, horizonY + 20);

          // 2. Clean Graphite Asphalt Road (NO GIANT COLORED FLOOR BLOCKS)
          const farZ = s.trackZ + 750;
          const nearZ = Math.max(0, camZ + 40);

          const pRoadNearL = project(-1.45, 0, nearZ, w, h, camZ);
          const pRoadNearR = project(1.45, 0, nearZ, w, h, camZ);
          const pRoadFarL = project(-1.45, 0, farZ, w, h, camZ);
          const pRoadFarR = project(1.45, 0, farZ, w, h, camZ);

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

            // Clean white boundary lines
            ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
            ctx.lineWidth = Math.max(1.5, 3 * pRoadNearL.scale);
            ctx.beginPath();
            ctx.moveTo(pRoadNearL.x, nearY);
            ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
            ctx.moveTo(pRoadNearR.x, nearY);
            ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
            ctx.stroke();

            // Subtle center dashed lane
            const pCenterNear = project(0, 0, nearZ, w, h, camZ);
            const pCenterFar = project(0, 0, farZ, w, h, camZ);
            if (pCenterNear && pCenterFar) {
              ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
              ctx.lineWidth = 1.5;
              ctx.setLineDash([12, 12]);
              ctx.beginPath();
              ctx.moveTo(pCenterNear.x, pCenterNear.y);
              ctx.lineTo(pCenterFar.x, pCenterFar.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }

          // 3. Draw Destructible Barriers
          s.barriers.forEach((b) => {
            if (b.destroyed || b.z < camZ + 20 || b.z > camZ + 750) return;

            const pB = project(b.x, 10, b.z, w, h, camZ);
            if (!pB) return;

            const bW = Math.max(35, 90 * pB.scale);
            const bH = Math.max(22, 55 * pB.scale);

            ctx.save();
            ctx.translate(pB.x, pB.y);

            // Barrier Body (Red/Black metallic fence with HP)
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(-bW / 2, -bH / 2, bW, bH);
            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = Math.max(1.5, 2.5 * pB.scale);
            ctx.strokeRect(-bW / 2, -bH / 2, bW, bH);

            // HP Bar
            const hpRatio = Math.max(0, b.hp / b.maxHp);
            ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
            ctx.fillRect(-bW / 2, -bH / 2 - 12 * pB.scale, bW, 7 * pB.scale);
            ctx.fillStyle = "#facc15";
            ctx.fillRect(-bW / 2, -bH / 2 - 12 * pB.scale, bW * hpRatio, 7 * pB.scale);

            // Small crisp text
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(8, Math.floor(10 * pB.scale))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`HP ${Math.max(0, Math.ceil(b.hp))}`, 0, -bH / 2 - 15 * pB.scale);

            ctx.restore();
          });

          // 4. Draw Thin Holographic Vertical Gates
          s.gates.forEach((g) => {
            if (g.passed || g.z < camZ + 20 || g.z > camZ + 750) return;

            const pGate = project(g.x, 18, g.z, w, h, camZ);
            if (!pGate) return;

            const isMember = g.type === "member";
            const gateW = Math.max(38, 100 * pGate.scale);
            const gateH = Math.max(35, 90 * pGate.scale);

            ctx.save();
            ctx.translate(pGate.x, pGate.y);

            // Thin Vertical Neon Frame (NOT GIANT FLOOR BLOCKS)
            ctx.fillStyle = isMember ? "rgba(14, 165, 233, 0.25)" : "rgba(245, 158, 11, 0.25)";
            ctx.fillRect(-gateW / 2, -gateH / 2, gateW, gateH);

            ctx.strokeStyle = isMember ? "#38bdf8" : "#facc15";
            ctx.lineWidth = Math.max(1.5, 2.5 * pGate.scale);
            ctx.strokeRect(-gateW / 2, -gateH / 2, gateW, gateH);

            // Small Floating Text ABOVE Gate (DOES NOT COVER VISION)
            ctx.fillStyle = "#ffffff";
            const fontPx = Math.max(9, Math.floor(12 * pGate.scale));
            ctx.font = `bold ${fontPx}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(g.label, 0, -gateH / 2 - 10 * pGate.scale);

            ctx.restore();
          });

          // 5. Draw Red Rival Mobs (Proportional Scale)
          s.rivals.forEach((r) => {
            if (r.defeated || r.z < camZ + 20 || r.z > camZ + 750) return;

            const pRival = project(r.x, 0, r.z, w, h, camZ);
            if (!pRival) return;

            const rivalCountDrawn = Math.min(10, Math.ceil(r.count / 2));
            for (let rc = 0; rc < rivalCountDrawn; rc++) {
              const rx = pRival.x + ((rc % 4) - 1.5) * 14 * pRival.scale;
              const ry = pRival.y + Math.floor(rc / 4) * 10 * pRival.scale;
              renderFanAvatar(ctx, rx, ry, pRival.scale, rivalTeam, rc + 1, false);
            }

            // Small health text
            ctx.fillStyle = "#ef4444";
            ctx.font = `bold ${Math.max(8, Math.floor(10 * pRival.scale))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`RIVAIS: ${r.count}`, pRival.x, pRival.y - 35 * pRival.scale);
          });

          // 6. Draw Small Fast Rocket Projectile Streaks (UNPOLLUTED VISION)
          s.projectiles.forEach((proj) => {
            const pProj = project(proj.x, proj.y, proj.z, w, h, camZ);
            if (!pProj) return;

            const streakLen = 14 * pProj.scale;

            // Small crisp streak
            ctx.strokeStyle = proj.color;
            ctx.lineWidth = Math.max(1.5, 3 * pProj.scale);
            ctx.beginPath();
            ctx.moveTo(pProj.x, pProj.y);
            ctx.lineTo(pProj.x, pProj.y - streakLen);
            ctx.stroke();

            // Tiny head spark
            ctx.fillStyle = "#ffffff";
            ctx.beginPath();
            ctx.arc(pProj.x, pProj.y - streakLen, Math.max(1.5, 3 * pProj.scale), 0, Math.PI * 2);
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

          // 7. Draw Knockout Fans on Asphalt
          s.knockoutFans.forEach((kf) => {
            const pKF = project(kf.x, kf.y, kf.z, w, h, camZ);
            if (pKF) {
              renderFanAvatar(ctx, pKF.x, pKF.y, pKF.scale, kf.team, 1, kf.facingDown);
            }
          });

          // 8. Draw Player Torcida Bonde (At Base of Screen)
          const pPlayer = project(s.playerX, 0, s.trackZ, w, h, camZ);
          if (pPlayer) {
            const maxFansDrawn = Math.min(s.crowdCount, 26);
            const fanPositions: { x: number; z: number }[] = [];

            for (let i = 0; i < maxFansDrawn; i++) {
              const angle = i * 2.39996;
              const dist = Math.sqrt((i + 1) / maxFansDrawn) * 0.70;
              const fx = s.playerX + Math.cos(angle) * dist * 0.30;
              const fz = s.trackZ + Math.sin(angle) * dist * 12;
              fanPositions.push({ x: fx, z: fz });
            }

            fanPositions.sort((a, b) => b.z - a.z);

            fanPositions.forEach((fan, idx) => {
              const pFan = project(fan.x, 0, fan.z, w, h, camZ);
              if (pFan) {
                renderFanAvatar(ctx, pFan.x, pFan.y, pFan.scale, playerTeam, idx, false);
              }
            });
          }

          // 9. Floating Combat Texts
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

  // Smooth Continuous Drag Handlers (NO BUTTONS ON SCREEN, 100% CLEAN FLOOR)
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
    s.targetX = Math.max(-0.90, Math.min(0.90, s.dragStartPlayerX + normDelta));
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
            🎆 BATERIA DE ROJÕES 3D
          </span>
          <h3 className="text-sm font-black text-white uppercase mt-0.5">
            Estilo Runner Voodoo 3D
          </h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Deslize o dedo na tela para guiar o bonde no asfalto!
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>
            <span className="text-amber-400 font-bold">Barreiras com HP</span>: Atire nas barreiras na frente dos portões para destruí-las e liberar o bônus!
          </li>
          <li>
            <span className="text-sky-400 font-bold">Portões Finos</span>: Portões de `+5 MEMBROS` e `+ROJÕES` flutuando no caminho.
          </li>
          <li>
            <span className="text-red-400 font-bold">Inimigos Rivais</span>: Não deixe a horda rival tocar no seu bonde para não perder torcedores!
          </li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 15s • Controle: Deslizar contínuo
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

      {/* 3D Shooter Canvas (100% CLEAN FLOOR, CONTINUOUS DRAG CONTROLS) */}
      <div
        className="relative w-full h-80 rounded-xl overflow-hidden border border-zinc-800 cursor-grab active:cursor-grabbing touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Floating Game Result Overlay */}
        {gameResult && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center space-y-2 animate-fade-in">
            <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
              FIM DA BATERIA DE ROJÕES!
            </span>
            <div className="text-3xl font-black text-white">
              RANK <span className={gameResult.rank === "S" ? "text-emerald-400" : gameResult.rank === "B" ? "text-sky-400" : "text-amber-400"}>{gameResult.rank}</span>
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

      {/* Clean Drag Instruction */}
      <div className="flex justify-between items-center w-full text-[10px] text-zinc-400 font-semibold px-1">
        <span>Deslize o dedo na tela para mover o bonde</span>
        <span className="text-amber-400 font-mono font-bold text-xs">{score} pts</span>
      </div>
    </div>
  );
};
