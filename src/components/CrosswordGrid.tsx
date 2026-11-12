"use client";
import { PublicPuzzleLayout } from "@/lib/puzzle-types";
import { useEffect, useMemo, useRef, useState } from "react";

interface Props {
  layout: PublicPuzzleLayout;
  gridState: Record<string, string>;
  onChange?: (state: Record<string, string>) => void;
  readOnly?: boolean;
  cellPx?: number;
  showClue?: boolean;
}

export function CrosswordGrid({ layout, gridState, onChange, readOnly, cellPx = 36, showClue = true }: Props) {
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);
  const [direction, setDirection] = useState<"ACROSS" | "DOWN">("ACROSS");
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  const cellMap = useMemo(() => {
    const m = new Map<string, typeof layout.cells[number]>();
    layout.cells.forEach(c => m.set(`${c.row},${c.col}`, c));
    return m;
  }, [layout]);

  const selectedWord = useMemo(() => {
    if (!selected) return null;
    const cell = cellMap.get(`${selected.r},${selected.c}`);
    if (!cell) return null;
    let wordId: string | undefined;
    if (direction === "ACROSS" && cell.acrossWordId) wordId = cell.acrossWordId;
    else if (direction === "DOWN" && cell.downWordId) wordId = cell.downWordId;
    else wordId = cell.acrossWordId || cell.downWordId;
    return layout.words.find(w => w.id === wordId) ?? null;
  }, [selected, direction, cellMap, layout.words]);

  const activeWordCells = useMemo(() => {
    const s = new Set<string>();
    if (!selectedWord) return s;
    for (let i = 0; i < selectedWord.length; i++) {
      const r = selectedWord.direction === "ACROSS" ? selectedWord.row : selectedWord.row + i;
      const c = selectedWord.direction === "ACROSS" ? selectedWord.col + i : selectedWord.col;
      s.add(`${r},${c}`);
    }
    return s;
  }, [selectedWord]);

  const focusCell = (r: number, c: number) => {
    const cell = cellMap.get(`${r},${c}`);
    if (!cell || cell.type !== "LETTER") return;
    setSelected({ r, c });
    const el = refs.current[`${r},${c}`];
    el?.focus();
  };

  const onCellClick = (r: number, c: number) => {
    const cell = cellMap.get(`${r},${c}`);
    if (!cell || cell.type !== "LETTER") return;

    const hasAcross = !!cell.acrossWordId;
    const hasDown = !!cell.downWordId;

    if (selected && selected.r === r && selected.c === c) {
      // Toggle direction if both available
      if (hasAcross && hasDown) {
        setDirection(d => (d === "ACROSS" ? "DOWN" : "ACROSS"));
      }
    } else {
      // Pick a sensible direction: prefer current, else whichever exists
      if (direction === "ACROSS" && hasAcross) setDirection("ACROSS");
      else if (direction === "DOWN" && hasDown) setDirection("DOWN");
      else if (hasAcross) setDirection("ACROSS");
      else if (hasDown) setDirection("DOWN");
      setSelected({ r, c });
    }
  };

  const moveNext = (r: number, c: number) => {
    if (direction === "ACROSS") {
      let cc = c + 1;
      while (cc < layout.width) {
        if (cellMap.get(`${r},${cc}`)?.type === "LETTER") { focusCell(r, cc); return; }
        cc++;
      }
    } else {
      let rr = r + 1;
      while (rr < layout.height) {
        if (cellMap.get(`${rr},${c}`)?.type === "LETTER") { focusCell(rr, c); return; }
        rr++;
      }
    }
  };

  const movePrev = (r: number, c: number) => {
    if (direction === "ACROSS") {
      let cc = c - 1;
      while (cc >= 0) {
        if (cellMap.get(`${r},${cc}`)?.type === "LETTER") { focusCell(r, cc); return; }
        cc--;
      }
    } else {
      let rr = r - 1;
      while (rr >= 0) {
        if (cellMap.get(`${rr},${c}`)?.type === "LETTER") { focusCell(rr, c); return; }
        rr--;
      }
    }
  };

  const setLetter = (r: number, c: number, letter: string) => {
    if (readOnly) return;
    const next = { ...gridState };
    const key = `${r},${c}`;
    if (letter) next[key] = letter.toUpperCase();
    else delete next[key];
    onChange?.(next);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, r: number, c: number) => {
    if (readOnly) return;
    if (e.key === "Backspace") {
      e.preventDefault();
      const key = `${r},${c}`;
      if (gridState[key]) {
        setLetter(r, c, "");
      } else {
        const p = findPrev(r, c);
        if (p) { setLetter(p.r, p.c, ""); focusCell(p.r, p.c); }
      }
      return;
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); setDirection("ACROSS"); findAndFocus(r, c, 0, -1); return; }
    if (e.key === "ArrowRight") { e.preventDefault(); setDirection("ACROSS"); findAndFocus(r, c, 0, 1); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setDirection("DOWN"); findAndFocus(r, c, -1, 0); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setDirection("DOWN"); findAndFocus(r, c, 1, 0); return; }
    if (e.key === "Tab") return;
    if (/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      setLetter(r, c, e.key);
      setTimeout(() => moveNext(r, c), 0);
    }
  };

  const findPrev = (r: number, c: number) => {
    if (direction === "ACROSS") {
      let cc = c - 1;
      while (cc >= 0) { if (cellMap.get(`${r},${cc}`)?.type === "LETTER") return { r, c: cc }; cc--; }
    } else {
      let rr = r - 1;
      while (rr >= 0) { if (cellMap.get(`${rr},${c}`)?.type === "LETTER") return { r: rr, c }; rr--; }
    }
    return null;
  };

  const findAndFocus = (r: number, c: number, dr: number, dc: number) => {
    let rr = r + dr, cc = c + dc;
    while (rr >= 0 && cc >= 0 && rr < layout.height && cc < layout.width) {
      if (cellMap.get(`${rr},${cc}`)?.type === "LETTER") { focusCell(rr, cc); return; }
      rr += dr; cc += dc;
    }
  };

  useEffect(() => {
    for (const cell of layout.cells) {
      if (cell.type === "LETTER") {
        if (cell.acrossWordId) setDirection("ACROSS");
        else if (cell.downWordId) setDirection("DOWN");
        setSelected({ r: cell.row, c: cell.col });
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  return (
    <div className="inline-flex flex-col gap-2">
      <div
        className="grid bg-mtn-dark p-1 rounded-lg border border-white/10"
        style={{ gridTemplateColumns: `repeat(${layout.width}, ${cellPx}px)`, gridTemplateRows: `repeat(${layout.height}, ${cellPx}px)` }}
        role="grid"
        aria-label="Crossword grid"
      >
        {layout.cells.map(cell => {
          const key = `${cell.row},${cell.col}`;
          const isSelected = selected?.r === cell.row && selected?.c === cell.col;
          const isActive = activeWordCells.has(key);
          if (cell.type === "BLACK") {
            return <div key={key} className="bg-black" aria-hidden="true" />;
          }
          return (
            <div
              key={key}
              onClick={() => onCellClick(cell.row, cell.col)}
              className={`relative border border-neutral-600 ${
                isSelected ? "bg-mtn-yellow" : isActive ? "bg-mtn-yellow/40" : "bg-white"
              }`}
            >
              {typeof cell.number === "number" && (
                <span className="absolute top-0 left-0.5 text-[9px] font-bold text-black leading-none pointer-events-none">{cell.number}</span>
              )}
              <input
                ref={el => { refs.current[key] = el; }}
                value={gridState[key] || ""}
                onChange={(e) => {
                  const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(-1);
                  setLetter(cell.row, cell.col, v);
                  if (v) setTimeout(() => moveNext(cell.row, cell.col), 0);
                }}
                onKeyDown={(e) => onKeyDown(e, cell.row, cell.col)}
                onFocus={() => setSelected({ r: cell.row, c: cell.col })}
                disabled={readOnly}
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck={false}
                maxLength={1}
                aria-label={`Row ${cell.row + 1} Column ${cell.col + 1}`}
                style={{ fontSize: Math.max(12, cellPx * 0.5) }}
                className="w-full h-full text-center text-black font-bold uppercase bg-transparent outline-none p-0"
              />
            </div>
          );
        })}
      </div>
      {showClue && selectedWord && (
        <div className="px-3 py-2 bg-mtn-yellow text-black font-semibold rounded-lg text-sm">
          {selectedWord.number} {selectedWord.direction}: {selectedWord.clue}
        </div>
      )}
    </div>
  );
}


