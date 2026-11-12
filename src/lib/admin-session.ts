import { cookies } from "next/headers";
import crypto from "crypto";

const COOKIE = "mtn_admin";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("ADMIN_SESSION_SECRET not configured");
  return s;
}

export function signAdminSession(): string {
  const payload = JSON.stringify({ t: Date.now(), r: crypto.randomBytes(8).toString("hex") });
  const b64 = Buffer.from(payload).toString("base64url");
  const sig = crypto.createHmac("sha256", secret()).update(b64).digest("base64url");
  return `${b64}.${sig}`;
}

export function verifyAdminSession(token: string | undefined): boolean {
  if (!token) return false;
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return false;
  const expected = crypto.createHmac("sha256", secret()).update(b64).digest("base64url");
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const { t } = JSON.parse(Buffer.from(b64, "base64url").toString());
    if (Date.now() - t > MAX_AGE * 1000) return false;
    return true;
  } catch { return false; }
}

export async function setAdminCookie() {
  const jar = await cookies();
  jar.set(COOKIE, signAdminSession(), {
    httpOnly: true, sameSite: "lax", path: "/", maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production" && process.env.FORCE_HTTPS === "1"
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  return verifyAdminSession(jar.get(COOKIE)?.value);
}

export async function requireAdmin(): Promise<Response | null> {
  if (await isAdmin()) return null;
  return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "content-type": "application/json" } });
}