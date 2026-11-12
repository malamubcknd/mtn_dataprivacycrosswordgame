"use client";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { Timer } from "@/components/Timer";
import { ResultModal } from "@/components/ResultModal";
import { MiniLeaderboard } from "@/components/MiniLeaderboard";
import { AutoFullscreen } from "@/components/AutoFullscreen";
import { PublicPuzzleLayout } from "@/lib/puzzle-types";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface AttemptState {
  attemptId: string;
  playerName: string;
  startTime: number;
  allowedDurationSeconds: number;
  layout: PublicPuzzleLayout;
  gridState: Record<string, string>;
  status: string;
}

interface SubmitResult {
  score: number;
  totalAvailableScore: number;
  correctAnswerCount: number;
  totalQuestionCount: number;
  durationSeconds: number;
  position: number | null;
  inTop5: boolean;
  submissionReason: string;
}

export default function GamePage() {
  const router = useRouter();
  const [state, setState] = useState<AttemptState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gridState, setGridState] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    (async () => {
      const r = await fetch("/api/attempt/state", { cache: "no-store" });
      if (r.status === 404) { router.replace("/"); return; }
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Could not load game."); return; }
      setState(d);
      setGridState(d.gridState || {});
    })();
  }, [router]);

  const scheduleSave = useCallback((next: Record<string, string>) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      fetch("/api/attempt/grid", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ gridState: next })
      }).catch(() => {});
    }, 400);
  }, []);

  const onChange = (next: Record<string, string>) => {
    setGridState(next);
    scheduleSave(next);
  };

  const doSubmit = async (reason: "MANUAL_SUBMISSION" | "TIMER_EXPIRED") => {
    if (submittedRef.current || submitting) return;
    submittedRef.current = true;
    setSubmitting(true);
    const res = await fetch("/api/attempt/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ gridState, reason })
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Submission failed.");
      setSubmitting(false);
      return;
    }
    setResult(d);
  };

  const completedCount = state ? state.layout.words.filter(w => {
    for (let i = 0; i < w.length; i++) {
      const r = w.direction === "ACROSS" ? w.row : w.row + i;
      const c = w.direction === "ACROSS" ? w.col + i : w.col;
      if (!gridState[`${r},${c}`]) return false;
    }
    return true;
  }).length : 0;

  const handleFinish = async () => {
    try { sessionStorage.clear(); } catch {}
    router.replace("/");
  };

  if (error) return <main className="h-screen flex items-center justify-center p-6"><div className="text-red-300">{error}</div></main>;
  if (!state) return <main className="h-screen flex items-center justify-center">Loading…</main>;

  const endsAt = new Date(state.startTime).valueOf() + state.allowedDurationSeconds * 1000;
  const remainingClues = state.layout.words.length - completedCount;

  // Puzzle takes the left area. Right side = 360px.
  const rightPanelW = 360;
  const leftPaneW = viewport.w - rightPanelW - 40;
  const availableH = viewport.h - 120; // header + clue bar + padding
  const cellPx = Math.max(24, Math.min(
    Math.floor(leftPaneW / state.layout.width),
    Math.floor(availableH / state.layout.height),
    52
  ));

  return (
    <main className="h-screen overflow-hidden p-3 flex flex-col">
      <AutoFullscreen />

      <div className="flex items-center justify-between mb-2 gap-4 flex-wrap">
        <div>
          <div className="text-[10px] text-white/50 uppercase tracking-wider">Player</div>
          <div className="text-base font-bold">{state.playerName}</div>
        </div>
        <Timer endsAt={endsAt} onExpire={() => doSubmit("TIMER_EXPIRED")} />
        <div className="text-right">
          <div className="text-[10px] text-white/50 uppercase tracking-wider">Progress</div>
          <div className="text-base font-bold">{completedCount} / {state.layout.words.length}</div>
          <div className="text-[10px] text-white/60">{remainingClues} remaining</div>
        </div>
      </div>

      <div className="flex-1 grid gap-3 min-h-0" style={{ gridTemplateColumns: `1fr ${rightPanelW}px` }}>
        {/* LEFT: puzzle + its selected-word clue (nothing else) */}
        <div className="flex items-start justify-center overflow-hidden min-h-0">
          <CrosswordGrid layout={state.layout} gridState={gridState} onChange={onChange} cellPx={cellPx} showClue={false}/>
        </div>

        {/* RIGHT: leaderboard (top), clue lists (below), submit (bottom) */}
        <div className="flex flex-col gap-2 min-h-0">
          <div className="flex-shrink-0">
            <MiniLeaderboard />
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 min-h-0">
            <ClueList title="Across" words={state.layout.words.filter(w => w.direction === "ACROSS")} />
            <ClueList title="Down" words={state.layout.words.filter(w => w.direction === "DOWN")} />
          </div>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={submitting}
            className="w-full py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 disabled:opacity-50 focus-ring flex-shrink-0"
          >
            {submitting ? "Submitting…" : "Submit Challenge"}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-40">
          <div className="bg-mtn-dark border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-2">Submit your answers?</h3>
            <p className="text-white/70 mb-4">
              {remainingClues > 0
                ? `You still have ${remainingClues} unanswered ${remainingClues === 1 ? "clue" : "clues"}. `
                : ""}
              Are you sure you want to submit? You will not be able to make changes after submission.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 focus-ring">Continue Playing</button>
              <button onClick={() => { setShowConfirm(false); doSubmit("MANUAL_SUBMISSION"); }} className="flex-1 py-3 bg-mtn-yellow text-black font-bold rounded-xl focus-ring">Submit Challenge</button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <ResultModal
          name={state.playerName}
          score={result.score}
          totalAvailableScore={result.totalAvailableScore}
          correctAnswers={result.correctAnswerCount}
          totalQuestions={result.totalQuestionCount}
          timeUsed={result.durationSeconds}
          position={result.position}
          inTop5={result.inTop5}
          submissionReason={result.submissionReason}
          resetSeconds={15}
          onFinish={handleFinish}
        />
      )}
    </main>
  );
}

function ClueList({ title, words }: { title: string; words: { number: number; clue: string; length: number }[] }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-2 overflow-hidden flex flex-col min-h-0">
      <h4 className="font-bold text-mtn-yellow mb-1 text-xs uppercase tracking-wider flex-shrink-0">{title}</h4>
      <ol className="space-y-0.5 text-[11px] overflow-y-auto pr-1 flex-1">
        {words.sort((a, b) => a.number - b.number).map(w => (
          <li key={`${title}-${w.number}`}>
            <span className="font-bold">{w.number}.</span> {w.clue} <span className="text-white/40">({w.length})</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

