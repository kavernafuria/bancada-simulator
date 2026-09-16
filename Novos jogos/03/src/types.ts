export interface TeamInfo {
  id: string;
  name: string;
  nickname: string;
  stadium: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  baseStrength: number;
  chants: string[];
}

export interface MatchSimulationResult {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeBaseStrength: number;
  awayBaseStrength: number;
  busScore: number;
  standScore: number;
  crowdAverage: number;
  finalHomeStrength: number;
  finalAwayStrength: number;
  homeGoals: number;
  awayGoals: number;
  outcome: 'home_win' | 'draw' | 'away_win';
  mathBreakdown: string;
  narrative: [string, string, string]; // 3 parágrafos narrativos
  keyEvents: Array<{
    minute: number;
    description: string;
    type: 'goal_home' | 'goal_away' | 'chant' | 'chance' | 'card';
  }>;
}

export interface ArquibancadaAction {
  id: string;
  name: string;
  cost: number;
  description: string;
  fieldPush: number;
  moraleBoost: number;
  decibelBoost: number;
  iconName: string;
  durationMs: number;
}
