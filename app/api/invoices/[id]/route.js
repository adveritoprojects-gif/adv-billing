import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function DELETE(request, { params }) {
  const auth = requireStaff(request);
  if (auth) return auth;
  try {
    const { id } = await params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/invoices/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
