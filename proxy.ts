import { type NextRequest } from "next/server";
import { updateSession } from "@/utils/supabase/middleware";

// Next.js 16 renamed the "middleware" convention to "proxy". Same behavior —
// here it refreshes the Supabase auth session on each matched request.
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static assets and image optimization
     * files. Add public routes here if they should skip session refresh.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
