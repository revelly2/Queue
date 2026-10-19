"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { UniversitySeal } from "@/components/illustrations/UniversitySeal";
import { StaffDeskIllustration } from "@/components/illustrations/StaffDeskIllustration";
import { AlertCircleIcon, ArrowRightIcon } from "@/components/icons/Icons";

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
    <div className="min-h-screen bg-[#FCFBF8] text-ink flex flex-col justify-between">
      <header className="border-b border-line bg-surface/90 backdrop-blur">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <UniversitySeal size={32} />
            <div>
              <p className="font-extrabold text-xs text-royal-dark">QueUA Staff</p>
              <p className="text-[10px] text-muted">University of Abra</p>
            </div>
          </Link>
          <Link href="/" className="text-xs font-semibold text-royal hover:underline">
            ← Home
          </Link>
        </div>
      </header>

      <main className="max-w-md w-full mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="card p-6 sm:p-8 bg-surface border border-line shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center -my-2">
              <StaffDeskIllustration size={120} />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-crimson-light text-crimson border border-crimson/20">
              Authorized Personnel Only
            </div>
            <h1 className="text-xl font-bold text-royal-dark">Registrar Staff Portal</h1>
            <p className="text-xs text-muted">
              Sign in to manage your counter window, cashier clearance, or department settings.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <label className="flex flex-col gap-1.5">
              <span className="section-label">University Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="staff@abra.edu.ph"
                className="field text-sm"
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
                placeholder="••••••••"
                className="field text-sm"
                autoComplete="current-password"
              />
            </label>

            {error && (
              <div role="alert" className="p-3.5 rounded-xl bg-red-light border border-red/20 text-xs text-red font-semibold flex items-center gap-2">
                <AlertCircleIcon size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn py-3.5 text-sm font-bold shadow-md rounded-xl flex items-center justify-center gap-2"
              style={{
                backgroundColor: "#064E3B",
                color: "#FFFFFF",
                boxShadow: "0 4px 12px rgba(6, 78, 59, 0.3)",
              }}
            >
              <span>{loading ? "Verifying Credentials…" : "Sign In to Station"}</span>
              <ArrowRightIcon size={15} />
            </button>
          </form>

          <div className="p-3 rounded-xl bg-bg border border-line text-[11px] text-muted text-center">
            Locked to University of Abra campus security policies. Stations are bound by counter window assignment.
          </div>
        </div>
      </main>

      <footer className="border-t border-line bg-[#F4F1EA] py-3 text-center text-[10px] text-muted">
        QueUA Authentication · University of Abra Office of the Registrar
      </footer>
    </div>
  );
}
