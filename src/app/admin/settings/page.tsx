"use client";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

interface Status {
  eventMode: string;
  gameStatus: string;
  durationMinutes: number;
  repeatAttemptsAllowed: boolean;
  publishedPuzzle: null | { id: string; versionNumber: number; words: number; totalPoints: number; width: number; height: number; unplaced: number; };
  activeQuestions: number;
  totalPointsAvailable: number;
  completedLive: number;
  completedTest: number;
  activeAttempt: null | { playerName: string; startedAt: string; };
  top5: { rank: number; name: string; score: number }[];
  unpublishedChanges: boolean;
}

export default function AdminDashboard() {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await fetch("/api/admin/status", { cache: "no-store" });
    if (r.status === 401) { window.location.href = "/admin"; return; }
    setStatus(await r.json());
  };
  useEffect(() => { refresh(); const i = setInterval(refresh, 3000); return () => clearInterval(i); }, []);

  const call = async (url: string, body?: any, method: string = "POST") => {
    setBusy(true);
    try {
      await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      await refresh();
    } finally { setBusy(false); }
  };

  const setGameStatus = (s: string) => call("/api/admin/config", { gameStatus: s }, "PATCH");
  const setMode = async (m: string) => {
    if (m === "LIVE" && !confirm("Switch to LIVE MODE? This will treat all attempts as live.")) return;
    call("/api/admin/config", { eventMode: m }, "PATCH");
  };
  const publish = async () => {
    if (!confirm("Publish puzzle? All subsequent players will receive this layout.")) return;
    call("/api/admin/puzzle/publish");
  };
  const cancelActive = async () => {
    if (!confirm("End the current active attempt? It will be marked CANCELLED.")) return;
    call("/api/admin/cancel-attempt");
  };
  const logout = async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin"; };

  if (!status) return <main className="min-h-screen flex items-center justify-center">Loading…</main>;

  return (
    <main className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6">
        <Logo />
        <div className="flex items-center gap-3">
          <a href="/admin/questions" className="text-sm underline">Questions</a>
          <a href="/admin/results" className="text-sm underline">Results</a>
          <a href="/leaderboard" className="text-sm underline" target="_blank">Leaderboard</a>
          <a href="/tv" className="text-sm underline" target="_blank">TV</a>
          <button onClick={logout} className="text-sm underline">Logout</button>
        </div>
      </header>

      <h1 className="text-3xl font-black mb-6">Event Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card title="Event Mode" value={status.eventMode} tone={status.eventMode === "LIVE" ? "ok" : "warn"} />
        <Card title="Game Status" value={status.gameStatus} />
        <Card title="Duration (min)" value={String(status.durationMinutes)} />
        <Card title="Active Questions" value={String(status.activeQuestions)} />
        <Card title="Total Points" value={String(status.totalPointsAvailable)} />
        <Card title="Published Puzzle" value={status.publishedPuzzle ? `v${status.publishedPuzzle.versionNumber} (${status.publishedPuzzle.words} words)` : "None"} tone={status.publishedPuzzle ? "ok" : "bad"} />
        <Card title="Completed (LIVE)" value={String(status.completedLive)} />
        <Card title="Completed (TEST)" value={String(status.completedTest)} />
        <Card title="Unpublished Changes" value={status.unpublishedChanges ? "YES" : "No"} tone={status.unpublishedChanges ? "warn" : "ok"} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4">
          <h2 className="font-bold mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => setGameStatus("OPEN")} className="px-4 py-2 bg-green-600 rounded-lg">Open Game</button>
            <button disabled={busy} onClick={() => setGameStatus("PAUSED")} className="px-4 py-2 bg-amber-500 text-black rounded-lg">Pause</button>
            <button disabled={busy} onClick={() => setGameStatus("CLOSED")} className="px-4 py-2 bg-red-600 rounded-lg">Close</button>
            <button disabled={busy} onClick={() => setMode("TEST")} className="px-4 py-2 bg-white/10 rounded-lg">Test Mode</button>
            <button disabled={busy} onClick={() => setMode("LIVE")} className="px-4 py-2 bg-mtn-yellow text-black rounded-lg font-bold">Live Mode</button>
            <a href="/admin/questions" className="px-4 py-2 bg-white/10 rounded-lg">Preview Puzzle</a>
            <button disabled={busy} onClick={publish} className="px-4 py-2 bg-mtn-yellow text-black rounded-lg font-bold">Publish Puzzle</button>
            <a href="/api/admin/export?type=all" className="px-4 py-2 bg-white/10 rounded-lg">Export All (CSV)</a>
            <a href="/api/admin/export?type=top10" className="px-4 py-2 bg-white/10 rounded-lg">Export Top 10</a>
            <a href="/api/admin/export?type=top5" className="px-4 py-2 bg-white/10 rounded-lg">Export Top 5</a>
            <a href="/api/admin/backup" className="px-4 py-2 bg-white/10 rounded-lg">Backup DB</a>
          </div>
        </div>

        <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4">
          <h2 className="font-bold mb-3">Active Attempt</h2>
          {status.activeAttempt ? (
            <>
              <div>Player: <b>{status.activeAttempt.playerName}</b></div>
              <div className="text-sm text-white/60">Started: {new Date(status.activeAttempt.startedAt).toLocaleTimeString()}</div>
              <button disabled={busy} onClick={cancelActive} className="mt-3 px-4 py-2 bg-red-600 rounded-lg">End Current Attempt</button>
            </>
          ) : <div className="text-white/50">No active attempt.</div>}
        </div>
      </div>

      <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4">
        <h2 className="font-bold mb-3">Final Top 5</h2>
        {status.top5.length === 0 ? <div className="text-white/50">No completed LIVE attempts yet.</div> : (
          <ol className="space-y-1">
            {status.top5.map(t => <li key={t.rank}><b>#{t.rank}</b> {t.name} — {t.score}</li>)}
          </ol>
        )}
      </div>
    </main>
  );
}

function Card({ title, value, tone }: { title: string; value: string; tone?: "ok" | "warn" | "bad" }) {
  const bg = tone === "warn" ? "border-amber-500/40" : tone === "bad" ? "border-red-500/40" : tone === "ok" ? "border-green-500/40" : "border-white/10";
  return (
    <div className={`bg-mtn-dark border ${bg} rounded-2xl p-4`}>
      <div className="text-xs uppercase tracking-wider text-white/50">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}