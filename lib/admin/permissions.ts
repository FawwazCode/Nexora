import { Role } from "@prisma/client";

export function assertSuperAdmin(role?: string | null) {
  if (role !== Role.SUPER_ADMIN) {
    throw new Error("Forbidden");
  }
}

export function canManageProducts(role?: string | null) {
  return role === Role.SUPER_ADMIN || role === Role.CATALOG_ADMIN;
}

export function canManageOrders(role?: string | null) {
  return role === Role.SUPER_ADMIN || role === Role.ORDER_SPECIALIST;
}
