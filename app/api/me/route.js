import { NextResponse } from "next/server";
import { verifySessionToken, getSessionFromHeaders } from "@/lib/auth";

export async function GET(request) {
  const claims = verifySessionToken(getSessionFromHeaders(request.headers));
  if (!claims) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }
  return NextResponse.json({
    id: claims.uid,
    name: claims.name,
    username: claims.username,
    role: claims.role,
  });
}