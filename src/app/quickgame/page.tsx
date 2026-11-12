// "use client";
// import { AutoFullscreen } from "@/components/AutoFullscreen";
// import { useEffect, useState, useRef, useCallback } from "react";
// import { Logo } from "@/components/Logo";
// import { RotateCcw, Clock, Zap, HelpCircle, Send, Trophy } from "lucide-react";

// interface GameData {
//   questionId: string;
//   clue: string;
//   length: number;
//   hints: (string | null)[];
//   cycleComplete: boolean;
//   totalWords: number;
//   remainingWords: number;
// }

// type Status = "LOADING" | "PLAYING" | "CORRECT" | "WRONG" | "TIMES_UP" | "CYCLE_DONE";

// const SOLVED_KEY = "mtn_quickgame_solved";

// /* ── confetti helpers ── */
// interface Particle {
//   id: number;
//   x: number;
//   y: number;
//   color: string;
//   rotation: number;
//   scale: number;
//   delay: number;
// }

// function makeParticles(count: number): Particle[] {
//   const colors = [
//     "#FFCB05", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
//     "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE",
//     "#85C1E9", "#F1948A",
//   ];
//   return Array.from({ length: count }, (_, i) => ({
//     id: i,
//     x: 50 + (Math.random() - 0.5) * 30,
//     y: 40 + (Math.random() - 0.5) * 20,
//     color: colors[Math.floor(Math.random() * colors.length)],
//     rotation: Math.random() * 360,
//     scale: 0.5 + Math.random() * 1,
//     delay: Math.random() * 0.3,
//   }));
// }

// function Confetti({ count = 60 }: { count?: number }) {
//   const [particles] = useState(() => makeParticles(count));
//   return (
//     <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
//       {particles.map((p) => (
//         <div
//           key={p.id}
//           className="absolute"
//           style={{
//             left: `${p.x}%`,
//             top: `${p.y}%`,
//             width: 10 * p.scale,
//             height: 10 * p.scale,
//             backgroundColor: p.color,
//             borderRadius: Math.random() > 0.5 ? "50%" : "2px",
//             transform: `rotate(${p.rotation}deg)`,
//             animation: `confetti-fall 2s ease-out ${p.delay}s forwards`,
//           }}
//         />
//       ))}
//       <style>{`
//         @keyframes confetti-fall {
//           0% {
//             opacity: 1;
//             transform: translate(0, 0) rotate(0deg) scale(1);
//           }
//           100% {
//             opacity: 0;
//             transform: translate(${Math.random() > 0.5 ? "" : "-"}${40 + Math.random() * 60}px, ${300 + Math.random() * 200}px) rotate(${720 + Math.random() * 360}deg) scale(0.3);
//           }
//         }
//         @keyframes wrong-flash {
//           0% { opacity: 0; }
//           15% { opacity: 1; }
//           30% { opacity: 0; }
//           45% { opacity: 0.7; }
//           60% { opacity: 0; }
//           100% { opacity: 0; }
//         }
//         .animate-wrong-flash {
//           animation: wrong-flash 1s ease-out forwards;
//         }
//         @keyframes shake {
//           0%, 100% { transform: translateX(0); }
//           10%, 50%, 90% { transform: translateX(-6px); }
//           30%, 70% { transform: translateX(6px); }
//         }
//         .animate-shake {
//           animation: shake 0.5s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// }

// function WrongShake() {
//   return (
//     <div className="fixed inset-0 pointer-events-none z-50">
//       <div className="absolute inset-0 bg-red-500/10 animate-wrong-flash" />
//     </div>
//   );
// }

// export default function QuickGamePage() {
//   const [game, setGame] = useState<GameData | null>(null);
//   const [letters, setLetters] = useState<string[]>([]);
//   const [status, setStatus] = useState<Status>("LOADING");
//   const [timeLeft, setTimeLeft] = useState(10);
//   const [checking, setChecking] = useState(false);
//   const [solvedCount, setSolvedCount] = useState(0);
//   const [totalWords, setTotalWords] = useState(0);
//   const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);

