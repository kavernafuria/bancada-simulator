import { MatchSimulationResult } from '../types';

export function calculateMatchSimulation(
  homeTeamStrength: number,
  awayTeamStrength: number,
  busReceptionScore: number,
  stadiumPartyScore: number
): MatchSimulationResult {
  // Média da Torcida = (Recepção do Ônibus + Festa na Arquibancada) / 2
  const crowdAverage = Math.round(((busReceptionScore + stadiumPartyScore) / 2) * 10) / 10;

  // Força Final = (Força do Time da Casa * 0.75) + (Média da Torcida * 0.25)
  const homeFinalStrength = Math.round(((homeTeamStrength * 0.75) + (crowdAverage * 0.25)) * 10) / 10;
  const awayFinalStrength = awayTeamStrength;

  const diff = homeFinalStrength - awayFinalStrength;

  // Placar baseado na probabilidade e diferença
  let homeGoals = 0;
  let awayGoals = 0;

  // Se a diferença for dentro da margem de 3 pontos => alta probabilidade de Empate
  if (Math.abs(diff) <= 3) {
    // Empate equilibrado (0x0, 1x1 ou 2x2)
    const baseGoals = Math.min(Math.floor((homeFinalStrength + awayFinalStrength) / 55), 2);
    homeGoals = baseGoals;
    awayGoals = baseGoals;
    if (diff > 1 && Math.random() > 0.65) {
      homeGoals += 1; // Leve vantagem no detalhe
    } else if (diff < -1 && Math.random() > 0.65) {
      awayGoals += 1;
    }
  } else if (diff > 3) {
    // Vitória do mandante
    if (diff > 25) {
      homeGoals = 3 + Math.floor(Math.random() * 2);
      awayGoals = Math.random() > 0.6 ? 1 : 0;
    } else if (diff > 12) {
      homeGoals = 2 + (Math.random() > 0.5 ? 1 : 0);
      awayGoals = Math.random() > 0.4 ? 1 : 0;
    } else {
      homeGoals = 1 + (Math.random() > 0.6 ? 1 : 0);
      awayGoals = Math.random() > 0.7 ? 1 : 0;
    }
  } else {
    // Vitória do visitante
    const awayDiff = Math.abs(diff);
    if (awayDiff > 25) {
      awayGoals = 3 + Math.floor(Math.random() * 2);
      homeGoals = Math.random() > 0.6 ? 1 : 0;
    } else if (awayDiff > 12) {
      awayGoals = 2 + (Math.random() > 0.5 ? 1 : 0);
      homeGoals = Math.random() > 0.4 ? 1 : 0;
    } else {
      awayGoals = 1 + (Math.random() > 0.6 ? 1 : 0);
      homeGoals = Math.random() > 0.7 ? 1 : 0;
    }
  }

  const mathExplanation = `(Força Casa: ${homeTeamStrength} × 0.75 = ${(homeTeamStrength * 0.75).toFixed(1)}) + (Média Torcida: ${crowdAverage.toFixed(1)} × 0.25 = ${(crowdAverage * 0.25).toFixed(1)}) = Força Final Casa ${homeFinalStrength.toFixed(1)} vs Força Visitante ${awayFinalStrength.toFixed(1)}`;

  // Geração de 3 parágrafos narrativos refletindo o impacto matemático
  const narrative = generateNarrative(
    homeTeamStrength,
    awayTeamStrength,
    crowdAverage,
    homeFinalStrength,
    awayFinalStrength,
    diff,
    homeGoals,
    awayGoals
  );

  return {
    homeTeamStrength,
    awayTeamStrength,
    busReceptionScore,
    stadiumPartyScore,
    crowdAverage,
    homeFinalStrength,
    awayFinalStrength,
    homeGoals,
    awayGoals,
    mathExplanation,
    narrative,
  };
}

