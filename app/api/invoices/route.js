import { NextResponse } from "next/server";
import { readDB, writeDB, uid } from "@/lib/db";

export async function GET() {
  const db = readDB();
  return NextResponse.json(db.invoices);
}

export async function POST(request) {
  const body = await request.json();

  if (!body.patientId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: "patientId and at least one line item are required" }, { status: 400 });
  }

  const db = readDB();
  const invoice = {
    id: uid("INV", db.invoices.map((i) => i.id)),
    patientId: body.patientId,
    date: body.date || new Date().toISOString().slice(0, 10),
    items: body.items,
    discountPct: Number(body.discountPct) || 0,
    taxPct: Number(body.taxPct) || 0,
    insurancePct: Number(body.insurancePct) || 0,
    subtotal: Number(body.subtotal) || 0,
    discountAmt: Number(body.discountAmt) || 0,
    taxAmt: Number(body.taxAmt) || 0,
    insuranceAmt: Number(body.insuranceAmt) || 0,
    total: Number(body.total) || 0,
    paid: Number(body.paid) || 0,
    due: Number(body.due) || 0,
    status: body.status || "Unpaid",
    mode: body.mode || "Cash",
  };

  db.invoices.push(invoice);
  writeDB(db);

  return NextResponse.json(invoice, { status: 201 });
}
