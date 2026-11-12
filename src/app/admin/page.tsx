"use client";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

export default function AdminLogin() {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/me").then(r => r.json()).then(d => setAuthed(d.authed)).catch(() => setAuthed(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const r = await fetch("/api/admin/login", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ pin }) });
    if (r.ok) { window.location.href = "/admin/settings"; }
    else { const d = await r.json(); setErr(d.error || "Invalid PIN"); }
  };

  if (authed === null) return <main className="min-h-screen flex items-center justify-center">Loading…</main>;
  if (authed) {
    if (typeof window !== "undefined") window.location.href = "/admin/settings";
    return null;
  }

  return (
    <main className="min-h-screen flex flex-col">
      <header className="p-6 border-b border-white/10 flex justify-between"><Logo /><a href="/" className="text-xs underline text-white/60">Home</a></header>
      <div className="flex-1 flex items-center justify-center p-6">
        <form onSubmit={submit} className="max-w-sm w-full space-y-4 bg-mtn-dark p-6 rounded-2xl border border-white/10">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <input type="password" value={pin} onChange={e => setPin(e.target.value)} placeholder="Admin PIN" className="w-full px-4 py-3 rounded-xl bg-black/60 border border-white/20 focus:border-mtn-yellow outline-none" autoFocus />
          {err && <div className="text-red-300 text-sm">{err}</div>}
          <button className="w-full py-3 bg-mtn-yellow text-black font-bold rounded-xl focus-ring">Log in</button>
        </form>
      </div>
    </main>
  );
}