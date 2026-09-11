"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, Activity, TrendingUp, Clock, Plus, Receipt, BarChart3 } from "lucide-react";
import { fmt, today } from "@/lib/constants";
import { useMode } from "@/components/ModeContext";
import { StatCard, SectionHeader, Badge } from "@/components/ui";

export default function DashboardPage() {
  const { isAdvanced } = useMode();
  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/xrays").then((r) => r.json()),
      fetch("/api/invoices").then((r) => r.json()),
    ]).then(([p, x, i]) => {
      setPatients(p);
      setXrays(x);
      setInvoices(i);
      setLoading(false);
    });
  }, []);

  if (loading) return <p className="text-sm text-inkSoft">Loading…</p>;

  const revenue = invoices.reduce((s, i) => s + i.paid, 0);
  const pending = invoices.reduce((s, i) => s + i.due, 0);

  return (
    <div>
      <SectionHeader title="Clinic overview" subtitle={`As of ${today()}`} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard label="Registered patients" value={patients.length} icon={Users} />
        <StatCard label="X-rays on file" value={xrays.length} icon={Activity} tint="#E4ECE6" />
        <StatCard label="Revenue collected" value={fmt(revenue)} icon={TrendingUp} tint="#E4F1E8" />
        <StatCard label="Pending dues" value={fmt(pending)} icon={Clock} tint="#FBEBD9" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg bg-white p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-medium text-ink">Recent invoices</h3>
            <Link href="/invoices" className="text-sm text-teal">View all</Link>
          </div>
          <div className="divide-y divide-border">
            {invoices.slice(-5).reverse().map((inv) => {
              const p = patients.find((p) => p.id === inv.patientId);
              return (
                <div key={inv.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="text-ink">{p ? p.name : "Unknown patient"}</div>
                    <div className="text-xs text-inkSoft">{inv.id} · {inv.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums text-ink">{fmt(inv.total)}</span>
                    <Badge status={inv.status} />
                  </div>
                </div>
              );
            })}
            {invoices.length === 0 && <p className="text-sm py-4 text-inkSoft">No invoices yet.</p>}
          </div>
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-2 bg-tealDeep">
          <h3 className="text-[15px] font-medium text-white mb-1">Quick actions</h3>
          <Link href="/patients" className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2">
            <Plus size={15} /> Register a patient
          </Link>
          <Link href="/xrays" className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2">
            <Activity size={15} /> Log an x-ray
          </Link>
          <Link href="/billing" className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2">
            <Receipt size={15} /> Create a bill
          </Link>
          {isAdvanced && (
            <Link href="/reports" className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2">
              <BarChart3 size={15} /> View reports
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
