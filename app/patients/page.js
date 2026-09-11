"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search } from "lucide-react";
import { Field, TextInput, Select, SectionHeader } from "@/components/ui";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: "", age: "", gender: "Female", phone: "", address: "" });

  const load = () => {
    Promise.all([
      fetch("/api/patients").then((r) => r.json()),
      fetch("/api/xrays").then((r) => r.json()),
    ]).then(([p, x]) => {
      setPatients(p);
      setXrays(x);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const filtered = patients.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.id.toLowerCase().includes(query.toLowerCase())
  );

  const addPatient = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    if (res.ok) {
      const created = await res.json();
      setPatients((prev) => [...prev, created]);
      setDraft({ name: "", age: "", gender: "Female", phone: "", address: "" });
      setShowForm(false);
    }
    setSaving(false);
  };

  if (loading) return <p className="text-sm text-inkSoft">Loading…</p>;

  return (
    <div>
      <SectionHeader
        title="Patients"
        subtitle={`${patients.length} registered`}
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white bg-teal"
          >
            {showForm ? <X size={15} /> : <Plus size={15} />} {showForm ? "Cancel" : "Register patient"}
          </button>
        }
      />

      {showForm && (
        <div className="rounded-lg bg-white p-4 mb-4 grid sm:grid-cols-2 gap-3 border border-border">
          <Field label="Full name" span>
            <TextInput value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Priya Nair" />
          </Field>
          <Field label="Age">
            <TextInput type="number" value={draft.age} onChange={(e) => setDraft({ ...draft, age: e.target.value })} placeholder="0" />
          </Field>
          <Field label="Gender">
            <Select value={draft.gender} onChange={(e) => setDraft({ ...draft, gender: e.target.value })}>
              <option>Female</option><option>Male</option><option>Other</option>
            </Select>
          </Field>
          <Field label="Phone">
            <TextInput value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="98765 43210" />
          </Field>
          <Field label="Address">
            <TextInput value={draft.address} onChange={(e) => setDraft({ ...draft, address: e.target.value })} placeholder="Street, area" />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button onClick={addPatient} disabled={saving} className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep disabled:opacity-50">
              {saving ? "Saving…" : "Save patient"}
            </button>
          </div>
        </div>
      )}

      <div className="relative mb-3 max-w-xs">
        <Search size={15} className="absolute left-2.5 top-2.5 text-inkSoft" />
        <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients" className="pl-8 w-full" />
      </div>

      <div className="rounded-lg bg-white overflow-hidden border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surfaceAlt text-inkSoft">
              <th className="text-left font-medium px-4 py-2">Patient</th>
              <th className="text-left font-medium px-4 py-2 hidden sm:table-cell">Age / Gender</th>
              <th className="text-left font-medium px-4 py-2 hidden md:table-cell">Phone</th>
              <th className="text-left font-medium px-4 py-2">X-rays</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5">
                  <div className="text-ink">{p.name}</div>
                  <div className="text-xs text-inkSoft">{p.id}</div>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-inkSoft">{p.age} · {p.gender}</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-inkSoft">{p.phone}</td>
                <td className="px-4 py-2.5 text-inkSoft">{xrays.filter((x) => x.patientId === p.id).length}</td>
                <td className="px-4 py-2.5 text-right">
                  <button onClick={() => router.push(`/billing?patientId=${p.id}`)} className="text-xs font-medium text-teal">
                    Bill
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-inkSoft">No patients match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
