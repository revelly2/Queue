/**
 * Operational reporting (PRD FR-5.3). Computes aggregates client-side from
 * tickets in a date range (staff-readable via RLS). For very large ranges this
 * could move to SQL aggregation; fine for typical registrar volumes.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export interface ServiceCount {
  code: string;
  name: string;
  count: number;
}

export interface ReportData {
  total: number;
  completed: number;
  noShow: number;
  noShowRate: number; // 0..1
  aqwtMins: number | null; // avg queue wait (created -> called)
  ashtMins: number | null; // avg service handling (called -> completed)
  byService: ServiceCount[];
  byHour: { hour: number; count: number }[];
}

interface Row {
  queue_status: string;
  created_at: string;
  called_at: string | null;
  completed_at: string | null;
  ticket_items: Array<{ services: { code: string; name: string } | null }>;
}

const mins = (aIso: string, bIso: string) =>
  (new Date(bIso).getTime() - new Date(aIso).getTime()) / 60000;

export async function getReport(
  sb: SupabaseClient,
  fromIso: string,
  toIso: string,
): Promise<ReportData> {
  const { data, error } = await sb
    .from("tickets")
    .select("queue_status,created_at,called_at,completed_at,ticket_items(services(code,name))")
    .gte("created_at", fromIso)
    .lte("created_at", toIso);
  if (error) throw new Error(`Failed to build report: ${error.message}`);

  const rows = (data as unknown as Row[]) ?? [];
  let completed = 0;
  let noShow = 0;
  const waits: number[] = [];
  const handles: number[] = [];
  const svc = new Map<string, ServiceCount>();
  const hours = new Array(24).fill(0) as number[];

  for (const r of rows) {
    if (r.queue_status === "COMPLETED") completed++;
    if (r.queue_status === "NO_SHOW") noShow++;
    if (r.called_at) waits.push(mins(r.created_at, r.called_at));
    if (r.called_at && r.completed_at && r.queue_status === "COMPLETED") {
      handles.push(mins(r.called_at, r.completed_at));
    }
    hours[new Date(r.created_at).getHours()]++;
    for (const it of r.ticket_items) {
      if (!it.services) continue;
      const cur = svc.get(it.services.code) ?? { code: it.services.code, name: it.services.name, count: 0 };
      cur.count++;
      svc.set(it.services.code, cur);
    }
  }

  const avg = (xs: number[]) =>
    xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 10) / 10 : null;

  return {
    total: rows.length,
    completed,
    noShow,
    noShowRate: completed + noShow > 0 ? noShow / (completed + noShow) : 0,
    aqwtMins: avg(waits),
    ashtMins: avg(handles),
    byService: [...svc.values()].sort((a, b) => b.count - a.count),
    byHour: hours.map((count, hour) => ({ hour, count })),
  };
}

/** Build a CSV string for download. */
export function reportToCsv(r: ReportData, fromIso: string, toIso: string): string {
  const lines: string[] = [];
  lines.push(`QueUA Report,${fromIso},${toIso}`);
  lines.push("");
  lines.push("Metric,Value");
  lines.push(`Total tickets,${r.total}`);
  lines.push(`Completed,${r.completed}`);
  lines.push(`No-show,${r.noShow}`);
  lines.push(`No-show rate,${(r.noShowRate * 100).toFixed(1)}%`);
  lines.push(`Avg queue wait (AQWT) mins,${r.aqwtMins ?? "n/a"}`);
  lines.push(`Avg service handling (ASHT) mins,${r.ashtMins ?? "n/a"}`);
  lines.push("");
  lines.push("Service code,Service name,Count");
  for (const s of r.byService) lines.push(`${s.code},"${s.name.replace(/"/g, '""')}",${s.count}`);
  lines.push("");
  lines.push("Hour,Count");
  for (const h of r.byHour) lines.push(`${h.hour},${h.count}`);
  return lines.join("\n");
}
