import { describe, it, expect } from "vitest";
import { scoreAttempt } from "../src/lib/scoring";
import { PuzzleLayout } from "../src/lib/puzzle-types";

const layout: PuzzleLayout = {
  width: 5, height: 1,
  cells: Array.from({ length: 5 }, (_, i) => ({ row: 0, col: i, type: "LETTER", letter: "HELLO"[i] })),
  words: [{ id: "W0", questionId: "Q1", clue: "Greeting", points: 10, direction: "ACROSS", row: 0, col: 0, length: 5, number: 1, answer: "HELLO" }],
  unplaced: []
};

describe("scoring", () => {
  it("awards full points for correct", () => {
    const r = scoreAttempt(layout, { "0,0":"H","0,1":"E","0,2":"L","0,3":"L","0,4":"O" });
    expect(r.score).toBe(10); expect(r.correctAnswerCount).toBe(1);
  });
  it("gives zero for incorrect", () => {
    const r = scoreAttempt(layout, { "0,0":"H","0,1":"E","0,2":"L","0,3":"L","0,4":"P" });
    expect(r.score).toBe(0);
  });
  it("gives zero for incomplete", () => {
    const r = scoreAttempt(layout, { "0,0":"H" });
    expect(r.score).toBe(0);
  });
});