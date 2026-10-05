import { describe, it, expect } from "vitest";
import { AvaliarMelhorOpcao, BotPlayerState, OptionEffect } from "../lib/autoplay_bot";

describe("Autoplay Bot Utility Agent (AvaliarMelhorOpcao)", () => {
  it("picks the option that maximizes gain for low Moral when Moral is most critical", () => {
    const state: BotPlayerState = {
      dinheiro: 50000,
      moral: 10, // Extremely low -> Criticality = 90
      massa: 70,
      respeito: 60,
      pista: 80,
      bancada: 70,
      caravana: 70,
      autonomia: 70,
      risco_mp: 10,
    };

    const options: OptionEffect[] = [
      { text: "Opção 1", stateEffects: { moral: 2 }, cost: 0 },
      { text: "Opção 2", stateEffects: { moral: 10 }, cost: 5000 },
      { text: "Opção 3", statEffects: { poder_pista: 15 }, cost: 0 },
    ];

    const result = AvaliarMelhorOpcao(state, options);
    expect(result).toBe(2); // Option 2 delivers +10 Moral
  });

  it("picks the option that reduces Risco MP when Risco MP is at dangerous levels (e.g. 90%)", () => {
    const state: BotPlayerState = {
      dinheiro: 50000,
      moral: 80,
      massa: 80,
      respeito: 80,
      pista: 80,
      bancada: 80,
      caravana: 80,
      autonomia: 80,
      risco_mp: 95, // Extremely high -> Criticality = 95
    };

    const options: OptionEffect[] = [
      { text: "Opção 1", stateEffects: { moral: 10, risco_mp: 5 } },
      { text: "Opção 2", stateEffects: { risco_mp: -15 } },
      { text: "Opção 3", statEffects: { poder_pista: 20 } },
    ];

    const result = AvaliarMelhorOpcao(state, options);
    expect(result).toBe(2); // Option 2 reduces MP risk by 15
  });

  it("uses total net stat gain as tie-breaker when multiple options tie on critical attribute gain", () => {
    const state: BotPlayerState = {
      dinheiro: 50000,
      moral: 20, // Criticality = 80
      massa: 70,
      respeito: 60,
      pista: 70,
      bancada: 70,
      caravana: 70,
      autonomia: 70,
      risco_mp: 10,
    };

    const options: OptionEffect[] = [
      { text: "Opção 1", stateEffects: { moral: 5 }, statEffects: { poder_pista: 2 } },
      { text: "Opção 2", stateEffects: { moral: 5 }, statEffects: { poder_pista: 10, pressao_bancada: 10 } },
    ];

    const result = AvaliarMelhorOpcao(state, options);
    expect(result).toBe(2); // Option 2 has higher overall net stat gain
  });
});
