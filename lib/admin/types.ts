import type { Prisma, Role } from "@prisma/client";

export type AdminRole = Role;

export type PaginationInput = {
  page: number;
  pageSize: number;
};

export type SearchInput = PaginationInput & {
  search?: string;
};

export type ProductListItem = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  variants: Array<{
    id: string;
    price: Prisma.Decimal;
    stock: number;
    sku: string;
    isActive: boolean;
  }>;
};

export type CategoryListItem = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  _count: { products: number };
};

export type AdminDashboardSummary = {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
};
