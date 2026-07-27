import { Prisma, Role, OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AdminDashboardSummary, PaginationInput, SearchInput } from "@/lib/admin/types";

const productInclude = {
  brand: {
    select: { id: true, name: true },
  },
  category: {
    select: { id: true, name: true },
  },
  variants: {
    select: { id: true, price: true, stock: true, sku: true, isActive: true },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const [totalProducts, totalCategories, totalCustomers, totalOrders, totalRevenue, pendingOrders, completedOrders, lowStockProducts] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.category.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { role: Role.CUSTOMER, isActive: true } }),
    prisma.order.count(),
    prisma.order.aggregate({
      _sum: { grandTotal: true },
      where: { paymentStatus: PaymentStatus.PAID },
    }),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
    prisma.productVariant.count({ where: { stock: { lte: 5 }, isActive: true } }),
  ]);

  return {
    totalProducts,
    totalCategories,
    totalCustomers,
    totalOrders,
    totalRevenue: Number(totalRevenue._sum.grandTotal ?? 0),
    pendingOrders,
    completedOrders,
    lowStockProducts,
  };
}

export async function getAdminRecentOrders(limit = 5) {
  return prisma.order.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { select: { quantity: true, price: true } },
    },
  });
}

export async function getAdminRecentCustomers(limit = 5) {
  return prisma.user.findMany({
    take: limit,
    where: { role: Role.CUSTOMER },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      isActive: true,
    },
  });
}

export async function getAdminLowStockProducts(limit = 5) {
  return prisma.productVariant.findMany({
    take: limit,
    where: { stock: { lte: 5 }, isActive: true },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { stock: "asc" },
  });
}

export async function getAdminBestSellingProducts(limit = 5) {
  const items = await prisma.orderItem.groupBy({
    by: ["variantId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const variantIds = items.map((item) => item.variantId);

  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });

  return variants.map((variant) => ({
    ...variant,
    soldQuantity: items.find((item) => item.variantId === variant.id)?._sum.quantity ?? 0,
  }));
}

export async function listProducts(input: SearchInput & { status?: "published" | "draft"; categoryId?: string | null; brandId?: string | null; isFeatured?: boolean }) {
  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    ...(input.search ? { name: { contains: input.search, mode: "insensitive" } } : {}),
    ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    ...(input.brandId ? { brandId: input.brandId } : {}),
    ...(input.status ? { isPublished: input.status === "published" } : {}),
    ...(typeof input.isFeatured === "boolean" ? { isFeatured: input.isFeatured } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function createProduct(input: {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  brandId: string;
  categoryId?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  sku: string;
  price: number;
  stock: number;
  color?: string;
  ram?: string;
  storage?: string;
  barcode?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        shortDescription: input.shortDescription ?? null,
        brandId: input.brandId,
        categoryId: input.categoryId || null,
        isFeatured: input.isFeatured ?? false,
        isPublished: input.isPublished ?? false,
      },
    });

    await tx.productVariant.create({
      data: {
        productId: product.id,
        sku: input.sku,
        price: input.price,
        stock: input.stock,
        color: input.color ?? "Default",
        ram: input.ram ?? "8GB",
        storage: input.storage ?? "256GB",
        barcode: input.barcode || null,
      },
    });

    return product;
  });
}

export async function updateProduct(input: {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  brandId?: string;
  categoryId?: string;
  isFeatured?: boolean;
  isPublished?: boolean;
  sku?: string;
  price?: number;
  stock?: number;
  color?: string;
  ram?: string;
  storage?: string;
  barcode?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id: input.id } });
    if (!existing) {
      throw new Error("Product not found");
    }

    const product = await tx.product.update({
      where: { id: input.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription || null } : {}),
        ...(input.brandId ? { brandId: input.brandId } : {}),
        ...(input.categoryId !== undefined ? { categoryId: input.categoryId || null } : {}),
        ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
        ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      },
    });

    const variant = await tx.productVariant.findFirst({ where: { productId: input.id } });

    if (variant && (input.sku !== undefined || input.price !== undefined || input.stock !== undefined || input.color !== undefined || input.ram !== undefined || input.storage !== undefined || input.barcode !== undefined)) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: {
          ...(input.sku ? { sku: input.sku } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.stock !== undefined ? { stock: input.stock } : {}),
          ...(input.color ? { color: input.color } : {}),
          ...(input.ram ? { ram: input.ram } : {}),
          ...(input.storage ? { storage: input.storage } : {}),
          ...(input.barcode !== undefined ? { barcode: input.barcode || null } : {}),
        },
      });
    }

    return product;
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isDeleted: true } });
}

