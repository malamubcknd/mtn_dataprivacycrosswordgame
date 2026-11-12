import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { normalizeAnswer } from "@/lib/normalize";
import { NextResponse } from "next/server";

export async function GET() {
  const u = await requireAdmin(); if (u) return u;
  return NextResponse.json(await prisma.question.findMany({ orderBy: { createdAt: "asc" } }));
}

export async function POST(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const b = await req.json();
  const q = await prisma.question.create({ data: {
    clue: String(b.clue||"").trim(),
    answer: String(b.answer||"").trim(),
    normalized: normalizeAnswer(b.answer),
    points: Number(b.points)||10,
    direction: ["AUTO","ACROSS","DOWN"].includes(b.direction) ? b.direction : "AUTO",
    active: b.active !== false
  }});
  return NextResponse.json(q);
}

export async function PATCH(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const b = await req.json();
  if (!b.id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const data: any = {};
  if (b.clue !== undefined) data.clue = String(b.clue).trim();
  if (b.answer !== undefined) { data.answer = String(b.answer).trim(); data.normalized = normalizeAnswer(b.answer); }
  if (b.points !== undefined) data.points = Number(b.points);
  if (b.direction !== undefined && ["AUTO","ACROSS","DOWN"].includes(b.direction)) data.direction = b.direction;
  if (b.active !== undefined) data.active = !!b.active;
  const q = await prisma.question.update({ where: { id: b.id }, data });
  return NextResponse.json(q);
}