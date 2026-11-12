import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { generateCrossword } from "@/lib/crossword-generator";
import { NextResponse } from "next/server";

export async function POST() {
  const u = await requireAdmin(); if (u) return u;
  const active = await prisma.gameAttempt.findFirst({ where: { status: "ACTIVE" } });
  if (active) return NextResponse.json({ error: "Cannot publish while a player is active." }, { status: 409 });

  const qs = await prisma.question.findMany({ where: { active: true } });
  if (qs.length === 0) return NextResponse.json({ error: "No active questions." }, { status: 400 });
  const layout = generateCrossword(qs.map(q => ({ questionId: q.id, clue: q.clue, answer: q.normalized, points: q.points, direction: q.direction as any })));
  if (layout.words.length === 0) return NextResponse.json({ error: "Could not place any words." }, { status: 400 });

  const last = await prisma.puzzleVersion.findFirst({ orderBy: { versionNumber: "desc" } });
  const versionNumber = (last?.versionNumber || 0) + 1;

  const p = await prisma.puzzleVersion.create({
    data: {
      versionNumber, gridWidth: layout.width, gridHeight: layout.height,
      serializedLayout: JSON.stringify(layout), published: true
    }
  });
  await prisma.puzzleVersion.updateMany({ where: { id: { not: p.id } }, data: { published: false } });
  await prisma.gameConfiguration.update({ where: { id: "singleton" }, data: { publishedPuzzleVersionId: p.id } });
  return NextResponse.json({ ok: true, id: p.id, versionNumber, unplaced: layout.unplaced });
}