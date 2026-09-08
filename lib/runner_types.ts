export interface RunnerTeam {
  id: string;
  name: string;
  shortName: string;
  club: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  mascot: string;
  slogan: string;
  contingent?: number;
  pistaOverall?: number;
  pistaDefense?: number;
}

export type GateType = 'add' | 'mult' | 'sub' | 'div';

export interface Gate {
  id: string;
  z: number;
  lane: 'left' | 'right';
  type: GateType;
  value: number;
  label: string;
  passed: boolean;
}

export type ItemType = 'iron_bar' | 'firework' | 'drum' | 'flare' | 'barricade' | 'bomb';

export interface TrackItem {
  id: string;
  x: number; // -1 to 1 normalized lane position
  z: number; // Distance down the avenue
  type: ItemType;
  collected: boolean;
  hp?: number;
  maxHp?: number;
  fuseTimer?: number; // Countdown for bombs (in seconds)
  exploded?: boolean;
  explosionRadius?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  exploded: boolean;
  isRival?: boolean;
  damage?: number;
}

export interface Particle {
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
  isSpark?: boolean;
  isSmoke?: boolean;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  scale: number;
}

export type CameraMode = 'top_down' | 'classic_3d';

export interface Upgrades {
  startingMembers: number; // Level 0-10
  ironBarPower: number;    // Level 0-10
  fireworkBlast: number;   // Level 0-10
  crowdMorale: number;     // Level 0-10
}

export interface GameState {
  stage: 'menu' | 'playing' | 'clash' | 'victory' | 'defeat';
  distanceProgress: number; // 0 to 1
  crowdCount: number;
  ironBars: number;
  fireworks: number;
  flaresActive: number;
  totalCombatPower: number;
  rivalCount: number;
  rivalPower: number;
  coins: number;
  level: number;
}
