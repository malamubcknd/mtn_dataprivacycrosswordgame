import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await requireAdmin(); if (u) return u;
  const all = await prisma.gameAttempt.findMany({ include: { player: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    all: all.map(a => ({
      id: a.id, name: a.player.fullOfficialName, employeeId: a.player.rawEmployeeId,
      mode: a.eventMode, status: a.status, score: a.score, totalAvailableScore: a.totalAvailableScore,
      correct: a.correctAnswerCount, total: a.totalQuestionCount,
      durationSeconds: a.durationSeconds, submissionTime: a.submissionTime
    }))
  });
}