function generateNarrative(
  homeStrength: number,
  awayStrength: number,
  crowdAverage: number,
  homeFinal: number,
  awayFinal: number,
  diff: number,
  homeGoals: number,
  awayGoals: number
): [string, string, string] {
  const isCrowdCarrying = homeStrength < awayStrength && homeFinal >= awayFinal;
  const isCrowdHyped = crowdAverage >= 75;
  const isCrowdCold = crowdAverage < 45;

  let p1 = '';
  let p2 = '';
  let p3 = '';

  // 1º Parágrafo: O Clima Inicial e a Chegada
  if (isCrowdHyped) {
    p1 = `O estádio era um verdadeiro caldeirão desde as primeiras horas da tarde. O mar de sinalizadores e o ritmo ensurdecedor da bateria contagiaram os onze titulares na entrada em campo, fazendo o gramado pulsar a cada toque na bola e empurrando a equipe contra as linhas defensivas adversárias com intensidade eletrizante.`;
  } else if (isCrowdCold) {
    p1 = `A atmosfera nas arquibancadas começou tensa e hesitante, com a torcida sofrendo para encontrar a cadência das canções. Esse compasso quebrado refletiu-se nos primeiros minutos de jogo, com o time da casa errando passes laterais simples enquanto o adversário aproveitava os espaços no meio-campo para ditar o seu ritmo.`;
  } else {
    p1 = `Com as bancadas divididas entre a ansiedade e a esperança, os donos da casa sentiram o peso de um clássico disputado centímetro a centímetro. O apoio constante dos setores populares equilibrou as investidas iniciais do visitante, estabelecendo uma disputa física ferrenha desde o apito inaugural do árbitro.`;
  }

  // 2º Parágrafo: O Confronto e Impacto Tático
  if (isCrowdCarrying) {
    p2 = `Embora no papel a equipe visitante demonstrasse maior qualidade técnica (${awayStrength} contra ${homeStrength} base), o fator bancada transformou o duelo numa prova de superação implacável. Cada desarme da zaga virava motivo de explosão nas arquibancadas, criando uma pressão sufocante que desestruturou a troca de passes rival e multiplicou a energia física dos donos da casa.`;
  } else if (diff > 10) {
    p2 = `Dominando amplamente as ações táticas, o time mandante soube capitalizar a sintonia com os torcedores. Triangulações rápidas nas pontas desmontaram a retranca visitante, permitindo que a superioridade calculada de ${homeFinal.toFixed(1)} contra ${awayFinal.toFixed(1)} se traduzisse em chances claras de gol e controle absoluto do meio-campo.`;
  } else if (Math.abs(diff) <= 3) {
    p2 = `A partida permaneceu travada e eletrizante em cada disputa de bola. Com os dois planteis em pé de igualdade (diferença de apenas ${Math.abs(diff).toFixed(1)} pontos após a influência das arquibancadas), goleiros e zagueiros viraram os grandes protagonistas, frustrando as tentativas ofensivas em um duelo de nervos de aço.`;
  } else {
    p2 = `Mesmo com os esforços da bancada para manter o apoio contínuo, a frieza técnica e a disciplina tática da equipe visitante começaram a prevalecer no segundo tempo. Aproveitando os momentos de desatenção mandante, o rival encontrou espaços vitais nas entrelinhas para neutralizar qualquer ímpeto de reação.`;
  }

  // 3º Parágrafo: O Desfecho e o Placar Final
  if (homeGoals > awayGoals) {
    p3 = `O apito final coroou uma exibição memorável, sacramentando o placar de ${homeGoals} a ${awayGoals}. A sintonia entre o suor derramado no campo e a paixão inesgotável das arquibancadas comprovou que, quando a torcida joga junto, a matemática do futebol se curva à energia do caldeirão.`;
  } else if (homeGoals === awayGoals) {
    p3 = `Com o marcador selado em um justo empate por ${homeGoals} a ${awayGoals}, os torcedores aplaudiram a entrega coletiva. Foi um jogo onde ninguém arredou o pé, e cada ponto conquistado refletiu a paridade extrema entre as duas forças que duelaram sob sol e chuva até o último suspiro.`;
  } else {
    p3 = `Ao término dos 90 minutos, o placar de ${homeGoals} a ${awayGoals} a favor do visitante deixou lições claras para a temporada. A bancada cantou até o fim em sinal de lealdade, mas o time precisará de ajustes táticos imediatos para transformar o apoio incondicional das arquibancadas em vitórias no gramado.`;
  }

  return [p1, p2, p3];
}
