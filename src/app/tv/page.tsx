"use client";
import { CinemaButton } from "@/components/CinemaButton";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { Logo } from "@/components/Logo";
import { Timer } from "@/components/Timer";
import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";

interface TvData {
  gameTitle: string;
  eventMode: string;
  active: null | {
    playerFirstName: string;
    startTime: number;
    allowedDurationSeconds: number;
    layout: any;
    gridState: Record<string, string>;
  };
  publishedLayout: any | null;
  leaderboard: {
    rank: number; name: string; maskedId: string; score: number; correct: number; durationSeconds: number;
  }[];
}

export default function TvPage() {
  const [data, setData] = useState<TvData | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);
  const prevActiveRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const r = await fetch("/api/tv", { cache: "no-store" });
      const d = await r.json();
      setData(d);
      if (prevActiveRef.current && !d.active) {
        setJustCompleted(true);
        setTimeout(() => setJustCompleted(false), 3500);
      }
      prevActiveRef.current = !!d.active;
    };
    load();
    const i = setInterval(load, 2000);
    return () => clearInterval(i);
  }, []);

  if (!data) return <main className="h-screen flex items-center justify-center">Loading…</main>;

  const layout = data.active?.layout || data.publishedLayout;
  // Fit the puzzle in available left pane
  const availableW = Math.floor(window.innerWidth * 0.62);
  const availableH = Math.floor(window.innerHeight * 0.72);
  const cellPx = layout ? Math.max(20, Math.min(
    Math.floor(availableW / layout.width),
    Math.floor(availableH / layout.height),
    44
  )) : 32;

  return (
    <main className="h-screen overflow-hidden p-3 flex flex-col">
      <header className="flex items-center justify-between mb-2">
        <Logo />
        <div className="flex items-center gap-3">
          {data.eventMode === "TEST" && <span className="px-2 py-1 rounded-full bg-amber-500 text-black text-[10px] font-bold">TEST MODE</span>}
          <CinemaButton />
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[1fr_440px] gap-3 min-h-0">
        {/* LEFT */}
        <section className="bg-mtn-dark border border-white/10 rounded-2xl p-4 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl md:text-2xl font-black leading-tight">{data.gameTitle}</h1>
              <p className="text-mtn-yellow text-[10px] uppercase tracking-widest">Data Privacy Week</p>
            </div>
            {data.active && <Timer endsAt={new Date(data.active.startTime).valueOf() + data.active.allowedDurationSeconds * 1000} />}
          </div>

          {data.active ? (
            <>
              <div className="mb-2">
                <div className="text-[10px] text-white/50 uppercase">Current Player</div>
                <div className="text-2xl font-bold">{data.active.playerFirstName}</div>
              </div>
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                <CrosswordGrid layout={data.active.layout} gridState={data.active.gridState} readOnly cellPx={cellPx} showClue={false} />
              </div>
            </>
          ) : justCompleted ? (
            <div className="flex-1 flex items-center justify-center text-3xl font-bold text-mtn-yellow">Challenge completed.</div>
          ) : (
            <>
              <div className="text-xl font-bold mb-2 text-center">Waiting for the next challenger…</div>
              <div className="flex-1 flex items-center justify-center overflow-hidden">
                {data.publishedLayout && (
                  <CrosswordGrid layout={data.publishedLayout} gridState={{}} readOnly cellPx={cellPx} showClue={false} />
                )}
              </div>
            </>
          )}
        </section>

        {/* RIGHT */}
        <aside className="bg-mtn-dark border border-white/10 rounded-2xl p-3 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-mtn-yellow" />
            <h2 className="text-lg font-bold">Live Top 10</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <table className="w-full text-sm">
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
                {data.leaderboard.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-white/40">No results yet</td></tr>}
                {data.leaderboard.map(r => {
                  const medal = r.rank === 1 ? "bg-yellow-400 text-black" : r.rank === 2 ? "bg-gray-300 text-black" : r.rank === 3 ? "bg-amber-700 text-white" : "bg-white/10 text-white";
                  const mm = String(Math.floor(r.durationSeconds / 60)).padStart(2, "0");
                  const ss = String(r.durationSeconds % 60).padStart(2, "0");
                  return (
                    <tr key={r.rank} className="border-t border-white/5">
                      <td className="px-2 py-1.5">
                        <span className={`inline-block w-6 h-6 text-xs rounded-full font-bold text-center leading-6 ${medal}`}>{r.rank}</span>
                      </td>
                      <td className="px-2 py-1.5 font-semibold truncate max-w-[150px]">{r.name}</td>
                      <td className="px-2 py-1.5 text-right font-bold text-mtn-yellow">{r.score}</td>
                      <td className="px-2 py-1.5 text-right">{r.correct}</td>
                      <td className="px-2 py-1.5 text-right font-mono">{mm}:{ss}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </aside>
      </div>

      <footer className="mt-2 flex items-center gap-2 text-[10px] text-white/40 font-mono">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
        Data Privacy Crossword Live · Leaderboard Updating Automatically
      </footer>
    </main>
  );
}