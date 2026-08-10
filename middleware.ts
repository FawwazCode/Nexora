import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import authConfig from "./lib/auth.config";
import {
  canAccessRoute,
  getDashboardRedirect,
  isPublicRoute,
} from "./lib/rbac";

const { auth } = NextAuth(authConfig);

export default auth(async (request) => {
  const { pathname } = request.nextUrl;
  const session = request.auth;
  const role = (session?.user as { role?: string } | undefined)?.role;

  // 1. If user is already authenticated and visits /login or /register, redirect to their home
  if (session?.user && (pathname === "/login" || pathname === "/register")) {
    const targetUrl = role === "CUSTOMER" ? "/customer" : "/dashboard";
    return NextResponse.redirect(new URL(targetUrl, request.url));
  }

  // 2. Allow public routes (e.g. /, /products, /categories, /about, /login, /register, /api/auth)
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // 3. If user is not authenticated:
  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  // 4. Authenticated role redirection for dashboard routes
  const dashboardRedirect = getDashboardRedirect(pathname, role);
  if (dashboardRedirect) {
    return NextResponse.redirect(
      new URL(dashboardRedirect, request.url)
    );
  }

  // 5. Enforce fine-grained RBAC permissions
  if (!canAccessRoute(pathname, role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Forbidden: Access denied" },
        { status: 403 }
      );
    }

    const fallbackUrl = role === "CUSTOMER" ? "/customer" : "/dashboard";
    return NextResponse.redirect(
      new URL(fallbackUrl, request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};