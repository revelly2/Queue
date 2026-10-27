import { NextResponse, connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDisplaySnapshot } from "@/lib/display/board";

export async function GET() {
  await connection();
  try {
    const admin = createAdminClient();
    const snapshot = await getDisplaySnapshot(admin);
    return NextResponse.json(snapshot);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
