import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function POST() {
  const u = await requireAdmin(); if (u) return u;
  const active = await prisma.gameAttempt.findFirst({ where: { status: "ACTIVE" } });
  if (!active) return NextResponse.json({ error: "No active attempt" }, { status: 404 });
  await prisma.gameAttempt.update({ where: { id: active.id }, data: { status: "CANCELLED", submissionReason: "ADMIN_CANCELLED", completed: false, submissionTime: new Date() } });
  return NextResponse.json({ ok: true });
}