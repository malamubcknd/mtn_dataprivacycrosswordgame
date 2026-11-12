import { clearAdminCookie } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ ok: true });
}