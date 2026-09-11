"use client";

import React, { useEffect, useRef, useState } from "react";
import { soundManager } from "@/lib/runner_audio";
import { RunnerTeam } from "@/lib/runner_types";
import { Flame, Sparkles, Trophy, RotateCcw, ArrowLeft, ArrowRight, Shield, Swords, Users, Zap } from "lucide-react";

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
  { level: 1, name: "Rojão Padrão", fireRate: 300, projectileCount: 1, damage: 6, color: "#f59e0b", icon: "🚀" },
  { level: 2, name: "Rojão 12 Tiros 🎆", fireRate: 220, projectileCount: 3, damage: 10, color: "#38bdf8", icon: "🎆" },
  { level: 3, name: "Rojão Trovão ⚡", fireRate: 150, projectileCount: 4, damage: 16, color: "#facc15", icon: "⚡" },
  { level: 4, name: "Morteiro de Torcida 💣", fireRate: 100, projectileCount: 5, damage: 26, color: "#ef4444", icon: "💣" },
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
  lane: "left" | "right";
  x: number; // -0.75 for left, +0.75 for right
  z: number;
  type: "member" | "weapon";
  val: number;
  weaponLevel?: number;
  label: string;
  passed: boolean;
}

interface RivalMob {
  id: string;
  x: number; // Center lane ~ 0.0
  z: number; // Distance down the avenue
  speed: number; // Marching speed downwards
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
    gates: [] as GateBlock[],
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

  // Top-Down / Isometric 3D Projection (High Angle looking down the avenue)
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

    const focalLength = 310;
    const scale = focalLength / relZ;
    const horizonY = canvasHeight * 0.18; // Top horizon showing stadium
    const screenX = canvasWidth / 2 + worldX * (canvasWidth * 0.42) * scale;
    const screenY = horizonY + (160 - worldY) * scale * 0.92;

