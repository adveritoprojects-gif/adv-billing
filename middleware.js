import { NextResponse } from "next/server";

const SESSION_COOKIE = "session";

function base64urlToBytes(s) {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

async function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64urlToBytes(sig),
    enc.encode(payload)
  );
  if (!valid) return null;
  try {
    const claims = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    if (!claims.uid || (claims.exp || 0) < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

function readSessionCookie(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match ? match[1] : null;
}

export async function middleware(request) {
  const claims = await verifyToken(readSessionCookie(request), process.env.SESSION_SECRET);
  if (claims) return NextResponse.next();

  const loginUrl = new URL("/login", request.url);
  const returnTo = request.nextUrl.pathname + request.nextUrl.search;
  loginUrl.searchParams.set("from", returnTo);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|icon.png|login).*)"],
};