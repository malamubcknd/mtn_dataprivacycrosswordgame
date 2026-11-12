"use client";
import { useEffect, useState } from "react";
import { Maximize } from "lucide-react";

/**
 * Automatically attempts to enter fullscreen.
 * Browsers require a user gesture, so we attach a one-time
 * click/key listener if the auto attempt fails.
 */
export function AutoFullscreen() {
  const [needsClick, setNeedsClick] = useState(false);

  useEffect(() => {
    const isFs = () => !!document.fullscreenElement;
    if (isFs()) return;

    const enter = async () => {
      try {
        await document.documentElement.requestFullscreen();
        setNeedsClick(false);
      } catch {
        setNeedsClick(true);
      }
    };

    // Try immediately (will fail without gesture, but safe)
    enter();

    // Attach one-shot activation on first interaction
    const onInteract = () => {
      enter();
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
    window.addEventListener("click", onInteract);
    window.addEventListener("keydown", onInteract);
    window.addEventListener("touchstart", onInteract);

    // Show prompt after 1s if still not fullscreen
    const t = setTimeout(() => { if (!isFs()) setNeedsClick(true); }, 1000);

    return () => {
      clearTimeout(t);
      window.removeEventListener("click", onInteract);
      window.removeEventListener("keydown", onInteract);
      window.removeEventListener("touchstart", onInteract);
    };
  }, []);

  if (!needsClick) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-mtn-yellow text-black rounded-lg shadow-lg text-xs font-bold animate-pulse">
      <Maximize className="w-4 h-4" />
      Click anywhere to enter Cinema Mode
    </div>
  );
}