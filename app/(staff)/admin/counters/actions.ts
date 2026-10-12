"use server";

import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

type Result = { ok: true } | { ok: false; error: string };

/** Confirm the caller is an admin before any privileged work. */
async function requireAdminCaller(): Promise<Result> {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in" };
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "REGISTRAR_ADMIN" && profile?.role !== "SYSTEM_ADMIN") {
    return { ok: false, error: "Admin access required" };
  }
  return { ok: true };
}

/** Create a dedicated station login and bind it to the counter. */
export async function createCounterAccount(input: {
  counterId: number;
  email: string;
  password: string;
}): Promise<Result> {
  const gate = await requireAdminCaller();
  if (!gate.ok) return gate;

  const email = input.email.trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, error: "A valid email is required" };
  if ((input.password ?? "").length < 8) {
    return { ok: false, error: "Password must be at least 8 characters" };
  }

  const admin = createAdminClient();

  const { data: counter, error: cErr } = await admin
    .from("counters")
    .select("label_name, assigned_staff_id")
    .eq("id", input.counterId)
    .single();
  if (cErr || !counter) return { ok: false, error: "Counter not found" };
  if (counter.assigned_staff_id) {
    return { ok: false, error: "This counter already has a login — remove it first" };
  }

  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: counter.label_name },
  });
  if (createErr || !created.user) {
    return { ok: false, error: createErr?.message ?? "Could not create account" };
  }
  const uid = created.user.id;

  const { error: roleErr } = await admin
    .from("profiles")
    .update({ role: "COUNTER", full_name: counter.label_name })
    .eq("id", uid);
  if (roleErr) return { ok: false, error: roleErr.message };

  const { error: bindErr } = await admin
    .from("counters")
    .update({ assigned_staff_id: uid })
    .eq("id", input.counterId);
  if (bindErr) return { ok: false, error: bindErr.message };

  return { ok: true };
}

/** Unbind a counter's station login (optionally delete the auth user). */
export async function removeCounterAccount(input: {
  counterId: number;
  deleteUser?: boolean;
}): Promise<Result> {
  const gate = await requireAdminCaller();
  if (!gate.ok) return gate;

  const admin = createAdminClient();
  const { data: counter } = await admin
    .from("counters")
    .select("assigned_staff_id")
    .eq("id", input.counterId)
    .single();
  const uid = counter?.assigned_staff_id as string | null | undefined;

  const { error: unbindErr } = await admin
    .from("counters")
    .update({ assigned_staff_id: null })
    .eq("id", input.counterId);
  if (unbindErr) return { ok: false, error: unbindErr.message };

  if (input.deleteUser && uid) {
    const { error: delErr } = await admin.auth.admin.deleteUser(uid);
    if (delErr) return { ok: false, error: delErr.message };
  }
  return { ok: true };
}
