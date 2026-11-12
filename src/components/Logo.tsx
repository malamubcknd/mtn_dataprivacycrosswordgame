export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full bg-mtn-yellow text-mtn-black font-black text-xl flex items-center justify-center shadow-lg">MTN</div>
      <div className="leading-tight">
        <div className="text-mtn-yellow font-bold tracking-wide">Data Privacy Week</div>
        <div className="text-white/60 text-xs">Crossword Challenge</div>
      </div>
    </div>
  );
}