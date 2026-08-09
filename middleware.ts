import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { canAccessRoute, getDashboardRedirect, isPublicRoute } from "./lib/rbac";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    return NextResponse.next();
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  const dashboardRedirect = getDashboardRedirect(pathname, role);
  if (dashboardRedirect) {
    return NextResponse.redirect(new URL(dashboardRedirect, request.url));
  }

  if (!session?.user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!canAccessRoute(pathname, role)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
