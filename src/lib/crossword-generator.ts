import { PuzzleLayout, PuzzleCell, PuzzleWord } from "./puzzle-types";

export interface GeneratorInput {
  questionId: string;
  clue: string;
  answer: string; // normalized
  points: number;
  direction: "AUTO" | "ACROSS" | "DOWN";
}

interface Placement {
  row: number;
  col: number;
  direction: "ACROSS" | "DOWN";
  length: number;
}

const GRID_SIZE = 20;

export function generateCrossword(inputs: GeneratorInput[]): PuzzleLayout {
  // Sort: longest first, with direction preferences respected
  const items = [...inputs].filter(i => i.answer.length >= 2).sort((a, b) => b.answer.length - a.answer.length);

  const grid: (string | null)[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(null));
  const placed: (PuzzleWord & { answer: string })[] = [];
  const unplaced: { questionId: string; clue: string; answer: string }[] = [];

  if (items.length === 0) {
    return { width: 0, height: 0, cells: [], words: [], unplaced: [] };
  }

  // Place first word in centre horizontally (unless forced DOWN)
  const first = items[0];
  const firstDir: "ACROSS" | "DOWN" = first.direction === "DOWN" ? "DOWN" : "ACROSS";
  const midRow = Math.floor(GRID_SIZE / 2);
  const midCol = Math.floor((GRID_SIZE - first.answer.length) / 2);
  const firstPlacement: Placement = firstDir === "ACROSS"
    ? { row: midRow, col: midCol, direction: "ACROSS", length: first.answer.length }
    : { row: midCol, col: midRow, direction: "DOWN", length: first.answer.length };
  applyPlacement(grid, first.answer, firstPlacement);
  placed.push(buildWord(first, firstPlacement, 0));

  for (let i = 1; i < items.length; i++) {
    const item = items[i];
    const candidate = findBestPlacement(grid, item, placed);
    if (candidate) {
      applyPlacement(grid, item.answer, candidate);
      placed.push(buildWord(item, candidate, placed.length));
    } else {
      unplaced.push({ questionId: item.questionId, clue: item.clue, answer: item.answer });
    }
  }

  // Compute bounding box & shift
  const bounds = computeBounds(grid);
  if (!bounds) {
    return { width: 0, height: 0, cells: [], words: [], unplaced };
  }
  const { minR, maxR, minC, maxC } = bounds;
  const width = maxC - minC + 1;
  const height = maxR - minR + 1;

  // Shift grid and placements
  const shifted: (string | null)[][] = Array.from({ length: height }, () => Array(width).fill(null));
  for (let r = minR; r <= maxR; r++) {
    for (let c = minC; c <= maxC; c++) {
      shifted[r - minR][c - minC] = grid[r][c];
    }
  }
  const shiftedWords = placed.map(w => ({ ...w, row: w.row - minR, col: w.col - minC }));

  // Build cells and numbering
  const cells: PuzzleCell[] = [];
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const ch = shifted[r][c];
      if (ch === null) {
        cells.push({ row: r, col: c, type: "BLACK" });
      } else {
        cells.push({ row: r, col: c, type: "LETTER", letter: ch });
      }
    }
  }

  // Assign numbers: a cell is numbered if it's the start of an across or down word
  const cellMap = new Map<string, PuzzleCell>();
  cells.forEach(c => cellMap.set(`${c.row},${c.col}`, c));

  // Determine starts
  let nextNumber = 1;
  const startNumbers = new Map<string, number>();
  for (let r = 0; r < height; r++) {
    for (let c = 0; c < width; c++) {
      const cell = cellMap.get(`${r},${c}`)!;
      if (cell.type !== "LETTER") continue;
      const leftBlack = c === 0 || cellMap.get(`${r},${c - 1}`)?.type === "BLACK";
      const rightHasLetter = c + 1 < width && cellMap.get(`${r},${c + 1}`)?.type === "LETTER";
      const upBlack = r === 0 || cellMap.get(`${r - 1},${c}`)?.type === "BLACK";
      const downHasLetter = r + 1 < height && cellMap.get(`${r + 1},${c}`)?.type === "LETTER";
      const startsAcross = leftBlack && rightHasLetter;
      const startsDown = upBlack && downHasLetter;
      if (startsAcross || startsDown) {
        startNumbers.set(`${r},${c}`, nextNumber);
        cell.number = nextNumber;
        nextNumber++;
      }
    }
  }

  // Finalize words with numbers and acrossWordId/downWordId
  const finalWords: PuzzleWord[] = shiftedWords.map(w => {
    const key = `${w.row},${w.col}`;
    const num = startNumbers.get(key) ?? 0;
    return { ...w, number: num };
  });

  for (const w of finalWords) {
    for (let k = 0; k < w.length; k++) {
      const rr = w.direction === "ACROSS" ? w.row : w.row + k;
      const cc = w.direction === "ACROSS" ? w.col + k : w.col;
      const cell = cellMap.get(`${rr},${cc}`);
      if (!cell) continue;
      if (w.direction === "ACROSS") cell.acrossWordId = w.id;
      else cell.downWordId = w.id;
    }
  }

  return { width, height, cells, words: finalWords, unplaced };
}