//   const stopTimer = useCallback(() => {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//     }
//   }, []);

//   const getSolvedIds = (): string[] => {
//     try {
//       const stored = sessionStorage.getItem(SOLVED_KEY);
//       return stored ? JSON.parse(stored) : [];
//     } catch {
//       return [];
//     }
//   };

//   const addSolvedId = (id: string) => {
//     try {
//       const current = getSolvedIds();
//       if (!current.includes(id)) {
//         const updated = [...current, id];
//         sessionStorage.setItem(SOLVED_KEY, JSON.stringify(updated));
//         setSolvedCount(updated.length);
//       }
//     } catch {
//       /* ignore */
//     }
//   };

//   const resetSolved = () => {
//     try {
//       sessionStorage.removeItem(SOLVED_KEY);
//       setSolvedCount(0);
//     } catch {
//       /* ignore */
//     }
//   };

//   const loadNewWord = useCallback(async () => {
//     setStatus("LOADING");
//     setTimeLeft(20);
//     stopTimer();

//     try {
//       const solved = getSolvedIds();
//       const exclude = solved.join(",");
//       const res = await fetch(`/api/quickgame?exclude=${exclude}`);
//       if (!res.ok) return;
//       const data: GameData = await res.json();

//       setTotalWords(data.totalWords);

//       // If cycle was completed → show celebration screen first
//       if (data.cycleComplete && solved.length > 0) {
//         resetSolved();
//         setGame(data);
//         setLetters(data.hints.map((h) => (h ? h : "")));
//         setStatus("CYCLE_DONE");
//         return;
//       }

//       setGame(data);
//       setLetters(data.hints.map((h) => (h ? h : "")));
//       setStatus("PLAYING");

//       setTimeout(() => {
//         const firstBlank = data.hints.findIndex((h) => h === null);
//         if (firstBlank >= 0) inputRefs.current[firstBlank]?.focus();
//       }, 100);
//     } catch {
//       /* ignore */
//     }
//   }, [stopTimer]);

//   // Timer
//   useEffect(() => {
//     if (status !== "PLAYING") return;

//     setTimeLeft(20);
//     timerRef.current = setInterval(() => {
//       setTimeLeft((prev) => {
//         if (prev <= 1) {
//           stopTimer();
//           setStatus("TIMES_UP");
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return stopTimer;
//   }, [status, stopTimer]);

//   // Initial load
//   useEffect(() => {
//     setSolvedCount(getSolvedIds().length);
//     loadNewWord();
//   }, [loadNewWord]);

//   const checkAnswer = useCallback(async () => {
//     if (!game || checking) return;
//     if (status !== "PLAYING") return;

//     const answer = letters.join("");
//     if (answer.length !== game.length) return;

//     stopTimer();
//     setChecking(true);

//     try {
//       const res = await fetch("/api/quickgame", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ questionId: game.questionId, answer }),
//       });
//       const data = await res.json();
//       if (data.correct) {
//         addSolvedId(game.questionId);
//         setStatus("CORRECT");
//       } else {
//         setStatus("WRONG");
//       }
//     } catch {
//       setStatus("WRONG");
//     } finally {
//       setChecking(false);
//     }
//   }, [game, letters, checking, status, stopTimer]);

//   const handleLetterChange = useCallback(
//     (index: number, value: string) => {
//       if (status !== "PLAYING") return;
//       if (game?.hints[index] !== null) return;

//       const char = value.toUpperCase().replace(/[^A-Z]/g, "");
//       setLetters((prev) => {
//         const next = [...prev];
//         next[index] = char;
//         return next;
//       });

//       if (char) {
//         for (let i = index + 1; i < (game?.length || 0); i++) {
//           if (game?.hints[i] === null) {
//             inputRefs.current[i]?.focus();
//             return;
//           }
//         }
//       }
//     },
//     [status, game]
//   );

