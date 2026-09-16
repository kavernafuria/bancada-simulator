import { MatchSimulationParams, MatchSimulationResult } from '../types';

export function calculateMatchSimulation(
  params: MatchSimulationParams
): MatchSimulationResult {
  const { homeForce, awayForce, busReceptionScore, stadiumPartyScore } = params;

  // 1. Crowd Average
  const crowdAverage = Math.round((busReceptionScore + stadiumPartyScore) / 2);

  // 2. Final Home Force = (Home * 0.75) + (Crowd * 0.25)
  const weightedHome = homeForce * 0.75;
  const weightedCrowd = crowdAverage * 0.25;
  const finalHomeForce = Math.round((weightedHome + weightedCrowd) * 10) / 10;

  // 3. Away final force is its base force
  const finalAwayForce = Math.round(awayForce * 10) / 10;

  const diff = finalHomeForce - finalAwayForce;

  let outcome: 'home_win' | 'away_win' | 'draw' = 'draw';
  let homeScore = 1;
  let awayScore = 1;

  // 3-point margin for a draw
  if (Math.abs(diff) <= 3) {
    outcome = 'draw';
    if (finalHomeForce > 70) {
      homeScore = 2;
      awayScore = 2;
    } else if (finalHomeForce < 45) {
      homeScore = 0;
      awayScore = 0;
    } else {
      homeScore = 1;
      awayScore = 1;
    }
  } else if (diff > 3) {
    outcome = 'home_win';
    if (diff > 25) {
      homeScore = 4;
      awayScore = 0;
    } else if (diff > 15) {
      homeScore = 3;
      awayScore = 1;
    } else if (diff > 8) {
      homeScore = 2;
      awayScore = 0;
    } else {
      homeScore = 2;
      awayScore = 1;
    }
  } else {
    outcome = 'away_win';
    if (diff < -20) {
      homeScore = 0;
      awayScore = 3;
    } else if (diff < -10) {
      homeScore = 1;
      awayScore = 2;
    } else {
      homeScore = 0;
      awayScore = 1;
    }
  }

  // Generate 3-paragraph narrative reflecting mathematical impact
  const narrative: string[] = [];

  // Paragraph 1: O Clima e a Chegada (Impacto da Torcida e Recepção)
  if (crowdAverage >= 80) {
    narrative.push(
      `O caldeirão ferveu antes mesmo do apito inicial. Com a Recepção do Ônibus marcando ${busReceptionScore} e um espetáculo de bandeirão nota ${stadiumPartyScore} na arquibancada (Média da Torcida: ${crowdAverage}), o estádio pulsava com fumaça colorida e cantos ensurdecedores. Esse empurrão das arquibancadas transformou a atmosfera em uma verdadeira muralha psicológica contra os visitantes.`
    );
  } else if (crowdAverage >= 50) {
    narrative.push(
      `A torcida marcou presença e cumpriu seu papel de empurrar o time mandante. Com média da arquibancada de ${crowdAverage} pontos (Recepção: ${busReceptionScore}, Bandeirão: ${stadiumPartyScore}), os torcedores mantiveram o ritmo com bandeirões tremulando nos momentos cruciais e criaram um ambiente competitivo para a partida.`
    );
  } else {
    narrative.push(
      `A festa nas arquibancadas começou tímida, com o bandeirão sem o sincronismo ideal e nota média da torcida de ${crowdAverage} pontos. O time mandante precisou buscar forças exclusivamente na sua formação tática inicial (${homeForce} pts), já que o fator campo não conseguiu desestabilizar a postura inicial do adversário.`
    );
  }

  // Paragraph 2: O Confronto em Campo (Ponderação 75% Time + 25% Torcida)
  if (homeForce < awayForce && finalHomeForce > finalAwayForce) {
    // Overcame underdog status via crowd buff!
    narrative.push(
      `Tecnicamente inferior no papel (${homeForce} contra ${awayForce} do adversário), o mandante compensou cada deficiência na base da raça e do abafa. A injeção de 25% da bancada elevou o poder de combate da equipe para ${finalHomeForce}, travando as investidas rivais na intermediária e incendiando as divididas com uma energia quase sobrenatural vinda das grades.`
    );
  } else if (homeForce >= awayForce && finalHomeForce > finalAwayForce) {
    narrative.push(
      `Com superioridade técnica respaldada pela fúria positiva das arquibancadas, o time da casa impôs um ritmo sufocante desde os primeiros minutos. A Força Final de ${finalHomeForce} contra ${finalAwayForce} do visitante traduziu-se em controle absoluto da posse de bola, triangulações verticais rápidas e finalizações perigosas que encurralaram a defesa adversária.`
    );
  } else if (Math.abs(diff) <= 3) {
    narrative.push(
      `O jogo se desenhou como uma batalha tática milimétrica. Com forças finais quase equivalentes (${finalHomeForce} vs ${finalAwayForce}), cada centímetro de gramado foi disputado como uma final de campeonato. O visitante suportou a pressão dos bandeirões e armou contragolpes perigosos, mantendo o confronto em equilíbrio tenso até o minuto final.`
    );
  } else {
    narrative.push(
      `Mesmo com as tentativas da bancada de inflamar o jogo, o visitante demonstrou frieza cirúrgica com sua base sólida de ${finalAwayForce} pontos. O time da casa, atingindo Força Final de ${finalHomeForce}, sentiu o peso dos desfalques e não conseguiu furar as linhas de marcação bem postadas do rival.`
    );
  }

  // Paragraph 3: O Desfecho e o Placar Final
  if (outcome === 'home_win') {
    narrative.push(
      `A explosão veio nos minutos finais: com a arquibancada cantando a plenos pulmões sob as luzes dos refletores, o mandante selou uma vitória maiúscula por ${homeScore} a ${awayScore}. Um resultado construído na união inabalável entre o gramado e o asfalto da torcida!`
    );
  } else if (outcome === 'draw') {
    narrative.push(
      `O apito final ecoou decretando a igualdade de ${homeScore} a ${awayScore}. Um empate eletrizante onde o suor e a entrega física de ambos os lados deixaram a sensação de um clássico disputado na lealdade e na coragem até o último suspiro.`
    );
  } else {
    narrative.push(
      `No contra-ataque derradeiro, o adversário garantiu o triunfo por ${awayScore} a ${homeScore}. Fica o reconhecimento para a torcida que tremulou o bandeirão e apoiou incondicionalmente até o último segundo, provando a honra da sua camisa.`
    );
  }

  const calculationSummary = `(Time da Casa: ${homeForce} × 0.75) + (Média Torcida: ${crowdAverage} × 0.25) = Força Final ${finalHomeForce} vs Adversário ${finalAwayForce}`;

  return {
    crowdAverage,
    finalHomeForce,
    finalAwayForce,
    difference: diff,
    outcome,
    homeScore,
    awayScore,
    narrative,
    calculationSummary,
  };
}
