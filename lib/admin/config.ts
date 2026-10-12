/**
 * Admin configuration data layer — counters, modules, service mappings, and
 * module→counter assignments. All writes go through the authenticated admin
 * client; RLS (migration 0006) enforces admin-only on modules/assignments.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { AccessLevel, CounterStatus, ServiceCategory } from "@/lib/db/enums";

function check<T>({ data, error }: { data: T; error: { message: string } | null }, what: string): T {
  if (error) throw new Error(`${what}: ${error.message}`);
  return data;
}

// --------------------------------------------------------------------------
// Counters + assignments
// --------------------------------------------------------------------------
export interface AdminAssignment {
  id: number;
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  accessLevel: AccessLevel;
}

export interface AdminCounter {
  id: number;
  number: number;
  label: string;
  status: CounterStatus;
  assignments: AdminAssignment[];
}

interface CounterRow {
  id: number;
  counter_number: number;
  label_name: string;
  status: CounterStatus;
  counter_modules: Array<{
    id: number;
    access_level: AccessLevel;
    module_id: number;
    modules: { code: string; name: string } | null;
  }>;
}

export async function listCounters(sb: SupabaseClient): Promise<AdminCounter[]> {
  const data = check(
    await sb
      .from("counters")
      .select("id,counter_number,label_name,status,counter_modules(id,access_level,module_id,modules(code,name))")
      .order("counter_number"),
    "load counters",
  ) as unknown as CounterRow[];
  return data.map((c) => ({
    id: c.id,
    number: c.counter_number,
    label: c.label_name,
    status: c.status,
    assignments: c.counter_modules.map((cm) => ({
      id: cm.id,
      moduleId: cm.module_id,
      moduleCode: cm.modules?.code ?? "",
      moduleName: cm.modules?.name ?? "",
      accessLevel: cm.access_level,
    })),
  }));
}

export async function createCounter(sb: SupabaseClient, number: number, label: string) {
  check(await sb.from("counters").insert({ counter_number: number, label_name: label, status: "CLOSED" }), "create counter");
}

export async function updateCounter(
  sb: SupabaseClient,
  id: number,
  patch: { label?: string; number?: number; status?: CounterStatus },
) {
  const row: Record<string, unknown> = {};
  if (patch.label !== undefined) row.label_name = patch.label;
  if (patch.number !== undefined) row.counter_number = patch.number;
  if (patch.status !== undefined) row.status = patch.status;
  check(await sb.from("counters").update(row).eq("id", id), "update counter");
}

export async function deleteCounter(sb: SupabaseClient, id: number) {
  check(await sb.from("counters").delete().eq("id", id), "delete counter");
}

export async function assignModule(
  sb: SupabaseClient,
  counterId: number,
  moduleId: number,
  accessLevel: AccessLevel,
) {
  check(
    await sb.from("counter_modules").insert({ counter_id: counterId, module_id: moduleId, access_level: accessLevel }),
    "assign module",
  );
}

export async function updateAssignment(sb: SupabaseClient, id: number, accessLevel: AccessLevel) {
  check(await sb.from("counter_modules").update({ access_level: accessLevel }).eq("id", id), "update assignment");
}

export async function removeAssignment(sb: SupabaseClient, id: number) {
  check(await sb.from("counter_modules").delete().eq("id", id), "remove assignment");
}

// --------------------------------------------------------------------------
// Modules + service membership
// --------------------------------------------------------------------------
export interface AdminModule {
  id: number;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  serviceIds: number[];
}

export interface AdminService {
  id: number;
  code: string;
  name: string;
  category: ServiceCategory;
}

interface ModuleRow {
  id: number;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  module_services: Array<{ service_id: number }>;
}

export async function listModules(sb: SupabaseClient): Promise<AdminModule[]> {
  const data = check(
    await sb.from("modules").select("id,code,name,description,is_active,module_services(service_id)").order("code"),
    "load modules",
  ) as unknown as ModuleRow[];
  return data.map((m) => ({
    id: m.id,
    code: m.code,
    name: m.name,
    description: m.description,
    isActive: m.is_active,
    serviceIds: m.module_services.map((x) => x.service_id),
  }));
}

export async function listServices(sb: SupabaseClient): Promise<AdminService[]> {
  const data = check(
    await sb.from("services").select("id,code,name,category").order("code"),
    "load services",
  ) as unknown as AdminService[];
  return data;
}

export async function createModule(sb: SupabaseClient, code: string, name: string, description: string) {
  check(
    await sb.from("modules").insert({ code, name, description: description || null }),
    "create module",
  );
}

export async function updateModule(
  sb: SupabaseClient,
  id: number,
  patch: { name?: string; description?: string | null; isActive?: boolean },
) {
  const row: Record<string, unknown> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.description !== undefined) row.description = patch.description || null;
  if (patch.isActive !== undefined) row.is_active = patch.isActive;
  check(await sb.from("modules").update(row).eq("id", id), "update module");
}

export async function deleteModule(sb: SupabaseClient, id: number) {
  check(await sb.from("modules").delete().eq("id", id), "delete module");
}

/** Reconcile a module's service membership to exactly `serviceIds`. */
export async function setModuleServices(sb: SupabaseClient, moduleId: number, serviceIds: number[]) {
  const cur = check(
    await sb.from("module_services").select("service_id").eq("module_id", moduleId),
    "load module services",
  ) as { service_id: number }[];
  const current = new Set(cur.map((r) => r.service_id));
  const target = new Set(serviceIds);
  const toAdd = serviceIds.filter((id) => !current.has(id));
  const toRemove = [...current].filter((id) => !target.has(id));
  if (toRemove.length) {
    check(
      await sb.from("module_services").delete().eq("module_id", moduleId).in("service_id", toRemove),
      "remove module services",
    );
  }
  if (toAdd.length) {
    check(
      await sb.from("module_services").insert(toAdd.map((sid) => ({ module_id: moduleId, service_id: sid }))),
      "add module services",
    );
  }
}
