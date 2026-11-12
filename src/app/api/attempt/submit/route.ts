import { prisma } from "@/lib/prisma";
import { scoreAttempt } from "@/lib/scoring";
import { PuzzleLayout } from "@/lib/puzzle-types";
import { bestPerEmployee } from "@/lib/ranking";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAttemptId } from "../state/route";

const ATTEMPT_COOKIE = "mtn_attempt";

export async function POST(req: Request) {
  const id = await getAttemptId();
  if (!id) return NextResponse.json({ error: "No attempt" }, { status: 404 });
  const { gridState, reason } = await req.json().catch(() => ({ gridState: {}, reason: "MANUAL_SUBMISSION" }));

  const attempt = await prisma.gameAttempt.findUnique({ where: { id }, include: { puzzleVersion: true, player: true } });
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.status !== "ACTIVE" || attempt.completed) {
    return NextResponse.json({ error: "Already finalized" }, { status: 409 });
  }

  const now = new Date();
  const elapsed = Math.min(attempt.allowedDurationSeconds, Math.max(0, Math.floor((now.getTime() - new Date(attempt.startTime).getTime()) / 1000)));
  const submissionReason = reason === "TIMER_EXPIRED" || elapsed >= attempt.allowedDurationSeconds ? "TIMER_EXPIRED" : "MANUAL_SUBMISSION";

  const layout = JSON.parse(attempt.puzzleVersion.serializedLayout) as PuzzleLayout;
  // Use submitted gridState if present, else stored
  const stored = JSON.parse(attempt.currentGridState || "{}");
  const final: Record<string, string> = { ...stored };
  if (gridState && typeof gridState === "object") {
    for (const [k, v] of Object.entries(gridState)) {
      if (typeof v === "string") {
        const letter = v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
        if (letter) final[k] = letter;
      }
    }
  }

  const result = scoreAttempt(layout, final);

  await prisma.$transaction(async (tx) => {
    await tx.gameAttempt.update({
      where: { id },
      data: {
        status: "COMPLETED",
        completed: true,
        submissionTime: now,
        durationSeconds: elapsed,
        score: result.score,
        totalAvailableScore: result.totalAvailableScore,
        correctAnswerCount: result.correctAnswerCount,
        totalQuestionCount: result.totalQuestionCount,
        submissionReason,
        currentGridState: JSON.stringify(final)
      }
    });
    for (const pw of result.perWord) {
      await tx.attemptAnswer.create({
        data: {
          attemptId: id, questionId: pw.questionId,
          playerSubmittedAnswer: pw.submitted, isCorrect: pw.isCorrect, pointsEarned: pw.pointsEarned
        }
      });
    }
  });

  // Compute position among LIVE best-per-employee
  let position: number | null = null;
  let inTop5 = false;
  if (attempt.eventMode === "LIVE") {
    const completed = await prisma.gameAttempt.findMany({
      where: { eventMode: "LIVE", completed: true, status: "COMPLETED" },
      include: { player: true }
    });
    const ranked = bestPerEmployee(completed.map(c => ({
      id: c.id, playerId: c.playerId, normalizedEmployeeId: c.player.normalizedEmployeeId,
      fullOfficialName: c.player.fullOfficialName, score: c.score, correctAnswerCount: c.correctAnswerCount,
      durationSeconds: c.durationSeconds || 0, submissionTime: c.submissionTime || new Date()
    })));
    const idx = ranked.findIndex(r => r.id === id);
    if (idx >= 0) { position = idx + 1; inTop5 = position <= 5; }
  }

  // Clear attempt cookie — session ends now
  const jar = await cookies();
  jar.delete(ATTEMPT_COOKIE);

  return NextResponse.json({
    score: result.score,
    totalAvailableScore: result.totalAvailableScore,
    correctAnswerCount: result.correctAnswerCount,
    totalQuestionCount: result.totalQuestionCount,
    durationSeconds: elapsed,
    position, inTop5, submissionReason
  });
}