function buildWord(item: GeneratorInput, p: Placement, index: number): PuzzleWord & { answer: string } {
  return {
    id: `W${index}`,
    questionId: item.questionId,
    clue: item.clue,
    points: item.points,
    direction: p.direction,
    row: p.row,
    col: p.col,
    length: item.answer.length,
    number: 0,
    answer: item.answer
  };
}

function applyPlacement(grid: (string | null)[][], answer: string, p: Placement) {
  for (let i = 0; i < answer.length; i++) {
    const r = p.direction === "ACROSS" ? p.row : p.row + i;
    const c = p.direction === "ACROSS" ? p.col + i : p.col;
    grid[r][c] = answer[i];
  }
}

function findBestPlacement(
  grid: (string | null)[][],
  item: GeneratorInput,
  placed: (PuzzleWord & { answer: string })[]
): Placement | null {
  const candidates: { placement: Placement; score: number }[] = [];
  const allowedDirs: ("ACROSS" | "DOWN")[] =
    item.direction === "ACROSS" ? ["ACROSS"] :
    item.direction === "DOWN" ? ["DOWN"] :
    ["ACROSS", "DOWN"];

  for (const existing of placed) {
    for (let i = 0; i < existing.answer.length; i++) {
      const letter = existing.answer[i];
      for (let j = 0; j < item.answer.length; j++) {
        if (item.answer[j] !== letter) continue;
        for (const dir of allowedDirs) {
          if (dir === existing.direction) continue; // must cross perpendicularly
          const existingR = existing.direction === "ACROSS" ? existing.row : existing.row + i;
          const existingC = existing.direction === "ACROSS" ? existing.col + i : existing.col;
          const row = dir === "ACROSS" ? existingR : existingR - j;
          const col = dir === "ACROSS" ? existingC - j : existingC;
          const placement: Placement = { row, col, direction: dir, length: item.answer.length };
          if (isValidPlacement(grid, item.answer, placement)) {
            const score = scorePlacement(grid, item.answer, placement);
            candidates.push({ placement, score });
          }
        }
      }
    }
  }

  if (candidates.length === 0) return null;
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].placement;
}

function isValidPlacement(grid: (string | null)[][], answer: string, p: Placement): boolean {
  const W = GRID_SIZE, H = GRID_SIZE;
  if (p.row < 0 || p.col < 0) return false;
  const endR = p.direction === "ACROSS" ? p.row : p.row + answer.length - 1;
  const endC = p.direction === "ACROSS" ? p.col + answer.length - 1 : p.col;
  if (endR >= H || endC >= W) return false;

  // Cell before must be empty/out-of-bounds
  const beforeR = p.direction === "ACROSS" ? p.row : p.row - 1;
  const beforeC = p.direction === "ACROSS" ? p.col - 1 : p.col;
  if (inBounds(beforeR, beforeC) && grid[beforeR][beforeC] !== null) return false;
  // Cell after
  const afterR = p.direction === "ACROSS" ? p.row : endR + 1;
  const afterC = p.direction === "ACROSS" ? endC + 1 : p.col;
  if (inBounds(afterR, afterC) && grid[afterR][afterC] !== null) return false;

  let crossings = 0;
  for (let i = 0; i < answer.length; i++) {
    const r = p.direction === "ACROSS" ? p.row : p.row + i;
    const c = p.direction === "ACROSS" ? p.col + i : p.col;
    const cur = grid[r][c];
    if (cur !== null) {
      if (cur !== answer[i]) return false;
      crossings++;
    } else {
      // Adjacent cells perpendicular must be empty (unless they're crossings on another word)
      if (p.direction === "ACROSS") {
        if (inBounds(r - 1, c) && grid[r - 1][c] !== null) return false;
        if (inBounds(r + 1, c) && grid[r + 1][c] !== null) return false;
      } else {
        if (inBounds(r, c - 1) && grid[r][c - 1] !== null) return false;
        if (inBounds(r, c + 1) && grid[r][c + 1] !== null) return false;
      }
    }
  }
  return crossings >= 1;
}

function scorePlacement(grid: (string | null)[][], answer: string, p: Placement): number {
  let crossings = 0;
  for (let i = 0; i < answer.length; i++) {
    const r = p.direction === "ACROSS" ? p.row : p.row + i;
    const c = p.direction === "ACROSS" ? p.col + i : p.col;
    if (grid[r][c] !== null) crossings++;
  }
  return crossings;
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && c >= 0 && r < GRID_SIZE && c < GRID_SIZE;
}

function computeBounds(grid: (string | null)[][]) {
  let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
  let found = false;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] !== null) {
        found = true;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
      }
    }
  }
  if (!found) return null;
  return { minR, maxR, minC, maxC };
}