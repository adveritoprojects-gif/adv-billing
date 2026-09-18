"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Stethoscope } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password) return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (res.ok) {
      router.push(searchParams.get("from") || "/");
      router.refresh();
    } else {
      setError(data.error || "Login failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-tealDeep p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-1">
          <Stethoscope size={20} className="text-tealDeep" />
          <p className="text-xl font-head text-ink">Adv Billings</p>
        </div>
        <p className="text-xs text-inkSoft mb-6">Payyannur Scans — staff login</p>
        <label className="block mb-4">
          <span className="text-sm text-inkSoft">Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoFocus
            autoCapitalize="none"
            autoCorrect="off"
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-teal"
          />
        </label>
        <label className="block mb-5">
          <span className="text-sm text-inkSoft">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-border px-3 py-2 text-sm outline-teal"
          />
        </label>
        {error && <p className="mb-3 text-sm text-rose">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md py-2.5 text-sm text-white bg-tealDeep disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}