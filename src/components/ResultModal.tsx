"use client";
import { CheckCircle, Trophy } from "lucide-react";
import { useEffect, useState } from "react";

export function ResultModal({
  name, score, totalAvailableScore, correctAnswers, totalQuestions, timeUsed, position, inTop5, submissionReason, resetSeconds, onFinish
}: {
  name: string; score: number; totalAvailableScore: number; correctAnswers: number;
  totalQuestions: number; timeUsed: number; position: number | null; inTop5: boolean;
  submissionReason: string; resetSeconds: number; onFinish: () => void;
}) {
  const [counter, setCounter] = useState(resetSeconds);
  useEffect(() => {
    const i = setInterval(() => setCounter(c => {
      if (c <= 1) { clearInterval(i); onFinish(); return 0; }
      return c - 1;
    }), 1000);
    return () => clearInterval(i);
  }, [onFinish]);

  const pct = totalAvailableScore > 0 ? (score / totalAvailableScore) : 0;
  const message =
    pct >= 0.8 ? "Privacy Champion! You completed the challenge with an outstanding score." :
    pct >= 0.6 ? "Great work! You demonstrated strong knowledge of data privacy." :
    pct >= 0.4 ? "Well done! Keep strengthening your data privacy awareness." :
                 "Thank you for participating. Every privacy lesson helps us protect personal data better.";

  const mm = String(Math.floor(timeUsed / 60)).padStart(2, "0");
  const ss = String(timeUsed % 60).padStart(2, "0");

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-mtn-dark border border-mtn-yellow/40 rounded-2xl p-8 max-w-xl w-full shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <CheckCircle className="w-8 h-8 text-mtn-yellow" />
          <h2 className="text-2xl font-bold">Challenge Complete</h2>
        </div>
        <p className="text-white/70 mb-6">{name}</p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Stat label="Score" value={`${score} / ${totalAvailableScore}`} big />
          <Stat label="Correct Answers" value={`${correctAnswers} / ${totalQuestions}`} />
          <Stat label="Time Used" value={`${mm}:${ss}`} />
          <Stat label="Submission" value={submissionReason.replace("_", " ")} />
        </div>

        <div className="bg-black/40 rounded-lg p-4 mb-4 border border-white/10">
          <p className="font-semibold">{message}</p>
        </div>

        {position !== null && (
          <div className="bg-mtn-yellow/10 border border-mtn-yellow/30 rounded-lg p-4 mb-4 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-mtn-yellow" />
            <div>
              <div className="font-bold">Current Position: #{position}</div>
              {inTop5 && <div className="text-mtn-yellow">Congratulations! You are currently in the Top 5.</div>}
              <div className="text-xs text-white/60 mt-1">Leaderboard positions may change as more employees complete the challenge.</div>
            </div>
          </div>
        )}

        <button
          onClick={onFinish}
          className="w-full py-4 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg focus-ring"
        >
          Finish ({counter}s)
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: string; big?: boolean }) {
  return (
    <div className="bg-black/40 border border-white/10 rounded-lg p-3">
      <div className="text-xs text-white/50 uppercase tracking-wider">{label}</div>
      <div className={`font-bold ${big ? "text-3xl text-mtn-yellow" : "text-lg"}`}>{value}</div>
    </div>
  );
}