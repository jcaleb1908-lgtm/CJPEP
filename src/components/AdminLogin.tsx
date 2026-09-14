"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Error");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setBusy(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-20">
      <form onSubmit={onSubmit} className="card w-full max-w-sm p-8">
        <h1 className="display text-2xl">Panel</h1>
        <p className="mt-1 text-sm text-muted">Acceso para procesar órdenes.</p>

        <label className="label mt-6" htmlFor="pw">
          Contraseña
        </label>
        <input
          id="pw"
          type="password"
          className="field"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="mt-3 text-sm font-medium text-[#b3261e]">{error}</p>}

        <button type="submit" disabled={busy || !password} className="btn btn-primary mt-5 w-full">
          {busy ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
