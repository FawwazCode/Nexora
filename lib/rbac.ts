import { Role } from "@prisma/client";

export type AppRole = Role;

const customerRoutes = ["/profile", "/wishlist", "/cart", "/checkout", "/orders"];

const dashboardAccessByRole: Record<string, string[]> = {
  [Role.CATALOG_ADMIN]: [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/categories",
    "/dashboard/inventory",
  ],
  [Role.ORDER_SPECIALIST]: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/customers",
    "/dashboard/shipping",
  ],
  [Role.SUPER_ADMIN]: ["/dashboard"],
};

function normalizePath(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "") || "/";
}

function matchesPath(pathname: string, route: string) {
  const normalized = normalizePath(pathname);
  const normalizedRoute = normalizePath(route);

  return normalized === normalizedRoute || normalized.startsWith(`${normalizedRoute}/`);
}

export function isPublicRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  if (normalized === "/") return true;
  if (normalized.startsWith("/products")) return true;
  if (normalized.startsWith("/categories")) return true;
  if (normalized.startsWith("/about")) return true;
  if (normalized.startsWith("/login")) return true;
  if (normalized.startsWith("/register")) return true;
  if (normalized.startsWith("/api/auth")) return true;
  if (normalized.startsWith("/_next")) return true;
  if (normalized.startsWith("/favicon.ico")) return true;

  return false;
}

export function isCustomerRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  return customerRoutes.some((route) => matchesPath(normalized, route));
}

export function isDashboardRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  return normalized === "/dashboard" || normalized.startsWith("/dashboard/");
}

export function isAdminApiRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  return normalized.startsWith("/api/admin") || normalized.startsWith("/api/dashboard");
}

export function canAccessRoute(pathname: string, role?: string | null) {
  const normalized = normalizePath(pathname);

  if (isPublicRoute(normalized)) {
    return true;
  }

  if (!role) {
    return false;
  }

  if (isCustomerRoute(normalized)) {
    return true;
  }

  if (isAdminApiRoute(normalized)) {
    return role === Role.SUPER_ADMIN;
  }

  if (isDashboardRoute(normalized)) {
    if (role === Role.SUPER_ADMIN) {
      return true;
    }

    if (role === Role.CUSTOMER) {
      return true;
    }

    const allowedDashboardRoutes = dashboardAccessByRole[role];

    if (!allowedDashboardRoutes) {
      return false;
    }

    return allowedDashboardRoutes.some((route) => matchesPath(normalized, route));
  }

  return true;
}

export function getDashboardRedirect(pathname: string, role?: string | null) {
  const normalized = normalizePath(pathname);

  if (!isDashboardRoute(normalized)) {
    return null;
  }

  if (!role) {
    return "/";
  }

  if (role === Role.CUSTOMER) {
    return null;
  }

  if (role === Role.SUPER_ADMIN) {
    return null;
  }

  const allowedDashboardRoutes = dashboardAccessByRole[role];

  if (!allowedDashboardRoutes || allowedDashboardRoutes.some((route) => matchesPath(normalized, route))) {
    return null;
  }

  return "/dashboard";
}
