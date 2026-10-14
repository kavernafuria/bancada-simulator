import { describe, it, expect } from "vitest";
import { getPresidentOptions } from "../lib/bancada_engine";
import { getSeasonalActionEvent } from "../lib/season_events";

describe("Text Conciseness Unit Tests", () => {
  it("should have president descriptions under 75 characters", () => {
    const options = getPresidentOptions();
    expect(options.length).toBe(3);
    for (const opt of options) {
      expect(opt.description.length).toBeLessThanOrEqual(75);
      expect(opt.bonus.length).toBeLessThanOrEqual(75);
      expect(opt.penalty.length).toBeLessThanOrEqual(75);
    }
  });

  it("should have action step narratives under 80 characters for both capital and interior", () => {
    const periods = [1, 2, 3, 4, 5] as const;
    for (const isInterior of [false, true]) {
      for (const period of periods) {
        for (let season = 1; season <= 3; season++) {
          const event = getSeasonalActionEvent(period, season, period, isInterior);
          expect(event.contextNarrative.length).toBeLessThanOrEqual(80);
        }
      }
    }
  });
});
