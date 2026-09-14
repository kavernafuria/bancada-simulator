export type FeedbackType = 'perfect' | 'good' | 'miss' | 'idle';

export interface RhythmGameStats {
  combo: number;
  maxCombo: number;
  totalHits: number;
  totalMisses: number;
  score: number; // 0 to 100
  speedMultiplier: number;
  timeLeft: number; // 0 to 20s
  isPlaying: boolean;
  isFinished: boolean;
  currentBpm: number;
}

export interface RhythmResult {
  score: number;
  rank: 'S' | 'A' | 'B' | 'C' | 'F';
  modifier: number;
  cashReward: number;
  moralReward: number;
  description: string;
}