//   const handleKeyDown = useCallback(
//     (e: React.KeyboardEvent, index: number) => {
//       if (status !== "PLAYING") return;

//       if (e.key === "Enter") {
//         e.preventDefault();
//         checkAnswer();
//         return;
//       }

//       if (e.key === "Backspace") {
//         e.preventDefault();
//         if (letters[index]) {
//           setLetters((prev) => {
//             const next = [...prev];
//             next[index] = "";
//             return next;
//           });
//         } else {
//           for (let i = index - 1; i >= 0; i--) {
//             if (game?.hints[i] === null) {
//               inputRefs.current[i]?.focus();
//               setLetters((prev) => {
//                 const next = [...prev];
//                 next[i] = "";
//                 return next;
//               });
//               return;
//             }
//           }
//         }
//         return;
//       }

//       if (e.key === "ArrowLeft") {
//         e.preventDefault();
//         for (let i = index - 1; i >= 0; i--) {
//           if (game?.hints[i] === null) {
//             inputRefs.current[i]?.focus();
//             return;
//           }
//         }
//         return;
//       }

//       if (e.key === "ArrowRight" || e.key === "Tab") {
//         e.preventDefault();
//         for (let i = index + 1; i < (game?.length || 0); i++) {
//           if (game?.hints[i] === null) {
//             inputRefs.current[i]?.focus();
//             return;
//           }
//         }
//         return;
//       }
//     },
//     [status, letters, game, checkAnswer]
//   );

//   const allFilled =
//     game !== null &&
//     letters.length === game.length &&
//     game.hints.every((h, i) => h !== null || letters[i] !== "");

//   const isLocked = status !== "PLAYING";

//   const timerColor =
//     timeLeft <= 3
//       ? "text-red-500"
//       : timeLeft <= 5
//       ? "text-orange-400"
//       : "text-green-400";

//   const timerPulse = timeLeft <= 3 ? "animate-pulse" : "";

//   const boxBorderClass = (index: number) => {
//     const isRevealed = game?.hints[index] !== null;
//     const isFilled = letters[index] !== "";

//     if (status === "CORRECT") return "border-green-400 bg-green-500/20 text-green-400";
//     if (status === "WRONG") return "border-red-400 bg-red-500/10 text-red-400";
//     if (status === "TIMES_UP") return "border-gray-600 bg-gray-800 text-gray-500";
//     if (isRevealed) return "border-mtn-yellow bg-mtn-yellow/20 text-mtn-yellow";
//     if (isFilled) return "border-white/40 bg-white/10 text-white";
//     return "border-white/20 bg-white/5 text-white";
//   };

//   return (
//     <main className="h-screen w-screen overflow-hidden bg-mtn-dark text-white flex flex-col">
//         <AutoFullscreen />
//       {status === "CORRECT" && <Confetti />}
//       {status === "CYCLE_DONE" && <Confetti count={120} />}
//       {status === "WRONG" && <WrongShake />}

//       {/* Header */}
//       <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/10">
//         <div className="flex items-center gap-3">
//           <Logo />
//           <div>
//             <h1 className="text-lg font-bold flex items-center gap-2">
//               <Zap className="w-5 h-5 text-mtn-yellow" />
//               Quick Word Challenge
//             </h1>
//             <p className="text-xs text-gray-500">
//               Guess the data privacy term — 20 seconds!
//             </p>
//           </div>
//         </div>

//         <div className="flex items-center gap-4">
//           {/* Progress */}
//           {totalWords > 0 && (
//             <div className="text-xs text-gray-400 text-right">
//               <div className="font-bold text-white">
//                 {solvedCount} / {totalWords}
//               </div>
//               <div>solved this cycle</div>
//             </div>
//           )}

//           {status === "PLAYING" && (
//             <div
//               className={`flex items-center gap-2 text-2xl font-mono font-bold ${timerColor} ${timerPulse}`}
//             >
//               <Clock className="w-6 h-6" />
//               <span>{timeLeft}s</span>
//             </div>
//           )}
//         </div>
//       </header>

