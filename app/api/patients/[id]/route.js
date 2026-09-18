import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export async function PUT(request, { params }) {
  const auth = requireStaff(request);
  if (auth) return auth;
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
  const auth = requireStaff(request);
  if (auth) return auth;
  try {
    const { id } = await params;

    const linked = await prisma.$transaction(async (tx) => {
      const x = await tx.xRay.count({ where: { patientId: id } });
      const i = await tx.invoice.count({ where: { patientId: id } });
      return { xrays: x, invoices: i };
    });

    if (linked.xrays > 0 || linked.invoices > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete ${id}: still has ${linked.xrays} x-ray record(s) and ${linked.invoices} invoice(s). Delete those first.`,
        },
        { status: 409 }
      );
    }

    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/patients/[id] error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
