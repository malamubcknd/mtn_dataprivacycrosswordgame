import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { bestPerEmployee } from "@/lib/ranking";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "all";

  const attempts = await prisma.gameAttempt.findMany({ include: { player: true, puzzleVersion: true }, orderBy: { createdAt: "desc" } });
  let rows = attempts.map(a => ({
    rank: "",
    name: a.player.fullOfficialName,
    employeeId: a.player.rawEmployeeId,
    score: a.score,
    totalAvailableScore: a.totalAvailableScore,
    correct: a.correctAnswerCount,
    total: a.totalQuestionCount,
    startTime: a.startTime.toISOString(),
    submissionTime: a.submissionTime?.toISOString() || "",
    durationSeconds: a.durationSeconds || "",
    submissionReason: a.submissionReason || "",
    puzzleVersion: a.puzzleVersion.versionNumber,
    status: a.status,
    mode: a.eventMode
  }));

  if (type !== "all") {
    const completedLive = attempts.filter(a => a.eventMode === "LIVE" && a.completed);
    const ranked = bestPerEmployee(completedLive.map(c => ({
      id: c.id, playerId: c.playerId, normalizedEmployeeId: c.player.normalizedEmployeeId,
      fullOfficialName: c.player.fullOfficialName, score: c.score, correctAnswerCount: c.correctAnswerCount,
      durationSeconds: c.durationSeconds || 0, submissionTime: c.submissionTime || new Date()
    })));
    const limit = type === "top5" ? 5 : 10;
    const idsOrdered = ranked.slice(0, limit).map(r => r.id);
    rows = idsOrdered.map((id, i) => {
      const a = attempts.find(x => x.id === id)!;
      return {
        rank: String(i+1), name: a.player.fullOfficialName, employeeId: a.player.rawEmployeeId,
        score: a.score, totalAvailableScore: a.totalAvailableScore, correct: a.correctAnswerCount, total: a.totalQuestionCount,
        startTime: a.startTime.toISOString(), submissionTime: a.submissionTime?.toISOString() || "",
        durationSeconds: a.durationSeconds || "", submissionReason: a.submissionReason || "",
        puzzleVersion: a.puzzleVersion.versionNumber, status: a.status, mode: a.eventMode
      };
    });
  }

  const header = ["Rank","Name","EmployeeID","Score","Total","Correct","TotalQuestions","Start","Submitted","DurationSec","Reason","PuzzleVer","Status","Mode"];
  const csv = [header.join(",")].concat(rows.map(r => [
    r.rank, csvEsc(r.name), csvEsc(r.employeeId), r.score, r.totalAvailableScore, r.correct, r.total,
    r.startTime, r.submissionTime, r.durationSeconds, r.submissionReason, r.puzzleVersion, r.status, r.mode
  ].join(","))).join("\n");

  return new NextResponse(csv, { headers: { "content-type": "text/csv", "content-disposition": `attachment; filename="results-${type}.csv"` } });
}

function csvEsc(s: string) {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}