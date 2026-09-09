import React, { useEffect, useRef } from 'react';
import { Gate, TrackItem, Projectile, Particle, FloatingText, RunnerTeam, Upgrades, CameraMode } from '../../lib/runner_types';
import { soundManager } from '../../lib/runner_audio';

interface GameCanvasProps {
  playerTeam: RunnerTeam;
  rivalTeam: RunnerTeam;
  upgrades: Upgrades;
  stage: 'menu' | 'playing' | 'clash' | 'victory' | 'defeat';
  crowdCount: number;
  ironBars: number;
  fireworks: number;
  flaresActive: number;
  level: number;
  onUpdateStats: (stats: {
    crowdCount: number;
    ironBars: number;
    fireworks: number;
    flaresActive: number;
    distanceProgress: number;
  }) => void;
  onReachClash: (finalStats: {
    crowdCount: number;
    ironBars: number;
    fireworks: number;
    flaresActive: number;
    playerPower: number;
    rivalCount: number;
    rivalPower: number;
  }) => void;
  onClashResolved: (result: {
    won: boolean;
    survivors: number;
    coinsEarned: number;
    playerPower: number;
    rivalPower: number;
  }) => void;
  triggerFireworkSignal?: number;
  steerSignal?: { dir: 'left' | 'right'; timestamp: number };
  speedFactor?: number;
  cameraMode?: CameraMode;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  playerTeam,
  rivalTeam,
  upgrades,
  stage,
  crowdCount,
  ironBars,
  fireworks,
  flaresActive,
  level,
  onUpdateStats,
  onReachClash,
  onClashResolved,
  triggerFireworkSignal = 0,
  steerSignal,
  speedFactor = 1.0,
  cameraMode = 'top_down',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // State refs to keep loop at 60fps without react re-render stalls
  const stateRef = useRef({
    stage,
    crowdCount,
    ironBars,
    fireworks,
    flaresActive,
    level,
    playerTeam,
    rivalTeam,
    upgrades,
    playerX: 0, // -1.4 to 1.4 road coords
    playerZ: 0,
    targetX: 0,
    speed: 3.5 * speedFactor, // Calm, responsive pace for smooth gate runner gameplay
    speedFactor,
    cameraMode,
    isDragging: false,
    dragStartX: 0,
    dragStartPlayerX: 0,
    trackLength: 2600 + Math.min(level * 400, 2000),
    gates: [] as Gate[],
    items: [] as TrackItem[],
    projectiles: [] as Projectile[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    knockoutFans: [] as {
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      rotation: number;
      vRot: number;
      scale: number;
      team: RunnerTeam;
      life: number;
      maxLife: number;
      facingDown: boolean;
    }[],
    rivalCount: (rivalTeam.contingent || 75) + Math.min((level - 1) * 3, 18),
    rivalPower: Math.round(((rivalTeam.contingent || 75) + Math.min((level - 1) * 3, 18)) * ((rivalTeam.pistaOverall || 88) * 1.6) * (1 + (level - 1) * 0.04)),
    clashTimer: 0,
    clashImpactTimer: 0,
    clashInitialPlayerCount: 0,
    clashInitialRivalCount: 0,
    clashPlayerPower: 0,
    clashRivalPower: 0,
    clashMaxPlayerPower: 1,
    clashMaxRivalPower: 1,
    clashResolved: false,
    cameraShake: 0,
    rivalRocketTimer: 3.2,
    mobLean: 0,
    cameraRoll: 0,
    cameraZoomImpulse: 0,
    redFlashTimer: 0,
    dustTimer: 0,
  });

  // Keep state sync with props (except during active clash battle where counts tick down dynamically)
  useEffect(() => {
    stateRef.current.stage = stage;
    if (stage !== 'clash') {
      stateRef.current.crowdCount = crowdCount;
    }
    stateRef.current.ironBars = ironBars;
    stateRef.current.fireworks = fireworks;
    stateRef.current.flaresActive = flaresActive;
    stateRef.current.level = level;
    stateRef.current.playerTeam = playerTeam;
    stateRef.current.rivalTeam = rivalTeam;
    stateRef.current.upgrades = upgrades;
    stateRef.current.speed = 3.5 * speedFactor;
    stateRef.current.cameraMode = cameraMode;
  }, [stage, crowdCount, ironBars, fireworks, flaresActive, level, playerTeam, rivalTeam, upgrades, speedFactor, cameraMode]);

  // Helper to spawn bonequinhos flying through the air when hit or defeated
  const spawnKnockoutFans = (
    count: number,
    baseX: number,
    baseY: number,
    baseZ: number,
    team: RunnerTeam,
    facingDown: boolean
  ) => {
    const s = stateRef.current;
    const num = Math.min(8, Math.max(1, count));
    for (let k = 0; k < num; k++) {
      s.knockoutFans.push({
        x: baseX + (Math.random() - 0.5) * 0.7,
        y: baseY + (Math.random() - 0.5) * 4,
        z: baseZ + (Math.random() - 0.5) * 12,
        vx: (Math.random() - 0.5) * 0.14,
        vy: -(4 + Math.random() * 5),
        vz: (facingDown ? 1 : -1) * (1.5 + Math.random() * 3),
        rotation: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        scale: 1,
        team,
        life: 0,
        maxLife: 0.65,
        facingDown,
      });
    }
  };

  // Handle external manual firework launch signal
  useEffect(() => {
    if (triggerFireworkSignal > 0 && stateRef.current.fireworks > 0) {
      launchFireworks(3);
    }
  }, [triggerFireworkSignal]);

  // Handle external mobile steer button signal
  useEffect(() => {
    if (!steerSignal) return;
    const s = stateRef.current;
    if (s.stage !== 'playing') return;
    const maxSteer = s.cameraMode === 'top_down' ? 0.95 : 0.85;
    if (steerSignal.dir === 'left') {
      s.targetX = Math.max(-maxSteer, s.targetX - 0.40);
    } else if (steerSignal.dir === 'right') {
      s.targetX = Math.min(maxSteer, s.targetX + 0.40);
    }
  }, [steerSignal]);

  const launchFireworks = (count = 2) => {
    const s = stateRef.current;
    if (s.fireworks <= 0) return;

    const actualLaunch = Math.min(count, s.fireworks);
    s.fireworks -= actualLaunch;
    soundManager.playFireworkLaunch();

    for (let i = 0; i < actualLaunch; i++) {
      const offsetX = (Math.random() - 0.5) * 0.8;
      s.projectiles.push({
        id: `proj_${Date.now()}_${Math.random()}`,
        x: s.playerX + offsetX,
        y: 15,
        z: s.playerZ + 20,
        vx: (Math.random() - 0.5) * 0.04,
        vy: 0.1,
        vz: 16 + Math.random() * 4,
        color: Math.random() > 0.5 ? '#f59e0b' : '#ef4444',
        exploded: false,
      });
    }

    onUpdateStats({
      crowdCount: s.crowdCount,
      ironBars: s.ironBars,
      fireworks: s.fireworks,
      flaresActive: s.flaresActive,
      distanceProgress: s.playerZ / s.trackLength,
    });
  };

  // Generate track on mount or reset
  const initTrack = () => {
    const s = stateRef.current;
    const len = 2600 + Math.min(s.level * 400, 2000);
    s.trackLength = len;
    s.playerZ = 0;
    s.playerX = 0;
    s.targetX = 0;
    s.projectiles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.clashTimer = 0;
    s.clashResolved = false;

    // Rivals at end calculated from rival torcida contingent and pista overall
    const baseRivalContingent = (s.rivalTeam.contingent || 75) + Math.min((s.level - 1) * 3, 18);
    s.rivalCount = baseRivalContingent;
    const rivalPistaFactor = (s.rivalTeam.pistaOverall || 88) * 1.6;
    s.rivalPower = Math.round(baseRivalContingent * rivalPistaFactor * (1 + (s.level - 1) * 0.04));

    // Player baseline contingent based on chosen torcida
    const basePlayerContingent = (s.playerTeam.contingent || 75) + s.upgrades.startingMembers * 2;
    s.crowdCount = basePlayerContingent;

    // Generate gates: realistic reinforcements that respect the ±20% crowd dynamic
    const gateZPositions = [350, 750, 1150, 1550, 1950, 2350, 2750].filter((z) => z < len - 300);
    s.gates = [];

    gateZPositions.forEach((z, idx) => {
      const isEarly = idx === 0;
      let leftType: 'add' | 'sub' = 'add';
      let rightType: 'add' | 'sub' = 'add';
      let leftVal = 6;
      let rightVal = 8;
      let leftLabel = '';
      let rightLabel = '';

      if (isEarly) {
        leftType = 'add';
        leftVal = 5 + Math.min(s.level, 4);
        leftLabel = `+${leftVal} Bateria`;

        rightType = 'add';
        rightVal = 8 + Math.min(s.level, 4);
        rightLabel = `+${rightVal} Caravana`;
      } else {
        const scenario = Math.random();
        if (scenario < 0.45) {
          leftType = 'add';
          leftVal = 4 + Math.floor(Math.random() * 5);
          leftLabel = `+${leftVal} Bonde`;

          rightType = 'add';
          rightVal = 7 + Math.floor(Math.random() * 6);
          rightLabel = `+${rightVal} Aliados`;
        } else if (scenario < 0.75) {
          leftType = 'sub';
          leftVal = -(3 + Math.floor(Math.random() * 4));
          leftLabel = `${leftVal} Emboscada`;

          rightType = 'add';
          rightVal = 6 + Math.floor(Math.random() * 5);
          rightLabel = `+${rightVal} Trem`;
        } else {
          leftType = 'add';
          leftVal = 5 + Math.floor(Math.random() * 4);
          leftLabel = `+${leftVal} Bandeirão`;

          rightType = 'sub';
          rightVal = -(4 + Math.floor(Math.random() * 3));
          rightLabel = `${rightVal} Blitz`;
        }
      }

      s.gates.push({
        id: `gate_${idx}_l`,
        z,
        lane: 'left',
        type: leftType,
        value: leftVal,
        label: leftLabel,
        passed: false,
      });

      s.gates.push({
        id: `gate_${idx}_r`,
        z,
        lane: 'right',
        type: rightType,
        value: rightVal,
        label: rightLabel,
        passed: false,
      });
    });

    // Generate items
    s.items = [];
    let itemId = 0;
    for (let z = 140; z < len - 220; z += 90 + Math.random() * 70) {
      if (s.gates.some((g) => Math.abs(g.z - z) < 60)) continue;
      const roll = Math.random();

      if (roll < 0.38) {
        // Barras de Ferro (Iron bars in clusters)
        const lx = (Math.random() - 0.5) * 1.5;
        const count = 2 + Math.floor(Math.random() * 3);
        for (let k = 0; k < count; k++) {
          s.items.push({
            id: `iron_${itemId++}`,
            x: Math.max(-1.3, Math.min(1.3, lx + (k - count / 2) * 0.2)),
            z: z + k * 18,
            type: 'iron_bar',
            collected: false,
          });
        }
      } else if (roll < 0.68) {
        // Rojões (Fireworks)
        s.items.push({
          id: `fw_${itemId++}`,
          x: (Math.random() - 0.5) * 1.6,
          z,
          type: 'firework',
          collected: false,
        });
      } else if (roll < 0.82) {
        // Sinalizador ou Bumbo
        s.items.push({
          id: `flare_${itemId++}`,
          x: (Math.random() - 0.5) * 1.4,
          z,
          type: Math.random() > 0.5 ? 'flare' : 'drum',
          collected: false,
        });
      } else if (roll < 0.92) {
        // Bomba explosiva no caminho com pavio e raio de explosão
        s.items.push({
          id: `bomb_${itemId++}`,
          x: (Math.random() - 0.5) * 1.4,
          z,
          type: 'bomb',
          collected: false,
          fuseTimer: 2.2,
          exploded: false,
          explosionRadius: 0.55,
        });
      } else if (s.level > 1) {
        // Barricada quebrável
        s.items.push({
          id: `barricade_${itemId++}`,
          x: Math.random() > 0.5 ? 0.55 : -0.55,
          z,
          type: 'barricade',
          collected: false,
          hp: 2,
          maxHp: 2,
        });
      }
    }
  };

  useEffect(() => {
    initTrack();
  }, [level]);

  // Keyboard controls for desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = stateRef.current;
      if (s.stage !== 'playing') return;

      const maxSteer = s.cameraMode === 'top_down' ? 0.95 : 0.85;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.targetX = Math.max(-maxSteer, s.targetX - 0.35);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.targetX = Math.min(maxSteer, s.targetX + 0.35);
      } else if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        launchFireworks(2);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main game loop and canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = parent.clientWidth * dpr;
        canvas.height = parent.clientHeight * dpr;
      }
    };
    resize();
    window.addEventListener('resize', resize);

    // Render loop
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      const s = stateRef.current;

      // UPDATE LOGIC
      if (s.stage === 'playing') {
        const basePlayerContingent = (s.playerTeam.contingent || 75) + s.upgrades.startingMembers * 2;
        const minAllowedCrowd = Math.round(basePlayerContingent * 0.8);
        const maxAllowedCrowd = Math.round(basePlayerContingent * 1.2);

        // Move forward along avenue
        s.playerZ += s.speed * (dt * 60);

        // Smoothly interpolate player X with high responsiveness
        s.playerX += (s.targetX - s.playerX) * 0.22;
        const maxBound = s.cameraMode === 'top_down' ? 0.95 : 0.85;
        s.playerX = Math.max(-maxBound, Math.min(maxBound, s.playerX));

        // Mob turn lean & camera tilt dynamics
        const targetLean = (s.targetX - s.playerX) * 0.45;
        s.mobLean += (targetLean - s.mobLean) * 0.22;
        const targetRoll = -s.mobLean * 0.035;
        s.cameraRoll += (targetRoll - s.cameraRoll) * 0.15;

        // Camera impulse zoom & red damage vignette decay
        s.cameraZoomImpulse *= 0.88;
        s.redFlashTimer = Math.max(0, s.redFlashTimer - dt);

        // Ground foot dust puffs while running
        s.dustTimer += dt;
        if (s.dustTimer > 0.08) {
          s.dustTimer = 0;
          s.particles.push({
            x: s.playerX + (Math.random() - 0.5) * 0.5,
            y: 0,
            z: s.playerZ + (Math.random() - 0.5) * 8,
            vx: (Math.random() - 0.5) * 0.02,
            vy: 0.03 + Math.random() * 0.03,
            vz: -2 - Math.random() * 2,
            color: 'rgba(226, 232, 240, 0.35)',
            size: 3 + Math.random() * 3,
            alpha: 0.4,
            life: 0,
            maxLife: 0.4,
            isSmoke: true,
          });
        }

        // Auto launch rojão if we have plenty and see barricades/targets ahead
        const nearBarricade = s.items.find(
          (it) => it.type === 'barricade' && !it.collected && it.z > s.playerZ && it.z - s.playerZ < 250
        );
        if (nearBarricade && s.fireworks > 0 && Math.random() < 0.08) {
          launchFireworks(1);
        }

        // Rival torcida shooting firework rockets down the avenue towards player!
        s.rivalRocketTimer -= dt;
        if (s.rivalRocketTimer <= 0 && s.playerZ < s.trackLength - 260) {
          s.rivalRocketTimer = Math.max(3.2, 5.5 - s.level * 0.3) + Math.random() * 1.5;
          // Spawn rival rocket in a distinct lane with plenty of anticipation distance
          const targetLaneX = Math.max(-1.25, Math.min(1.25, s.playerX + (Math.random() - 0.5) * 0.9));
          s.projectiles.push({
            id: 'rival_fw_' + Math.random(),
            x: targetLaneX,
            y: 16,
            z: s.playerZ + 420,
            vx: 0,
            vy: 0,
            vz: -(4.0 + Math.min(s.level * 0.25, 2.0)),
            color: '#ef4444',
            exploded: false,
            isRival: true,
            damage: 4 + Math.min(s.level, 5),
          });
          soundManager.playFireworkLaunch();
        }

        // Check Gates collision
        s.gates.forEach((gate) => {
          if (!gate.passed && Math.abs(gate.z - s.playerZ) < 30) {
            // Check if player crowd intersects lane
            // Left lane: x < 0, Right lane: x > 0
            const inLane = gate.lane === 'left' ? s.playerX < 0.2 : s.playerX > -0.2;
            if (inLane) {
              gate.passed = true;

              if (gate.type === 'add') {
                const added = Math.min(gate.value, maxAllowedCrowd - s.crowdCount);
                s.crowdCount = Math.min(maxAllowedCrowd, s.crowdCount + gate.value);
                soundManager.playGateSound(true);
                s.cameraZoomImpulse = 0.05;
                addFloatingText(`+${gate.value}`, 0, -40, '#22c55e');
              } else if (gate.type === 'sub') {
                const lost = Math.min(Math.abs(gate.value), Math.max(0, s.crowdCount - minAllowedCrowd));
                s.crowdCount = Math.max(minAllowedCrowd, s.crowdCount + gate.value);
                if (lost > 0) {
                  spawnKnockoutFans(lost, s.playerX, 8, s.playerZ, s.playerTeam, false);
                }
                soundManager.playGateSound(false);
                s.cameraShake = 0;
                s.redFlashTimer = 0;
                addFloatingText(`${gate.value}`, 0, -40, '#ef4444');
              }

              // Gate burst particles
              createSparks(gate.lane === 'left' ? -0.8 : 0.8, 10, gate.z, gate.type === 'sub' ? '#ef4444' : '#22c55e', 25);
            }
          }
        });

        // Check Items update & collision
        s.items.forEach((item) => {
          if (item.collected) return;

          // Road Bomb ticking and detonation mechanics
          if (item.type === 'bomb') {
            const distZ = item.z - s.playerZ;
            // When player approaches within 150m, bomb starts ticking down!
            if (distZ < 150 && distZ > -20) {
              item.fuseTimer = Math.max(0, (item.fuseTimer ?? 2.2) - dt);
              if (Math.random() < 0.4) {
                createSparks(item.x, 6, item.z, '#fbbf24', 2);
              }

              // Timer expired: BOOM!
              if (item.fuseTimer <= 0 && !item.exploded) {
                item.exploded = true;
                item.collected = true;
                soundManager.playFireworkExplosion();
                s.cameraShake = 0;
                createSparks(item.x, 10, item.z, '#ef4444', 12);
                createSparks(item.x, 12, item.z, '#f97316', 25);

                // Check if player mob is caught inside blast radius!
                const latDist = Math.abs(item.x - s.playerX);
                const zDist = Math.abs(item.z - s.playerZ);
                const blastRadius = (item.explosionRadius || 0.55) + 0.35;
                if (zDist < 32 && latDist < blastRadius) {
                  const maxLoss = Math.max(0, s.crowdCount - minAllowedCrowd);
                  const lost = Math.min(maxLoss, Math.min(6, Math.max(2, Math.floor(s.crowdCount * 0.08))));
                  s.crowdCount = Math.max(minAllowedCrowd, s.crowdCount - lost);
                  if (lost > 0) {
                    spawnKnockoutFans(lost, s.playerX, 8, s.playerZ, s.playerTeam, false);
                    addFloatingText(`-${lost}`, 0, -45, '#ef4444');
                  }
                }
              }
            }

            // Direct collision with unexploded bomb
            if (!item.exploded && Math.abs(item.z - s.playerZ) < 22 && Math.abs(item.x - s.playerX) < 0.45) {
              item.exploded = true;
              item.collected = true;
              soundManager.playFireworkExplosion();
              s.cameraShake = 0;
              createSparks(item.x, 10, item.z, '#ef4444', 12);
              createSparks(item.x, 12, item.z, '#f97316', 30);
              const maxLoss = Math.max(0, s.crowdCount - minAllowedCrowd);
              const lost = Math.min(maxLoss, Math.min(7, Math.max(2, Math.floor(s.crowdCount * 0.1))));
              s.crowdCount = Math.max(minAllowedCrowd, s.crowdCount - lost);
              if (lost > 0) {
                spawnKnockoutFans(lost, s.playerX, 8, s.playerZ, s.playerTeam, false);
                addFloatingText(`-${lost}`, 0, -45, '#ef4444');
              }
            }
            return;
          }

          // Other items collision with player
          if (Math.abs(item.z - s.playerZ) < 25) {
            const dist = Math.abs(item.x - s.playerX);
            const radius = Math.min(0.8, 0.35 + (s.crowdCount / 100) * 0.3);

            if (dist < radius) {
              if (item.type === 'iron_bar') {
                item.collected = true;
                s.ironBars += 1;
                soundManager.playIronBarPickup();
                addFloatingText('+1 ⚔️', 0, -30, '#38bdf8');
                createSparks(item.x, 8, item.z, '#e2e8f0', 12);
              } else if (item.type === 'firework') {
                item.collected = true;
                s.fireworks += 2;
                soundManager.playGateSound(true);
                addFloatingText('+2 🎆', 0, -35, '#f59e0b');
                createSparks(item.x, 8, item.z, '#f59e0b', 16);
                if (Math.random() > 0.4) {
                  launchFireworks(1);
                }
              } else if (item.type === 'flare') {
                item.collected = true;
                s.flaresActive += 1;
                soundManager.playGateSound(true);
                addFloatingText('+1 🔥', 0, -45, s.playerTeam.accentColor);
                createSparks(item.x, 5, item.z, s.playerTeam.accentColor, 20);
              } else if (item.type === 'drum') {
                item.collected = true;
                soundManager.playGateSound(true);
                addFloatingText('+1 🥁', 0, -35, '#38bdf8');
              } else if (item.type === 'barricade') {
                item.collected = true;
                const maxLoss = Math.max(0, s.crowdCount - minAllowedCrowd);
                const lost = Math.min(maxLoss, Math.min(5, Math.max(1, Math.floor(s.crowdCount * 0.07))));
                s.crowdCount = Math.max(minAllowedCrowd, s.crowdCount - lost);
                if (lost > 0) {
                  spawnKnockoutFans(lost, s.playerX, 8, s.playerZ, s.playerTeam, false);
                  addFloatingText(`-${lost}`, 0, -40, '#ef4444');
                }
                s.cameraShake = 0;
                soundManager.playGateSound(false);
                createSparks(item.x, 10, item.z, '#78716c', 20);
              }
            }
          }
        });

        // Update projectiles (Rojões do jogador e Rojões rivais)
        for (let i = s.projectiles.length - 1; i >= 0; i--) {
          const p = s.projectiles[i];
          p.z += p.vz * (dt * 60);
          p.x += p.vx * (dt * 60);
          p.y += (Math.sin(currentTime * 0.02 + i) * 0.8) * (dt * 60);

          if (p.isRival) {
            // Fiery trail behind incoming rival rocket
            for (let tCount = 0; tCount < 2; tCount++) {
              s.particles.push({
                x: p.x + (Math.random() - 0.5) * 0.08,
                y: p.y + (Math.random() - 0.5) * 3,
                z: p.z + 5 + Math.random() * 8,
                vx: (Math.random() - 0.5) * 0.04,
                vy: (Math.random() - 0.5) * 0.04,
                vz: 3,
                color: Math.random() > 0.4 ? '#ef4444' : '#f59e0b',
                size: 5 + Math.random() * 3,
                alpha: 0.95,
                life: 0,
                maxLife: 0.4,
                isSpark: true,
              });
            }

            // Check collision of rival rocket with player mob!
            if (Math.abs(p.z - s.playerZ) < 22) {
              const playerWidth = Math.min(0.75, 0.35 + (s.crowdCount / 100) * 0.25);
              if (Math.abs(p.x - s.playerX) < playerWidth) {
                // Direct strike on player mob!
                p.exploded = true;
                soundManager.playFireworkExplosion();
                const maxLoss = Math.max(0, s.crowdCount - minAllowedCrowd);
                const lost = Math.min(maxLoss, Math.min(p.damage || 4, Math.max(1, Math.floor(s.crowdCount * 0.06))));
                s.crowdCount = Math.max(minAllowedCrowd, s.crowdCount - lost);
                if (lost > 0) {
                  spawnKnockoutFans(lost, s.playerX, 8, s.playerZ, s.playerTeam, false);
                  addFloatingText(`-${lost}`, 0, -45, '#ef4444');
                }
                s.cameraShake = 0;
                createSparks(p.x, 10, p.z, '#ef4444', 35);
              }
            }

            // Rival rocket passed behind player without hitting
            if (p.z < s.playerZ - 30) {
              p.exploded = true;
              createSparks(p.x, 2, p.z, '#78716c', 10);
            }
          } else {
            // Player's forward rocket
            if (Math.random() < 0.6) {
              s.particles.push({
                x: p.x,
                y: p.y,
                z: p.z - 5,
                vx: (Math.random() - 0.5) * 0.05,
                vy: (Math.random() - 0.5) * 0.05,
                vz: -2,
                color: '#fbbf24',
                size: 3 + Math.random() * 2,
                alpha: 0.9,
                life: 0,
                maxLife: 0.35,
                isSpark: true,
              });
            }

            // Intercept incoming rival rockets in midair!
            const hitRivalRocket = s.projectiles.find(
              (rp) => rp.isRival && !rp.exploded && Math.abs(rp.z - p.z) < 28 && Math.abs(rp.x - p.x) < 0.65
            );
            if (hitRivalRocket) {
              p.exploded = true;
              hitRivalRocket.exploded = true;
              soundManager.playFireworkExplosion();
              addFloatingText('Interceptado!', 0, -50, '#38bdf8');
              createSparks((p.x + hitRivalRocket.x) / 2, 14, (p.z + hitRivalRocket.z) / 2, '#38bdf8', 12);
              s.cameraShake = 0;
            }

            // Check if player projectile hits barricade
            const hitBarricade = s.items.find(
              (it) => it.type === 'barricade' && !it.collected && Math.abs(it.z - p.z) < 22 && Math.abs(it.x - p.x) < 0.65
            );

            if (hitBarricade) {
              p.exploded = true;
              hitBarricade.collected = true;
              soundManager.playFireworkExplosion();
              addFloatingText('Destruído!', 0, -40, '#f59e0b');
              createSparks(hitBarricade.x, 12, hitBarricade.z, '#f97316', 12);
              s.cameraShake = 0;
            }

            // Check if player projectile hits bomb (detonates it safely ahead!)
            const hitBomb = s.items.find(
              (it) => it.type === 'bomb' && !it.collected && Math.abs(it.z - p.z) < 25 && Math.abs(it.x - p.x) < 0.65
            );

            if (hitBomb) {
              p.exploded = true;
              hitBomb.exploded = true;
              hitBomb.collected = true;
              soundManager.playFireworkExplosion();
              addFloatingText('Desarmado!', 0, -45, '#22c55e');
              createSparks(hitBomb.x, 10, hitBomb.z, '#22c55e', 12);
              s.cameraShake = 0;
            }

            // Check if projectile reached rival torcida at track end
            if (p.z >= s.trackLength - 50) {
              p.exploded = true;
              soundManager.playFireworkExplosion();
              createSparks(p.x, 15, s.trackLength, '#f59e0b', 35);
              s.rivalPower = Math.max(10, s.rivalPower - 80);
              s.rivalCount = Math.max(5, s.rivalCount - 3);
              addFloatingText('-80 PODER RIVAL! 💥', 0, -60, '#f97316');
            }
          }

          if (p.z > s.trackLength + 100 || p.exploded) {
            s.projectiles.splice(i, 1);
          }
        }

        // Calculate and update stats incorporating pista overall and ±20% limits
        const ironBonus = (s.upgrades.ironBarPower + 1) * 25;
        const moraleBonus = 1 + s.upgrades.crowdMorale * 0.15;
        const pistaFactor = (s.playerTeam.pistaOverall || 88) * 1.6;

        const basePower = Math.round(basePlayerContingent * pistaFactor * moraleBonus);
        const minAllowedPower = Math.round(basePower * 0.8);
        const maxAllowedPower = Math.round(basePower * 1.2);

        const currentRawPower = Math.round(
          s.crowdCount * pistaFactor * moraleBonus + s.ironBars * ironBonus + s.fireworks * 40
        );
        const totalCombatPower = Math.max(minAllowedPower, Math.min(maxAllowedPower, currentRawPower));

        onUpdateStats({
          crowdCount: s.crowdCount,
          ironBars: s.ironBars,
          fireworks: s.fireworks,
          flaresActive: s.flaresActive,
          distanceProgress: Math.min(1, s.playerZ / s.trackLength),
        });

        // Check if reached final confrontation zone
        if (s.playerZ >= s.trackLength) {
          s.stage = 'clash';
          s.clashTimer = 0;
          s.clashImpactTimer = 0;
          s.clashResolved = false;

          const finalPower = totalCombatPower;
          s.clashPlayerPower = finalPower;
          s.clashRivalPower = s.rivalPower;
          s.clashMaxPlayerPower = finalPower;
          s.clashMaxRivalPower = s.rivalPower;
          s.clashInitialPlayerCount = Math.max(1, s.crowdCount);
          s.clashInitialRivalCount = Math.max(1, s.rivalCount);

          onReachClash({
            crowdCount: s.crowdCount,
            ironBars: s.ironBars,
            fireworks: s.fireworks,
            flaresActive: s.flaresActive,
            playerPower: finalPower,
            rivalCount: s.rivalCount,
            rivalPower: s.rivalPower,
          });

          // Empty all fireworks onto rival in cinematic volley
          for (let f = 0; f < Math.min(8, s.fireworks); f++) {
            setTimeout(() => {
              launchFireworks(1);
            }, f * 180);
          }
        }
      }

      // CLASH PHASE SIMULATION (Torcidas engage and bonequinhos diminish in real time!)
      if (s.stage === 'clash') {
        s.clashTimer += dt;
        s.clashImpactTimer += dt;
        s.cameraShake = Math.sin(s.clashTimer * 20) * 3;

        // Player crowd advances to front collision line
        if (s.playerZ < s.trackLength + 18) {
          s.playerZ += 1.6 * (dt * 60);
        }

        const clashDuration = 3.6;
        const progress = Math.min(1, s.clashTimer / clashDuration);

        // Effective combat prowess includes Pista Overall and Pista Defense!
        const playerCombatFactor = ((s.playerTeam.pistaOverall || 88) / 85) * ((s.playerTeam.pistaDefense || 85) / 85);
        const rivalCombatFactor = ((s.rivalTeam.pistaOverall || 88) / 85) * ((s.rivalTeam.pistaDefense || 85) / 85);

        const playerEffectivePower = s.clashMaxPlayerPower * playerCombatFactor;
        const rivalEffectivePower = s.clashMaxRivalPower * rivalCombatFactor;

        const playerWins = playerEffectivePower >= rivalEffectivePower;

        // Target ending numbers for both crowds
        const targetPlayer = playerWins
          ? Math.max(1, Math.round(s.clashInitialPlayerCount * Math.max(0.2, (playerEffectivePower - rivalEffectivePower * 0.5) / playerEffectivePower)))
          : 0;
        const targetRival = playerWins
          ? 0
          : Math.max(1, Math.round(s.clashInitialRivalCount * Math.max(0.2, (rivalEffectivePower - playerEffectivePower * 0.5) / rivalEffectivePower)));

        // Interpolate counts downwards over the duration of the combat
        const currentTargetP = Math.round(s.clashInitialPlayerCount - (s.clashInitialPlayerCount - targetPlayer) * progress);
        const currentTargetR = Math.round(s.clashInitialRivalCount - (s.clashInitialRivalCount - targetRival) * progress);

        // Visually eliminate player bonequinhos
        if (s.crowdCount > currentTargetP) {
          const lost = s.crowdCount - currentTargetP;
          s.crowdCount = currentTargetP;
          spawnKnockoutFans(lost, s.playerX, 5, s.playerZ + 6, s.playerTeam, false);
          createSparks(s.playerX + (Math.random() - 0.5) * 0.6, 12, s.trackLength + 26, s.playerTeam.primaryColor, 8);
        }

        // Visually eliminate rival bonequinhos
        if (s.rivalCount > currentTargetR) {
          const lost = s.rivalCount - currentTargetR;
          s.rivalCount = currentTargetR;
          spawnKnockoutFans(lost, (Math.random() - 0.5) * 0.8, 5, s.trackLength + 28, s.rivalTeam, true);
          createSparks((Math.random() - 0.5) * 0.6, 12, s.trackLength + 26, s.rivalTeam.primaryColor, 8);
        }

        // Update real-time power display in sync with crowd count
        s.clashPlayerPower = Math.round(s.clashMaxPlayerPower * (s.crowdCount / Math.max(1, s.clashInitialPlayerCount)));
        s.clashRivalPower = Math.round(s.clashMaxRivalPower * (s.rivalCount / Math.max(1, s.clashInitialRivalCount)));

        // Sound beat and spark bursts of clash
        if (s.clashImpactTimer > 0.16) {
          s.clashImpactTimer = 0;
          soundManager.playClashImpact();
          createSparks(
            (Math.random() - 0.5) * 1.2,
            12,
            s.trackLength + 26,
            Math.random() > 0.5 ? s.playerTeam.primaryColor : s.rivalTeam.primaryColor,
            8
          );
        }

        // Determine outcome after showdown duration
        if (!s.clashResolved && s.clashTimer >= clashDuration) {
          s.clashResolved = true;
          const won = playerWins;
          if (won) {
            s.rivalCount = 0;
            s.clashRivalPower = 0;
          } else {
            s.crowdCount = 0;
            s.clashPlayerPower = 0;
          }
          const survivors = won ? Math.max(1, s.crowdCount) : 0;
          const coinsEarned = won ? 50 + s.level * 30 + Math.floor(survivors * 1.5) : 15;

          if (won) {
            soundManager.playVictoryFanfare();
          }

          setTimeout(() => {
            onClashResolved({
              won,
              survivors,
              coinsEarned,
              playerPower: s.clashMaxPlayerPower,
              rivalPower: s.clashMaxRivalPower,
            });
          }, 700);
        }
      }

      // UPDATE PARTICLES
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.life += dt;
        p.x += p.vx * (dt * 60);
        p.y += p.vy * (dt * 60);
        p.z += p.vz * (dt * 60);
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          s.particles.splice(i, 1);
        }
      }

      // UPDATE KNOCKOUT FANS
      for (let i = s.knockoutFans.length - 1; i >= 0; i--) {
        const kf = s.knockoutFans[i];
        kf.life += dt;
        kf.x += kf.vx * (dt * 60);
        kf.y += kf.vy * (dt * 60);
        kf.vy += 0.35 * (dt * 60); // gravity
        kf.z += kf.vz * (dt * 60);
        kf.rotation += kf.vRot * (dt * 60);

        if (kf.life >= kf.maxLife) {
          s.knockoutFans.splice(i, 1);
        }
      }

      // UPDATE FLOATING TEXTS
      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y -= 40 * dt;
        ft.alpha -= 0.8 * dt;
        if (ft.alpha <= 0) {
          s.floatingTexts.splice(i, 1);
        }
      }

      // RENDER CANVAS
      render(ctx, canvas);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const addFloatingText = (text: string, x: number, y: number, color: string) => {
    stateRef.current.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      text,
      x,
      y,
      color,
      alpha: 1,
      scale: 1,
    });
  };

  const createSparks = (worldX: number, worldY: number, worldZ: number, color: string, count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.08 + Math.random() * 0.12;
      stateRef.current.particles.push({
        x: worldX,
        y: worldY,
        z: worldZ,
        vx: Math.cos(angle) * speed,
        vy: (Math.random() * 0.2 + 0.05),
        vz: Math.sin(angle) * 5,
        color,
        size: 3 + Math.random() * 3,
        alpha: 1,
        life: 0,
        maxLife: 0.4 + Math.random() * 0.3,
        isSpark: true,
      });
    }
  };

  // 3D Perspective Projection Function
  const project = (
    worldX: number,
    worldY: number,
    worldZ: number,
    canvasWidth: number,
    canvasHeight: number,
    camZ: number,
    camY = 140
  ) => {
    const s = stateRef.current;
    const isTopDown = s.cameraMode === 'top_down';
    const relZ = worldZ - camZ;

    if (relZ <= 5) {
      return null;
    }

    if (isTopDown) {
      // TOP-DOWN BIRD'S EYE PERSPECTIVE (Elevated & Positioned Further Back)
      const focalLength = 340;
      const scale = focalLength / relZ;
      const roadHalfW = Math.min(canvasWidth * 0.46, 280);
      const screenX = canvasWidth / 2 + (worldX / 1.7) * roadHalfW * (scale / 2.7);
      const horizonY = canvasHeight * 0.10;
      const screenY = horizonY + (camY - worldY) * scale * 0.95;

      return {
        x: screenX,
        y: screenY,
        scale,
        depth: relZ,
      };
    }

    // ELEVATED 3D RUNNER PERSPECTIVE (Further Back & Wide Panoramic View)
    const focalLength = 380;
    const scale = focalLength / relZ;
    const horizonY = canvasHeight * 0.24;
    const screenX = canvasWidth / 2 + worldX * (canvasWidth * 0.44) * scale;
    const screenY = horizonY + (camY - worldY) * scale * 0.95;

    return {
      x: screenX,
      y: screenY,
      scale,
      depth: relZ,
    };
  };

  // Main Canvas Render
  const render = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const s = stateRef.current;
    const w = canvas.width;
    const h = canvas.height;
    const isTopDown = s.cameraMode === 'top_down';
    const currentTime = performance.now();

    ctx.save();
    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Perfectly stable and smooth 3D tracking camera (no trembling or shaking)
    const camZ = isTopDown ? s.playerZ - 170 : s.playerZ - 215;
    const camY = isTopDown ? Math.round(h * 0.32) : 155;
    const horizonY = isTopDown ? h * 0.10 : h * 0.22;

    // Draw Sky & Stadium Skyline
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY + 30);
    skyGrad.addColorStop(0, '#0284c7');
    skyGrad.addColorStop(0.4, '#38bdf8');
    skyGrad.addColorStop(0.85, '#7dd3fc');
    skyGrad.addColorStop(1, '#bae6fd');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY + 20);

    // Distant Stadium in the skyline (Huge circular football arena matching image 2)
    const pStadium = project(0, 150, s.trackLength + 140, w, h, camZ, camY);
    if (pStadium && pStadium.scale > 0.03) {
      const sW = 680 * pStadium.scale;
      const sH = 220 * pStadium.scale;

      // Outer concrete bowl
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.ellipse(pStadium.x, pStadium.y, sW / 2, sH / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = Math.max(2, 4 * pStadium.scale);
      ctx.stroke();

      // Stadium inner stands / grandstand tiers
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.ellipse(pStadium.x, pStadium.y - 12 * pStadium.scale, sW * 0.44, sH * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stadium pitch / field inner glow
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(pStadium.x, pStadium.y - 10 * pStadium.scale, sW * 0.32, sH * 0.22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Floodlight towers around stadium
      const floodlights = [-0.48, -0.26, 0.26, 0.48];
      floodlights.forEach((fx) => {
        const lx = pStadium.x + fx * sW;
        const ly = pStadium.y - sH * 0.65;
        // Tower pole
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.max(1.5, 3 * pStadium.scale);
        ctx.beginPath();
        ctx.moveTo(lx, pStadium.y);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        // Light bank
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(lx - 12 * pStadium.scale, ly - 6 * pStadium.scale, 24 * pStadium.scale, 12 * pStadium.scale);

        // Light halo glow
        const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 35 * pStadium.scale);
        glow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        glow.addColorStop(0.4, 'rgba(254, 240, 138, 0.4)');
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(lx, ly, 35 * pStadium.scale, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw Ground / Avenue & Sidewalks
    // Safe ground rendering boundaries (Elimina distorções e retângulos brancos)
    const farZ = Math.min(s.playerZ + 850, s.trackLength + 350);
    const nearZ = Math.max(0, camZ + 45);

    // 1. Fixed Stylized City Backdrop on sides (Inspirado na imagem de referência)
    const horizonBaseY = horizonY + 25;

    // Left urban building facades (Prédios urbanos estáticos à esquerda)
    const leftCityBlocks = [
      { x: 0, w: 0.12, h: 140, color: '#94a3b8' },
      { x: 0.09, w: 0.09, h: 180, color: '#991b1b' },
      { x: 0.16, w: 0.08, h: 120, color: '#475569' },
      { x: 0.22, w: 0.07, h: 155, color: '#334155' },
    ];
    leftCityBlocks.forEach((b) => {
      const bx = b.x * w;
      const bw = b.w * w;
      const bh = b.h;
      ctx.fillStyle = b.color;
      ctx.fillRect(bx, horizonBaseY - bh, bw, bh + 60);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, horizonBaseY - bh, bw, bh + 60);

      // Lit windows grid
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      for (let wy = horizonBaseY - bh + 14; wy < horizonBaseY - 10; wy += 22) {
        for (let wx = bx + 8; wx < bx + bw - 8; wx += 14) {
          ctx.fillRect(wx, wy, 5, 8);
        }
      }
    });

    // Right urban building facades (Prédios urbanos estáticos à direita)
    const rightCityBlocks = [
      { x: 0.71, w: 0.07, h: 160, color: '#334155' },
      { x: 0.76, w: 0.08, h: 130, color: '#475569' },
      { x: 0.82, w: 0.09, h: 195, color: '#1e3a8a' },
      { x: 0.89, w: 0.11, h: 145, color: '#64748b' },
    ];
    rightCityBlocks.forEach((b) => {
      const bx = b.x * w;
      const bw = b.w * w;
      const bh = b.h;
      ctx.fillStyle = b.color;
      ctx.fillRect(bx, horizonBaseY - bh, bw, bh + 60);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.strokeRect(bx, horizonBaseY - bh, bw, bh + 60);

      // Lit windows grid
      ctx.fillStyle = 'rgba(254, 240, 138, 0.6)';
      for (let wy = horizonBaseY - bh + 14; wy < horizonBaseY - 10; wy += 22) {
        for (let wx = bx + 8; wx < bx + bw - 8; wx += 14) {
          ctx.fillRect(wx, wy, 5, 8);
        }
      }
    });

    // 2. Perspective Road & Sidewalk Polygons (Clamped safely inside canvas bounds)
    const pRoadNearL = project(-1.65, 0, nearZ, w, h, camZ, camY);
    const pRoadNearR = project(1.65, 0, nearZ, w, h, camZ, camY);
    const pRoadFarL = project(-1.65, 0, farZ, w, h, camZ, camY);
    const pRoadFarR = project(1.65, 0, farZ, w, h, camZ, camY);

    const pSideNearL = project(-2.2, 0, nearZ, w, h, camZ, camY);
    const pSideFarL = project(-2.2, 0, farZ, w, h, camZ, camY);
    const pSideNearR = project(2.2, 0, nearZ, w, h, camZ, camY);
    const pSideFarR = project(2.2, 0, farZ, w, h, camZ, camY);

    if (pRoadNearL && pRoadNearR && pRoadFarL && pRoadFarR) {
      // Clamp near Y coordinates to bottom edge of canvas
      const nearY = Math.min(h, pRoadNearL.y);

      // Sidewalk Left
      if (pSideNearL && pSideFarL) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(pSideNearL.x, nearY);
        ctx.lineTo(pSideFarL.x, pSideFarL.y);
        ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
        ctx.lineTo(pRoadNearL.x, nearY);
        ctx.closePath();
        ctx.fill();
      }

      // Sidewalk Right
      if (pSideNearR && pSideFarR) {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(pRoadNearR.x, nearY);
        ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
        ctx.lineTo(pSideFarR.x, pSideFarR.y);
        ctx.lineTo(pSideNearR.x, nearY);
        ctx.closePath();
        ctx.fill();
      }

      // 3. Draw Asphalt Road (Asfalto grafite liso)
      ctx.beginPath();
      ctx.moveTo(pRoadNearL.x, nearY);
      ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
      ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
      ctx.lineTo(pRoadNearR.x, nearY);
      ctx.closePath();

      const roadGrad = ctx.createLinearGradient(0, pRoadFarL.y, 0, nearY);
      roadGrad.addColorStop(0, '#334155');
      roadGrad.addColorStop(0.5, '#475569');
      roadGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = roadGrad;
      ctx.fill();

      // White Road Boundary Lines (Meio-fio de delimitação)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, 4 * pRoadNearL.scale);
      ctx.beginPath();
      ctx.moveTo(pRoadNearL.x, nearY);
      ctx.lineTo(pRoadFarL.x, pRoadFarL.y);
      ctx.moveTo(pRoadNearR.x, nearY);
      ctx.lineTo(pRoadFarR.x, pRoadFarR.y);
      ctx.stroke();
    }

    // 5. DRAW REALISTIC URBAN STREET LAMPS & TREES ALONG SIDEWALKS (Rua Urbana Normal)
    const lampStep = 95;
    const startLampZ = Math.floor(camZ / lampStep) * lampStep;
    for (let lz = startLampZ; lz < farZ; lz += lampStep) {
      if (lz < nearZ) continue;

      const lampSides = [-2.4, 2.4];
      lampSides.forEach((lx) => {
        const pL = project(lx, 0, lz, w, h, camZ, camY);
        if (pL && pL.scale > 0.035) {
          const lScale = pL.scale;
          const poleH = 75 * lScale;
          const isLeft = lx < 0;

          // Warm street light cone pool on sidewalk
          const glowR = 42 * lScale;
          const lampGlow = ctx.createRadialGradient(pL.x, pL.y, 2, pL.x, pL.y, glowR);
          lampGlow.addColorStop(0, 'rgba(254, 240, 138, 0.3)');
          lampGlow.addColorStop(0.5, 'rgba(253, 224, 71, 0.12)');
          lampGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
          ctx.fillStyle = lampGlow;
          ctx.beginPath();
          ctx.ellipse(pL.x, pL.y, glowR, glowR * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();

          // Metallic Lamp Pole
          ctx.strokeStyle = '#475569';
          ctx.lineWidth = Math.max(1.5, 3.5 * lScale);
          ctx.beginPath();
          ctx.moveTo(pL.x, pL.y);
          ctx.lineTo(pL.x, pL.y - poleH);
          const armDir = isLeft ? 1 : -1;
          const armX = pL.x + armDir * 14 * lScale;
          const armY = pL.y - poleH - 6 * lScale;
          ctx.lineTo(armX, armY);
          ctx.stroke();

          // Fixture / Lamp Bulb
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(armX, armY, Math.max(2, 4.5 * lScale), 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // Urban Trees along sidewalks
    const treeStep = 135;
    const startTreeZ = Math.floor(camZ / treeStep) * treeStep + 45;
    for (let tz = startTreeZ; tz < farZ; tz += treeStep) {
      if (tz < nearZ) continue;

      const treeSides = [-2.65, 2.65];
      treeSides.forEach((tx) => {
        const pT = project(tx, 0, tz, w, h, camZ, camY);
        if (pT && pT.scale > 0.035) {
          const tScale = pT.scale;
          const trunkH = 50 * tScale;
          const crownR = 24 * tScale;

          // Tree trunk
          ctx.fillStyle = '#451a03';
          ctx.fillRect(pT.x - 3 * tScale, pT.y - trunkH, 6 * tScale, trunkH);

          // Foliage crown
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(pT.x, pT.y - trunkH - crownR * 0.6, crownR, 0, Math.PI * 2);
          ctx.fill();

          // Highlights on leaves
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(pT.x - crownR * 0.3, pT.y - trunkH - crownR * 0.9, crownR * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    }

    // DRAW TRANSLUCENT ACRYLIC MULTIPLIER GATES (Idênticos à imagem 1!)
    // DRAW TRANSLUCENT ACRYLIC MULTIPLIER GATES (Compact & Non-overlapping)
    s.gates.forEach((gate) => {
      if (gate.z < camZ || gate.z > camZ + 750) return;

      const laneX = gate.lane === 'left' ? -0.68 : 0.68;
      const pBottom = project(laneX, 0, gate.z, w, h, camZ, camY);
      const pTop = project(laneX, 75, gate.z, w, h, camZ, camY);

      if (!pBottom || !pTop) return;

      const isPositive = gate.type === 'add' || gate.type === 'mult';
      const gateWidth = 115 * pBottom.scale;
      const gateHeight = (pBottom.y - pTop.y);

      // Gate Ground Shadow (Soft colored tint on road)
      ctx.fillStyle = isPositive ? 'rgba(14, 165, 233, 0.2)' : 'rgba(239, 68, 68, 0.2)';
      ctx.beginPath();
      ctx.ellipse(pBottom.x, pBottom.y, gateWidth * 0.48, 5 * pBottom.scale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Glass Body with rounded corners
      const glassGrad = ctx.createLinearGradient(pBottom.x - gateWidth / 2, pTop.y, pBottom.x + gateWidth / 2, pBottom.y);
      if (isPositive) {
        glassGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        glassGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
        glassGrad.addColorStop(1, 'rgba(2, 132, 199, 0.6)');
      } else {
        glassGrad.addColorStop(0, 'rgba(248, 113, 113, 0.6)');
        glassGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
        glassGrad.addColorStop(1, 'rgba(220, 38, 38, 0.6)');
      }

      ctx.fillStyle = glassGrad;
      ctx.beginPath();
      ctx.roundRect(pBottom.x - gateWidth / 2, pTop.y, gateWidth, gateHeight, Math.max(3, 6 * pBottom.scale));
      ctx.fill();

      // Glass Edge Frame & Neon Glow
      ctx.strokeStyle = isPositive ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = Math.max(2, 3.5 * pBottom.scale);
      ctx.stroke();

      // Vertical Glowing Neon Pillars on Left and Right edges
      const pillarW = 4.5 * pBottom.scale;
      ctx.fillStyle = isPositive ? '#0ea5e9' : '#dc2626';
      ctx.fillRect(pBottom.x - gateWidth / 2 - pillarW / 2, pTop.y - 3 * pBottom.scale, pillarW, gateHeight + 3 * pBottom.scale);
      ctx.fillRect(pBottom.x + gateWidth / 2 - pillarW / 2, pTop.y - 3 * pBottom.scale, pillarW, gateHeight + 3 * pBottom.scale);

      // Clean, Bold Centered Number Text
      const valStr = gate.type === 'mult' ? `×${gate.value}` : gate.value > 0 ? `+${gate.value}` : `${gate.value}`;
      ctx.font = `900 ${Math.max(14, Math.round(34 * pBottom.scale))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Soft text drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillText(valStr, pBottom.x + 1.5, pTop.y + gateHeight * 0.48 + 1.5);

      // Crisp White Number
      ctx.fillStyle = '#ffffff';
      ctx.fillText(valStr, pBottom.x, pTop.y + gateHeight * 0.48);
    });

    // DRAW TRACK ITEMS (Compact, Elegant Size for Rojões, Barras & Bombas)
    s.items.forEach((item) => {
      if (item.collected || item.z < camZ || item.z > camZ + 700) return;

      const p = project(item.x, 8, item.z, w, h, camZ, camY);
      if (!p) return;

      const size = 15 * p.scale;

      if (item.type === 'iron_bar') {
        // STACK OF 3 METALLIC STEEL BARS WITH SPARKLING AURA (Matching Image 1!)
        ctx.save();
        ctx.translate(p.x, p.y);

        // Bright cyan/white starburst aura behind steel bars
        const auraGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 1.8);
        auraGrad.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
        auraGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.25)');
        auraGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // 3D Metallic Ingot Stack (Pyramid: 2 on bottom, 1 on top)
        const barW = size * 2.2;
        const barH = size * 0.55;

        // Bottom Ingot
        const drawIngot = (ox: number, oy: number) => {
          ctx.save();
          ctx.translate(ox, oy);
          ctx.rotate(-0.18);

          // Top facet
          const bGrad = ctx.createLinearGradient(-barW / 2, -barH / 2, barW / 2, barH / 2);
          bGrad.addColorStop(0, '#cbd5e1');
          bGrad.addColorStop(0.3, '#f8fafc');
          bGrad.addColorStop(0.6, '#64748b');
          bGrad.addColorStop(1, '#334155');

          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.roundRect(-barW / 2, -barH / 2, barW, barH, 2 * p.scale);
          ctx.fill();

          // Beveled edge
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = Math.max(1, 1.5 * p.scale);
          ctx.stroke();
          ctx.restore();
        };

        drawIngot(-size * 0.15, size * 0.3);
        drawIngot(size * 0.15, 0);
        drawIngot(0, -size * 0.35);

        // Specular glint star sparks (✨)
        const glintPhase = performance.now() * 0.005;
        const glintX = Math.sin(glintPhase) * size * 0.9;
        const glintY = Math.cos(glintPhase) * size * 0.6;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(glintX, glintY, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (item.type === 'firework') {
        // FAN OF 3 COLORFUL FIREWORK ROCKETS WITH GOLDEN AURA (Matching Image 1!)
        ctx.save();
        ctx.translate(p.x, p.y);

        // Golden radiant burst aura
        const fAura = ctx.createRadialGradient(0, 0, 2, 0, 0, size * 1.9);
        fAura.addColorStop(0, 'rgba(254, 240, 138, 0.7)');
        fAura.addColorStop(0.4, 'rgba(245, 158, 11, 0.3)');
        fAura.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = fAura;
        ctx.beginPath();
        ctx.arc(0, 0, size * 1.9, 0, Math.PI * 2);
        ctx.fill();

        // Draw 3 fanned rockets: left (-25°), center (0°), right (+25°)
        const rockets = [
          { angle: -0.38, color: '#0ea5e9' },
          { angle: 0, color: '#ef4444' },
          { angle: 0.38, color: '#22c55e' },
        ];

        rockets.forEach((rk) => {
          ctx.save();
          ctx.rotate(rk.angle);

          // Wooden stick
          ctx.fillStyle = '#d97706';
          ctx.fillRect(-1 * p.scale, 0, 2 * p.scale, size * 1.3);

          // Rocket cylinder body with stripes
          ctx.fillStyle = rk.color;
          ctx.fillRect(-size * 0.22, -size * 0.8, size * 0.44, size * 0.8);

          // Yellow diagonal stripe on rocket
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(-size * 0.22, -size * 0.5, size * 0.44, size * 0.16);

          // Rocket cone tip
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.moveTo(0, -size * 1.3);
          ctx.lineTo(-size * 0.28, -size * 0.8);
          ctx.lineTo(size * 0.28, -size * 0.8);
          ctx.closePath();
          ctx.fill();

          ctx.restore();
        });

        // Golden sparkle glints
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(size * 0.7, -size * 0.5, 2.5 * p.scale, 0, Math.PI * 2);
        ctx.arc(-size * 0.7, -size * 0.3, 2 * p.scale, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      } else if (item.type === 'barricade') {
        // Barricade
        ctx.fillStyle = '#78716c';
        ctx.fillRect(p.x - size * 1.8, p.y - size, size * 3.6, size * 1.4);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3 * p.scale;
        ctx.strokeRect(p.x - size * 1.8, p.y - size, size * 3.6, size * 1.4);
      } else if (item.type === 'bomb') {
        // Red Pulsing Danger Radius on asphalt
        const blastGroundRadius = Math.max(18, (item.explosionRadius || 0.55) * 230 * p.scale);
        const pulse = 0.5 + Math.sin(performance.now() * 0.012) * 0.35;
        ctx.save();
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 + pulse * 0.45})`;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.08 + pulse * 0.08})`;
        ctx.lineWidth = Math.max(1.5, 2.5 * p.scale);
        ctx.setLineDash([6 * p.scale, 4 * p.scale]);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y + size * 0.35, blastGroundRadius, blastGroundRadius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Bomb Body (Spherical black metallic bomb)
        const bombR = size * 0.9;
        const bombGrad = ctx.createRadialGradient(p.x - bombR * 0.3, p.y - bombR * 0.3, bombR * 0.1, p.x, p.y, bombR);
        bombGrad.addColorStop(0, '#64748b');
        bombGrad.addColorStop(0.3, '#1e293b');
        bombGrad.addColorStop(1, '#020617');

        ctx.fillStyle = bombGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, bombR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = Math.max(1, 1.5 * p.scale);
        ctx.stroke();

        // Brass Fuse Cap
        ctx.fillStyle = '#d97706';
        ctx.fillRect(p.x - bombR * 0.3, p.y - bombR * 1.3, bombR * 0.6, bombR * 0.35);

        // Fuse Wick with Sizzling Spark
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = Math.max(1.5, 2 * p.scale);
        ctx.beginPath();
        ctx.moveTo(p.x, p.y - bombR * 1.25);
        ctx.quadraticCurveTo(p.x + bombR * 0.5, p.y - bombR * 1.65, p.x + bombR * 0.3, p.y - bombR * 1.95);
        ctx.stroke();

        // Spark fire at tip
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x + bombR * 0.3, p.y - bombR * 1.95, Math.max(2, (3 + Math.random() * 3) * p.scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(p.x + bombR * 0.3, p.y - bombR * 1.95, Math.max(1, (1.5 + Math.random() * 1.5) * p.scale), 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'flare') {
        ctx.fillStyle = s.playerTeam.accentColor || '#ef4444';
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.type === 'drum') {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // DRAW RIVAL TORCIDA FORMATION AT TRACK END
    if (s.trackLength - camZ < 850) {
      const rivalZ = s.trackLength + 40;
      const pRivalLeader = project(0, 0, rivalZ, w, h, camZ, camY);

      if (pRivalLeader) {
        // Draw giant waving Torcida Flags (Bandeirões) in the back row!
        const flagZ = rivalZ + 75;
        const flagPositions = [-0.9, 0, 0.9];
        flagPositions.forEach((fx, fIdx) => {
          const pFlag = project(fx, 30, flagZ, w, h, camZ, camY);
          if (pFlag) {
            const fScale = pFlag.scale;
            const wave = Math.sin(performance.now() * 0.005 + fIdx * 2) * 12 * fScale;
            // Flagpole
            ctx.fillStyle = '#94a3b8';
            ctx.fillRect(pFlag.x - 2 * fScale, pFlag.y - 70 * fScale, 4 * fScale, 95 * fScale);
            // Flag fabric
            ctx.fillStyle = fIdx % 2 === 0 ? s.rivalTeam.primaryColor : s.rivalTeam.secondaryColor;
            ctx.beginPath();
            ctx.moveTo(pFlag.x, pFlag.y - 70 * fScale);
            ctx.quadraticCurveTo(pFlag.x + 35 * fScale, pFlag.y - 72 * fScale + wave, pFlag.x + 70 * fScale, pFlag.y - 68 * fScale);
            ctx.lineTo(pFlag.x + 70 * fScale, pFlag.y - 30 * fScale);
            ctx.quadraticCurveTo(pFlag.x + 35 * fScale, pFlag.y - 34 * fScale + wave, pFlag.x, pFlag.y - 32 * fScale);
            ctx.closePath();
            ctx.fill();
          }
        });

        // Draw rival members in organic, intimidating torcida formation
        // Render from BACK to FRONT (largest row to 0) so closer fans overlap behind fans correctly!
        const maxRivalDrawn = Math.min(s.rivalCount, 56);
        const rows = Math.ceil(maxRivalDrawn / 8);
        for (let row = rows - 1; row >= 0; row--) {
          const inRow = Math.min(8, maxRivalDrawn - row * 8);
          for (let col = 0; col < inRow; col++) {
            const stagger = (row % 2 === 1 ? 0.12 : -0.12);
            const rx = (col - (inRow - 1) / 2) * 0.28 + stagger;
            const rz = rivalZ + row * 16;

            const pR = project(rx, 0, rz, w, h, camZ, camY);
            if (pR) {
              const hasIron = row === 0 && (col % 2 === 0);
              renderFanAvatar(
                ctx,
                pR.x,
                pR.y,
                isTopDown ? pR.scale * 0.52 : pR.scale * 0.78,
                s.rivalTeam,
                hasIron,
                false,
                s.stage === 'clash',
                true,
                row * inRow + col,
                0.85
              );
            }
          }
        }

        // Draw grand rival banner and Power Bar BEHIND the rival torcida (at rivalZ + 95, elevated)
        const pBackBanner = project(0, 65, rivalZ + 95, w, h, camZ, camY);
        if (pBackBanner) {
          const bW = 340 * pBackBanner.scale;
          const bH = 60 * pBackBanner.scale;
          // Grandstand stadium banner
          ctx.fillStyle = s.rivalTeam.primaryColor;
          ctx.fillRect(pBackBanner.x - bW / 2, pBackBanner.y - bH / 2, bW, bH);
          ctx.strokeStyle = s.rivalTeam.secondaryColor;
          ctx.lineWidth = Math.max(3, 4 * pBackBanner.scale);
          ctx.strokeRect(pBackBanner.x - bW / 2, pBackBanner.y - bH / 2, bW, bH);

          // Support cables on sides
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = Math.max(1.5, 2 * pBackBanner.scale);
          ctx.beginPath();
          ctx.moveTo(pBackBanner.x - bW / 2, pBackBanner.y);
          ctx.lineTo(pBackBanner.x - bW / 2, pBackBanner.y + 65 * pBackBanner.scale);
          ctx.moveTo(pBackBanner.x + bW / 2, pBackBanner.y);
          ctx.lineTo(pBackBanner.x + bW / 2, pBackBanner.y + 65 * pBackBanner.scale);
          ctx.stroke();

          ctx.fillStyle = s.rivalTeam.secondaryColor;
          ctx.font = `bold ${Math.max(16, Math.round(32 * pBackBanner.scale))}px 'Teko', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(
            `⚔️ ${s.rivalTeam.name.toUpperCase()} ⚔️`,
            pBackBanner.x,
            pBackBanner.y
          );

          // Rival Power Bar HUD directly above back banner
          const barWidth = 200 * pBackBanner.scale;
          const barHeight = 18 * pBackBanner.scale;
          const barY = pBackBanner.y - bH / 2 - 24 * pBackBanner.scale;
          ctx.fillStyle = 'rgba(0,0,0,0.7)';
          ctx.fillRect(pBackBanner.x - barWidth / 2, barY, barWidth, barHeight);

          const fillP = s.stage === 'clash' ? s.clashRivalPower / s.clashMaxRivalPower : 1;
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(
            pBackBanner.x - barWidth / 2,
            barY,
            barWidth * Math.max(0, fillP),
            barHeight
          );
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pBackBanner.x - barWidth / 2, barY, barWidth, barHeight);

          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, Math.round(14 * pBackBanner.scale))}px sans-serif`;
          ctx.fillText(
            `PODER RIVAL: ${s.stage === 'clash' ? Math.round(s.clashRivalPower) : s.rivalPower}`,
            pBackBanner.x,
            barY - 8 * pBackBanner.scale
          );
        }
      }
    }

    // DRAW PROJECTILES (Rojões em voo do jogador e rojões inimigos)
    s.projectiles.forEach((p) => {
      const projPoint = project(p.x, p.y, p.z, w, h, camZ, camY);
      if (!projPoint) return;

      if (p.isRival) {
        // Broad Danger Corridor on asphalt for this rocket's lane
        const laneW = 0.38;
        const pL1 = project(p.x - laneW, 0, p.z, w, h, camZ, camY);
        const pR1 = project(p.x + laneW, 0, p.z, w, h, camZ, camY);
        const pL2 = project(p.x - laneW, 0, Math.max(0, s.playerZ - 15), w, h, camZ, camY);
        const pR2 = project(p.x + laneW, 0, Math.max(0, s.playerZ - 15), w, h, camZ, camY);

        if (pL1 && pR1 && pL2 && pR2) {
          const pulse = 0.5 + Math.sin(performance.now() * 0.018) * 0.45;
          ctx.save();
          // Red glowing asphalt danger strip
          ctx.fillStyle = `rgba(239, 68, 68, ${0.22 + pulse * 0.22})`;
          ctx.beginPath();
          ctx.moveTo(pL1.x, pL1.y);
          ctx.lineTo(pR1.x, pR1.y);
          ctx.lineTo(pR2.x, pR2.y);
          ctx.lineTo(pL2.x, pL2.y);
          ctx.closePath();
          ctx.fill();

          // Bright pulsating border lines
          ctx.strokeStyle = `rgba(248, 113, 113, ${0.7 + pulse * 0.3})`;
          ctx.lineWidth = Math.max(2, 4 * projPoint.scale);
          ctx.setLineDash([12 * projPoint.scale, 8 * projPoint.scale]);
          ctx.stroke();
          ctx.restore();
        }

        // Giant luminous fireball & rocket head
        // Use an effective minimum scale so it is clearly visible even from far away!
        const visScale = Math.max(0.5, projPoint.scale);
        const rSize = 28 * visScale;

        // Big outer glowing halo
        const haloGrad = ctx.createRadialGradient(projPoint.x, projPoint.y, 4, projPoint.x, projPoint.y, 45 * visScale);
        haloGrad.addColorStop(0, '#fef08a');
        haloGrad.addColorStop(0.3, 'rgba(249, 115, 22, 0.8)');
        haloGrad.addColorStop(0.7, 'rgba(239, 68, 68, 0.4)');
        haloGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(projPoint.x, projPoint.y, 45 * visScale, 0, Math.PI * 2);
        ctx.fill();

        // Rocket core
        ctx.save();
        ctx.translate(projPoint.x, projPoint.y);

        // Rocket body (cylinder)
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(-rSize * 0.28, -rSize * 0.7, rSize * 0.56, rSize * 1.3);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2 * visScale;
        ctx.strokeRect(-rSize * 0.28, -rSize * 0.7, rSize * 0.56, rSize * 1.3);

        // Rocket warhead / cone pointing DOWNWARDS towards player
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(0, rSize * 1.25);
        ctx.lineTo(-rSize * 0.4, rSize * 0.6);
        ctx.lineTo(rSize * 0.4, rSize * 0.6);
        ctx.closePath();
        ctx.fill();

        // Burning flame tip at back (pointing upwards away from player)
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.moveTo(0, -rSize * 1.5);
        ctx.lineTo(-rSize * 0.3, -rSize * 0.7);
        ctx.lineTo(rSize * 0.3, -rSize * 0.7);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Player forward rocket
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(projPoint.x, projPoint.y, 6 * projPoint.scale, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(projPoint.x, projPoint.y, 14 * projPoint.scale, 0, Math.PI * 2);
        ctx.globalAlpha = 0.3;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });

    // DRAW SMOKE / FLARE TRAIL
    if (s.flaresActive > 0) {
      for (let sm = 0; sm < 4; sm++) {
        const sx = s.playerX + (Math.random() - 0.5) * 0.8;
        const sz = s.playerZ - 10 - Math.random() * 40;
        const pSmoke = project(sx, 12 + Math.random() * 20, sz, w, h, camZ, camY);
        if (pSmoke) {
          ctx.fillStyle = s.playerTeam.accentColor || '#ef4444';
          ctx.globalAlpha = 0.25;
          ctx.beginPath();
          ctx.arc(pSmoke.x, pSmoke.y, 35 * pSmoke.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      }
    }

    // DRAW PLAYER CROWD FORMATION
    // Render dynamic swarm showing the complete bonde (front line, middle rows, rear flag bearers)
    const maxFansDrawn = isTopDown ? Math.min(s.crowdCount, 22) : Math.min(s.crowdCount, 38);
    const crowdSpread = Math.min(1.1, 0.35 + (s.crowdCount / 100) * 0.45);

    // Fans are sorted by Z distance so front ones draw over back ones
    const fanPositions: { x: number; z: number; hasIron: boolean; hasFirework: boolean }[] = [];

    for (let i = 0; i < maxFansDrawn; i++) {
      // Tight golden spiral distribution clamped strictly inside asphalt road boundaries (X: -1.20 to 1.20)
      const angle = i * 2.39996;
      const dist = Math.sqrt((i + 1) / maxFansDrawn) * crowdSpread;
      const spreadFactor = isTopDown ? 0.42 : 0.30;
      const rawFx = s.playerX + Math.cos(angle) * dist * spreadFactor;
      const maxFanRoadX = isTopDown ? 1.35 : 1.20;
      const fx = Math.max(-maxFanRoadX, Math.min(maxFanRoadX, rawFx));
      const fz = s.playerZ + Math.sin(angle) * dist * (isTopDown ? 16 : 13);

      // Assign iron bars to front/side fans
      const hasIron = i < s.ironBars * 2;
      const hasFirework = i >= s.ironBars * 2 && i < s.ironBars * 2 + s.fireworks;

      fanPositions.push({ x: fx, z: fz, hasIron, hasFirework });
    }

    fanPositions.sort((a, b) => b.z - a.z);

    fanPositions.forEach((fan, idx) => {
      const p = project(fan.x, 0, fan.z, w, h, camZ, camY);
      if (p) {
        renderFanAvatar(
          ctx,
          p.x,
          p.y,
          isTopDown ? p.scale * 0.52 : p.scale * 0.68,
          s.playerTeam,
          fan.hasIron,
          fan.hasFirework,
          s.stage === 'clash',
          false,
          idx,
          s.speedFactor
        );
      }
    });

    // DRAW KNOCKOUT FANS (Flying bonequinhos defeated in combat or hit by explosives)
    s.knockoutFans.forEach((kf, idx) => {
      const p = project(kf.x, kf.y, kf.z, w, h, camZ, camY);
      if (p) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(kf.rotation);
        const alpha = Math.max(0, 1 - kf.life / kf.maxLife);
        ctx.globalAlpha = alpha;
        renderFanAvatar(
          ctx,
          0,
          0,
          p.scale * 1.05,
          kf.team,
          false,
          false,
          true,
          kf.facingDown,
          idx,
          0
        );
        ctx.restore();
      }
    });

    // Draw Crowd Counter Pill directly above the player mob
    const pCenter = project(s.playerX, 70, s.playerZ, w, h, camZ, camY);
    if (pCenter && s.stage !== 'clash') {
      const labelText = `${s.crowdCount}`;
      ctx.font = `bold ${Math.max(14, Math.round(26 * pCenter.scale))}px sans-serif`;
      const textWidth = ctx.measureText(labelText).width;
      const pillW = textWidth + 30 * pCenter.scale;
      const pillH = 32 * pCenter.scale;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.strokeStyle = s.playerTeam.primaryColor;
      ctx.lineWidth = Math.max(2, 3 * pCenter.scale);

      ctx.beginPath();
      ctx.roundRect(pCenter.x - pillW / 2, pCenter.y - pillH / 2, pillW, pillH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(labelText, pCenter.x, pCenter.y);
    }

    // DRAW CLASH ARENA TOP HUD (Clean minimalistic duel score)
    if (s.stage === 'clash') {
      const hudY = 42;
      const hudCenterX = w / 2;

      // Center VS Badge
      const vsR = 22;
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(hudCenterX, hudY, vsR, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#000000';
      ctx.font = "900 17px 'Teko', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('VS', hudCenterX, hudY);

      // Left Player Pill (Showing exact bonequinhos count, pista overall & power)
      const pillWidth = 185;
      const pillHeight = 36;
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.roundRect(hudCenterX - vsR - 8 - pillWidth, hudY - pillHeight / 2, pillWidth, pillHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = "bold 17px 'Teko', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`👥 ${s.crowdCount}  |  PISTA ${s.playerTeam.pistaOverall || 88}  |  ⚡${Math.round(s.clashPlayerPower)}`, hudCenterX - vsR - 8 - pillWidth / 2, hudY);

      // Right Rival Pill (Showing exact rival count, pista overall & power)
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.roundRect(hudCenterX + vsR + 8, hudY - pillHeight / 2, pillWidth, pillHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = "bold 17px 'Teko', sans-serif";
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`👥 ${s.rivalCount}  |  PISTA ${s.rivalTeam.pistaOverall || 88}  |  ⚡${Math.round(s.clashRivalPower)}`, hudCenterX + vsR + 8 + pillWidth / 2, hudY);
    }

    // DRAW PARTICLES
    s.particles.forEach((p) => {
      const pt = project(p.x, p.y, p.z, w, h, camZ, camY);
      if (pt) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, Math.max(1, p.size * pt.scale), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
    });

    // DRAW FLOATING TEXTS (SCREEN SPACE)
    s.floatingTexts.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.font = `bold 22px 'Teko', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.textAlign = 'center';
      const screenX = w / 2 + ft.x;
      const screenY = h * 0.4 + ft.y;
      ctx.strokeText(ft.text, screenX, screenY);
      ctx.fillText(ft.text, screenX, screenY);
      ctx.restore();
    });

    ctx.restore();
  };

  // Helper to render stylized Fan with Team Jersey and Items
  // High-fidelity 3D Running Model matching reference images
  const renderFanAvatar = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    team: RunnerTeam,
    hasIron: boolean,
    hasFirework: boolean,
    inClash: boolean,
    facingDown = false,
    runnerIdx = 0,
    speedFactor = 1.0
  ) => {
    const s = scale;
    if (s <= 0.03) return;

    // Running cycle calculation based on time, runner offset, and speed
    const runCycle = (performance.now() * 0.012 * speedFactor) + (runnerIdx * 1.35);
    const stride = Math.sin(runCycle);
    const strideBob = Math.abs(Math.sin(runCycle)) * 3.2 * s;

    // Varied hair color palette across runners
    const hairColors = ['#1e1b18', '#382216', '#261c14', '#451a03', '#1e293b'];
    const hairColor = hairColors[runnerIdx % hairColors.length];

    // Varied skin tones
    const skinTones = ['#fcd34d', '#f59e0b', '#fbbf24', '#e2a053', '#d97706'];
    const skinColor = skinTones[runnerIdx % skinTones.length];

    // Anatomical anchor positions
    const groundY = y;
    const hipY = y - 13 * s - strideBob;
    const torsoY = hipY - 13 * s;
    const headY = torsoY - 8 * s;
    const bodyW = 13 * s;
    const bodyH = 14 * s;
    const headR = 5.8 * s;

    // 1. SOFT CONTACT SHADOW ON ASPHALT (Dynamically stretches with stride)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.ellipse(x, groundY + 1 * s, (9 + Math.abs(stride) * 1.8) * s, 4.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. RUNNING LEGS & SHOES (True stride kinematics matching 3D runner images!)
    // Left Leg
    const legSwingL = stride;
    const kneeLX = x - 3.4 * s + legSwingL * 3.2 * s;
    const kneeLY = hipY + 6.5 * s + (legSwingL > 0 ? -1.2 : 1) * s;
    const footLX = x - 3.4 * s + legSwingL * 7.5 * s;
    const footLY = groundY - (legSwingL < -0.2 ? Math.abs(legSwingL) * 3.5 * s : 0);

    // Right Leg (Opposite stride)
    const legSwingR = -stride;
    const kneeRX = x + 3.4 * s + legSwingR * 3.2 * s;
    const kneeRY = hipY + 6.5 * s + (legSwingR > 0 ? -1.2 : 1) * s;
    const footRX = x + 3.4 * s + legSwingR * 7.5 * s;
    const footRY = groundY - (legSwingR < -0.2 ? Math.abs(legSwingR) * 3.5 * s : 0);

    // Draw Left Leg (Pants in dark athletic navy/black)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.6 * s;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x - 3.4 * s, hipY);
    ctx.lineTo(kneeLX, kneeLY);
    ctx.lineTo(footLX, footLY);
    ctx.stroke();

    // Left Athletic Running Shoe (Dark shoe with white sole accent)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(footLX - 2.5 * s, footLY - 2.2 * s, 5 * s, 2.5 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(footLX - 2.5 * s, footLY - 0.7 * s, 5 * s, 0.9 * s);

    // Draw Right Leg
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3.6 * s;
    ctx.beginPath();
    ctx.moveTo(x + 3.4 * s, hipY);
    ctx.lineTo(kneeRX, kneeRY);
    ctx.lineTo(footRX, footRY);
    ctx.stroke();

    // Right Athletic Running Shoe
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(footRX - 2.5 * s, footRY - 2.2 * s, 5 * s, 2.5 * s);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(footRX - 2.5 * s, footRY - 0.7 * s, 5 * s, 0.9 * s);

    // 3. TORSO (Athletic Crew-Neck Jersey in team color)
    ctx.fillStyle = team.primaryColor;
    ctx.beginPath();
    ctx.roundRect(x - bodyW / 2, torsoY, bodyW, bodyH, 3 * s);
    ctx.fill();

    // Jersey Shading (Subtle top highlight and bottom shadow)
    const jerseyGrad = ctx.createLinearGradient(0, torsoY, 0, torsoY + bodyH);
    jerseyGrad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
    jerseyGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0)');
    jerseyGrad.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
    ctx.fillStyle = jerseyGrad;
    ctx.beginPath();
    ctx.roundRect(x - bodyW / 2, torsoY, bodyW, bodyH, 3 * s);
    ctx.fill();

    // Jersey central vertical stripe / team accent
    ctx.fillStyle = team.secondaryColor;
    ctx.fillRect(x - bodyW * 0.14, torsoY, bodyW * 0.28, bodyH);

    // 4. ARMS & HANDS (Swinging in natural opposition to leg stride!)
    const armSwingL = legSwingR; // Left arm swings with right leg
    const armSwingR = legSwingL; // Right arm swings with left leg

    // Left Arm (Bare skin tone with sleeve cuff)
    // Shoulder at (x - bodyW * 0.48, torsoY + 2 * s)
    ctx.fillStyle = team.primaryColor;
    ctx.beginPath();
    ctx.arc(x - bodyW * 0.45, torsoY + 2.5 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 3 * s;
    ctx.beginPath();
    ctx.moveTo(x - bodyW * 0.45, torsoY + 2.5 * s);
    const handLX = x - bodyW * 0.55 + armSwingL * 4.5 * s;
    const handLY = torsoY + 11 * s - Math.abs(armSwingL) * 2.5 * s;
    ctx.lineTo(handLX, handLY);
    ctx.stroke();

    // Left Hand Fist
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(handLX, handLY, 1.8 * s, 0, Math.PI * 2);
    ctx.fill();

    // Right Arm & Equipped Items
    ctx.fillStyle = team.primaryColor;
    ctx.beginPath();
    ctx.arc(x + bodyW * 0.45, torsoY + 2.5 * s, 2.4 * s, 0, Math.PI * 2);
    ctx.fill();

    if (hasIron) {
      // Right arm raised holding 3D metallic iron bar forward!
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x + bodyW * 0.45, torsoY + 2.5 * s);
      const ironHandX = x + bodyW * 0.65;
      const ironHandY = torsoY + 4 * s;
      ctx.lineTo(ironHandX, ironHandY);
      ctx.stroke();

      // Hand holding the bar
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(ironHandX, ironHandY, 2 * s, 0, Math.PI * 2);
      ctx.fill();

      // 3D Metallic Steel Bar
      ctx.save();
      ctx.translate(ironHandX, ironHandY);
      ctx.rotate(-0.35 + (inClash ? Math.sin(performance.now() * 0.03) * 0.45 : 0));

      const barG = ctx.createLinearGradient(-2 * s, -18 * s, 2 * s, 6 * s);
      barG.addColorStop(0, '#f8fafc');
      barG.addColorStop(0.3, '#cbd5e1');
      barG.addColorStop(0.7, '#64748b');
      barG.addColorStop(1, '#334155');

      ctx.fillStyle = barG;
      ctx.fillRect(-1.8 * s, -18 * s, 3.6 * s, 24 * s);

      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = Math.max(0.8, 1.2 * s);
      ctx.strokeRect(-1.8 * s, -18 * s, 3.6 * s, 24 * s);

      // Glint highlight
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1.5 * s, -16 * s, 3 * s, 4 * s);
      ctx.restore();
    } else if (hasFirework) {
      // Right arm raised holding festive rocket with sparkling tip!
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x + bodyW * 0.45, torsoY + 2.5 * s);
      const fwHandX = x + bodyW * 0.6;
      const fwHandY = torsoY + 5 * s;
      ctx.lineTo(fwHandX, fwHandY);
      ctx.stroke();

      // Wooden stick
      ctx.fillStyle = '#d97706';
      ctx.fillRect(fwHandX - 1 * s, fwHandY - 14 * s, 2 * s, 18 * s);

      // Rocket cylinder body with stripes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(fwHandX - 2.5 * s, fwHandY - 20 * s, 5 * s, 8 * s);

      ctx.fillStyle = '#fef08a';
      ctx.fillRect(fwHandX - 2.5 * s, fwHandY - 17 * s, 5 * s, 2 * s);

      // Rocket cone tip
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(fwHandX, fwHandY - 25 * s);
      ctx.lineTo(fwHandX - 3 * s, fwHandY - 20 * s);
      ctx.lineTo(fwHandX + 3 * s, fwHandY - 20 * s);
      ctx.closePath();
      ctx.fill();

      // Spark flame at fuse tip
      const sparkFlicker = (2.2 + Math.sin(performance.now() * 0.04) * 1.2) * s;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(fwHandX, fwHandY - 26 * s, sparkFlicker, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Natural running arm swing
      ctx.strokeStyle = skinColor;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x + bodyW * 0.45, torsoY + 2.5 * s);
      const handRX = x + bodyW * 0.55 + armSwingR * 4.5 * s;
      const handRY = torsoY + 11 * s - Math.abs(armSwingR) * 2.5 * s;
      ctx.lineTo(handRX, handRY);
      ctx.stroke();

      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(handRX, handRY, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. HEAD & CROPPED HAIR (Sculpted 3D hairstyle matching Image 1!)
    // Smooth round head sphere in skin tone
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x, headY, headR, 0, Math.PI * 2);
    ctx.fill();

    // Small stylized ears on the sides
    ctx.fillStyle = skinColor;
    ctx.beginPath();
    ctx.arc(x - headR * 0.95, headY + 0.5 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.arc(x + headR * 0.95, headY + 0.5 * s, 1.6 * s, 0, Math.PI * 2);
    ctx.fill();

    // Sculpted 3D cropped hair covering top, back, and sides of head
    ctx.fillStyle = hairColor;
    ctx.beginPath();
    // Top crown of hair
    ctx.arc(x, headY - 1.2 * s, headR * 0.98, Math.PI * 0.9, Math.PI * 2.1);
    ctx.lineTo(x + headR * 0.9, headY + 0.5 * s);
    ctx.lineTo(x - headR * 0.9, headY + 0.5 * s);
    ctx.closePath();
    ctx.fill();

    // Hair volume highlight on crown
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.beginPath();
    ctx.ellipse(x, headY - headR * 0.6, headR * 0.6, 2 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    // If facing player (rival torcida charging down towards screen)
    if (facingDown) {
      // Facial features: determined runner eyes and shouting mouth chanting
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x - 2.8 * s, headY - 0.5 * s, 1.6 * s, 1.4 * s);
      ctx.fillRect(x + 1.2 * s, headY - 0.5 * s, 1.6 * s, 1.4 * s);

      // Shouting mouth
      ctx.fillStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.ellipse(x, headY + 2.4 * s, 2 * s, 1.4 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      // Front club crest on left chest
      ctx.fillStyle = team.secondaryColor;
      ctx.beginPath();
      ctx.arc(x - bodyW * 0.25, torsoY + 4 * s, 1.6 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  // Pointer / Touch / Mouse drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (s.stage !== 'playing') return;
    s.isDragging = true;
    s.dragStartX = e.clientX;
    s.dragStartPlayerX = s.playerX;
    soundManager.startStadiumDrums();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const s = stateRef.current;
    if (!s.isDragging || s.stage !== 'playing') return;

    const deltaX = e.clientX - s.dragStartX;
    const canvasWidth = canvasRef.current?.clientWidth || window.innerWidth;
    const normalizedDelta = (deltaX / (canvasWidth * 0.4)) * 1.4;
    const maxSteer = s.cameraMode === 'top_down' ? 0.95 : 0.85;

    s.targetX = Math.max(-maxSteer, Math.min(maxSteer, s.dragStartPlayerX + normalizedDelta));
  };

  const handlePointerUp = () => {
    stateRef.current.isDragging = false;
  };

  return (
    <div
      className="relative w-full h-full select-none touch-none overflow-hidden cursor-grab active:cursor-grabbing"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
};
