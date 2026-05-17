import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export async function middleware(request: Request) {
  const session = await auth()
  const { pathname } = new URL(request.url)

  // Public paths that don't require auth
  const publicPaths = ["/login", "/register", "/api/auth"]
  if (publicPaths.some(p => pathname.startsWith(p))) {
    // Redirect to / if already logged in
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url))
    }
    return NextResponse.next()
  }

  // Protected paths require authentication
  if (pathname.startsWith("/profile") || pathname.startsWith("/api/user")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin paths require ADMIN role
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    if (!session) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/api/user/:path*", "/api/admin/:path*", "/login", "/register"],
}
