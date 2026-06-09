import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// ─── Route definitions ─────────────────────────────────────────────────────

/** Public routes — accessible without authentication */
const PUBLIC_ROUTES = ["/", "/login", "/register"];

/** Auth routes — redirect to dashboard if already signed in */
const AUTH_ROUTES = ["/login", "/register"];

/** API routes that are public (no JWT required) */
const PUBLIC_API_ROUTES = ["/api/auth", "/api/health"];

/** Routes that require ADMIN role only */
const ADMIN_ONLY_ROUTES = [
  "/api/suppliers",  // DELETE
  "/api/products",   // DELETE
];

// ─── Middleware ─────────────────────────────────────────────────────────────

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const isLoggedIn = !!session;
  const pathname = nextUrl.pathname;
  const method = req.method;

  // ── Allow public API routes through ──────────────────────────────────────
  if (PUBLIC_API_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next();
  }

  // ── Protect all other API routes ─────────────────────────────────────────
  if (pathname.startsWith("/api/")) {
    if (!isLoggedIn) {
      return NextResponse.json(
        { error: "Unauthorized — please sign in" },
        { status: 401 }
      );
    }

    // RBAC: Admin-only DELETE operations
    const isAdminOnlyDelete =
      method === "DELETE" &&
      ADMIN_ONLY_ROUTES.some((r) => pathname.startsWith(r));

    if (isAdminOnlyDelete && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden — Admin access required" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // ── Redirect authenticated users away from auth pages ────────────────────
  if (isLoggedIn && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // ── Redirect unauthenticated users to login ───────────────────────────────
  const isPublic = PUBLIC_ROUTES.includes(pathname);
  if (!isLoggedIn && !isPublic) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Add role header for downstream use ───────────────────────────────────
  const response = NextResponse.next();
  if (session?.user?.role) {
    response.headers.set("x-user-role", session.user.role);
    response.headers.set("x-user-id",   session.user.id ?? "");
  }

  return response;
});

export const config = {
  matcher: [
    /*
     * Match all routes except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
