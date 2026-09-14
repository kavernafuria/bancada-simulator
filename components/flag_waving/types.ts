export interface Point {
  x: number;
  y: number;
}

export interface PathPattern {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  timeLimit: number;
  generatePoints: (width: number, height: number) => Point[];
  svgPathD: (width: number, height: number) => string;
}

export type GameState =
  | 'idle'
  | 'countdown'
  | 'playing'
  | 'round_success'
  | 'round_fail'
  | 'game_over';

export interface RoundResult {
  round: number;
  patternName: string;
  accuracy: number;
  coverage: number;
  missCount: number;
  timeTaken: number;
  timeLimit: number;
  isPerfect: boolean;
  score: number;
}

export interface GameSettings {
  errorThresholdPx: number;
  showGuideZone: boolean;
  hapticFeedback: boolean;
  audioEnabled: boolean;
  flagTheme: 'tricolor' | 'rubronegro' | 'alvinegro' | 'verdao';
}
