import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(patients);
}

export async function POST(request) {
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
}
