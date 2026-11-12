"use client";
import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";

interface Row {
  rank: number;
  name: string;
  maskedId: string;
  score: number;
  correct: number;
  durationSeconds: number;
}

export function MiniLeaderboard({ compact = false }: { compact?: boolean }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const load = () =>
      fetch("/api/leaderboard")
        .then(r => r.json())
        .then(d => setRows(d.rows || []))
        .catch(() => {});
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="bg-mtn-dark border border-white/10 rounded-xl overflow-hidden">
      <div className="px-3 py-2 bg-black/40 flex items-center gap-2 border-b border-white/10">
        <Trophy className="w-4 h-4 text-mtn-yellow" />
        <h3 className="font-bold text-sm">Live Top 10</h3>
      </div>
      <div className="max-h-full overflow-hidden">
        <table className="w-full text-xs">
          <thead className="text-white/50 text-[10px] uppercase">
            <tr>
              <th className="px-2 py-1 text-left">#</th>
              <th className="px-2 py-1 text-left">Name</th>
              <th className="px-2 py-1 text-right">Pts</th>
              <th className="px-2 py-1 text-right">✓</th>
              <th className="px-2 py-1 text-right">Time</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="px-2 py-3 text-center text-white/40">No results yet</td></tr>
            )}
            {rows.map(r => {
              const medal =
                r.rank === 1 ? "bg-yellow-400 text-black" :
                r.rank === 2 ? "bg-gray-300 text-black" :
                r.rank === 3 ? "bg-amber-700 text-white" :
                "bg-white/10 text-white";
              const mm = String(Math.floor(r.durationSeconds / 60)).padStart(2, "0");
              const ss = String(r.durationSeconds % 60).padStart(2, "0");
              return (
                <tr key={r.rank} className="border-t border-white/5">
                  <td className="px-2 py-1">
                    <span className={`inline-block w-5 h-5 text-[10px] rounded-full font-bold text-center leading-5 ${medal}`}>{r.rank}</span>
                  </td>
                  <td className="px-2 py-1 font-semibold truncate max-w-[110px]">{r.name}</td>
                  <td className="px-2 py-1 text-right font-bold text-mtn-yellow">{r.score}</td>
                  <td className="px-2 py-1 text-right">{r.correct}</td>
                  <td className="px-2 py-1 text-right font-mono">{mm}:{ss}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}