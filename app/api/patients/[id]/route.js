import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name: String(body.name).trim(),
        age: Number(body.age) || 0,
        gender: body.gender || "Other",
        phone: body.phone || "",
        address: body.address || "",
      },
    });

    return NextResponse.json(patient);
  } catch (e) {
    console.error("PUT /api/patients/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/patients/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
