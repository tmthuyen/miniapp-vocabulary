import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("session_token")?.value
  const pathname = request.nextUrl.pathname
  const hasSessionCookie = Boolean(token)

  if (pathname.startsWith("/dashboard") && !hasSessionCookie) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (pathname.startsWith("/auth") && hasSessionCookie) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
}
