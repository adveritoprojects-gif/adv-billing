"use client";

import { useEffect, useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { PAY_MODES, fmt } from "@/lib/constants";
import { StatCard, SectionHeader } from "@/components/ui";

export default function ReportsPage() {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([p, i]) => {
      setPatients(p);
      setInvoices(i);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="text-sm text-inkSoft">Loading…</p>;
  }

  const revenue = invoices.reduce((s, i) => s + i.paid, 0);

  const pending = invoices.reduce((s, i) => s + i.due, 0);

  const byMode = PAY_MODES.map((m) => ({
    mode: m,
    amount: invoices
      .filter((i) => i.mode === m)
      .reduce((s, i) => s + i.paid, 0),
  }));

  const maxByMode = Math.max(1, ...byMode.map((b) => b.amount));

  const overdue = invoices
    .filter((i) => i.due > 0.005)
    .map((i) => ({
      ...i,
      patientName:
        patients.find((p) => p.id === i.patientId)?.name || "Unknown",
    }));

  return (
    <div>
      <SectionHeader
        title="Reports"
        subtitle="Financial overview of clinic activity"
      />

      <div className="grid sm:grid-cols-2 gap-4 mb-4">
        <StatCard
          label="Total revenue collected"
          value={fmt(revenue)}
          icon={TrendingUp}
          tint="#E4F1E8"
        />

        <StatCard
          label="Total outstanding"
          value={fmt(pending)}
          icon={AlertCircle}
          tint="#F7E4E4"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="rounded-lg bg-white p-4 border border-border">
          <h3 className="text-[15px] font-medium mb-3 text-ink">
            Revenue by payment mode
          </h3>

          <div className="flex flex-col gap-2.5">
            {byMode.map((b) => (
              <div key={b.mode}>
                <div className="flex justify-between text-xs mb-1 text-inkSoft">
                  <span>{b.mode}</span>

                  <span className="tabular-nums">{fmt(b.amount)}</span>
                </div>

                <div className="h-2 rounded-full bg-surfaceAlt">
                  <div
                    className="h-2 rounded-full bg-teal"
                    style={{
                      width: `${(b.amount / maxByMode) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 border border-border">
          <h3 className="text-[15px] font-medium mb-3 text-ink">
            Outstanding balances
          </h3>

          <div className="divide-y divide-border">
            {overdue.map((inv) => (
              <div key={inv.id} className="flex justify-between py-2 text-sm">
                <div>
                  <div className="text-ink">{inv.patientName}</div>

                  <div className="text-xs text-inkSoft">{inv.id}</div>
                </div>

                <span className="text-rose tabular-nums">{fmt(inv.due)}</span>
              </div>
            ))}

            {overdue.length === 0 && (
              <p className="text-sm py-3 text-inkSoft">
                Nothing outstanding. All clear.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
