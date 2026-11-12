export interface RankableAttempt {
  id: string;
  playerId: string;
  normalizedEmployeeId: string;
  fullOfficialName: string;
  score: number;
  correctAnswerCount: number;
  durationSeconds: number;
  submissionTime: Date;
}

export function rankAttempts<T extends RankableAttempt>(attempts: T[]): T[] {
  return [...attempts].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correctAnswerCount !== a.correctAnswerCount) return b.correctAnswerCount - a.correctAnswerCount;
    if (a.durationSeconds !== b.durationSeconds) return a.durationSeconds - b.durationSeconds;
    return a.submissionTime.getTime() - b.submissionTime.getTime();
  });
}

export function bestPerEmployee<T extends RankableAttempt>(attempts: T[]): T[] {
  const ranked = rankAttempts(attempts);
  const seen = new Set<string>();
  const out: T[] = [];
  for (const a of ranked) {
    if (seen.has(a.normalizedEmployeeId)) continue;
    seen.add(a.normalizedEmployeeId);
    out.push(a);
  }
  return out;
}