"use client";
import { Logo } from "@/components/Logo";
import { CrosswordGrid } from "@/components/CrosswordGrid";
import { useEffect, useState } from "react";

interface Question { id: string; clue: string; answer: string; points: number; direction: string; active: boolean; }

export default function AdminQuestions() {
  const [list, setList] = useState<Question[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [edit, setEdit] = useState<Partial<Question>>({ clue: "", answer: "", points: 10, direction: "AUTO", active: true });

  const load = async () => {
    const r = await fetch("/api/admin/questions"); if (r.status === 401) { window.location.href = "/admin"; return; }
    setList(await r.json());
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!edit.clue || !edit.answer) return;
    await fetch("/api/admin/questions", { method: edit.id ? "PATCH" : "POST", headers: {"content-type":"application/json"}, body: JSON.stringify(edit) });
    setEdit({ clue: "", answer: "", points: 10, direction: "AUTO", active: true });
    await load();
  };
  const del = async (id: string) => { if (!confirm("Delete question?")) return; await fetch(`/api/admin/questions/${id}`, { method: "DELETE" }); await load(); };
  const toggle = async (q: Question) => { await fetch(`/api/admin/questions/${q.id}`, { method: "PATCH", headers: {"content-type":"application/json"}, body: JSON.stringify({ active: !q.active })}); await load(); };

  const regenerate = async () => { const r = await fetch("/api/admin/puzzle/preview", { method: "POST" }); setPreview(await r.json()); };
  const publish = async () => { if (!confirm("Publish current preview?")) return; await fetch("/api/admin/puzzle/publish", { method: "POST" }); alert("Published."); };

  return (
    <main className="min-h-screen p-6">
      <header className="flex justify-between items-center mb-6"><Logo /><a href="/admin/settings" className="underline text-sm">Dashboard</a></header>
      <h1 className="text-3xl font-black mb-6">Questions</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4">
          <h2 className="font-bold mb-3">{edit.id ? "Edit Question" : "New Question"}</h2>
          <div className="space-y-2">
            <input className="w-full px-3 py-2 rounded bg-black/60 border border-white/20" placeholder="Clue" value={edit.clue || ""} onChange={e => setEdit({...edit, clue: e.target.value})} />
            <input className="w-full px-3 py-2 rounded bg-black/60 border border-white/20 font-mono uppercase" placeholder="Answer (e.g. DATA BREACH)" value={edit.answer || ""} onChange={e => setEdit({...edit, answer: e.target.value})} />
            <div className="flex gap-2">
              <input type="number" className="w-24 px-3 py-2 rounded bg-black/60 border border-white/20" value={edit.points || 10} onChange={e => setEdit({...edit, points: parseInt(e.target.value)||0})} />
              <select className="px-3 py-2 rounded bg-black/60 border border-white/20" value={edit.direction || "AUTO"} onChange={e => setEdit({...edit, direction: e.target.value})}>
                <option value="AUTO">AUTO</option><option value="ACROSS">ACROSS</option><option value="DOWN">DOWN</option>
              </select>
              <label className="flex items-center gap-1"><input type="checkbox" checked={edit.active !== false} onChange={e => setEdit({...edit, active: e.target.checked})} /> Active</label>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="px-4 py-2 bg-mtn-yellow text-black rounded font-bold">{edit.id ? "Update" : "Create"}</button>
              {edit.id && <button onClick={() => setEdit({ clue: "", answer: "", points: 10, direction: "AUTO", active: true })} className="px-4 py-2 bg-white/10 rounded">Cancel</button>}
            </div>
          </div>
        </div>

        <div className="bg-mtn-dark border border-white/10 rounded-2xl p-4">
          <div className="flex gap-2 mb-3">
            <button onClick={regenerate} className="px-4 py-2 bg-white/10 rounded">Regenerate Preview</button>
            <button onClick={publish} className="px-4 py-2 bg-mtn-yellow text-black rounded font-bold">Publish Puzzle</button>
            <label className="flex items-center gap-1 ml-2"><input type="checkbox" checked={showAnswers} onChange={e => setShowAnswers(e.target.checked)} /> Show Answers (admin)</label>
          </div>
          {preview && (
            <div className="text-sm text-white/70 mb-3">
              Grid: {preview.width}×{preview.height} · Words: {preview.words.length} · Total points: {preview.totalPoints} · Unplaced: {preview.unplaced.length}
              {preview.unplaced.length > 0 && <div className="text-amber-300 mt-1">Unplaced: {preview.unplaced.map((u:any)=>u.answer).join(", ")}</div>}
            </div>
          )}
          {preview && (
            <div className="overflow-auto">
              <CrosswordGrid layout={preview} gridState={showAnswers ? Object.fromEntries(preview.cells.filter((c:any)=>c.type==="LETTER" && c.letter).map((c:any)=>[`${c.row},${c.col}`, c.letter])) : {}} readOnly cellPx={34} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 bg-mtn-dark border border-white/10 rounded-2xl p-4">
        <h2 className="font-bold mb-3">All Questions ({list.length})</h2>
        <table className="w-full text-sm">
          <thead className="text-white/50 text-left"><tr><th>Clue</th><th>Answer</th><th>Points</th><th>Dir</th><th>Active</th><th></th></tr></thead>
          <tbody>
            {list.map(q => (
              <tr key={q.id} className="border-t border-white/10">
                <td className="py-2">{q.clue}</td>
                <td className="py-2 font-mono">{q.answer}</td>
                <td className="py-2">{q.points}</td>
                <td className="py-2">{q.direction}</td>
                <td className="py-2"><button onClick={() => toggle(q)} className={`px-2 py-0.5 rounded text-xs ${q.active ? "bg-green-600" : "bg-white/10"}`}>{q.active ? "YES" : "NO"}</button></td>
                <td className="py-2 text-right">
                  <button onClick={() => setEdit(q)} className="px-2 py-1 bg-white/10 rounded mr-2">Edit</button>
                  <button onClick={() => del(q.id)} className="px-2 py-1 bg-red-600 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}