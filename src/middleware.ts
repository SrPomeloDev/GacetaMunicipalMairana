import { createServerClient } from "@supabase/ssr"
import type { CookieOptionsWithName } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const publicAdminPaths = ["/admin/login"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAdminRoute = pathname.startsWith("/admin")

  if (!isAdminRoute) {
    return NextResponse.next()
  }

  if (publicAdminPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptionsWithName }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  if (!authUser) {
    const redirectUrl = new URL("/admin/login", request.url)
    redirectUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const { data: user } = await supabase
    .from("usuarios")
    .select("activo, rol")
    .eq("id", authUser.id)
    .single()

  if (!user || !user.activo) {
    await supabase.auth.signOut()
    const redirectUrl = new URL("/admin/login", request.url)
    redirectUrl.searchParams.set("error", "inactive")
    return NextResponse.redirect(redirectUrl)
  }

  return response
}

export const config = {
  matcher: ["/admin/:path*"],
}