//       {/* Game Area */}
//       <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
//         {status === "LOADING" && (
//           <div className="text-center">
//             <div className="animate-spin w-10 h-10 border-3 border-mtn-yellow border-t-transparent rounded-full mx-auto mb-4" />
//             <p className="text-gray-400">Loading word…</p>
//           </div>
//         )}

//         {/* Cycle completion screen */}
//         {status === "CYCLE_DONE" && (
//           <div className="text-center max-w-xl">
//             <div className="text-7xl mb-4">🏆</div>
//             <h2 className="text-3xl font-bold text-mtn-yellow mb-3">
//               All Words Solved!
//             </h2>
//             <p className="text-gray-300 text-lg mb-6">
//               Amazing teamwork! You&apos;ve cleared all{" "}
//               <span className="text-white font-bold">{totalWords}</span> data
//               privacy terms.
//             </p>
//             <p className="text-gray-500 text-sm mb-8">
//               Ready to go another round? The cycle has been reset.
//             </p>
//             <button
//               onClick={loadNewWord}
//               className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg"
//             >
//               <RotateCcw className="w-5 h-5" />
//               Start New Cycle
//             </button>
//           </div>
//         )}

//         {status !== "LOADING" && status !== "CYCLE_DONE" && game && (
//           <div className="w-full max-w-3xl">
//             {/* Clue */}
//             <div className="text-center mb-8">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-mtn-yellow/10 border border-mtn-yellow/30 rounded-xl">
//                 <HelpCircle className="w-5 h-5 text-mtn-yellow flex-shrink-0" />
//                 <span className="text-mtn-yellow font-medium text-lg">
//                   {game.clue}
//                 </span>
//               </div>
//             </div>

//             {/* Letter Boxes */}
//             <div
//               className={`flex items-center justify-center gap-2 flex-wrap mb-8 ${
//                 status === "WRONG" ? "animate-shake" : ""
//               }`}
//             >
//               {game.hints.map((hint, i) => {
//                 const isRevealed = hint !== null;
//                 return (
//                   <div key={i} className="flex flex-col items-center">
//                     <div
//                       className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${boxBorderClass(
//                         i
//                       )}`}
//                     >
//                       {isRevealed ? (
//                         <span className="text-2xl font-bold">{hint}</span>
//                       ) : (
//                         <input
//                           ref={(el) => {
//                             inputRefs.current[i] = el;
//                           }}
//                           type="text"
//                           inputMode="text"
//                           autoComplete="off"
//                           autoCorrect="off"
//                           autoCapitalize="characters"
//                           spellCheck={false}
//                           maxLength={1}
//                           value={letters[i]}
//                           readOnly={isLocked}
//                           onChange={(e) =>
//                             handleLetterChange(i, e.target.value)
//                           }
//                           onKeyDown={(e) => handleKeyDown(e, i)}
//                           className={`w-full h-full text-center text-2xl font-bold bg-transparent outline-none caret-transparent ${
//                             isLocked ? "cursor-not-allowed" : "cursor-pointer"
//                           }`}
//                           style={{ color: "inherit" }}
//                         />
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>

