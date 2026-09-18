"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, Search, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Field, TextInput, Select, SectionHeader, Skeleton, Modal, ConfirmDialog } from "@/components/ui";

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [xrays, setXrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: "", age: "", gender: "Female", phone: "", address: "" });
  const [menuOpen, setMenuOpen] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editDraft, setEditDraft] = useState({ name: "", age: "", gender: "Female", phone: "", address: "" });

  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
      })
      .catch(() => {
        setError("Failed to load data.");
        setLoading(false);
      });
  };

  useEffect(load, []);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.phone || "").toLowerCase().includes(query.toLowerCase()) ||
      p.id.toLowerCase().includes(query.toLowerCase())
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

  const startEdit = (p) => {
    setEditId(p.id);
    setEditDraft({ name: p.name, age: String(p.age), gender: p.gender, phone: p.phone, address: p.address });
    setMenuOpen(null);
    setShowForm(false);
  };

  const saveEdit = async () => {
    if (!editDraft.name.trim()) return;
    setSaving(true);
    const res = await fetch(`/api/patients/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editDraft),
    });
    if (res.ok) {
      const updated = await res.json();
      setPatients((prev) => prev.map((p) => (p.id === editId ? updated : p)));
      setEditId(null);
    }
    setSaving(false);
  };

  const confirmDeletePatient = (p) => {
    setConfirmDelete(p);
    setMenuOpen(null);
  };

  const deletePatient = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    const res = await fetch(`/api/patients/${confirmDelete.id}`, { method: "DELETE" });
    if (res.ok) {
      setPatients((prev) => prev.filter((p) => p.id !== confirmDelete.id));
    }
    setDeleting(false);
    setConfirmDelete(null);
  };

  if (loading) {
    return (
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <Skeleton className="h-7 w-28 mb-1" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
        <Skeleton className="h-9 w-72 mb-3" />
      <div className="rounded-lg bg-white border border-border">
          <div className="bg-surfaceAlt px-4 py-2 flex gap-16">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20 hidden sm:block" />
            <Skeleton className="h-4 w-20 hidden md:block" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-10" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center px-4 py-3 border-t border-border">
              <div className="flex-1">
                <Skeleton className="h-4 w-28 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-14 hidden sm:block" />
              <Skeleton className="h-4 w-20 hidden md:block" />
              <Skeleton className="h-4 w-6" />
              <Skeleton className="h-4 w-10" />
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

      <Modal open={!!editId} onClose={() => setEditId(null)} title="Edit Patient">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name" span>
            <TextInput value={editDraft.name} onChange={(e) => setEditDraft({ ...editDraft, name: e.target.value })} />
          </Field>
          <Field label="Age">
            <TextInput type="number" value={editDraft.age} onChange={(e) => setEditDraft({ ...editDraft, age: e.target.value })} />
          </Field>
          <Field label="Gender">
            <Select value={editDraft.gender} onChange={(e) => setEditDraft({ ...editDraft, gender: e.target.value })}>
              <option>Female</option><option>Male</option><option>Other</option>
            </Select>
          </Field>
          <Field label="Phone">
            <TextInput value={editDraft.phone} onChange={(e) => setEditDraft({ ...editDraft, phone: e.target.value })} />
          </Field>
          <Field label="Address">
            <TextInput value={editDraft.address} onChange={(e) => setEditDraft({ ...editDraft, address: e.target.value })} />
          </Field>
          <div className="sm:col-span-2 flex justify-end gap-2 mt-2">
            <button onClick={() => setEditId(null)} className="rounded-md px-4 py-2 text-sm text-inkSoft bg-surfaceAlt">Cancel</button>
            <button onClick={saveEdit} disabled={saving} className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep disabled:opacity-50">
              {saving ? "Saving…" : "Update"}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={deletePatient}
        title="Delete Patient"
        message={`Are you sure you want to delete ${confirmDelete?.name || ""}? This action cannot be undone.`}
        loading={deleting}
      />

      <div className="relative mb-3 max-w-xs">
        <Search size={15} className="absolute left-2.5 top-2.5 text-inkSoft" />
        <TextInput value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, phone or ID" className="pl-8 w-full" />
      </div>

      <div className="rounded-lg bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surfaceAlt text-inkSoft">
              <th className="text-left font-medium px-4 py-2">Patient</th>
              <th className="text-left font-medium px-4 py-2 hidden sm:table-cell">Age / Gender</th>
              <th className="text-left font-medium px-4 py-2 hidden md:table-cell">Phone</th>
              <th className="text-left font-medium px-4 py-2">X-rays</th>
              <th className="text-left font-medium px-4 py-2">Bill</th>
              <th className="px-4 py-2 w-10"></th>
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
                <td className="px-4 py-2.5">
                  <button onClick={() => router.push(`/billing?patientId=${p.id}`)} className="text-xs font-medium text-teal">
                    Bill
                  </button>
                </td>
                <td className="px-4 py-2.5 relative">
                  <button
                    onClick={() => setMenuOpen(menuOpen === p.id ? null : p.id)}
                    className="p-1 rounded hover:bg-surfaceAlt text-inkSoft"
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === p.id && (
                    <div className="absolute right-0 bottom-full mb-1 bg-white border border-border rounded-lg shadow-lg z-50 w-32 py-1">
                      <button
                        onClick={() => startEdit(p)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ink hover:bg-surfaceAlt"
                      >
                        <Pencil size={14} /> Edit
                      </button>
                      <button
                        onClick={() => confirmDeletePatient(p)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose hover:bg-roseLight"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-inkSoft">No patients match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
