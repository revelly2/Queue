import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { ServiceCategory } from "@/lib/db/enums";
import Kiosk, { type KioskService } from "./Kiosk";

export const instant = false;

interface ServiceRow {
  id: number;
  code: string;
  name: string;
  category: ServiceCategory;
  base_fee: number | string;
  requires_docstamp: boolean;
  docstamp_fee: number | string;
  is_per_page: boolean;
}

export default async function KioskPage() {
  const supabase = createClient(await cookies());
  const { data } = await supabase
    .from("services")
    .select("id,code,name,category,base_fee,requires_docstamp,docstamp_fee,is_per_page")
    .eq("is_active", true)
    .order("category")
    .order("name");

  const services: KioskService[] = ((data as ServiceRow[]) ?? []).map((s) => ({
    id: s.id,
    code: s.code,
    name: s.name,
    category: s.category,
    baseFee: Number(s.base_fee),
    requiresDocstamp: s.requires_docstamp,
    docstampFee: Number(s.docstamp_fee),
    isPerPage: s.is_per_page,
  }));

  return <Kiosk services={services} />;
}
