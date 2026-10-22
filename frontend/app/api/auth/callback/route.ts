import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Supabase OAuth/magic-link callback: exchanges the one-time `code` from the
// redirect URL for a session. With @supabase/ssr the session is stored in
// cookies, which the server-side proxy (proxy.ts) picks up.
export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    const redirectTo = (path: string) => NextResponse.redirect(new URL(path, origin));

    if (!code) {
        return redirectTo("/auth/signin?error=missing_code");
    }

    try {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll() {
                        // The callback only needs to exchange the code once;
                        // the resulting refresh/set-cookie happens via the
                        // response returned by exchangeCodeForSession on
                        // subsequent requests through proxy.
                    },
                },
            }
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            return redirectTo("/auth/signin?error=auth");
        }
        return redirectTo(next);
    } catch {
        return redirectTo("/auth/signin?error=auth");
    }
}
