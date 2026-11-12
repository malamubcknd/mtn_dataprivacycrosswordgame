"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function Timer({ endsAt, onExpire }: { endsAt: number; onExpire?: () => void }) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.floor((endsAt - Date.now()) / 1000)));
  useEffect(() => {
    const i = setInterval(() => {
      const r = Math.max(0, Math.floor((endsAt - Date.now()) / 1000));
      setRemaining(r);
      if (r === 0) { clearInterval(i); onExpire?.(); }
    }, 250);
    return () => clearInterval(i);
  }, [endsAt, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  let cls = "bg-green-600";
  if (remaining <= 30) cls = "bg-red-600 animate-pulse";
  else if (remaining <= 60) cls = "bg-amber-500";

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${cls} text-white font-mono text-2xl font-bold shadow-lg`}>
      <Clock className="w-5 h-5" />
      <span>{mm}:{ss}</span>
    </div>
  );
}