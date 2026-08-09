import { Role } from "@prisma/client";
import { canManageProducts } from "../lib/admin/permissions";
import { canAccessRoute, getDashboardRedirect } from "../lib/rbac";

const expectations = [
  { role: Role.SUPER_ADMIN, expectedProducts: true, expectedDashboard: true, path: "/dashboard/products" },
  { role: Role.CATALOG_ADMIN, expectedProducts: true, expectedDashboard: true, path: "/dashboard/products" },
  { role: Role.CATALOG_ADMIN, expectedProducts: true, expectedDashboard: true, path: "/api/admin/products" },
];

for (const item of expectations) {
  if (canManageProducts(item.role) !== item.expectedProducts) {
    throw new Error(`canManageProducts(${item.role}) expected ${item.expectedProducts}, received ${canManageProducts(item.role)}`);
  }

  const routeAccess = canAccessRoute(item.path, item.role);
  if (routeAccess !== item.expectedDashboard) {
    throw new Error(`canAccessRoute(${item.path}, ${item.role}) expected ${item.expectedDashboard}, received ${routeAccess}`);
  }

  const redirect = getDashboardRedirect(item.path, item.role);
  if (item.expectedDashboard && redirect !== null) {
    throw new Error(`getDashboardRedirect(${item.path}, ${item.role}) expected null, received ${redirect}`);
  }
}

console.log("verification-ok");
