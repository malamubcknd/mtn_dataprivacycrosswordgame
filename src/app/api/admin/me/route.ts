import { isAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ authed: await isAdmin() }); }