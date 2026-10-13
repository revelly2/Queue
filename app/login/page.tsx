"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    let dest = "/counter";
    const uid = data.user?.id;
    if (uid) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", uid).single();
      const role = profile?.role;
      if (role === "CASHIER") dest = "/cashier";
      else if (role === "REGISTRAR_ADMIN" || role === "SYSTEM_ADMIN") dest = "/admin";
    }
    setLoading(false);
    router.push(dest);
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-6">
      <div>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="grid h-[26px] w-[26px] place-items-center rounded-[7px] bg-accent text-[12px] font-extrabold text-white">Q</span>
          <span className="font-bold" style={{ letterSpacing: "-0.04em" }}>QueUA</span>
        </div>
        <h1 className="text-xl font-bold" style={{ letterSpacing: "-0.04em" }}>Sign in</h1>
        <p className="mt-1 text-xs text-muted">Staff portal — cashier, registrar & admin</p>
      </div>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="section-label">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field"
            autoComplete="username"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="section-label">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="field"
            autoComplete="current-password"
          />
        </label>
        {error && (
          <p role="alert" className="text-xs text-red">{error}</p>
        )}
        <button type="submit" disabled={loading} className="btn btn-primary mt-1 py-2.5 text-sm">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </main>
  );
}
