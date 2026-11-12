import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireAdmin(); if (u) return u;
  const { id } = await params;
  const b = await req.json();
  const q = await prisma.question.update({ where: { id }, data: b });
  return NextResponse.json(q);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await requireAdmin(); if (u) return u;
  const { id } = await params;
  await prisma.question.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}