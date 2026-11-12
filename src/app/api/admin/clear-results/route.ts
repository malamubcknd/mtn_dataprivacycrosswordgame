import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const url = new URL(req.url);
  const scope = url.searchParams.get("scope");
  if (!scope || !["TEST","LIVE"].includes(scope)) return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
  await prisma.gameAttempt.deleteMany({ where: { eventMode: scope } });
  return NextResponse.json({ ok: true });
}