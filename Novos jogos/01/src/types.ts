export type FeedbackType = 'perfect' | 'good' | 'miss' | 'idle';

export interface GameStats {
  combo: number;
  maxCombo: number;
  totalHits: number;
  totalMisses: number;
  score: number; // 0 to 100 (Torcida rating)
  speedMultiplier: number;
  timeLeft: number; // 0 to 20s
  isPlaying: boolean;
  isFinished: boolean;
  currentBpm: number;
}

export interface MatchSimulationResult {
  homeTeamStrength: number;
  awayTeamStrength: number;
  busReceptionScore: number;
  stadiumPartyScore: number; // calculated from the rhythm minigame
  crowdAverage: number;
  homeFinalStrength: number;
  awayFinalStrength: number;
  homeGoals: number;
  awayGoals: number;
  mathExplanation: string;
  narrative: [string, string, string]; // 3 paragraphs
}
