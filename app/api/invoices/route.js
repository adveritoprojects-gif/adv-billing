import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (e) {
    console.error("GET /api/invoices error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.patientId || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: "patientId and at least one line item are required" }, { status: 400 });
    }

    const count = await prisma.invoice.count();
    const id = `INV-${1000 + count + 1}`;

    const invoice = await prisma.invoice.create({
      data: {
        id,
        patientId: body.patientId,
        date: body.date || new Date().toISOString().slice(0, 10),
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
        items: {
          create: body.items.map((it) => ({
            description: it.desc,
            amount: Number(it.amount) || 0,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (e) {
    console.error("POST /api/invoices error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
