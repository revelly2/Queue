import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDisplaySnapshot } from "@/lib/display/board";
import Display from "./Display";

export const instant = false;

export default async function DisplayPage() {
  await connection();
  const admin = createAdminClient();
  const initial = await getDisplaySnapshot(admin);
  return <Display initial={initial} />;
}
