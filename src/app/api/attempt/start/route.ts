import { prisma } from "@/lib/prisma";
import { normalizeEmployeeId, validateEmployeeId, validateName } from "@/lib/normalize";
import { PuzzleLayout, toPublicLayout } from "@/lib/puzzle-types";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";

const ATTEMPT_COOKIE = "mtn_attempt";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const nameErr = validateName(body.fullOfficialName);
  if (nameErr) return NextResponse.json({ error: nameErr }, { status: 400 });
  const idErr = validateEmployeeId(body.employeeId);
  if (idErr) return NextResponse.json({ error: idErr }, { status: 400 });

  const cfg = await prisma.gameConfiguration.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  if (cfg.gameStatus !== "OPEN") return NextResponse.json({ error: `Game is ${cfg.gameStatus}.` }, { status: 400 });

  const active = await prisma.gameAttempt.findFirst({ where: { status: "ACTIVE" } });
  if (active) return NextResponse.json({ error: "Another player is currently in a game. Please wait." }, { status: 409 });

  if (!cfg.publishedPuzzleVersionId) return NextResponse.json({ error: "No published puzzle." }, { status: 400 });
  const puzzle = await prisma.puzzleVersion.findUnique({ where: { id: cfg.publishedPuzzleVersionId } });
  if (!puzzle) return NextResponse.json({ error: "Published puzzle missing." }, { status: 400 });

  const normalizedId = normalizeEmployeeId(body.employeeId);
  const fullName = body.fullOfficialName.trim();

  // Duplicate rule for LIVE
  if (cfg.eventMode === "LIVE" && !cfg.repeatAttemptsAllowed) {
    const existing = await prisma.gameAttempt.findFirst({
      where: { eventMode: "LIVE", completed: true, player: { normalizedEmployeeId: normalizedId } },
      include: { player: true }
    });
    if (existing) {
      const permission = await prisma.replayPermission.findUnique({ where: { normalizedEmployeeId: normalizedId } });
      if (!permission || permission.used) {
        return NextResponse.json({ error: "Our records show that this Employee ID has already completed the challenge. Please contact the administrator if you require assistance." }, { status: 409 });
      }
      await prisma.replayPermission.update({ where: { normalizedEmployeeId: normalizedId }, data: { used: true } });
    }
  }

  const player = await prisma.player.upsert({
    where: { normalizedEmployeeId: normalizedId },
    update: { fullOfficialName: fullName, rawEmployeeId: body.employeeId.trim() },
    create: { fullOfficialName: fullName, rawEmployeeId: body.employeeId.trim(), normalizedEmployeeId: normalizedId }
  });

  const layout = JSON.parse(puzzle.serializedLayout) as PuzzleLayout;
  const totalAvailable = layout.words.reduce((s, w) => s + w.points, 0);

  const attempt = await prisma.gameAttempt.create({
    data: {
      playerId: player.id,
      puzzleVersionId: puzzle.id,
      eventMode: cfg.eventMode,
      status: "ACTIVE",
      startTime: new Date(),
      allowedDurationSeconds: cfg.durationMinutes * 60,
      totalAvailableScore: totalAvailable,
      totalQuestionCount: layout.words.length,
      currentGridState: "{}"
    }
  });

  const token = crypto.createHmac("sha256", process.env.ADMIN_SESSION_SECRET || "fallback-secret").update(attempt.id).digest("base64url");
  const jar = await cookies();
  jar.set(ATTEMPT_COOKIE, `${attempt.id}.${token}`, { httpOnly: true, sameSite: "lax", path: "/", maxAge: cfg.durationMinutes * 60 + 60 });

  return NextResponse.json({ ok: true, attemptId: attempt.id });
}