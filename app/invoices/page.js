"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import { fmt } from "@/lib/constants";
import { TextInput, SectionHeader, Badge, Skeleton } from "@/components/ui";

export default function InvoicesPage() {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);

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
            <Skeleton className="h-4 w-16" />
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-8 w-12 rounded-full" />
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-18 rounded-full" />
          <Skeleton className="h-8 w-18 rounded-full" />
        </div>

        <div className="flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white overflow-hidden border border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-4 w-28 mb-1.5" />
                  <Skeleton className="h-3 w-36" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-14" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-4 w-4" />
                </div>
              </div>
            </div>
          ))}
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

  const withNames = invoices.map((inv) => ({
    ...inv,
    patientName:
      patients.find((p) => p.id === inv.patientId)?.name || "Unknown",
  }));

  const filtered = withNames.filter((inv) => {
    const matchStatus = filter === "All" || inv.status === filter;

    const search = query.toLowerCase();

    const matchQuery =
      inv.patientName.toLowerCase().includes(search) ||
      inv.id.toLowerCase().includes(search);

    return matchStatus && matchQuery;
  });

  return (
    <div>
      <SectionHeader title="Invoices" subtitle={`${invoices.length} total`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search
            size={15}
            className="absolute left-2.5 top-2.5 text-inkSoft"
          />

          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient or invoice #"
            className="pl-8 w-56"
          />
        </div>

        <div className="flex gap-1">
          {["All", "Paid", "Partial", "Unpaid"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                filter === s
                  ? "bg-tealDeep text-white"
                  : "bg-surfaceAlt text-inkSoft"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {filtered
          .slice()
          .reverse()
          .map((inv) => (
            <div
              key={inv.id}
              className="rounded-lg bg-white overflow-hidden border border-border"
            >
              <button
                onClick={() => setOpenId(openId === inv.id ? null : inv.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div>
                  <div className="text-sm text-ink">{inv.patientName}</div>

                  <div className="text-xs text-inkSoft">
                    {inv.id} · {inv.date}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm tabular-nums text-ink">
                    {fmt(inv.total)}
                  </span>

                  <Badge status={inv.status} />

                  <ChevronDown
                    size={16}
                    className="text-inkSoft transition-transform"
                    style={{
                      transform: openId === inv.id ? "rotate(180deg)" : "none",
                    }}
                  />
                </div>
              </button>

              {openId === inv.id && (
                <div className="px-4 pb-4 text-sm border-t border-border">
                  <div className="divide-y divide-border mt-2">
                    {inv.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between py-1.5">
                        <span className="text-ink">{it.description}</span>

                        <span className="tabular-nums">{fmt(it.amount)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-1 space-y-1 text-xs text-inkSoft">
                    {inv.discountAmt > 0 && (
                      <div className="flex justify-between">
                        <span>Discount</span>
                        <span>−{fmt(inv.discountAmt)}</span>
                      </div>
                    )}

                    {inv.taxAmt > 0 && (
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>+{fmt(inv.taxAmt)}</span>
                      </div>
                    )}

                    {inv.insuranceAmt > 0 && (
                      <div className="flex justify-between">
                        <span>Insurance</span>
                        <span>−{fmt(inv.insuranceAmt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-2 mt-1 border-t border-border text-sm text-ink">
                    <span>Paid via {inv.mode}</span>

                    <span className="tabular-nums">{fmt(inv.paid)}</span>
                  </div>

                  {inv.due > 0.005 && (
                    <div className="flex justify-between text-sm text-rose">
                      <span>Due</span>

                      <span className="tabular-nums">{fmt(inv.due)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

        {filtered.length === 0 && (
          <p className="text-sm py-6 text-center text-inkSoft">
            No invoices match.
          </p>
        )}
      </div>
    </div>
  );
}
