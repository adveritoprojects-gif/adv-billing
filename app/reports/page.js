"use client";

import { useEffect, useState } from "react";
import { TrendingUp, AlertCircle } from "lucide-react";
import { PAY_MODES, fmt } from "@/lib/constants";
import { StatCard, SectionHeader, Skeleton } from "@/components/ui";

export default function ReportsPage() {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/patients").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/invoices").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, i]) => {
        setPatients(Array.isArray(p) ? p : []);
        setInvoices(Array.isArray(i) ? i : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data.");
        setLoading(false);
      });
  };

  useEffect(load, []);

  if (loading) {
    return (
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-white p-4 flex items-start justify-between border border-border">
            <div className="flex-1">
              <Skeleton className="h-3.5 w-36 mb-2" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
          <div className="rounded-lg bg-white p-4 flex items-start justify-between border border-border">
            <div className="flex-1">
              <Skeleton className="h-3.5 w-32 mb-2" />
              <Skeleton className="h-7 w-20" />
            </div>
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="rounded-lg bg-white p-4 border border-border">
            <Skeleton className="h-5 w-44 mb-3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mb-2.5">
                <div className="flex justify-between mb-1">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            ))}
          </div>
          <div className="rounded-lg bg-white p-4 border border-border">
            <Skeleton className="h-5 w-40 mb-3" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between py-2 border-t border-border">
                <div>
                  <Skeleton className="h-4 w-28 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-14" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-white p-8 text-center border border-border">
        <p className="text-sm text-rose mb-3">{error}</p>
        <button onClick={load} className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep">
          Retry
        </button>
      </div>
    );
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