    return { x: screenX, y: screenY, scale, depth: relZ };
  };

  // Render authentic Torcida Fan Avatar matching GameCanvas design system
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
    if (s <= 0.02) return;

    ctx.save();
    ctx.translate(x, y);

    if (facingDown) {
      ctx.rotate(Math.PI * 0.85);
    }

    // Shadow on asphalt
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // Fan Seed Attributes for Skin & Body Diversity
    const skinTones = ["#3c2415", "#5c3a21", "#8d5524", "#c68642", "#e0ac69", "#f1c27d"];
    const skinColor = skinTones[runnerIdx % skinTones.length];
    const bodyTypes = ["GORDO", "MUSCULOSO", "ATLÉTICO", "MAGRO"];
    const bodyType = bodyTypes[runnerIdx % bodyTypes.length];
    const hairStyles = ["DEGRADÊ", "BLACK_POWER", "BONÉ_TRÁS", "DREADS", "CARECA"];
    const hairStyle = hairStyles[runnerIdx % hairStyles.length];

    const jerseyColor = team.primaryColor || "#16a34a";
    const accentColor = team.secondaryColor || "#ffffff";

    // Legs / Shorts
    ctx.fillStyle = "#1e293b";
    ctx.fillRect(-6 * s, -12 * s, 5 * s, 12 * s);
    ctx.fillRect(1 * s, -12 * s, 5 * s, 12 * s);

    // Torso / Regata (Chest)
    ctx.fillStyle = jerseyColor;
    if (bodyType === "GORDO") {
      ctx.beginPath();
      ctx.roundRect(-13 * s, -34 * s, 26 * s, 23 * s, 4 * s);
      ctx.fill();
    } else if (bodyType === "MUSCULOSO") {
      ctx.beginPath();
      ctx.roundRect(-12 * s, -36 * s, 24 * s, 25 * s, 3 * s);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.roundRect(-10 * s, -34 * s, 20 * s, 23 * s, 3 * s);
      ctx.fill();
    }

    // Jersey Accent Stripe
    ctx.fillStyle = accentColor;
    ctx.fillRect(-3 * s, -34 * s, 6 * s, 23 * s);

    // Bare Arms with Tattoos
    ctx.fillStyle = skinColor;
    const armW = bodyType === "MUSCULOSO" ? 6 * s : 4.5 * s;
    ctx.fillRect(-15 * s, -32 * s, armW, 16 * s);
    ctx.fillRect(11 * s, -32 * s, armW, 16 * s);

    // Tattoos on arms
    if (runnerIdx % 2 === 0) {
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 1.2 * s;
      ctx.beginPath();
      ctx.moveTo(-14 * s, -28 * s);
      ctx.lineTo(-11 * s, -20 * s);
      ctx.stroke();
    }

    // Neck & Head
    ctx.fillRect(-4 * s, -40 * s, 8 * s, 7 * s); // Neck
    ctx.beginPath();
    ctx.arc(0, -46 * s, 8.5 * s, 0, Math.PI * 2);
    ctx.fill();

    // Hair / Cap Diversity
    if (hairStyle === "BLACK_POWER") {
      ctx.fillStyle = "#1e1b18";
      ctx.beginPath();
      ctx.arc(0, -48 * s, 11 * s, 0, Math.PI * 2);
      ctx.fill();
    } else if (hairStyle === "BONÉ_TRÁS") {
      ctx.fillStyle = team.accentColor || "#15803d";
      ctx.beginPath();
      ctx.arc(0, -48 * s, 9 * s, Math.PI, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(-10 * s, -48 * s, 6 * s, 3 * s);
    } else if (hairStyle === "DREADS") {
      ctx.fillStyle = "#292524";
      ctx.fillRect(-9 * s, -52 * s, 18 * s, 8 * s);
      ctx.fillRect(-10 * s, -48 * s, 4 * s, 12 * s);
      ctx.fillRect(6 * s, -48 * s, 4 * s, 12 * s);
    } else if (hairStyle === "DEGRADÊ") {
      ctx.fillStyle = "#1c1917";
      ctx.beginPath();
      ctx.arc(0, -48 * s, 9 * s, Math.PI * 1.1, Math.PI * 1.9);
      ctx.fill();
    }

    // Waving Banner / Flag for rear fans
    if (runnerIdx === 0) {
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(-1 * s, -75 * s, 2 * s, 40 * s);
      ctx.fillStyle = jerseyColor;
      ctx.fillRect(1 * s, -75 * s, 22 * s, 14 * s);
      ctx.fillStyle = accentColor;
      ctx.fillRect(1 * s, -68 * s, 22 * s, 4 * s);
    }

    ctx.restore();
  };

  // Spawn Knockout Fans when damage occurs
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

  // Add floating combat text (+5 MEMBROS, UPGRADE!)
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

  // Initialize Track Layout with 3 Distinct Corridors
  const initTrack = () => {
    const s = stateRef.current;
    s.playerX = 0;
    s.targetX = 0;
    s.crowdCount = 25;
    s.weaponLevel = 1;
    s.score = 0;
    s.lastShotTime = 0;
    s.projectiles = [];
    s.particles = [];
    s.knockoutFans = [];
    s.floatingTexts = [];
    s.trackZ = 0;
    s.gameEnded = false;

    // LEFT CORRIDOR: Member Reinforcements Gates (+5 MEMBROS, x2 BONDE)
    // RIGHT CORRIDOR: Weapon Upgrade Gates (Rojão 12 Tiros, Trovão, Morteiro)
    const gates: GateBlock[] = [];
    const zSpacing = 300;
    for (let i = 1; i <= 10; i++) {
      const zPos = i * zSpacing;

      // Left Sidewalk: Holographic Green/Blue Member Gates
      const memberVal = i === 3 || i === 7 ? 10 : 5;
      gates.push({
        id: `gate_left_${i}`,
        lane: "left",
        x: -0.75,
        z: zPos,
        type: "member",
        val: memberVal,
        label: i === 3 ? "x2 BONDE 🔥" : `+${memberVal} MEMBROS`,
        passed: false,
      });

      // Right Sidewalk: Holographic Yellow Weapon Upgrade Gates
      const wLvl = Math.min(4, Math.floor(i / 2.5) + 1);
      const wInfo = WEAPON_LEVELS[wLvl - 1];
      gates.push({
        id: `gate_right_${i}`,
        lane: "right",
        x: 0.75,
        z: zPos,
        type: "weapon",
        val: wLvl,
        weaponLevel: wLvl,
        label: wInfo.name,
        passed: false,
      });
    }
    s.gates = gates;

    // CENTER CORRIDOR: Red Rival Mobs advancing continuously downwards from top of screen!
    const rivals: RivalMob[] = [];
    for (let j = 1; j <= 9; j++) {
      const rZ = j * 320 + 200;
      const count = (opponentTier === "S" ? 28 : opponentTier === "A" ? 20 : 14) + j * 3;
      rivals.push({
        id: `rival_center_${j}`,
        x: (Math.random() - 0.5) * 0.25, // Center Lane ~ 0.0
        z: rZ,
        speed: 15 + j * 2,
        count,
        maxCount: count,
        defeated: false,
      });
    }
    s.rivals = rivals;
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
      const spreadX = count === 1 ? 0 : (p - (count - 1) / 2) * 0.16;
      s.projectiles.push({
        id: `rocket_${Date.now()}_${p}`,
        x: s.playerX + spreadX,
        y: 16,
        z: s.trackZ + 25,
        vx: spreadX * 0.08,
        vy: 0.05,
        vz: 30, // Rockets fly straight up the center avenue
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

    // 15-second game timer
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

          // Update Track Forward Movement & Player X Interpolation
          s.trackZ += 80 * dt;
          s.playerX += (s.targetX - s.playerX) * 0.16;

          // Auto Fire Rockets
          fireRockets(currentTime);

          // --- UPDATE RED RIVAL MOBS ADVANCING DOWNWARDS ---
          s.rivals.forEach((r) => {
            if (!r.defeated) {
              // Rivals march down towards the player at bottom
              r.z -= r.speed * dt * 0.5;
            }
          });

          // --- UPDATE PROJECTILES FLYING UPWARDS ---
          for (let i = s.projectiles.length - 1; i >= 0; i--) {
            const proj = s.projectiles[i];
            proj.x += proj.vx;
            proj.z += proj.vz;

            // Rocket Trail Particles
            if (Math.random() < 0.6) {
              s.particles.push({
                x: proj.x,
                y: proj.y - 2,
                z: proj.z - 6,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                vz: -2,
                color: proj.color,
                size: 4 + Math.random() * 4,
                alpha: 0.7,
                life: 0,
                maxLife: 0.4,
              });
            }

            // Hit check on Red Rival Mobs in Center Lane
            const hitRival = s.rivals.find(
              (r) => !r.defeated && Math.abs(r.z - proj.z) < 35 && Math.abs(r.x - proj.x) < 0.75
            );
            if (hitRival) {
              s.projectiles.splice(i, 1);
              hitRival.count -= Math.ceil(proj.damage / 3);

              soundManager.playFireworkExplosion();
              for (let p = 0; p < 12; p++) {
                s.particles.push({
                  x: hitRival.x + (Math.random() - 0.5) * 0.5,
                  y: 12 + Math.random() * 10,
                  z: hitRival.z + (Math.random() - 0.5) * 10,
                  vx: (Math.random() - 0.5) * 0.4,
                  vy: (Math.random() - 0.5) * 0.4,
                  vz: (Math.random() - 0.5) * 0.4,
                  color: proj.color,
                  size: 5 + Math.random() * 6,
                  alpha: 1.0,
                  life: 0,
                  maxLife: 0.6,
                });
              }

              if (hitRival.count <= 0) {
                hitRival.defeated = true;
                const pts = hitRival.maxCount * 10;
                s.score += pts;
                setScore(s.score);
                addFloatingText(`+${pts} PTS!`, hitRival.x, 30, hitRival.z, "#facc15");
                spawnKnockoutFans(6, hitRival.x, 10, hitRival.z, rivalTeam);
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

          // --- CHECK GATE COLLISIONS (LEFT = MEMBROS | RIGHT = WEAPONS) ---
          s.gates.forEach((g) => {
            if (!g.passed && Math.abs(g.z - s.trackZ) < 28 && Math.abs(g.x - s.playerX) < 0.65) {
              g.passed = true;
              soundManager.playGateSound(true);

              if (g.type === "member") {
                const added = g.label.includes("x2") ? s.crowdCount : g.val;
                s.crowdCount = Math.min(100, s.crowdCount + added);
                setCrowdCount(s.crowdCount);
                addFloatingText(`+${added} MEMBROS!`, s.playerX, 35, s.trackZ, "#38bdf8");
              } else if (g.type === "weapon" && g.weaponLevel) {
                if (g.weaponLevel > s.weaponLevel) {
                  s.weaponLevel = g.weaponLevel;
                  setWeaponLevel(s.weaponLevel);
                  const wName = WEAPON_LEVELS[g.weaponLevel - 1].name;
                  addFloatingText(`UPGRADE: ${wName}!`, s.playerX, 40, s.trackZ, "#facc15");
                }
              }
            }
          });

          // --- CHECK DIRECT COLLISION OF PLAYER WITH RED RIVAL MOB ---
          s.rivals.forEach((r) => {
            if (!r.defeated && Math.abs(r.z - s.trackZ) < 28 && Math.abs(r.x - s.playerX) < 0.6) {
              r.defeated = true;
              const loss = Math.min(s.crowdCount - 5, Math.ceil(r.count * 0.4));
              s.crowdCount = Math.max(5, s.crowdCount - loss);
              setCrowdCount(s.crowdCount);
              soundManager.playGateSound(false);
              addFloatingText(`-${loss} TORCEDORES`, s.playerX, 35, s.trackZ, "#ef4444");
              spawnKnockoutFans(loss, s.playerX, 8, s.trackZ, playerTeam);
            }
          });

          // --- DRAWING PASS ---
          ctx.clearRect(0, 0, w, h);

          const camZ = s.trackZ - 140;
          const horizonY = h * 0.18;

          // 1. Sky Gradient & Stadium Lights Backdrop
          const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 30);
          skyGrad.addColorStop(0, "#020617");
          skyGrad.addColorStop(0.7, "#0f172a");
          skyGrad.addColorStop(1, "#1e293b");
          ctx.fillStyle = skyGrad;
          ctx.fillRect(0, 0, w, horizonY + 30);

          // Stadium Floodlight Towers at Top Horizon
          const stadiumLights = [
            { x: 0.15 * w, y: horizonY - 20 },
            { x: 0.85 * w, y: horizonY - 20 },
          ];
          stadiumLights.forEach((sl) => {
            const glow = ctx.createRadialGradient(sl.x, sl.y, 2, sl.x, sl.y, 40);
            glow.addColorStop(0, "rgba(254, 240, 138, 0.8)");
            glow.addColorStop(0.5, "rgba(253, 224, 71, 0.3)");
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(sl.x, sl.y, 40, 0, Math.PI * 2);
            ctx.fill();
          });

          // 2. Road Asphalt & 3 Visual Corridors (Left, Center, Right)
          const farZ = s.trackZ + 750;
          const nearZ = Math.max(0, camZ + 45);

          const pRoadNearL = project(-1.65, 0, nearZ, w, h, camZ);
          const pRoadNearR = project(1.65, 0, nearZ, w, h, camZ);
          const pRoadFarL = project(-1.65, 0, farZ, w, h, camZ);
          const pRoadFarR = project(1.65, 0, farZ, w, h, camZ);

          const pSideNearL = project(-2.2, 0, nearZ, w, h, camZ);
          const pSideFarL = project(-2.2, 0, farZ, w, h, camZ);
          const pSideNearR = project(2.2, 0, nearZ, w, h, camZ);
          const pSideFarR = project(2.2, 0, farZ, w, h, camZ);

          if (pRoadNearL && pRoadNearR && pRoadFarL && pRoadFarR) {
            const nearY = Math.min(h, pRoadNearL.y);

            // Sidewalk Left (Green Tint for Member Bonus Lane)
            if (pSideNearL && pSideFarL) {
              ctx.fillStyle = "#0284c7";
              ctx.beginPath();
              ctx.moveTo(pSideNearL.x, nearY);
              ctx.lineTo(pSideFarL.x, pSideFarL.y);
              ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
              ctx.lineTo(pRoadNearL.x, nearY);
              ctx.closePath();
              ctx.fill();
            }

            // Sidewalk Right (Yellow Tint for Weapon Upgrade Lane)
            if (pSideNearR && pSideFarR) {
              ctx.fillStyle = "#d97706";
              ctx.beginPath();
              ctx.moveTo(pRoadNearR.x, nearY);
              ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
              ctx.lineTo(pSideFarR.x, pSideFarR.y);
              ctx.lineTo(pSideNearR.x, nearY);
              ctx.closePath();
              ctx.fill();
            }

            // Central Asphalt Road
            ctx.beginPath();
            ctx.moveTo(pRoadNearL.x, nearY);
            ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
            ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
            ctx.lineTo(pRoadNearR.x, nearY);
            ctx.closePath();

            const roadGrad = ctx.createLinearGradient(0, pRoadFarL.y, 0, nearY);
            roadGrad.addColorStop(0, "#334155");
            roadGrad.addColorStop(0.5, "#475569");
            roadGrad.addColorStop(1, "#64748b");
            ctx.fillStyle = roadGrad;
            ctx.fill();

            // Lane Dividers separating Left, Center, Right Corridors
            const pDivLeftNear = project(-0.45, 0, nearZ, w, h, camZ);
            const pDivLeftFar = project(-0.45, 0, farZ, w, h, camZ);
            const pDivRightNear = project(0.45, 0, nearZ, w, h, camZ);
            const pDivRightFar = project(0.45, 0, farZ, w, h, camZ);

            ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
            ctx.lineWidth = 2;
            ctx.setLineDash([15, 12]);

            if (pDivLeftNear && pDivLeftFar) {
              ctx.beginPath();
              ctx.moveTo(pDivLeftNear.x, pDivLeftNear.y);
              ctx.lineTo(pDivLeftFar.x, pDivLeftFar.y);
              ctx.stroke();
            }
            if (pDivRightNear && pDivRightFar) {
              ctx.beginPath();
              ctx.moveTo(pDivRightNear.x, pDivRightNear.y);
              ctx.lineTo(pDivRightFar.x, pDivRightFar.y);
              ctx.stroke();
            }
            ctx.setLineDash([]);
          }

          // 3. Draw Holographic Gate Panels (Left = Members | Right = Weapons)
          s.gates.forEach((g) => {
            if (g.passed || g.z < camZ + 30 || g.z > camZ + 750) return;

            const pGate = project(g.x, 22, g.z, w, h, camZ);
            if (!pGate) return;

            const isMember = g.type === "member";
            const gateW = Math.max(55, 150 * pGate.scale);
            const gateH = Math.max(48, 115 * pGate.scale);

            ctx.save();
            ctx.translate(pGate.x, pGate.y);

            // Neon Glass Panel
            const glassGrad = ctx.createLinearGradient(0, -gateH / 2, 0, gateH / 2);
            if (isMember) {
              glassGrad.addColorStop(0, "rgba(56, 189, 248, 0.85)");
              glassGrad.addColorStop(1, "rgba(2, 132, 199, 0.95)");
            } else {
              glassGrad.addColorStop(0, "rgba(251, 191, 36, 0.85)");
              glassGrad.addColorStop(1, "rgba(217, 119, 6, 0.95)");
            }

            ctx.fillStyle = glassGrad;
            ctx.beginPath();
            ctx.roundRect(-gateW / 2, -gateH / 2, gateW, gateH, 6 * pGate.scale);
            ctx.fill();

            ctx.strokeStyle = isMember ? "#38bdf8" : "#facc15";
            ctx.lineWidth = Math.max(2, 4 * pGate.scale);
            ctx.stroke();

            // Label Text
            ctx.fillStyle = "#ffffff";
            const fontPx = Math.max(10, Math.floor(gateH * 0.32));
            ctx.font = `900 ${fontPx}px sans-serif`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            if (isMember) {
              ctx.fillText(g.label, 0, -gateH * 0.12);
              ctx.font = `700 ${Math.max(8, Math.floor(fontPx * 0.6))}px sans-serif`;
              ctx.fillStyle = "#e0f2fe";
              ctx.fillText("👥 +RECRUTAR", 0, gateH * 0.25);
            } else {
              const wIcon = WEAPON_LEVELS[(g.weaponLevel || 1) - 1]?.icon || "🚀";
              ctx.fillText(`${wIcon} ${g.label}`, 0, -gateH * 0.15);
              ctx.font = `700 ${Math.max(8, Math.floor(fontPx * 0.6))}px sans-serif`;
              ctx.fillStyle = "#fef08a";
              ctx.fillText("🎆 +ROJÕES", 0, gateH * 0.25);
            }

            ctx.restore();
          });

          // 4. Draw Red Rival Mobs in Center Lane (A Ameaça)
          s.rivals.forEach((r) => {
            if (r.defeated || r.z < camZ + 30 || r.z > camZ + 750) return;

            const pRival = project(r.x, 0, r.z, w, h, camZ);
            if (!pRival) return;

            // Render dense block of rival fans
            const rivalCountDrawn = Math.min(14, Math.ceil(r.count / 2));
            for (let rc = 0; rc < rivalCountDrawn; rc++) {
              const rx = pRival.x + ((rc % 4) - 1.5) * 18 * pRival.scale;
              const ry = pRival.y + Math.floor(rc / 4) * 12 * pRival.scale;
              renderFanAvatar(ctx, rx, ry, pRival.scale * 0.65, rivalTeam, rc + 1, false);
            }

            // Rival Mob Health Bar & Counter
            ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
            ctx.fillRect(pRival.x - 32 * pRival.scale, pRival.y - 48 * pRival.scale, 64 * pRival.scale, 14 * pRival.scale);
            ctx.fillStyle = "#ef4444";
            ctx.fillRect(
              pRival.x - 30 * pRival.scale,
              pRival.y - 46 * pRival.scale,
              60 * pRival.scale * (r.count / r.maxCount),
              10 * pRival.scale
            );
            ctx.fillStyle = "#ffffff";
            ctx.font = `bold ${Math.max(9, Math.floor(11 * pRival.scale))}px sans-serif`;
            ctx.textAlign = "center";
            ctx.fillText(`RIVAIS: ${r.count}`, pRival.x, pRival.y - 53 * pRival.scale);
          });

          // 5. Draw Rockets & Particles
          s.projectiles.forEach((proj) => {
            const pProj = project(proj.x, proj.y, proj.z, w, h, camZ);
            if (!pProj) return;

            const rSize = Math.max(6, 18 * pProj.scale);

            const glow = ctx.createRadialGradient(pProj.x, pProj.y, 2, pProj.x, pProj.y, rSize * 2.2);
            glow.addColorStop(0, "#fef08a");
            glow.addColorStop(0.5, proj.color);
            glow.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(pProj.x, pProj.y, rSize * 2.2, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = proj.color;
            ctx.beginPath();
            ctx.arc(pProj.x, pProj.y, rSize * 0.6, 0, Math.PI * 2);
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
              renderFanAvatar(ctx, pKF.x, pKF.y, pKF.scale * 0.7, kf.team, 1, kf.facingDown);
            }
          });

          // 7. Draw Player Torcida Bonde (At base of screen)
          const pPlayer = project(s.playerX, 0, s.trackZ, w, h, camZ);
          if (pPlayer) {
            const maxFansDrawn = Math.min(s.crowdCount, 30);
            const fanPositions: { x: number; z: number }[] = [];

            for (let i = 0; i < maxFansDrawn; i++) {
              const angle = i * 2.39996;
              const dist = Math.sqrt((i + 1) / maxFansDrawn) * 0.75;
              const fx = s.playerX + Math.cos(angle) * dist * 0.32;
              const fz = s.trackZ + Math.sin(angle) * dist * 14;
              fanPositions.push({ x: fx, z: fz });
            }

            fanPositions.sort((a, b) => b.z - a.z);

            fanPositions.forEach((fan, idx) => {
              const pFan = project(fan.x, 0, fan.z, w, h, camZ);
              if (pFan) {
                renderFanAvatar(ctx, pFan.x, pFan.y, pFan.scale * 0.68, playerTeam, idx, false);
              }
            });
          }

          // 8. Floating Combat Texts
          s.floatingTexts.forEach((ft, fIdx) => {
            ft.y += 15 * dt;
            ft.alpha -= 0.6 * dt;

            const pFt = project(ft.x, ft.y, ft.z, w, h, camZ);
            if (pFt && ft.alpha > 0) {
              ctx.fillStyle = ft.color;
              ctx.globalAlpha = ft.alpha;
              ctx.font = `900 ${Math.max(12, Math.floor(18 * pFt.scale))}px sans-serif`;
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
    s.targetX = Math.max(-0.92, Math.min(0.92, s.dragStartPlayerX + normDelta));
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
            Mecânica de Escolha Lateral
          </h3>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed text-left">
          <strong>Como Jogar:</strong> Arraste o bonde na base da tela para escolher sua estratégia:
        </p>
        <ul className="text-[11px] text-zinc-400 text-left space-y-1.5 list-disc pl-4">
          <li>
            <span className="text-sky-400 font-bold">⬅️ Lateral Esquerda (Bonde)</span>: Portões Verdes/Azuis para recrutar mais membros (`+5 MEMBROS`, `x2 BONDE`)!
          </li>
          <li>
            <span className="text-red-400 font-bold">⚔️ Centro (A Ameaça)</span>: Horda rival vindo do estádio. Dispare rojões continuamente para abrir caminho!
          </li>
          <li>
            <span className="text-amber-400 font-bold">➡️ Lateral Direita (Rojões)</span>: Portões Amarelos para evoluir os rojões (12 Tiros, Trovão, Morteiro)!
          </li>
        </ul>

        <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-xl text-[10px] font-mono text-amber-400 w-full text-left">
          ⏱️ Duração: 15s • Meta Rank S: 500+ Pts & 40+ Torcedores
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

      {/* 3D Shooter Canvas */}
      <div
        className="relative w-full h-72 rounded-xl overflow-hidden border border-zinc-800 cursor-grab active:cursor-grabbing touch-none"
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

      {/* Strategic Decision Lane Selector Buttons */}
      <div className="grid grid-cols-3 w-full gap-1.5 pt-1">
        <button
          onClick={() => {
            stateRef.current.targetX = -0.75;
          }}
          className="py-2 px-1 rounded-xl bg-sky-950/80 border border-sky-600 hover:bg-sky-900 text-sky-300 font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
        >
          <Users className="w-3.5 h-3.5 text-sky-400" />
          <span>⬅️ BONDE</span>
        </button>

        <button
          onClick={() => {
            stateRef.current.targetX = 0.0;
          }}
          className="py-2 px-1 rounded-xl bg-red-950/80 border border-red-600 hover:bg-red-900 text-red-300 font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
        >
          <Swords className="w-3.5 h-3.5 text-red-400" />
          <span>⚔️ CENTRO</span>
        </button>

        <button
          onClick={() => {
            stateRef.current.targetX = 0.75;
          }}
          className="py-2 px-1 rounded-xl bg-amber-950/80 border border-amber-600 hover:bg-amber-900 text-amber-300 font-black text-[10px] uppercase flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>➡️ ROJÕES</span>
        </button>
      </div>
    </div>
  );
};
