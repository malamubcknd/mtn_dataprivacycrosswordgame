import { prisma } from "@/lib/prisma";
import { bestPerEmployee } from "@/lib/ranking";
import { maskEmployeeId } from "@/lib/normalize";
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = await prisma.gameConfiguration.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  const completed = await prisma.gameAttempt.findMany({
    where: { eventMode: cfg.eventMode, completed: true, status: "COMPLETED" },
    include: { player: true }
  });
  const ranked = bestPerEmployee(completed.map(c => ({
    id: c.id, playerId: c.playerId, normalizedEmployeeId: c.player.normalizedEmployeeId,
    fullOfficialName: c.player.fullOfficialName, score: c.score, correctAnswerCount: c.correctAnswerCount,
    durationSeconds: c.durationSeconds || 0, submissionTime: c.submissionTime || new Date(),
    rawEmployeeId: c.player.rawEmployeeId
  } as any)));
  const rows = ranked.slice(0, 10).map((r, i) => ({
    rank: i + 1,
    name: r.fullOfficialName,
    maskedId: maskEmployeeId((r as any).rawEmployeeId),
    score: r.score,
    correct: r.correctAnswerCount,
    durationSeconds: r.durationSeconds
  }));
  return NextResponse.json({ rows });
}