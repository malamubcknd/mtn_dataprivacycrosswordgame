import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { generateCrossword } from "@/lib/crossword-generator";
import { NextResponse } from "next/server";

export async function POST() {
  const u = await requireAdmin(); if (u) return u;
  const qs = await prisma.question.findMany({ where: { active: true } });
  const layout = generateCrossword(qs.map(q => ({ questionId: q.id, clue: q.clue, answer: q.normalized, points: q.points, direction: q.direction as any })));
  const totalPoints = layout.words.reduce((s,w)=>s+w.points,0);
  return NextResponse.json({ ...layout, totalPoints });
}