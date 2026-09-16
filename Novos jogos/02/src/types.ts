export interface Point {
  x: number;
  y: number;
}

export interface PathPattern {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  timeLimit: number; // in seconds
  // Generator function that takes canvas width & height and returns array of sampled points
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
  accuracy: number; // 0 - 100%
  coverage: number; // 0 - 100%
  missCount: number;
  timeTaken: number; // in seconds
  timeLimit: number;
  isPerfect: boolean;
  score: number; // 0 - 100
}

export interface GameSettings {
  errorThresholdPx: number; // margin of error (default 42px)
  showGuideZone: boolean;
  hapticFeedback: boolean;
  audioEnabled: boolean;
  flagTheme: 'tricolor' | 'rubronegro' | 'alvinegro' | 'verdao';
}

export interface MatchSimulationParams {
  homeForce: number; // 0 - 100
  awayForce: number; // 0 - 100
  busReceptionScore: number; // 0 - 100
  stadiumPartyScore: number; // 0 - 100 (pontuacaoBandeira)
}

export interface MatchSimulationResult {
  crowdAverage: number;
  finalHomeForce: number;
  finalAwayForce: number;
  difference: number;
  outcome: 'home_win' | 'away_win' | 'draw';
  homeScore: number;
  awayScore: number;
  narrative: string[]; // 3 paragraphs
  calculationSummary: string;
}
