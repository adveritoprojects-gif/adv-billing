import { NextResponse } from "next/server";
import { readDB, writeDB, uid } from "@/lib/db";

export async function GET(request) {
  const db = readDB();
  const patientId = request.nextUrl.searchParams.get("patientId");
  const xrays = patientId ? db.xrays.filter((x) => x.patientId === patientId) : db.xrays;
  return NextResponse.json(xrays);
}

export async function POST(request) {
  const body = await request.json();

  if (!body.patientId) {
    return NextResponse.json({ error: "patientId is required" }, { status: 400 });
  }

  const db = readDB();
  const record = {
    id: uid("X", db.xrays.map((x) => x.id)),
    patientId: body.patientId,
    type: body.type || "Other",
    part: body.part || "Other",
    view: body.view || "AP",
    date: body.date || new Date().toISOString().slice(0, 10),
    radiologist: body.radiologist || "",
    cost: Number(body.cost) || 0,
  };

  db.xrays.push(record);
  writeDB(db);

  return NextResponse.json(record, { status: 201 });
}
