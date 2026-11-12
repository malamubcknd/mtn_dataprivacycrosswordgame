"use client";
import { Maximize, Minimize } from "lucide-react";
import { useEffect, useState } from "react";

export function CinemaButton() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported(typeof document !== "undefined" && !!document.documentElement.requestFullscreen);
    const handler = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const toggle = async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
      else await document.exitFullscreen();
    } catch { /* ignore */ }
  };

  if (!supported) return <span className="text-xs text-white/40">Fullscreen not available in this browser.</span>;

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition text-xs font-mono uppercase tracking-wider font-bold focus-ring"
    >
      {isFullscreen ? (
        <><Minimize className="w-4 h-4 text-mtn-yellow" /><span>Exit Fullscreen</span></>
      ) : (
        <><Maximize className="w-4 h-4 text-mtn-yellow" /><span>Cinema Mode</span></>
      )}
    </button>
  );
}