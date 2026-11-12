import { prisma } from "@/lib/prisma";
import { bestPerEmployee } from "@/lib/ranking";
import { firstName, maskEmployeeId } from "@/lib/normalize";
import { PuzzleLayout, toPublicLayout } from "@/lib/puzzle-types";
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = await prisma.gameConfiguration.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  const activeAttempt = await prisma.gameAttempt.findFirst({ where: { status: "ACTIVE" }, include: { player: true, puzzleVersion: true } });

  const completed = await prisma.gameAttempt.findMany({ where: { eventMode: cfg.eventMode, completed: true, status: "COMPLETED" }, include: { player: true } });
  const ranked = bestPerEmployee(completed.map(c => ({
    id: c.id, playerId: c.playerId, normalizedEmployeeId: c.player.normalizedEmployeeId,
    fullOfficialName: c.player.fullOfficialName, score: c.score, correctAnswerCount: c.correctAnswerCount,
    durationSeconds: c.durationSeconds || 0, submissionTime: c.submissionTime || new Date(),
    rawEmployeeId: c.player.rawEmployeeId
  } as any)));
  const leaderboard = ranked.slice(0, 10).map((r, i) => ({
    rank: i+1, name: r.fullOfficialName, maskedId: maskEmployeeId((r as any).rawEmployeeId),
    score: r.score, correct: r.correctAnswerCount, durationSeconds: r.durationSeconds
  }));

  let published = null;
  if (cfg.publishedPuzzleVersionId) {
    const p = await prisma.puzzleVersion.findUnique({ where: { id: cfg.publishedPuzzleVersionId }});
    if (p) published = toPublicLayout(JSON.parse(p.serializedLayout) as PuzzleLayout);
  }

  return NextResponse.json({
    gameTitle: cfg.gameTitle,
    eventMode: cfg.eventMode,
    active: activeAttempt ? {
      playerFirstName: firstName(activeAttempt.player.fullOfficialName),
      startTime: activeAttempt.startTime,
      allowedDurationSeconds: activeAttempt.allowedDurationSeconds,
      layout: toPublicLayout(JSON.parse(activeAttempt.puzzleVersion.serializedLayout) as PuzzleLayout),
      gridState: JSON.parse(activeAttempt.currentGridState || "{}")
    } : null,
    publishedLayout: published,
    leaderboard
  });
}