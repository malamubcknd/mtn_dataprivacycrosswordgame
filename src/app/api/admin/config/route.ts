import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const u = await requireAdmin(); if (u) return u;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (typeof body.gameStatus === "string" && ["OPEN","PAUSED","CLOSED"].includes(body.gameStatus)) data.gameStatus = body.gameStatus;
  if (typeof body.eventMode === "string" && ["TEST","LIVE"].includes(body.eventMode)) data.eventMode = body.eventMode;
  if (typeof body.durationMinutes === "number" && body.durationMinutes > 0 && body.durationMinutes <= 60) data.durationMinutes = body.durationMinutes;
  if (typeof body.repeatAttemptsAllowed === "boolean") data.repeatAttemptsAllowed = body.repeatAttemptsAllowed;
  if (typeof body.gameTitle === "string") data.gameTitle = body.gameTitle;
  if (typeof body.welcomeMessage === "string") data.welcomeMessage = body.welcomeMessage;
  const cfg = await prisma.gameConfiguration.update({ where: { id: "singleton" }, data });
  return NextResponse.json(cfg);
}