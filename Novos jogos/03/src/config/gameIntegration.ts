import { TeamInfo } from '../types';

/**
 * BANCADA SIMULATOR - CONFIGURAÇÃO DE INTEGRAÇÃO COM SEU JOGO
 * Exportado com as cores personalizadas que você definiu na bancada!
 */

export interface GameIntegrationTheme {
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
}

export const CUSTOM_GAME_CONFIG: GameIntegrationTheme = {
  "homeTeam": {
    "id": "meu-jogo-mandante",
    "name": "Meu Clube FC",
    "nickname": "O Campeão",
    "stadium": "Estádio Monumental",
    "primaryColor": "#0080ff",
    "secondaryColor": "#ffffff",
    "accentColor": "#f59e0b",
    "baseStrength": 80,
    "chants": [
      "Vamos, vamos meu time!",
      "Aqui manda o dono da casa!",
      "Com a força da nossa gente!",
      "Raça até o apito final!"
    ]
  },
  "awayTeam": {
    "id": "meu-jogo-visitante",
    "name": "Rival Esporte Clube",
    "nickname": "O Adversário",
    "stadium": "Arena Neutra",
    "primaryColor": "#c8102e",
    "secondaryColor": "#1a1a1a",
    "accentColor": "#ffffff",
    "baseStrength": 75,
    "chants": [
      "Vamos lutar!"
    ]
  }
};

export function loadGameIntegrationTheme(): GameIntegrationTheme {
  return CUSTOM_GAME_CONFIG;
}
