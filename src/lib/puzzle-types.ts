export type CellType = "BLACK" | "LETTER";

export interface PuzzleCell {
  row: number;
  col: number;
  type: CellType;
  letter?: string; // correct letter (server-side only)
  number?: number;
  acrossWordId?: string;
  downWordId?: string;
}

export interface PuzzleWord {
  id: string;
  questionId: string;
  clue: string;
  points: number;
  direction: "ACROSS" | "DOWN";
  row: number;
  col: number;
  length: number;
  number: number;
  answer: string; // normalized - SERVER ONLY
}

export interface PuzzleLayout {
  width: number;
  height: number;
  cells: PuzzleCell[];
  words: PuzzleWord[];
  unplaced: { questionId: string; clue: string; answer: string }[];
}

// Public (client-safe) version with no answers
export interface PublicPuzzleCell {
  row: number;
  col: number;
  type: CellType;
  number?: number;
  acrossWordId?: string;
  downWordId?: string;
}

export interface PublicPuzzleWord {
  id: string;
  questionId: string;
  clue: string;
  points: number;
  direction: "ACROSS" | "DOWN";
  row: number;
  col: number;
  length: number;
  number: number;
}

export interface PublicPuzzleLayout {
  width: number;
  height: number;
  cells: PublicPuzzleCell[];
  words: PublicPuzzleWord[];
}

export function toPublicLayout(layout: PuzzleLayout): PublicPuzzleLayout {
  return {
    width: layout.width,
    height: layout.height,
    cells: layout.cells.map(c => ({
      row: c.row, col: c.col, type: c.type, number: c.number,
      acrossWordId: c.acrossWordId, downWordId: c.downWordId
    })),
    words: layout.words.map(w => ({
      id: w.id, questionId: w.questionId, clue: w.clue, points: w.points,
      direction: w.direction, row: w.row, col: w.col, length: w.length, number: w.number
    }))
  };
}