//             {/* Result Messages */}
//             {status === "CORRECT" && (
//               <div className="text-center mb-6">
//                 <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
//                   <span className="text-4xl">🎉</span>
//                   <div>
//                     <p className="text-green-400 font-bold text-xl">Correct!</p>
//                     {/* <p className="text-green-400/70 text-sm">
//                       {totalWords - solvedCount} word
//                       {totalWords - solvedCount !== 1 ? "s" : ""} left in this
//                       cycle
//                     </p> */}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {status === "WRONG" && (
//               <div className="text-center mb-6">
//                 <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
//                   <span className="text-4xl">😔</span>
//                   <div>
//                     <p className="text-red-400 font-bold text-xl">Not quite!</p>
//                     <p className="text-red-400/70 text-sm">
//                       This word will come back later
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {status === "TIMES_UP" && (
//               <div className="text-center mb-6">
//                 <div className="inline-flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
//                   <Clock className="w-5 h-5 text-red-400" />
//                   <span className="text-red-400 font-bold text-lg">
//                     Time&apos;s Up!
//                   </span>
//                 </div>
//               </div>
//             )}

//             {/* Buttons */}
//             <div className="text-center space-y-3">
//               {status === "PLAYING" && (
//                 <button
//                   onClick={checkAnswer}
//                   disabled={!allFilled || checking}
//                   className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg disabled:opacity-30 disabled:cursor-not-allowed"
//                 >
//                   <Send className="w-5 h-5" />
//                   {checking ? "Checking…" : "Submit"}
//                 </button>
//               )}

//               {(status === "CORRECT" ||
//                 status === "WRONG" ||
//                 status === "TIMES_UP") && (
//                 <>
//                   <button
//                     onClick={loadNewWord}
//                     className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg"
//                   >
//                     <RotateCcw className="w-5 h-5" />
//                     Next Word
//                   </button>
//                   <p className="text-gray-600 text-xs">
//                     Pass the device to the next person
//                   </p>
//                 </>
//               )}

//               {status === "PLAYING" && !allFilled && (
//                 <p className="text-gray-500 text-sm">
//                   Fill in the missing letters · Press Enter or click Submit
//                 </p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <footer className="flex-shrink-0 flex items-center justify-between py-2 px-4 border-t border-white/10">
//         <p className="text-gray-600 text-xs">
//           Data Privacy Week · MTN Ghana · Quick Word Challenge
//         </p>
//         {solvedCount > 0 && (
//           <button
//             onClick={() => {
//               if (confirm("Reset the cycle? All solved words will be replayable.")) {
//                 resetSolved();
//                 loadNewWord();
//               }
//             }}
//             className="text-xs text-gray-600 hover:text-gray-400 transition"
//           >
//             Reset cycle
//           </button>
//         )}
//       </footer>
//     </main>
//   );
// }




"use client";
import { AutoFullscreen } from "@/components/AutoFullscreen";
import { useEffect, useState, useRef, useCallback } from "react";
import { Logo } from "@/components/Logo";
import { RotateCcw, Clock, Zap, HelpCircle, Send, Trophy } from "lucide-react";

interface GameData {
  questionId: string;
  clue: string;
  length: number;
  hints: (string | null)[];
  cycleComplete: boolean;
  totalWords: number;
  remainingWords: number;
}

type Status = "LOADING" | "PLAYING" | "CORRECT" | "WRONG" | "CYCLE_DONE";

const SOLVED_KEY = "mtn_quickgame_solved";

/* ── confetti helpers ── */
interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  rotation: number;
  scale: number;
  delay: number;
}

function makeParticles(count: number): Particle[] {
  const colors = [
    "#FFCB05", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
    "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE",
    "#85C1E9", "#F1948A",
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 50 + (Math.random() - 0.5) * 30,
    y: 40 + (Math.random() - 0.5) * 20,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 1,
    delay: Math.random() * 0.3,
  }));
}

