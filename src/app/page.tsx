"use client";
import { Logo } from "@/components/Logo";
import { AutoFullscreen } from "@/components/AutoFullscreen";
import { AlertTriangle, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cfg, setCfg] = useState<{ gameTitle: string; welcomeMessage: string; gameStatus: string; eventMode: string } | null>(null);

  useEffect(() => {
    try { sessionStorage.clear(); } catch {}
    fetch("/api/config").then(r => r.json()).then(setCfg).catch(() => {});
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) { setError("Please acknowledge the privacy notice."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/attempt/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fullOfficialName: name, employeeId })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Could not start challenge."); setLoading(false); return; }
      router.replace("/game");
    } catch {
      setError("Network error.");
      setLoading(false);
    }
  };

  return (
    <main className="h-screen overflow-hidden flex flex-col">
      <AutoFullscreen />

      <header className="px-6 py-3 flex items-center justify-between border-b border-white/10">
        <Logo />
        <div className="flex items-center gap-3">
          {cfg?.eventMode === "TEST" && (
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold">TEST MODE</span>
          )}
          {/* <a href="/leaderboard" className="text-xs text-white/60 hover:text-white underline">Leaderboard</a> */}
          {/* <a href="/admin" className="text-xs text-white/60 hover:text-white underline">Admin</a> */}
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        <div className="max-w-xl w-full">
          <h1 className="text-3xl md:text-4xl font-black mb-1">{cfg?.gameTitle ?? "MTN Data Privacy Crossword Challenge"}</h1>
          <p className="text-white/70 mb-4 text-sm">{cfg?.welcomeMessage ?? "Welcome!"}</p>

          {cfg?.gameStatus && cfg.gameStatus !== "OPEN" && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
              <div>
                <div className="font-bold text-amber-300">Game is currently {cfg.gameStatus}</div>
                <div className="text-sm text-white/70">Please wait or ask the administrator.</div>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3" autoComplete="off">
            <div>
              <label className="block text-sm font-semibold mb-1">Full Official Name</label>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={3}
                autoComplete="off" autoCorrect="off" autoCapitalize="words" spellCheck={false}
                name="mtn-full-name-random"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-mtn-yellow outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Employee ID</label>
              <input
                type="text" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required
                autoComplete="off" autoCorrect="off" spellCheck={false}
                name="mtn-emp-id-random"
                className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-white/20 focus:border-mtn-yellow outline-none font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80">
              Your name, Employee ID, score and completion time will be stored locally on this laptop for the administration of the Data Privacy Crossword Challenge. Only your name, masked Employee ID, score and completion time may appear on the event leaderboard.
            </div>

            <label className="flex items-start gap-3 cursor-pointer text-sm">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1 w-5 h-5 accent-mtn-yellow" />
              <span>I have read and understood the privacy notice.</span>
            </label>

            {error && <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading || (cfg?.gameStatus && cfg.gameStatus !== "OPEN") || false}
              className="w-full flex items-center justify-center gap-2 py-3 bg-mtn-yellow text-black font-bold rounded-xl text-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed focus-ring"
            >
              <Play className="w-5 h-5" />
              {loading ? "Starting…" : "Start Challenge"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}