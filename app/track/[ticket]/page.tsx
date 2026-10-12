import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { getTrackSnapshot } from "@/lib/track/queue";
import Tracker from "./Tracker";

export const instant = false;

export default async function TrackPage({
  params,
}: {
  params: Promise<{ ticket: string }>;
}) {
  const { ticket } = await params;
  const ticketNumber = decodeURIComponent(ticket).toUpperCase();
  const supabase = createClient(await cookies());
  const initial = await getTrackSnapshot(supabase, ticketNumber);
  return <Tracker ticketNumber={ticketNumber} initial={initial} />;
}
