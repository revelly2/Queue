import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getDisplaySnapshot } from "@/lib/display/board";
import Display from "./Display";

export const instant = false;

export default async function DisplayPage() {
  const supabase = createClient(await cookies());
  const initial = await getDisplaySnapshot(supabase);
  return <Display initial={initial} />;
}
