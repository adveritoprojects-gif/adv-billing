import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json(patients);
  } catch (e) {
    console.error("GET /api/patients error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.name || !String(body.name).trim()) {
      return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
    }

    const count = await prisma.patient.count();
    const id = `P-${1000 + count + 1}`;

    const patient = await prisma.patient.create({
      data: {
        id,
        name: String(body.name).trim(),
        age: Number(body.age) || 0,
        gender: body.gender || "Other",
        phone: body.phone || "",
        address: body.address || "",
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (e) {
    console.error("POST /api/patients error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
