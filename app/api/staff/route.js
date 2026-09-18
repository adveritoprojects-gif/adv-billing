import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, hashPassword } from "@/lib/auth";

const PUBLIC_FIELDS = {
  select: {
    id: true,
    username: true,
    name: true,
    role: true,
    createdAt: true,
  },
};

export async function GET(request) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const staff = await prisma.staff.findMany({
      ...PUBLIC_FIELDS,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(staff);
  } catch (e) {
    console.error("GET /api/staff error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const body = await request.json();
    const username = String(body.username || "").trim().toLowerCase();
    const name = String(body.name || "").trim();
    const role = body.role === "Admin" ? "Admin" : "Staff";
    const password = String(body.password || "");

    if (!username || !name || !password) {
      return NextResponse.json(
        { error: "Username, name and password are required" },
        { status: 400 }
      );
    }

    const exists = await prisma.staff.findUnique({ where: { username } });
    if (exists) {
      return NextResponse.json(
        { error: "That username is already taken" },
        { status: 409 }
      );
    }

    const count = await prisma.staff.count();
    const staff = await prisma.staff.create({
      data: {
        id: `S-${1000 + count + 1}`,
        username,
        name,
        role,
        passwordHash: await hashPassword(password),
      },
      ...PUBLIC_FIELDS,
    });
    return NextResponse.json(staff, { status: 201 });
  } catch (e) {
    console.error("POST /api/staff error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}