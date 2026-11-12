import { PuzzleLayout } from "./puzzle-types";

export interface GridState {
  [key: string]: string;
}

export interface ScoringResult {
  score: number;
  totalAvailableScore: number;
  correctAnswerCount: number;
  totalQuestionCount: number;
  perWord: {
    wordId: string;
    questionId: string;
    submitted: string;
    isCorrect: boolean;
    pointsEarned: number;
  }[];
}

export function scoreAttempt(layout: PuzzleLayout, gridState: GridState): ScoringResult {
  const perWord: ScoringResult["perWord"] = [];
  let score = 0;
  let correctAnswerCount = 0;
  let totalAvailableScore = 0;

  for (const w of layout.words) {
    totalAvailableScore += w.points;

    let submitted = "";
    let complete = true;
    for (let i = 0; i < w.length; i++) {
      const r = w.direction === "ACROSS" ? w.row : w.row + i;
      const c = w.direction === "ACROSS" ? w.col + i : w.col;
      const letter = (gridState[`${r},${c}`] || "").toUpperCase().trim();
      if (!letter) { complete = false; break; }
      submitted += letter;
    }

    const isCorrect = complete && submitted === w.answer.toUpperCase();
    const pointsEarned = isCorrect ? w.points : 0;
    if (isCorrect) {
      score += w.points;
      correctAnswerCount++;
    }
    perWord.push({
      wordId: w.id,
      questionId: w.questionId,
      submitted,
      isCorrect,
      pointsEarned,
    });
  }

  return {
    score,
    totalAvailableScore,
    correctAnswerCount,
    totalQuestionCount: layout.words.length,
    perWord,
  };
}