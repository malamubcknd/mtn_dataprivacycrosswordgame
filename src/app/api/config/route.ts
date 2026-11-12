import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const cfg = await prisma.gameConfiguration.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });
  return NextResponse.json({
    gameTitle: cfg.gameTitle,
    welcomeMessage: cfg.welcomeMessage,
    gameStatus: cfg.gameStatus,
    eventMode: cfg.eventMode
  });
}