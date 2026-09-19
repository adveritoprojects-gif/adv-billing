"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Activity,
  TrendingUp,
  Clock,
  Plus,
  Receipt,
  BarChart3,
} from "lucide-react";
import { fmt, today } from "@/lib/constants";
import { StatCard, SectionHeader, Badge, Skeleton } from "@/components/ui";

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/patients").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/xrays").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/invoices").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([me, p, x, i]) => {
        if (!me || me.role !== "Admin") {
          router.replace("/billing");
          return;
        }
        setPatients(Array.isArray(p) ? p : []);
        setXrays(Array.isArray(x) ? x : []);
        setInvoices(Array.isArray(i) ? i : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load data. Check your connection and try again.");
        setLoading(false);
      });
  };

  useEffect(load, [router]);

  if (loading) {
    return (
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Skeleton className="h-7 w-44 mb-1" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg bg-white p-4 flex items-start justify-between border border-border">
              <div className="flex-1">
                <Skeleton className="h-3.5 w-24 mb-2" />
                <Skeleton className="h-7 w-16" />
              </div>
              <Skeleton className="h-9 w-9 rounded-md" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-lg bg-white p-4 border border-border">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-14" />
            </div>
            <div className="divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2.5">
                  <div>
                    <Skeleton className="h-4 w-28 mb-1.5" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg p-4 bg-tealDeep">
            <Skeleton className="h-5 w-28 mb-3 bg-white/20" />
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-full mb-2 bg-white/10" />
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

  return (
    <div>
      <SectionHeader title="Clinic overview" subtitle={`As of ${today()}`} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard
          label="Registered patients"
          value={patients.length}
          icon={Users}
        />

        <StatCard
          label="X-rays on file"
          value={xrays.length}
          icon={Activity}
          tint="#E4ECE6"
        />

        <StatCard
          label="Revenue collected"
          value={fmt(revenue)}
          icon={TrendingUp}
          tint="#E4F1E8"
        />

        <StatCard
          label="Pending dues"
          value={fmt(pending)}
          icon={Clock}
          tint="#FBEBD9"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-lg bg-white p-4 border border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-medium text-ink">
              Recent invoices
            </h3>

            <Link href="/invoices" className="text-sm text-teal">
              View all
            </Link>
          </div>

          <div className="divide-y divide-border">
            {invoices
              .slice(-5)
              .reverse()
              .map((inv) => {
                const p = patients.find((p) => p.id === inv.patientId);

                return (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between py-2.5 text-sm"
                  >
                    <div>
                      <div className="text-ink">
                        {p ? p.name : "Unknown patient"}
                      </div>

                      <div className="text-xs text-inkSoft">
                        {inv.id} · {inv.date}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="tabular-nums text-ink">
                        {fmt(inv.total)}
                      </span>

                      <Badge status={inv.status} />
                    </div>
                  </div>
                );
              })}

            {invoices.length === 0 && (
              <p className="text-sm py-4 text-inkSoft">No invoices yet.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg p-4 flex flex-col gap-2 bg-tealDeep">
          <h3 className="text-[15px] font-medium text-white mb-1">
            Quick actions
          </h3>

          <Link
            href="/patients"
            className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2"
          >
            <Plus size={15} />
            Register a patient
          </Link>

          <Link
            href="/xrays"
            className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2"
          >
            <Activity size={15} />
            Log an x-ray
          </Link>

          <Link
            href="/billing"
            className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2"
          >
            <Receipt size={15} />
            Create a bill
          </Link>

          <Link
            href="/reports"
            className="text-sm text-white/90 rounded-md px-3 py-2 hover:bg-white/10 flex items-center gap-2"
          >
            <BarChart3 size={15} />
            View reports
          </Link>
        </div>
      </div>
    </div>
  );
}
