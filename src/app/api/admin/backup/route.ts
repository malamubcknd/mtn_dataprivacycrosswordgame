import { requireAdmin } from "@/lib/admin-session";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  const u = await requireAdmin(); if (u) return u;
  // DATABASE_URL example "file:./dev.db" (relative to prisma folder)
  const url = process.env.DATABASE_URL || "file:./dev.db";
  const match = url.match(/^file:(.+)$/);
  if (!match) return NextResponse.json({ error: "Non-file database" }, { status: 400 });
  let dbPath = match[1];
  if (!path.isAbsolute(dbPath)) dbPath = path.join(process.cwd(), "prisma", dbPath.replace(/^\.\//, ""));
  if (!fs.existsSync(dbPath)) return NextResponse.json({ error: "Database file not found: " + dbPath }, { status: 404 });
  const data = fs.readFileSync(dbPath);
  return new NextResponse(data, {
    headers: {
      "content-type": "application/octet-stream",
      "content-disposition": `attachment; filename="mtn-crossword-${Date.now()}.db"`
    }
  });
}