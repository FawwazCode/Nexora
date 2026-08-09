import {
  canManageProducts,
  canManageOrders,
} from "./admin/permissions";

export type AppRole =
  | "SUPER_ADMIN"
  | "CATALOG_ADMIN"
  | "ORDER_SPECIALIST"
  | "CUSTOMER";

const ROLE = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CATALOG_ADMIN: "CATALOG_ADMIN",
  ORDER_SPECIALIST: "ORDER_SPECIALIST",
  CUSTOMER: "CUSTOMER",
} as const;

const customerRoutes = [
  "/profile",
  "/wishlist",
  "/cart",
  "/checkout",
  "/orders",
  "/customer",
];

const dashboardAccessByRole: Record<string, string[]> = {
  [ROLE.CATALOG_ADMIN]: [
    "/dashboard",
    "/dashboard/products",
    "/dashboard/categories",
    "/dashboard/brands",
    "/dashboard/variants",
    "/dashboard/inventory",
  ],

  [ROLE.ORDER_SPECIALIST]: [
    "/dashboard",
    "/dashboard/orders",
    "/dashboard/customers",
    "/dashboard/shipping",
  ],

  [ROLE.SUPER_ADMIN]: ["/dashboard"],
};

function normalizePath(pathname: string) {
  return pathname === "/"
    ? pathname
    : pathname.replace(/\/+$/, "") || "/";
}

function matchesPath(pathname: string, route: string) {
  const normalized = normalizePath(pathname);
  const normalizedRoute = normalizePath(route);

  return (
    normalized === normalizedRoute ||
    normalized.startsWith(`${normalizedRoute}/`)
  );
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

  return customerRoutes.some((route) =>
    matchesPath(normalized, route)
  );
}

export function isDashboardRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  return (
    normalized === "/dashboard" ||
    normalized.startsWith("/dashboard/")
  );
}

export function isAdminApiRoute(pathname: string) {
  const normalized = normalizePath(pathname);

  return (
    normalized.startsWith("/api/admin") ||
    normalized.startsWith("/api/dashboard")
  );
}

export function canAccessRoute(
  pathname: string,
  role?: string | null
) {
  const normalized = normalizePath(pathname);

  // Public routes can always be accessed.
  if (isPublicRoute(normalized)) {
    return true;
  }

  // User must have a role.
  if (!role) {
    return false;
  }

  // Customer routes can be accessed by logged-in users.
  if (isCustomerRoute(normalized)) {
    return true;
  }

  // Admin API routes.
  if (isAdminApiRoute(normalized)) {
    // Product-related API.
    if (
      normalized === "/api/admin/products" ||
      normalized.startsWith("/api/admin/products/") ||
      normalized === "/api/admin/categories" ||
      normalized.startsWith("/api/admin/categories/") ||
      normalized === "/api/admin/brands" ||
      normalized.startsWith("/api/admin/brands/") ||
      normalized === "/api/admin/variants" ||
      normalized.startsWith("/api/admin/variants/") ||
      normalized === "/api/admin/inventory" ||
      normalized.startsWith("/api/admin/inventory/")
    ) {
      return canManageProducts(role);
    }

    // Order-related API.
    if (
      normalized === "/api/admin/orders" ||
      normalized.startsWith("/api/admin/orders/") ||
      normalized === "/api/admin/shipping" ||
      normalized.startsWith("/api/admin/shipping/") ||
      normalized === "/api/admin/customers" ||
      normalized.startsWith("/api/admin/customers/")
    ) {
      return canManageOrders(role);
    }

    // Other admin APIs are Super Admin only.
    return role === ROLE.SUPER_ADMIN;
  }

  // Product dashboard pages.
  if (
    normalized === "/dashboard/products" ||
    normalized.startsWith("/dashboard/products/")
  ) {
    return canManageProducts(role);
  }

  // Category dashboard pages.
  if (
    normalized === "/dashboard/categories" ||
    normalized.startsWith("/dashboard/categories/")
  ) {
    return canManageProducts(role);
  }

  // Brand dashboard pages.
  if (
    normalized === "/dashboard/brands" ||
    normalized.startsWith("/dashboard/brands/")
  ) {
    return canManageProducts(role);
  }

  // Variant dashboard pages.
  if (
    normalized === "/dashboard/variants" ||
    normalized.startsWith("/dashboard/variants/")
  ) {
    return canManageProducts(role);
  }

  // Dashboard routes.
  if (isDashboardRoute(normalized)) {
    if (role === ROLE.SUPER_ADMIN) {
      return true;
    }

    if (role === ROLE.CUSTOMER) {
      return false;
    }

    const allowedDashboardRoutes =
      dashboardAccessByRole[role];

    if (!allowedDashboardRoutes) {
      return false;
    }

    return allowedDashboardRoutes.some((route) =>
      matchesPath(normalized, route)
    );
  }

  // Other authenticated routes.
  return true;
}

export function getDashboardRedirect(
  pathname: string,
  role?: string | null
) {
  const normalized = normalizePath(pathname);

  if (!isDashboardRoute(normalized)) {
    return null;
  }

  // Not logged in / no role.
  if (!role) {
    return "/";
  }

  // Customer should use customer dashboard.
  if (role === ROLE.CUSTOMER) {
    return "/customer";
  }

  // Product dashboard permissions.
  if (
    normalized === "/dashboard/products" ||
    normalized.startsWith("/dashboard/products/")
  ) {
    return canManageProducts(role)
      ? null
      : "/dashboard";
  }

  // Category dashboard permissions.
  if (
    normalized === "/dashboard/categories" ||
    normalized.startsWith("/dashboard/categories/")
  ) {
    return canManageProducts(role)
      ? null
      : "/dashboard";
  }

  // Brand dashboard permissions.
  if (
    normalized === "/dashboard/brands" ||
    normalized.startsWith("/dashboard/brands/")
  ) {
    return canManageProducts(role)
      ? null
      : "/dashboard";
  }

  // Variant dashboard permissions.
  if (
    normalized === "/dashboard/variants" ||
    normalized.startsWith("/dashboard/variants/")
  ) {
    return canManageProducts(role)
      ? null
      : "/dashboard";
  }

  // Super Admin can access all dashboard routes.
  if (role === ROLE.SUPER_ADMIN) {
    return null;
  }

  const allowedDashboardRoutes =
    dashboardAccessByRole[role];

  if (
    !allowedDashboardRoutes ||
    allowedDashboardRoutes.some((route) =>
      matchesPath(normalized, route)
    )
  ) {
    return null;
  }

  return "/dashboard";
}