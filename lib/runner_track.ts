import { Gate, TrackItem } from './runner_types';

export interface GeneratedTrack {
  trackLength: number;
  gates: Gate[];
  items: TrackItem[];
  rivalTorcidaCount: number;
  rivalTorcidaPower: number;
}

export function generateTrackForLevel(level: number): GeneratedTrack {
  const trackLength = 2600 + Math.min(level * 400, 2000);
  const gates: Gate[] = [];
  const items: TrackItem[] = [];

  // Pair of gates spaced along the road
  const gateZPositions = [
    350,
    750,
    1150,
    1550,
    1950,
    2350,
    2750,
    3150,
    3550,
  ].filter((z) => z < trackLength - 300);

  gateZPositions.forEach((z, idx) => {
    // Generate left vs right options
    const isEarly = idx < 2;
    let leftType: 'add' | 'mult' | 'sub' = 'add';
    let rightType: 'add' | 'mult' | 'sub' = 'add';
    let leftVal = 10;
    let rightVal = 10;
    let leftLabel = '';
    let rightLabel = '';

    if (isEarly) {
      // Early gates: generous additions or multipliers
      leftType = 'add';
      leftVal = 5 + Math.floor(Math.random() * 8) + level;
      leftLabel = `+${leftVal} Torcida`;

      rightType = 'mult';
      rightVal = 2;
      rightLabel = `x${rightVal} Bateria`;
    } else {
      const scenario = Math.random();
      if (scenario < 0.4) {
        // High bonus vs Safe bonus
        leftType = 'mult';
        leftVal = 2;
        leftLabel = `x2 Puxador`;

        rightType = 'add';
        rightVal = 15 + Math.floor(Math.random() * 15);
        rightLabel = `+${rightVal} Caravana`;
      } else if (scenario < 0.7) {
        // Penalty vs Minor Penalty (Tough choice)
        leftType = 'sub';
        leftVal = -(5 + Math.floor(Math.random() * 6));
        leftLabel = `${leftVal} Emboscada`;

        rightType = 'add';
        rightVal = 8 + Math.floor(Math.random() * 8);
        rightLabel = `+${rightVal} Metrô`;
      } else {
        // Multiplier choice
        leftType = 'mult';
        leftVal = 2;
        leftLabel = `x2 Sinalizador`;

        rightType = 'add';
        rightVal = 20 + Math.floor(Math.random() * 12);
        rightLabel = `+${rightVal} Aliados`;
      }
    }

    gates.push({
      id: `gate_${idx}_l`,
      z,
      lane: 'left',
      type: leftType,
      value: leftVal,
      label: leftLabel,
      passed: false,
    });

    gates.push({
      id: `gate_${idx}_r`,
      z,
      lane: 'right',
      type: rightType,
      value: rightVal,
      label: rightLabel,
      passed: false,
    });
  });

  // Distribute items (Iron bars, Fireworks, Drums, Flares, Barricades)
  let itemId = 0;

  for (let z = 150; z < trackLength - 200; z += 120 + Math.random() * 80) {
    // Check not colliding right on a gate
    const nearGate = gates.some((g) => Math.abs(g.z - z) < 60);
    if (nearGate) continue;

    const roll = Math.random();

    if (roll < 0.38) {
      // Iron Bars (Barras de Ferro) - clustered sequence of 2-3 bars
      const laneX = (Math.random() - 0.5) * 1.3;
      const count = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        items.push({
          id: `iron_${itemId++}`,
          x: laneX + (Math.random() - 0.5) * 0.2,
          z: z + i * 25,
          type: 'iron_bar',
          collected: false,
        });
      }
    } else if (roll < 0.65) {
      // Fireworks (Rojões)
      const laneX = (Math.random() - 0.5) * 1.3;
      items.push({
        id: `firework_${itemId++}`,
        x: laneX,
        z,
        type: 'firework',
        collected: false,
      });
    } else if (roll < 0.78) {
      // Smoke Flare (Sinalizador) or Drum
      const isFlare = Math.random() > 0.5;
      items.push({
        id: `buff_${itemId++}`,
        x: (Math.random() - 0.5) * 1.2,
        z,
        type: isFlare ? 'flare' : 'drum',
        collected: false,
      });
    } else if (roll < 0.89) {
      // Explosive Bomb on road with ticking fuse!
      const laneX = (Math.random() - 0.5) * 1.4;
      items.push({
        id: `bomb_${itemId++}`,
        x: laneX,
        z,
        type: 'bomb',
        collected: false,
        fuseTimer: 2.2, // Seconds once triggered or active
        exploded: false,
        explosionRadius: 0.55,
      });
    } else if (roll < 0.98) {
      // Barricade (Obstáculo rival quebrável)
      const laneX = Math.random() > 0.5 ? 0.45 : -0.45;
      items.push({
        id: `barricade_${itemId++}`,
        x: laneX,
        z,
        type: 'barricade',
        collected: false,
        hp: 3,
        maxHp: 3,
      });
    }
  }

  // Rival torcida size and combat power based on level
  const baseRivalCount = 35 + level * 22 + Math.floor(Math.random() * 15);
  // Rival power considers basic strength + level multiplier
  const baseRivalPower = Math.round(baseRivalCount * (12 + level * 3.5));

  return {
    trackLength,
    gates,
    items,
    rivalTorcidaCount: baseRivalCount,
    rivalTorcidaPower: baseRivalPower,
  };
}
