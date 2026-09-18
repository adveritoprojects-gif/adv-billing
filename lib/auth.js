import crypto from "crypto";
import util from "util";
import { NextResponse } from "next/server";

const scrypt = util.promisify(crypto.scrypt);

export const SESSION_COOKIE = "session";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add SESSION_SECRET to your .env file."
    );
  }
  return secret;
}

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = await scrypt(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const derived = await scrypt(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  const actual = Buffer.from(derived);
  return (
    actual.length === expected.length && crypto.timingSafeEqual(actual, expected)
  );
}

export function createSessionToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      uid: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      exp: Date.now() + SESSION_TTL_MS,
    })
  ).toString("base64url");
  const sig = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expectedSig = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (!claims.uid || (claims.exp || 0) < Date.now()) return null;
  return claims;
}

export function getSessionFromHeaders(headers) {
  const cookieHeader = headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function sessionCookie(value) {
  const secure = process.env.NODE_ENV === "production";
  const params = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    value ? `Max-Age=${SESSION_TTL_MS / 1000}` : "Max-Age=0",
  ];
  if (secure) params.push("Secure");
  return params.join("; ");
}

// For API route handlers. Returns a 401 NextResponse when unauthenticated, null when authed.
export function requireStaff(request) {
  const claims = verifySessionToken(getSessionFromHeaders(request.headers));
  if (!claims) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return null;
}

// For API route handlers that need admin privileges. Returns a 401/403 response, null when allowed.
export function requireAdmin(request) {
  const claims = verifySessionToken(getSessionFromHeaders(request.headers));
  if (!claims) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  if (claims.role !== "Admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  return null;
}