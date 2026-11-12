mport { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { normalizeEmployeeId } from "@/lib/normalize";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const { employeeId } = await req.json();
  const n = normalizeEmployeeId(employeeId);
  await prisma.replayPermission.upsert({ where: { normalizedEmployeeId: n }, update: { used: false }, create: { normalizedEmployeeId: n } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const url = new URL(req.url);
  const n = normalizeEmployeeId(url.searchParams.get("employeeId") || "");
  await prisma.replayPermission.deleteMany({ where: { normalizedEmployeeId: n } });
  return NextResponse.json({ ok: true });
}