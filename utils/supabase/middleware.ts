import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Refreshes the Supabase auth session on every matched request and rewrites
 * the auth cookies onto the response.
 *
 * NOTE: this deviates from the pasted quickstart on purpose. The quickstart's
 * middleware never calls the auth API, so expired access tokens are never
 * refreshed — which is the whole reason the middleware exists. We call
 * `getUser()` (a network-validated check, unlike `getSession()`) so that
 * rotated tokens are written back via `setAll`. Do not remove this call.
 */
export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT: no logic between client creation and getUser(), per Supabase
  // SSR guidance — it keeps token refresh and cookie writes atomic.
  await supabase.auth.getUser();

  return supabaseResponse;
};
