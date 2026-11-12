"use client";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";

export default function ResultsPage() {
  const [data, setData] = useState<any>(null);
  const [search, setSearch] = useState("");

  const load = async () => { const r = await fetch("/api/admin/results"); if (r.status===401){window.location.href="/admin";return;} setData(await r.json()); };
  useEffect(() => { load(); }, []);

  const del = async (id: string) => { if (!confirm("Delete this result?")) return; await fetch(`/api/admin/delete-result?id=${id}`, { method: "DELETE" }); load(); };
  const clear = async (scope: "TEST" | "LIVE") => {
    if (!confirm(`Clear all ${scope} results? Consider exporting or backing up first. This cannot be undone.`)) return;
    await fetch(`/api/admin/clear-results?scope=${scope}`, { method: "POST" }); load();
  };

  if (!data) return <main className="min-h-screen flex items-center justify-center">Loading…</main>;

  const filt = (rows: any[]) => rows.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.employeeId.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6"><Logo /><a href="/admin/settings" className="underline text-sm">Dashboard</a></header>
      <h1 className="text-3xl font-black mb-4">Results</h1>
      <div className="flex gap-2 mb-4">
        <input placeholder="Search name or Employee ID" value={search} onChange={e=>setSearch(e.target.value)} className="px-3 py-2 rounded bg-black/60 border border-white/20 flex-1" />
        <button onClick={() => clear("TEST")} className="px-3 py-2 bg-amber-500 text-black rounded">Clear Test Results</button>
        <button onClick={() => clear("LIVE")} className="px-3 py-2 bg-red-600 rounded">Clear Live Results</button>
      </div>

      <Section title={`All Attempts (${data.all.length})`} rows={filt(data.all)} onDelete={del} />
    </main>
  );
}

function Section({ title, rows, onDelete }: { title: string; rows: any[]; onDelete: (id: string) => void }) {
  return (
    <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4 mb-6">
      <h2 className="font-bold mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead className="text-white/50 text-left"><tr>
          <th>Name</th><th>Employee ID</th><th>Mode</th><th>Status</th><th>Score</th><th>Correct</th><th>Time</th><th>Submitted</th><th></th>
        </tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t border-white/10">
              <td className="py-2">{r.name}</td>
              <td className="py-2 font-mono">{r.employeeId}</td>
              <td className="py-2">{r.mode}</td>
              <td className="py-2">{r.status}</td>
              <td className="py-2">{r.score}/{r.totalAvailableScore}</td>
              <td className="py-2">{r.correct}/{r.total}</td>
              <td className="py-2 font-mono">{r.durationSeconds ?? "-"}</td>
              <td className="py-2">{r.submissionTime ? new Date(r.submissionTime).toLocaleString() : "-"}</td>
              <td className="py-2 text-right"><button onClick={() => onDelete(r.id)} className="px-2 py-1 bg-red-600 rounded text-xs">Delete</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={9} className="py-4 text-center text-white/50">No results.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}