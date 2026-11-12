import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  await prisma.gameAttempt.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}