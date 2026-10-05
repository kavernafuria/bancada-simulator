import { TorcidaStats, StateTrackers, ActionChoice } from "./bancada_engine";

export interface BotPlayerState {
  dinheiro: number; // Cash balance in R$
  moral: number; // 0..100
  massa: number; // 0..100 (contingente)
  respeito: number; // 0..100 (respeito_nacional)
  pista: number; // 0..100 (poder_pista)
  bancada: number; // 0..100 (pressao_bancada)
  caravana: number; // 0..100
  autonomia: number; // 0..100 (autonomia_financeira)
  relacao_clube?: number; // 0..100
  risco_mp: number; // 0..100
}

export interface OptionEffect {
  id?: string;
  text?: string;
  cost?: number;
  cashDelta?: number;
  statEffects?: {
    contingente?: number;
    pressao_bancada?: number;
    poder_pista?: number;
    caravana?: number;
    autonomia_financeira?: number;
  };
  stateEffects?: {
    moral?: number;
    risco_mp?: number;
    relacao_clube?: number;
    respeito_nacional?: number;
  };
  // Flat deltas fallback support
  deltas?: {
    dinheiro?: number;
    moral?: number;
    massa?: number;
    respeito?: number;
    pista?: number;
    bancada?: number;
    caravana?: number;
    autonomia?: number;
    relacao_clube?: number;
    risco_mp?: number;
  };
}

export interface EvaluationResult {
  indice: number; // 1, 2, 3 or 4 (1-based index)
  atributoCritico: string;
  criticalityScore: number;
  gainOnCritical: number;
  totalNetGain: number;
  justificativa: string;
}

/**
 * Normalizes state to calculate criticalness (distance from ideal).
 * - For positive attributes, lower value means higher criticality (0..100).
 * - For Risco MP, higher value means higher criticality (0..100).
 * - For Dinheiro (Cash), R$ 50.000 is considered ideal (100 pts).
 */
export function getCriticalityScores(state: BotPlayerState): Record<string, number> {
  const normalizedCash = Math.min(100, Math.max(0, state.dinheiro / 500));
  
  return {
    dinheiro: 100 - normalizedCash,
    moral: 100 - Math.min(100, Math.max(0, state.moral)),
    massa: 100 - Math.min(100, Math.max(0, state.massa)),
    respeito: 100 - Math.min(100, Math.max(0, state.respeito)),
    pista: 100 - Math.min(100, Math.max(0, state.pista)),
    bancada: 100 - Math.min(100, Math.max(0, state.bancada)),
    caravana: 100 - Math.min(100, Math.max(0, state.caravana)),
    autonomia: 100 - Math.min(100, Math.max(0, state.autonomia)),
    relacao_clube: 100 - Math.min(100, Math.max(0, state.relacao_clube ?? 50)),
    risco_mp: Math.min(100, Math.max(0, state.risco_mp)), // 100% MP risk is maximum danger
  };
}

/**
 * Extracts attribute deltas from an OptionEffect / ActionChoice
 */
export function extractDeltas(option: OptionEffect): Record<string, number> {
  let dCash = 0;
  if (option.cashDelta !== undefined) dCash += option.cashDelta;
  if (option.cost !== undefined) dCash -= option.cost;
  if (option.deltas?.dinheiro !== undefined) dCash += option.deltas.dinheiro;

  const dMoral = (option.stateEffects?.moral ?? 0) + (option.deltas?.moral ?? 0);
  const dMassa = (option.statEffects?.contingente ?? 0) + (option.deltas?.massa ?? 0);
  const dRespeito = (option.stateEffects?.respeito_nacional ?? 0) + (option.deltas?.respeito ?? 0);
  const dPista = (option.statEffects?.poder_pista ?? 0) + (option.deltas?.pista ?? 0);
  const dBancada = (option.statEffects?.pressao_bancada ?? 0) + (option.deltas?.bancada ?? 0);
  const dCaravana = (option.statEffects?.caravana ?? 0) + (option.deltas?.caravana ?? 0);
  const dAutonomia = (option.statEffects?.autonomia_financeira ?? 0) + (option.deltas?.autonomia ?? 0);
  const dRelacaoClube = (option.stateEffects?.relacao_clube ?? 0) + (option.deltas?.relacao_clube ?? 0);
  const dRiscoMP = (option.stateEffects?.risco_mp ?? 0) + (option.deltas?.risco_mp ?? 0);

  return {
    dinheiro: dCash,
    moral: dMoral,
    massa: dMassa,
    respeito: dRespeito,
    pista: dPista,
    bancada: dBancada,
    caravana: dCaravana,
    autonomia: dAutonomia,
    relacao_clube: dRelacaoClube,
    risco_mp: dRiscoMP,
  };
}

