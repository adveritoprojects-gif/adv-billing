import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, sessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.findUnique({ where: { username } });
    if (!staff || !(await verifyPassword(password, staff.passwordHash))) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const token = createSessionToken(staff);
    const res = NextResponse.json({
      id: staff.id,
      name: staff.name,
      username: staff.username,
      role: staff.role,
    });
    res.headers.set("Set-Cookie", sessionCookie(token));
    return res;
  } catch (e) {
    console.error("POST /api/login error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}