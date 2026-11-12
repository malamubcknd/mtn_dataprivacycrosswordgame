"use client";
import { AutoFullscreen } from "@/components/AutoFullscreen";
import { Logo } from "@/components/Logo";
import { Trophy } from "lucide-react";
import { useEffect, useState } from "react";

interface Row { rank: number; name: string; maskedId: string; score: number; correct: number; durationSeconds: number; }

export default function LeaderboardPage() {
  const [rows, setRows] = useState<Row[]>([]);
  useEffect(() => {
    const load = () => fetch("/api/leaderboard").then(r => r.json()).then(d => setRows(d.rows || [])).catch(() => {});
    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);
  return (
    <main className="h-screen overflow-hidden p-4 flex flex-col">
      <AutoFullscreen />
      <header className="flex items-center justify-between mb-4">
        <Logo />
        <a href="/" className="text-xs text-white/60 underline">Home</a>
      </header>
      <h1 className="text-2xl font-black mb-4 flex items-center gap-2"><Trophy className="w-6 h-6 text-mtn-yellow" /> Live Top 10</h1>
      <div className="flex-1 overflow-hidden">
        <LeaderboardTable rows={rows} />
      </div>
    </main>
  );
}

export function LeaderboardTable({ rows }: { rows: Row[] }) {
  return (
    <div className="bg-mtn-dark border border-white/10 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-black/50 text-xs uppercase text-white/60">
          <tr>
            <th className="px-4 py-2 text-left">#</th>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Employee ID</th>
            <th className="px-4 py-2 text-right">Score</th>
            <th className="px-4 py-2 text-right">Correct</th>
            <th className="px-4 py-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-white/50">No completed attempts yet.</td></tr>}
          {rows.map(r => {
            const medal = r.rank === 1 ? "bg-yellow-400 text-black" : r.rank === 2 ? "bg-gray-300 text-black" : r.rank === 3 ? "bg-amber-700 text-white" : "bg-white/10 text-white";
            const mm = String(Math.floor(r.durationSeconds / 60)).padStart(2, "0");
            const ss = String(r.durationSeconds % 60).padStart(2, "0");
            return (
              <tr key={r.rank} className="border-t border-white/5">
                <td className="px-4 py-2"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${medal}`}>{r.rank}</span></td>
                <td className="px-4 py-2 font-semibold">{r.name}</td>
                <td className="px-4 py-2 font-mono text-sm text-white/70">{r.maskedId}</td>
                <td className="px-4 py-2 text-right font-bold text-mtn-yellow">{r.score}</td>
                <td className="px-4 py-2 text-right">{r.correct}</td>
                <td className="px-4 py-2 text-right font-mono">{mm}:{ss}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}