function Confetti({ count = 60 }: { count?: number }) {
  const [particles] = useState(() => makeParticles(count));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: 10 * p.scale,
            height: 10 * p.scale,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            transform: `rotate(${p.rotation}deg)`,
            animation: `confetti-fall 2s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            transform: translate(0, 0) rotate(0deg) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(${Math.random() > 0.5 ? "" : "-"}${40 + Math.random() * 60}px, ${300 + Math.random() * 200}px) rotate(${720 + Math.random() * 360}deg) scale(0.3);
          }
        }
        @keyframes wrong-flash {
          0% { opacity: 0; }
          15% { opacity: 1; }
          30% { opacity: 0; }
          45% { opacity: 0.7; }
          60% { opacity: 0; }
          100% { opacity: 0; }
        }
        .animate-wrong-flash {
          animation: wrong-flash 1s ease-out forwards;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 50%, 90% { transform: translateX(-6px); }
          30%, 70% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

function WrongShake() {
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="absolute inset-0 bg-red-500/10 animate-wrong-flash" />
    </div>
  );
}

export default function QuickGamePage() {
  const [game, setGame] = useState<GameData | null>(null);
  const [letters, setLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("LOADING");
  const [timeLeft, setTimeLeft] = useState(20);
  const [checking, setChecking] = useState(false);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs to always hold the latest values inside timer callbacks
  const lettersRef = useRef<string[]>([]);
  const gameRef = useRef<GameData | null>(null);
  const statusRef = useRef<Status>("LOADING");
  const checkingRef = useRef<boolean>(false);

  useEffect(() => { lettersRef.current = letters; }, [letters]);
  useEffect(() => { gameRef.current = game; }, [game]);
  useEffect(() => { statusRef.current = status; }, [status]);
  useEffect(() => { checkingRef.current = checking; }, [checking]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getSolvedIds = (): string[] => {
    try {
      const stored = sessionStorage.getItem(SOLVED_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const addSolvedId = (id: string) => {
    try {
      const current = getSolvedIds();
      if (!current.includes(id)) {
        const updated = [...current, id];
        sessionStorage.setItem(SOLVED_KEY, JSON.stringify(updated));
        setSolvedCount(updated.length);
      }
    } catch {
      /* ignore */
    }
  };

  const resetSolved = () => {
    try {
      sessionStorage.removeItem(SOLVED_KEY);
      setSolvedCount(0);
    } catch {
      /* ignore */
    }
  };

  // Core check — works with whatever letters are currently filled (even none)
  const performCheck = useCallback(async (auto: boolean = false) => {
    const currentGame = gameRef.current;
    const currentLetters = lettersRef.current;
    if (!currentGame) return;
    if (checkingRef.current) return;
    if (statusRef.current !== "PLAYING") return;

    stopTimer();
    setChecking(true);

    // Build answer from current letters (empty slots become empty string)
    const answer = currentLetters.join("");

    // If completely empty or shorter than required → automatically wrong
    // (we still call server for consistency; server will say false)
    try {
      const res = await fetch("/api/quickgame", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentGame.questionId,
          answer: answer || "_",  // send placeholder so server doesn't 400
        }),
      });
      const data = await res.json();
      if (data.correct) {
        addSolvedId(currentGame.questionId);
        setStatus("CORRECT");
      } else {
        setStatus("WRONG");
      }
    } catch {
      setStatus("WRONG");
    } finally {
      setChecking(false);
    }
  }, [stopTimer]);

  const checkAnswer = useCallback(() => {
    performCheck(false);
  }, [performCheck]);

  const loadNewWord = useCallback(async () => {
    setStatus("LOADING");
    setTimeLeft(20);
    stopTimer();

    try {
      const solved = getSolvedIds();
      const exclude = solved.join(",");
      const res = await fetch(`/api/quickgame?exclude=${exclude}`);
      if (!res.ok) return;
      const data: GameData = await res.json();

      setTotalWords(data.totalWords);

      if (data.cycleComplete && solved.length > 0) {
        resetSolved();
        setGame(data);
        setLetters(data.hints.map((h) => (h ? h : "")));
        setStatus("CYCLE_DONE");
        return;
      }

      setGame(data);
      setLetters(data.hints.map((h) => (h ? h : "")));
      setStatus("PLAYING");

      setTimeout(() => {
        const firstBlank = data.hints.findIndex((h) => h === null);
        if (firstBlank >= 0) inputRefs.current[firstBlank]?.focus();
      }, 100);
    } catch {
      /* ignore */
    }
  }, [stopTimer]);

  // Timer — on expiry, auto-submit whatever is there
  useEffect(() => {
    if (status !== "PLAYING") return;

    setTimeLeft(20);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          // Auto-submit on timer expiry (fires even if letters are empty/partial)
          performCheck(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return stopTimer;
  }, [status, stopTimer, performCheck]);

  // Initial load
  useEffect(() => {
    setSolvedCount(getSolvedIds().length);
    loadNewWord();
  }, [loadNewWord]);

  const handleLetterChange = useCallback(
    (index: number, value: string) => {
      if (status !== "PLAYING") return;
      if (game?.hints[index] !== null) return;

      const char = value.toUpperCase().replace(/[^A-Z]/g, "");
      setLetters((prev) => {
        const next = [...prev];
        next[index] = char;
        return next;
      });

      if (char) {
        for (let i = index + 1; i < (game?.length || 0); i++) {
          if (game?.hints[i] === null) {
            inputRefs.current[i]?.focus();
            return;
          }
        }
      }
    },
    [status, game]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      if (status !== "PLAYING") return;

      if (e.key === "Enter") {
        e.preventDefault();
        checkAnswer();
        return;
      }

      if (e.key === "Backspace") {
        e.preventDefault();
        if (letters[index]) {
          setLetters((prev) => {
            const next = [...prev];
            next[index] = "";
            return next;
          });
        } else {
          for (let i = index - 1; i >= 0; i--) {
            if (game?.hints[i] === null) {
              inputRefs.current[i]?.focus();
              setLetters((prev) => {
                const next = [...prev];
                next[i] = "";
                return next;
              });
              return;
            }
          }
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        for (let i = index - 1; i >= 0; i--) {
          if (game?.hints[i] === null) {
            inputRefs.current[i]?.focus();
            return;
          }
        }
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Tab") {
        e.preventDefault();
        for (let i = index + 1; i < (game?.length || 0); i++) {
          if (game?.hints[i] === null) {
            inputRefs.current[i]?.focus();
            return;
          }
        }
        return;
      }
    },
    [status, letters, game, checkAnswer]
  );

  const allFilled =
    game !== null &&
    letters.length === game.length &&
    game.hints.every((h, i) => h !== null || letters[i] !== "");

  const isLocked = status !== "PLAYING";

  const timerColor =
    timeLeft <= 3
      ? "text-red-500"
      : timeLeft <= 5
      ? "text-orange-400"
      : "text-green-400";

  const timerPulse = timeLeft <= 3 ? "animate-pulse" : "";

  const boxBorderClass = (index: number) => {
    const isRevealed = game?.hints[index] !== null;
    const isFilled = letters[index] !== "";

    if (status === "CORRECT") return "border-green-400 bg-green-500/20 text-green-400";
    if (status === "WRONG") return "border-red-400 bg-red-500/10 text-red-400";
    if (isRevealed) return "border-mtn-yellow bg-mtn-yellow/20 text-mtn-yellow";
    if (isFilled) return "border-white/40 bg-white/10 text-white";
    return "border-white/20 bg-white/5 text-white";
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-mtn-dark text-white flex flex-col">
        <AutoFullscreen />
      {status === "CORRECT" && <Confetti />}
      {status === "CYCLE_DONE" && <Confetti count={120} />}
      {status === "WRONG" && <WrongShake />}

      {/* Header */}
      <header className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-black/40 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Logo />
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-mtn-yellow" />
              Quick Word Challenge
            </h1>
            <p className="text-xs text-gray-500">
              Guess the data privacy term — 20 seconds!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {totalWords > 0 && (
            <div className="text-xs text-gray-400 text-right">
              <div className="font-bold text-white">
                {solvedCount} / {totalWords}
              </div>
              <div>solved this cycle</div>
            </div>
          )}

          {status === "PLAYING" && (
            <div
              className={`flex items-center gap-2 text-2xl font-mono font-bold ${timerColor} ${timerPulse}`}
            >
              <Clock className="w-6 h-6" />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>
      </header>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
        {status === "LOADING" && (
          <div className="text-center">
            <div className="animate-spin w-10 h-10 border-3 border-mtn-yellow border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-400">Loading word…</p>
          </div>
        )}

        {status === "CYCLE_DONE" && (
          <div className="text-center max-w-xl">
            <div className="text-7xl mb-4">🏆</div>
            <h2 className="text-3xl font-bold text-mtn-yellow mb-3">
              All Words Solved!
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              Amazing teamwork! You&apos;ve cleared all{" "}
              <span className="text-white font-bold">{totalWords}</span> data
              privacy terms.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Ready to go another round? The cycle has been reset.
            </p>
            <button
              onClick={loadNewWord}
              className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg"
            >
              <RotateCcw className="w-5 h-5" />
              Start New Cycle
            </button>
          </div>
        )}

        {status !== "LOADING" && status !== "CYCLE_DONE" && game && (
          <div className="w-full max-w-3xl">
            {/* Clue */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-mtn-yellow/10 border border-mtn-yellow/30 rounded-xl">
                <HelpCircle className="w-5 h-5 text-mtn-yellow flex-shrink-0" />
                <span className="text-mtn-yellow font-medium text-lg">
                  {game.clue}
                </span>
              </div>
            </div>

            {/* Letter Boxes */}
            <div
              className={`flex items-center justify-center gap-2 flex-wrap mb-8 ${
                status === "WRONG" ? "animate-shake" : ""
              }`}
            >
              {game.hints.map((hint, i) => {
                const isRevealed = hint !== null;
                return (
                  <div key={i} className="flex flex-col items-center">
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${boxBorderClass(
                        i
                      )}`}
                    >
                      {isRevealed ? (
                        <span className="text-2xl font-bold">{hint}</span>
                      ) : (
                        <input
                          ref={(el) => {
                            inputRefs.current[i] = el;
                          }}
                          type="text"
                          inputMode="text"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="characters"
                          spellCheck={false}
                          maxLength={1}
                          value={letters[i]}
                          readOnly={isLocked}
                          onChange={(e) =>
                            handleLetterChange(i, e.target.value)
                          }
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          className={`w-full h-full text-center text-2xl font-bold bg-transparent outline-none caret-transparent ${
                            isLocked ? "cursor-not-allowed" : "cursor-pointer"
                          }`}
                          style={{ color: "inherit" }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Result Messages */}
            {status === "CORRECT" && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <span className="text-4xl">🎉</span>
                  <div>
                    <p className="text-green-400 font-bold text-xl">Correct!</p>
                  </div>
                </div>
              </div>
            )}

            {status === "WRONG" && (
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                  <span className="text-4xl">😔</span>
                  <div>
                    <p className="text-red-400 font-bold text-xl">Not quite!</p>
                    <p className="text-red-400/70 text-sm">
                      This word will come back later
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="text-center space-y-3">
              {status === "PLAYING" && (
                <button
                  onClick={checkAnswer}
                  disabled={!allFilled || checking}
                  className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                  {checking ? "Checking…" : "Submit"}
                </button>
              )}

              {(status === "CORRECT" || status === "WRONG") && (
                <>
                  <button
                    onClick={loadNewWord}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-mtn-yellow text-black font-bold rounded-xl hover:brightness-110 transition text-lg"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Next Word
                  </button>
                  <p className="text-gray-600 text-xs">
                    Pass the device to the next person
                  </p>
                </>
              )}

              {status === "PLAYING" && !allFilled && (
                <p className="text-gray-500 text-sm">
                  Fill in the missing letters · Press Enter or click Submit
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 flex items-center justify-between py-2 px-4 border-t border-white/10">
        <p className="text-gray-600 text-xs">
          Data Privacy Week · MTN Ghana · Quick Word Challenge
        </p>
        {solvedCount > 0 && (
          <button
            onClick={() => {
              if (confirm("Reset the cycle? All solved words will be replayable.")) {
                resetSolved();
                loadNewWord();
              }
            }}
            className="text-xs text-gray-600 hover:text-gray-400 transition"
          >
            Reset cycle
          </button>
        )}
      </footer>
    </main>
  );
}