import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // create auth client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const PROTECTED_ROUTES = ["/dashboard", "/guardian/portal"]
  const AUTH_ROUTES = ["/auth/signin", "/auth/signup"]

  const isProtected = PROTECTED_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => request.nextUrl.pathname.startsWith(r))

  if (isProtected && !session) {
    // Disabled next.js server-side protection because we are using localStorage + FastAPI 
    // const url = request.nextUrl.clone()
    // url.pathname = "/auth/signin"
    // return NextResponse.redirect(url)
  }

  if (isAuthRoute && session) {
    // Disabled for same reason
    // const url = request.nextUrl.clone()
    // url.pathname = "/dashboard"
    // return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*", "/guardian/portal/:path*"]
}
