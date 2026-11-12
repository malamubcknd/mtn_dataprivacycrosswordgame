import { setAdminCookie } from "@/lib/admin-session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { pin } = await req.json().catch(() => ({}));
  const expected = process.env.ADMIN_PIN;
  if (!expected) return NextResponse.json({ error: "Admin PIN not configured" }, { status: 500 });
  if (!pin || pin !== expected) return NextResponse.json({ error: "Invalid PIN" }, { status: 401 });
  await setAdminCookie();
  return NextResponse.json({ ok: true });
}