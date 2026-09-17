"use client";

import { useEffect, useState } from "react";
import { Search, ChevronDown, MoreVertical, Trash2, Stethoscope } from "lucide-react";
import { fmt } from "@/lib/constants";
import { TextInput, SectionHeader, Badge, Skeleton, ConfirmDialog } from "@/components/ui";

export default function InvoicesPage() {
  const [patients, setPatients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const confirmDeleteInvoice = (inv) => {
    setConfirmDelete(inv);
    setMenuOpen(null);
  };

  const deleteInvoice = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/invoices/${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setInvoices((prev) => prev.filter((inv) => inv.id !== confirmDelete.id));
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

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
        <button onClick={load} className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep">Retry</button>
      </div>
    );
  }

  const fmtDateTime = (inv) => {
    const d = new Date(inv.createdAt || inv.date);
    if (!isNaN(d)) {
      return d.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return inv.date || "";
  };

  const withNames = invoices.map((inv) => {
    const patient = patients.find((p) => p.id === inv.patientId);
    return {
      ...inv,
      patientName: patient?.name || "Unknown",
      patientPhone: patient?.phone || "—",
    };
  });

  const filtered = withNames.filter((inv) => {
    const matchStatus = filter === "All" || inv.status === filter;
    const search = query.toLowerCase();
    const matchQuery =
      inv.patientName.toLowerCase().includes(search) ||
      inv.patientPhone.toLowerCase().includes(search) ||
      inv.id.toLowerCase().includes(search);
    return matchStatus && matchQuery;
  });

  return (
    <div>
      <SectionHeader title="Invoices" subtitle={`${invoices.length} total`} />

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-2.5 text-inkSoft" />
          <TextInput
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patient, phone or invoice #"
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

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={deleteInvoice}
        title="Delete Invoice"
        message={`Are you sure you want to delete invoice ${confirmDelete?.id || ""}? This action cannot be undone.`}
        loading={deleting}
      />

      <div className="flex flex-col gap-2">
        {filtered.slice().reverse().map((inv) => (
          <div
            key={inv.id}
            className="rounded-lg bg-white border border-border"
          >
            <button
              onClick={() => setOpenId(openId === inv.id ? null : inv.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <div>
                <div className="text-sm text-ink">{inv.patientName}</div>
                <div className="text-xs text-inkSoft">{inv.id} · {fmtDateTime(inv)}</div>
                <div className="text-xs text-inkSoft">{inv.patientPhone}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm tabular-nums text-ink">{fmt(inv.total)}</span>
                <Badge status={inv.status} />
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === inv.id ? null : inv.id)}
                    className="p-1 rounded hover:bg-surfaceAlt text-inkSoft"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === inv.id && (
                    <div className="absolute right-0 bottom-full mb-1 bg-white border border-border rounded-lg shadow-lg z-50 w-32 py-1">
                      <button
                        onClick={() => confirmDeleteInvoice(inv)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-roseLight"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
                <ChevronDown
                  size={16}
                  className="text-inkSoft transition-transform"
                  style={{ transform: openId === inv.id ? "rotate(180deg)" : "none" }}
                />
              </div>
            </button>

            {openId === inv.id && (
              <div className="px-4 pb-4 border-t border-border">
                <div className="max-w-md mx-auto mt-4 rounded-lg bg-white p-5" style={{ border: "1px dashed #CBD8CF" }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Stethoscope size={16} className="text-tealDeep" />
                    <span className="text-[15px] font-head text-ink">Riverside Family Clinic</span>
                  </div>
                  <p className="text-xs mb-3 text-inkSoft">Invoice {inv.id} · {fmtDateTime(inv)}</p>
                  <p className="text-sm mb-1 text-ink">
                    {inv.patientName} <span className="text-inkSoft">({inv.patientId})</span>
                  </p>
                  <p className="text-xs mb-3 text-inkSoft">{inv.patientPhone}</p>
                  <div className="text-sm divide-y divide-border border-t border-border">
                    {inv.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between py-1.5">
                        <span className="text-ink">{it.description}</span>
                        <span className="tabular-nums">{fmt(it.amount)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-border text-sm space-y-1">
                    {inv.discountAmt > 0 && (
                      <div className="flex justify-between text-xs text-inkSoft">
                        <span>Discount</span>
                        <span>-{fmt(inv.discountAmt)}</span>
                      </div>
                    )}
                    {inv.taxAmt > 0 && (
                      <div className="flex justify-between text-xs text-inkSoft">
                        <span>Tax</span>
                        <span>+{fmt(inv.taxAmt)}</span>
                      </div>
                    )}
                    {inv.insuranceAmt > 0 && (
                      <div className="flex justify-between text-xs text-inkSoft">
                        <span>Insurance</span>
                        <span>-{fmt(inv.insuranceAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-head text-ink">
                      <span>Total</span>
                      <span className="tabular-nums">{fmt(inv.total)}</span>
                    </div>
                    <div className="flex justify-between text-inkSoft">
                      <span>Paid ({inv.mode})</span>
                      <span className="tabular-nums">{fmt(inv.paid)}</span>
                    </div>
                    {inv.due > 0.005 && (
                      <div className="flex justify-between text-rose">
                        <span>Due</span>
                        <span className="tabular-nums">{fmt(inv.due)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-inkSoft">Status</span>
                      <Badge status={inv.status} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm py-6 text-center text-inkSoft">No invoices match.</p>
        )}
      </div>
    </div>
  );
}