/**
 * Calculates the Total Net Stat Gain for tie-breaking or fallback selection
 */
export function calculateTotalNetGain(deltas: Record<string, number>): number {
  const normalizedCashGain = deltas.dinheiro / 500;
  const safetyGain = -deltas.risco_mp; // reducing MP risk is positive safety gain

  return (
    normalizedCashGain +
    deltas.moral +
    deltas.massa +
    deltas.respeito +
    deltas.pista +
    deltas.bancada +
    deltas.caravana +
    deltas.autonomia +
    deltas.relacao_clube +
    safetyGain
  );
}

/**
 * Método de Avaliação de Escolhas (Autoplay Utility Agent)
 * 
 * @param estadoAtual Estado dos atributos e trackers do jogador
 * @param opcoesDisponiveis Lista de escolhas/opções do evento (Opção 1, 2, 3 ou 4)
 * @returns Índice 1..4 (ou 1-based index) da melhor escolha
 */
export function AvaliarMelhorOpcao(
  estadoAtual: BotPlayerState,
  opcoesDisponiveis: OptionEffect[]
): number {
  if (!opcoesDisponiveis || opcoesDisponiveis.length === 0) return 1;

  // Passo 1 & 2: Identificar o atributo mais crítico (maior deficit / maior distância do ideal)
  const criticalities = getCriticalityScores(estadoAtual);
  let mostCriticalAttr = "moral";
  let maxCriticality = -1;

  for (const [attr, score] of Object.entries(criticalities)) {
    if (score > maxCriticality) {
      maxCriticality = score;
      mostCriticalAttr = attr;
    }
  }

  // Passo 3 & 4: Simular mentalmente cada opção para o atributo mais crítico
  const optionEvaluations = opcoesDisponiveis.map((opt, index) => {
    const deltas = extractDeltas(opt);
    
    // Gain on critical attribute
    let gainOnCritical = 0;
    if (mostCriticalAttr === "risco_mp") {
      gainOnCritical = -deltas.risco_mp; // Reduzir Risco MP = Ganho de Segurança Positivo
    } else {
      gainOnCritical = deltas[mostCriticalAttr] ?? 0;
    }

    const totalNetGain = calculateTotalNetGain(deltas);

    return {
      index: index + 1, // 1-based index (1, 2, 3, 4)
      optionText: opt.text || `Opção ${index + 1}`,
      deltas,
      gainOnCritical,
      totalNetGain,
    };
  });

  // Identificar maior ganho no atributo crítico
  const maxGainOnCritical = Math.max(...optionEvaluations.map((e) => e.gainOnCritical));

  let chosenIndex = 1;

  if (maxGainOnCritical > 0) {
    // Passo 4: Filtrar opções com o maior ganho no atributo crítico
    const bestCandidates = optionEvaluations.filter((e) => e.gainOnCritical === maxGainOnCritical);
    
    if (bestCandidates.length === 1) {
      chosenIndex = bestCandidates[0].index;
    } else {
      // Passo 5 (Desempate): Se houver empate, escolher a com maior ganho na soma geral de status
      bestCandidates.sort((a, b) => b.totalNetGain - a.totalNetGain);
      chosenIndex = bestCandidates[0].index;
    }
  } else {
    // Passo 5: Se nenhuma opção trouxer ganho positivo para o atributo crítico,
    // escolher a opção com maior ganho na soma geral de status.
    optionEvaluations.sort((a, b) => b.totalNetGain - a.totalNetGain);
    chosenIndex = optionEvaluations[0].index;
  }

  return chosenIndex;
}

// Alias em minúsculo para convenção JS/TS
export const avaliarMelhorOpcao = AvaliarMelhorOpcao;
