import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getAttemptId } from "../state/route";

export async function POST(req: Request) {
  const id = await getAttemptId();
  if (!id) return NextResponse.json({ error: "No attempt" }, { status: 404 });
  const { gridState } = await req.json().catch(() => ({ gridState: {} }));
  const attempt = await prisma.gameAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.status !== "ACTIVE") return NextResponse.json({ error: "Inactive" }, { status: 410 });
  // Sanitize: single uppercase letter per cell
  const clean: Record<string, string> = {};
  for (const [k, v] of Object.entries(gridState || {})) {
    if (typeof v !== "string") continue;
    const letter = v.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 1);
    if (letter) clean[k] = letter;
  }
  await prisma.gameAttempt.update({ where: { id }, data: { currentGridState: JSON.stringify(clean) } });
  return NextResponse.json({ ok: true });
}