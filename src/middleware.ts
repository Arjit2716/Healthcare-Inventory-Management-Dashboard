import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const isLoggedIn = !!session;

  const isAuthPage = nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register");
  const isDashboardPage = nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/products") ||
    nextUrl.pathname.startsWith("/suppliers") ||
    nextUrl.pathname.startsWith("/inventory") ||
    nextUrl.pathname.startsWith("/alerts") ||
    nextUrl.pathname.startsWith("/analytics");

  // Redirect authenticated users away from auth pages
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (!isLoggedIn && isDashboardPage) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/suppliers/:path*",
    "/inventory/:path*",
    "/alerts/:path*",
    "/analytics/:path*",
    "/login",
    "/register",
  ],
};
