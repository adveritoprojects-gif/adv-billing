import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const patientId = request.nextUrl.searchParams.get("patientId");
    const xrays = await prisma.xRay.findMany({
      where: patientId ? { patientId } : {},
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(xrays);
  } catch (e) {
    console.error("GET /api/xrays error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.patientId) {
      return NextResponse.json({ error: "patientId is required" }, { status: 400 });
    }

    const count = await prisma.xRay.count();
    const id = `X-${1000 + count + 1}`;

    const record = await prisma.xRay.create({
      data: {
        id,
        patientId: body.patientId,
        type: body.type || "Other",
        part: body.part || "Other",
        view: body.view || "AP",
        date: body.date || new Date().toISOString().slice(0, 10),
        radiologist: body.radiologist || "",
        cost: Number(body.cost) || 0,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (e) {
    console.error("POST /api/xrays error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
