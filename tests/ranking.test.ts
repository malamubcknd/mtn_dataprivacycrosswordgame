import { describe, it, expect } from "vitest";
import { rankAttempts, bestPerEmployee } from "../src/lib/ranking";

const now = new Date();
const mk = (id: string, emp: string, score: number, correct: number, dur: number, sub: number) => ({
  id, playerId: id, normalizedEmployeeId: emp, fullOfficialName: id, score, correctAnswerCount: correct,
  durationSeconds: dur, submissionTime: new Date(now.getTime() + sub)
});

describe("ranking", () => {
  it("ranks by score, correct, duration, submissionTime", () => {
    const a = mk("A","E1", 80, 8, 225, 2000);
    const b = mk("B","E2", 80, 8, 202, 1000);
    const r = rankAttempts([a,b]);
    expect(r[0].id).toBe("B");
  });
  it("keeps best per employee", () => {
    const a1 = mk("A1","E1", 50, 5, 100, 1000);
    const a2 = mk("A2","E1", 80, 8, 200, 2000);
    const b = mk("B","E2", 70, 7, 150, 1500);
    const r = bestPerEmployee([a1,a2,b]);
    expect(r.map(x=>x.id)).toEqual(["A2","B"]);
  });
});