"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { XRAY_TYPES, VIEWS, fmt, today } from "@/lib/constants";
import { Field, TextInput, Select, SectionHeader, Skeleton } from "@/components/ui";

export default function XraysPage() {
  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const blankDraft = () => ({
    patientId: "",
    type: XRAY_TYPES[0].type,
    view: "PA",
    date: today(),
    radiologist: "",
    cost: XRAY_TYPES[0].cost,
  });
  const [draft, setDraft] = useState(blankDraft());

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetch("/api/patients").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/xrays").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([p, x]) => {
        setPatients(Array.isArray(p) ? p : []);
        setXrays(Array.isArray(x) ? x : []);
        setLoading(false);
        setDraft((d) => (d.patientId ? d : { ...d, patientId: p[0]?.id || "" }));
      })
      .catch(() => {
        setError("Failed to load data.");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const onTypeChange = (type) => {
    const preset = XRAY_TYPES.find((t) => t.type === type);
    setDraft({ ...draft, type, cost: preset ? preset.cost : draft.cost });
  };

  const addXray = async () => {
    if (!draft.patientId) return;
    const preset = XRAY_TYPES.find((t) => t.type === draft.type);
    setSaving(true);
    const res = await fetch("/api/xrays", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...draft, part: preset ? preset.part : "Other", cost: Number(draft.cost) || 0 }),
    });
    if (res.ok) {
      const created = await res.json();
      setXrays((prev) => [...prev, created]);
      setDraft(blankDraft());
      setShowForm(false);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Skeleton className="h-7 w-36 mb-1" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>

        <div className="rounded-lg bg-white overflow-hidden border border-border">
          <div className="bg-surfaceAlt px-4 py-2 flex gap-16">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-14" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 border-t border-border">
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20 hidden sm:block" />
              <Skeleton className="h-4 w-28 hidden md:block" />
              <Skeleton className="h-4 w-12" />
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

  return (
    <div>
      <SectionHeader
        title="X-ray records"
        subtitle={`${xrays.length} on file`}
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white bg-teal"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Cancel" : "Log x-ray"}
          </button>
        }
      />

      {showForm && (
        <div className="rounded-lg bg-white p-4 mb-4 grid sm:grid-cols-2 gap-3 border border-border">
          <Field label="Patient" span>
            <Select value={draft.patientId} onChange={(e) => setDraft({ ...draft, patientId: e.target.value })}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.id}</option>)}
            </Select>
          </Field>
          <Field label="Study type">
            <Select value={draft.type} onChange={(e) => onTypeChange(e.target.value)}>
              {XRAY_TYPES.map((t) => <option key={t.type} value={t.type}>{t.type}</option>)}
            </Select>
          </Field>
          <Field label="View">
            <Select value={draft.view} onChange={(e) => setDraft({ ...draft, view: e.target.value })}>
              {VIEWS.map((v) => <option key={v}>{v}</option>)}
            </Select>
          </Field>
          <Field label="Date">
            <TextInput type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </Field>
          <Field label="Radiologist">
            <TextInput value={draft.radiologist} onChange={(e) => setDraft({ ...draft, radiologist: e.target.value })} placeholder="Dr. …" />
          </Field>
          <Field label="Cost">
            <TextInput type="number" value={draft.cost} onChange={(e) => setDraft({ ...draft, cost: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button onClick={addXray} disabled={saving} className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep disabled:opacity-50">
              {saving ? "Saving…" : "Save record"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white overflow-hidden border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surfaceAlt text-inkSoft">
              <th className="text-left font-medium px-4 py-2">Study</th>
              <th className="text-left font-medium px-4 py-2">Patient</th>
              <th className="text-left font-medium px-4 py-2 hidden sm:table-cell">Date</th>
              <th className="text-left font-medium px-4 py-2 hidden md:table-cell">Radiologist</th>
              <th className="text-right font-medium px-4 py-2">Cost</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {xrays.slice().reverse().map((x) => {
              const p = patients.find((p) => p.id === x.patientId);
              return (
                <tr key={x.id}>
                  <td className="px-4 py-2.5">
                    <div className="text-ink">{x.type}</div>
                    <div className="text-xs text-inkSoft">{x.part} · {x.view} · {x.id}</div>
                  </td>
                  <td className="px-4 py-2.5 text-inkSoft">{p ? p.name : "—"}</td>
                  <td className="px-4 py-2.5 hidden sm:table-cell text-inkSoft">{x.date}</td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-inkSoft">{x.radiologist || "—"}</td>
                  <td className="px-4 py-2.5 text-right text-ink tabular-nums">{fmt(x.cost)}</td>
                </tr>
              );
            })}
            {xrays.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-inkSoft">No x-ray records yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
