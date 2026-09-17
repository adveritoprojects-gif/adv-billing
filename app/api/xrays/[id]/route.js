import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const record = await prisma.xRay.update({
      where: { id },
      data: {
        patientId: body.patientId,
        type: body.type || "Other",
        part: body.part || "Other",
        view: body.view || "AP",
        date: body.date || new Date().toISOString().slice(0, 10),
        radiologist: body.radiologist || "",
        cost: Number(body.cost) || 0,
      },
    });

    return NextResponse.json(record);
  } catch (e) {
    console.error("PUT /api/xrays/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.xRay.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/xrays/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
