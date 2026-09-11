import { NextResponse } from "next/server";
import { readDB, writeDB, uid } from "@/lib/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.patients);
}

export async function POST(request) {
  const body = await request.json();

  if (!body.name || !String(body.name).trim()) {
    return NextResponse.json({ error: "Patient name is required" }, { status: 400 });
  }

  const db = readDB();
  const patient = {
    id: uid("P", db.patients.map((p) => p.id)),
    name: String(body.name).trim(),
    age: Number(body.age) || 0,
    gender: body.gender || "Other",
    phone: body.phone || "",
    address: body.address || "",
  };

  db.patients.push(patient);
  writeDB(db);

  return NextResponse.json(patient, { status: 201 });
}
