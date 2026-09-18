"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, KeyRound, ShieldCheck } from "lucide-react";
import { Field, TextInput, Select, SectionHeader, Skeleton, ConfirmDialog } from "@/components/ui";

export default function StaffPage() {
  const router = useRouter();
  const [me, setMe] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [draft, setDraft] = useState({ username: "", name: "", role: "Staff", password: "" });

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/me").then((r) => (r.ok ? r.json() : null)),
      fetch("/api/staff").then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([m, s]) => {
        if (!m || m.role !== "Admin") {
          router.replace("/");
          return;
        }
        setMe(m);
        setStaff(Array.isArray(s) ? s : []);
      })
      .catch(() => setError("Failed to load staff."))
      .finally(() => setLoading(false));
  };

  useEffect(load, [router]);

  const addStaff = async () => {
    if (!draft.username.trim() || !draft.password) return;
    setSaving(true);
    const res = await fetch("/api/staff", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const payload = await res.json().catch(() => ({}));
    if (res.ok) {
      setStaff((prev) => [payload, ...prev]);
      setDraft({ username: "", name: "", role: "Staff", password: "" });
      setShowForm(false);
    } else {
      setError(payload.error || "Could not create staff user.");
    }
    setSaving(false);
  };

  const setRole = async (id, role) => {
    const res = await fetch(`/api/staff/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setStaff((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  const deleteStaff = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const res = await fetch(`/api/staff/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) setStaff((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (loading) {
    return (
      <div>
        <Skeleton className="h-7 w-40 mb-1" />
        <Skeleton className="h-4 w-56 mb-4" />
        <Skeleton className="h-10 w-44 mb-3" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
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
        title="Staff & Access"
        subtitle="Manage who can sign in, and their permission level"
        action={
          <button
            onClick={() => setShowForm((s) => !s)}
            className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-white bg-teal"
          >
            {showForm ? <ShieldCheck size={15} /> : <Plus size={15} />} {showForm ? "Cancel" : "Add staff"}
          </button>
        }
      />

      {showForm && (
        <div className="rounded-lg bg-white p-4 mb-4 grid sm:grid-cols-2 gap-3 border border-border">
          <Field label="Username" span>
            <TextInput
              value={draft.username}
              onChange={(e) => setDraft({ ...draft, username: e.target.value })}
              placeholder="e.g. riya"
            />
          </Field>
          <Field label="Full name">
            <TextInput
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Display name"
            />
          </Field>
          <Field label="Role">
            <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </Select>
          </Field>
          <Field label="Password">
            <TextInput
              type="password"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              placeholder="At least 8 characters"
            />
          </Field>
          <div className="sm:col-span-2 flex justify-end">
            <button
              onClick={addStaff}
              disabled={saving}
              className="rounded-md px-4 py-2 text-sm text-white bg-tealDeep disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create account"}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-lg bg-white border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surfaceAlt text-inkSoft">
              <th className="text-left font-medium px-4 py-2.5">User</th>
              <th className="text-left font-medium px-4 py-2.5 hidden sm:table-cell">Username</th>
              <th className="text-left font-medium px-4 py-2.5 hidden md:table-cell">Added</th>
              <th className="text-left font-medium px-4 py-2.5">Role</th>
              <th className="px-4 py-2.5 w-20 text-right">Remove</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {staff.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-2.5">
                  <div className="text-ink">{s.name || s.username}</div>
                  <div className="text-xs text-inkSoft">{s.id}</div>
                </td>
                <td className="px-4 py-2.5 hidden sm:table-cell text-inkSoft">{s.username}</td>
                <td className="px-4 py-2.5 hidden md:table-cell text-inkSoft">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5">
                  <select
                    value={s.role}
                    onChange={(e) => setRole(s.id, e.target.value)}
                    disabled={s.id === me?.id}
                    className="rounded-md border border-border bg-surfaceAlt px-2 py-1 text-xs text-ink disabled:opacity-50"
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => setDeleteTarget(s)}
                    disabled={s.id === me?.id}
                    className="text-xs font-medium text-rose disabled:opacity-40"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-inkSoft">
                  No staff accounts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStaff}
        title="Remove staff account"
        message={`Remove ${deleteTarget?.name || deleteTarget?.username}? They will no longer be able to sign in.`}
        loading={deleting}
      />
    </div>
  );
}
