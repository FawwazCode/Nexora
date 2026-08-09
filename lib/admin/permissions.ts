const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  CATALOG_ADMIN: "CATALOG_ADMIN",
  ORDER_SPECIALIST: "ORDER_SPECIALIST",
} as const;

export function assertSuperAdmin(role?: string | null) {
  if (role !== ROLES.SUPER_ADMIN) {
    throw new Error("Forbidden");
  }
}

export function canManageProducts(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.CATALOG_ADMIN
  );
}

export function canManageOrders(role?: string | null) {
  return (
    role === ROLES.SUPER_ADMIN ||
    role === ROLES.ORDER_SPECIALIST
  );
}