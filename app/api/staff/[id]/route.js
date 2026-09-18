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

export async function PUT(request, { params }) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const { id } = await params;
    const body = await request.json();

    const data = {};
    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.role === "Admin" || body.role === "Staff") data.role = body.role;
    if (body.password) data.passwordHash = await hashPassword(body.password);

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const staff = await prisma.staff.update({
      where: { id },
      data,
      ...PUBLIC_FIELDS,
    });
    return NextResponse.json(staff);
  } catch (e) {
    console.error("PUT /api/staff/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const err = requireAdmin(request);
  if (err) return err;
  try {
    const { id } = await params;
    await prisma.staff.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/staff/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}