import { prisma } from "@/lib/prisma";
import { firstName } from "@/lib/normalize";
import { PuzzleLayout, toPublicLayout } from "@/lib/puzzle-types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ATTEMPT_COOKIE = "mtn_attempt";

export async function getAttemptId(): Promise<string | null> {
  const jar = await cookies();
  const raw = jar.get(ATTEMPT_COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || !sig) return null;
  const expected = crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "fallback-secret").update(id).digest("base64url");
  if (sig !== expected) return null;
  return id;
}

export async function GET() {
  const id = await getAttemptId();
  if (!id) return NextResponse.json({ error: "No active attempt" }, { status: 404 });
  const attempt = await prisma.gameAttempt.findUnique({ where: { id }, include: { player: true, puzzleVersion: true } });
  if (!attempt) return NextResponse.json({ error: "Attempt not found" }, { status: 404 });
  if (attempt.status !== "ACTIVE") return NextResponse.json({ error: "Attempt not active" }, { status: 410 });

  // Check expiry
  const elapsed = (Date.now() - new Date(attempt.startTime).getTime()) / 1000;
  if (elapsed >= attempt.allowedDurationSeconds) {
    return NextResponse.json({ error: "Attempt expired" }, { status: 410 });
  }

  const layout = JSON.parse(attempt.puzzleVersion.serializedLayout) as PuzzleLayout;
  return NextResponse.json({
    attemptId: attempt.id,
    playerName: attempt.player.fullOfficialName,
    playerFirstName: firstName(attempt.player.fullOfficialName),
    startTime: attempt.startTime,
    allowedDurationSeconds: attempt.allowedDurationSeconds,
    status: attempt.status,
    layout: toPublicLayout(layout),
    gridState: JSON.parse(attempt.currentGridState || "{}")
  });
}