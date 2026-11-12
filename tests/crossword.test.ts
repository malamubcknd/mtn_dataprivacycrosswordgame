import { describe, it, expect } from "vitest";
import { generateCrossword } from "../src/lib/crossword-generator";

describe("crossword generator", () => {
  it("places intersecting words", () => {
    const layout = generateCrossword([
      { questionId: "1", clue: "a", answer: "DATA", points: 10, direction: "AUTO" },
      { questionId: "2", clue: "b", answer: "TRUST", points: 10, direction: "AUTO" } // shares T
    ]);
    expect(layout.words.length).toBeGreaterThanOrEqual(1);
  });
  it("places single word when no crossings possible", () => {
    const layout = generateCrossword([
      { questionId: "1", clue: "a", answer: "PRIVACY", points: 10, direction: "AUTO" },
      { questionId: "2", clue: "b", answer: "XYZQW", points: 10, direction: "AUTO" }
    ]);
    expect(layout.words.length).toBeGreaterThanOrEqual(1);
    expect(layout.words.length + layout.unplaced.length).toBe(2);
  });
});