export async function restoreProduct(id: string) {
  return prisma.product.update({ where: { id }, data: { isDeleted: false } });
}

export async function listCategories(input: SearchInput) {
  const where: Prisma.CategoryWhereInput = {
    isDeleted: false,
    ...(input.search ? { name: { contains: input.search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { products: true } } },
    }),
    prisma.category.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function createCategory(input: { name: string; slug: string; description?: string; isActive?: boolean }) {
  return prisma.category.create({ data: { name: input.name, slug: input.slug, description: input.description ?? null, isActive: input.isActive ?? true } });
}

export async function updateCategory(input: { id: string; name?: string; slug?: string; description?: string; isActive?: boolean }) {
  return prisma.category.update({ where: { id: input.id }, data: { ...(input.name ? { name: input.name } : {}), ...(input.slug ? { slug: input.slug } : {}), ...(input.description !== undefined ? { description: input.description || null } : {}), ...(input.isActive !== undefined ? { isActive: input.isActive } : {}) } });
}

export async function deleteCategory(id: string) {
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error("Cannot delete category with existing products");
  }

  return prisma.category.update({ where: { id }, data: { isDeleted: true } });
}

export async function listCustomers(input: SearchInput & { status?: "active" | "inactive" }) {
  const where: Prisma.UserWhereInput = {
    role: Role.CUSTOMER,
    ...(input.search ? { OR: [{ name: { contains: input.search, mode: "insensitive" } }, { email: { contains: input.search, mode: "insensitive" } }] } : {}),
    ...(input.status ? { isActive: input.status === "active" } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        isActive: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function getCustomerDetail(id: string) {
  return prisma.user.findFirst({
    where: { id, role: Role.CUSTOMER },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        include: { items: true },
      },
      addresses: true,
    },
  });
}

export async function toggleCustomerStatus(id: string, isActive: boolean) {
  return prisma.user.update({ where: { id }, data: { isActive } });
}

export async function listOrders(input: SearchInput & { status?: OrderStatus; paymentStatus?: PaymentStatus }) {
  const where: Prisma.OrderWhereInput = {
    ...(input.search ? { OR: [{ orderNumber: { contains: input.search, mode: "insensitive" } }, { user: { name: { contains: input.search, mode: "insensitive" } } }, { user: { email: { contains: input.search, mode: "insensitive" } } }] } : {}),
    ...(input.status ? { status: input.status } : {}),
    ...(input.paymentStatus ? { paymentStatus: input.paymentStatus } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { select: { quantity: true, price: true, variant: { select: { product: { select: { name: true } } } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function getOrderDetail(id: string) {
  return prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      address: true,
      payment: true,
      shipment: true,
      items: { include: { variant: { include: { product: { select: { name: true, slug: true } } } } } },
    },
  });
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return prisma.order.update({ where: { id }, data: { status } });
}

export async function getAdminReports() {
  const [revenue, monthlySales, totalOrders, bestSellingProducts, newCustomers] = await Promise.all([
    prisma.order.aggregate({ _sum: { grandTotal: true }, where: { paymentStatus: PaymentStatus.PAID } }),
    prisma.order.groupBy({
      by: ["createdAt"],
      _sum: { grandTotal: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.order.count(),
    getAdminBestSellingProducts(5),
    prisma.user.count({ where: { role: Role.CUSTOMER, createdAt: { gte: new Date(new Date().setDate(new Date().getDate() - 30)) } } }),
  ]);

  return {
    revenue: Number(revenue._sum.grandTotal ?? 0),
    monthlySales,
    totalOrders,
    bestSellingProducts,
    newCustomers,
  };
}

export async function getStoreSettings() {
  return prisma.storeSetting.findFirst();
}

export async function upsertStoreSettings(input: {
  storeName?: string;
  storeTagline?: string;
  storeLogo?: string;
  supportEmail?: string;
  supportPhone?: string;
  taxRate?: number;
  shippingFee?: number;
  currency?: string;
}) {
  const existing = await prisma.storeSetting.findFirst();
  if (existing) {
    return prisma.storeSetting.update({ where: { id: existing.id }, data: input });
  }

  return prisma.storeSetting.create({ data: input });
}

export async function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateUserRole(id: string, role: Role) {
  return prisma.user.update({ where: { id }, data: { role } });
}
