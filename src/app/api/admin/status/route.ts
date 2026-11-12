import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { bestPerEmployee } from "@/lib/ranking";
import { PuzzleLayout } from "@/lib/puzzle-types";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await requireAdmin(); if (u) return u;
  const cfg = await prisma.gameConfiguration.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  const activeQuestions = await prisma.question.count({ where: { active: true } });
  const totalPointsAvailable = (await prisma.question.aggregate({ _sum: { points: true }, where: { active: true } }))._sum.points || 0;
  const completedLive = await prisma.gameAttempt.count({ where: { eventMode: "LIVE", completed: true } });
  const completedTest = await prisma.gameAttempt.count({ where: { eventMode: "TEST", completed: true } });
  const active = await prisma.gameAttempt.findFirst({ where: { status: "ACTIVE" }, include: { player: true } });

  const liveAttempts = await prisma.gameAttempt.findMany({ where: { eventMode: "LIVE", completed: true }, include: { player: true } });
  const ranked = bestPerEmployee(liveAttempts.map(c => ({
    id: c.id, playerId: c.playerId, normalizedEmployeeId: c.player.normalizedEmployeeId,
    fullOfficialName: c.player.fullOfficialName, score: c.score, correctAnswerCount: c.correctAnswerCount,
    durationSeconds: c.durationSeconds || 0, submissionTime: c.submissionTime || new Date()
  })));
  const top5 = ranked.slice(0, 5).map((r, i) => ({ rank: i+1, name: r.fullOfficialName, score: r.score }));

  let publishedPuzzle = null;
  let unpublishedChanges = false;
  if (cfg.publishedPuzzleVersionId) {
    const p = await prisma.puzzleVersion.findUnique({ where: { id: cfg.publishedPuzzleVersionId } });
    if (p) {
      const layout = JSON.parse(p.serializedLayout) as PuzzleLayout;
      publishedPuzzle = {
        id: p.id, versionNumber: p.versionNumber, words: layout.words.length,
        totalPoints: layout.words.reduce((s,w)=>s+w.points,0), width: layout.width, height: layout.height, unplaced: layout.unplaced.length
      };
      if (p.createdAt) {
        const edited = await prisma.question.findFirst({ where: { updatedAt: { gt: p.createdAt } } });
        unpublishedChanges = !!edited;
      }
    }
  }

  return NextResponse.json({
    eventMode: cfg.eventMode, gameStatus: cfg.gameStatus, durationMinutes: cfg.durationMinutes,
    repeatAttemptsAllowed: cfg.repeatAttemptsAllowed,
    publishedPuzzle, activeQuestions, totalPointsAvailable, completedLive, completedTest,
    activeAttempt: active ? { playerName: active.player.fullOfficialName, startedAt: active.startTime } : null,
    top5, unpublishedChanges
  });
}