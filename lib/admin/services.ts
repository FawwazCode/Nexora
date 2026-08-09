import { Prisma, Role, OrderStatus, PaymentStatus, ShipmentStatus, StockMovementType } from "@prisma/client";
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

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id, isDeleted: false },
    include: productInclude,
  });
}

export async function createProduct(input: {
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  brandId?: string;
  categoryId?: string;
  brandName?: string;
  categoryName?: string;
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
    let brandId = input.brandId?.trim();
    if (!brandId && input.brandName?.trim()) {
      const brandName = input.brandName.trim();
      const brandSlug = brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
      const brand = await tx.brand.upsert({
        where: { slug: brandSlug },
        update: { name: brandName },
        create: { name: brandName, slug: brandSlug },
      });
      brandId = brand.id;
    }
    if (!brandId) {
      const defaultBrand = await tx.brand.upsert({
        where: { slug: "nexora" },
        update: {},
        create: { name: "Nexora", slug: "nexora" },
      });
      brandId = defaultBrand.id;
    }

    let categoryId = input.categoryId?.trim();
    if (!categoryId && input.categoryName?.trim()) {
      const categoryName = input.categoryName.trim();
      const categorySlug = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
      const category = await tx.category.upsert({
        where: { slug: categorySlug },
        update: { name: categoryName },
        create: { name: categoryName, slug: categorySlug, description: "Created from admin form" },
      });
      categoryId = category.id;
    }
    if (!categoryId) {
      const defaultCategory = await tx.category.upsert({
        where: { slug: "general" },
        update: {},
        create: { name: "General", slug: "general", description: "Default category" },
      });
      categoryId = defaultCategory.id;
    }

    const product = await tx.product.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: input.description,
        shortDescription: input.shortDescription ?? null,
        thumbnail: input.thumbnail || null,
        brandId,
        categoryId: categoryId || null,
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
  thumbnail?: string;
  brandId?: string;
  categoryId?: string;
  brandName?: string;
  categoryName?: string;
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

    let brandId = input.brandId?.trim();
    if (!brandId && input.brandName?.trim()) {
      const brandName = input.brandName.trim();
      const brandSlug = brandName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "brand";
      const brand = await tx.brand.upsert({
        where: { slug: brandSlug },
        update: { name: brandName },
        create: { name: brandName, slug: brandSlug },
      });
      brandId = brand.id;
    }

    let categoryId = input.categoryId?.trim();
    if (!categoryId && input.categoryName?.trim()) {
      const categoryName = input.categoryName.trim();
      const categorySlug = categoryName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "category";
      const category = await tx.category.upsert({
        where: { slug: categorySlug },
        update: { name: categoryName },
        create: { name: categoryName, slug: categorySlug, description: "Created from admin form" },
      });
      categoryId = category.id;
    }

    const product = await tx.product.update({
      where: { id: input.id },
      data: {
        ...(input.name ? { name: input.name } : {}),
        ...(input.slug ? { slug: input.slug } : {}),
        ...(input.description ? { description: input.description } : {}),
        ...(input.shortDescription !== undefined ? { shortDescription: input.shortDescription || null } : {}),
        ...(input.thumbnail !== undefined ? { thumbnail: input.thumbnail || null } : {}),
        ...(brandId !== undefined ? { brandId } : {}),
        ...(categoryId !== undefined ? { categoryId: categoryId || null } : {}),
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

export async function getCategoryById(id: string) {
  return prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: { _count: { select: { products: true } } },
  });
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

export async function updateOrderStatus(id: string, newStatus: OrderStatus) {
  const existingOrder = await prisma.order.findUnique({ where: { id } });
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const currentStatus = existingOrder.status;

  const validTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: [OrderStatus.PAID, OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    PAID: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    PROCESSING: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
    SHIPPED: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
    DELIVERED: [],
    CANCELLED: [],
  };

  if (currentStatus !== newStatus && !validTransitions[currentStatus]?.includes(newStatus)) {
    throw new Error(`Invalid order status transition from ${currentStatus} to ${newStatus}`);
  }

  return prisma.order.update({
    where: { id },
    data: { status: newStatus },
  });
}

export async function adminUpdatePaymentStatus(id: string, paymentStatus: PaymentStatus, note?: string) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    if (existingOrder.paymentStatus === PaymentStatus.PAID && paymentStatus === PaymentStatus.PENDING) {
      throw new Error("Cannot change payment status from PAID to PENDING");
    }

    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        paymentStatus,
        ...(paymentStatus === PaymentStatus.PAID && existingOrder.status === OrderStatus.PENDING
          ? { status: OrderStatus.PROCESSING }
          : {}),
      },
    });

    const grandTotal = Number(existingOrder.grandTotal);

    await tx.payment.upsert({
      where: { orderId: id },
      update: {
        method: "MANUAL",
        status: paymentStatus,
        amount: grandTotal,
        paidAmount: existingOrder.payment?.paidAmount || grandTotal,
        changeAmount: existingOrder.payment?.changeAmount || 0,
        paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : null,
        note: note || "Admin Manual Verification",
      },
      create: {
        orderId: id,
        method: "MANUAL",
        status: paymentStatus,
        amount: grandTotal,
        paidAmount: grandTotal,
        changeAmount: 0,
        paidAt: paymentStatus === PaymentStatus.PAID ? new Date() : null,
        note: note || "Admin Manual Verification",
      },
    });

    return updatedOrder;
  });
}

export async function adminUpdateShipmentStatus(
  id: string,
  shipmentStatus: ShipmentStatus,
  trackingNumber?: string,
  courierId?: string
) {
  return prisma.$transaction(async (tx) => {
    const existingOrder = await tx.order.findUnique({
      where: { id },
      include: { shipment: true },
    });

    if (!existingOrder) {
      throw new Error("Order not found");
    }

    const currentShipmentStatus = existingOrder.shipmentStatus;

    const validShipmentTransitions: Record<ShipmentStatus, ShipmentStatus[]> = {
      NOT_YET_SHIPPED: [ShipmentStatus.SHIPPED, ShipmentStatus.IN_TRANSIT, ShipmentStatus.HAS_ARRIVED],
      SHIPPED: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.HAS_ARRIVED],
      IN_TRANSIT: [ShipmentStatus.HAS_ARRIVED],
      HAS_ARRIVED: [],
    };

    if (currentShipmentStatus !== shipmentStatus && !validShipmentTransitions[currentShipmentStatus]?.includes(shipmentStatus)) {
      throw new Error(`Invalid shipment status transition from ${currentShipmentStatus} to ${shipmentStatus}`);
    }

    let targetOrderStatus = existingOrder.status;
    if (shipmentStatus === ShipmentStatus.SHIPPED || shipmentStatus === ShipmentStatus.IN_TRANSIT) {
      targetOrderStatus = OrderStatus.SHIPPED;
    } else if (shipmentStatus === ShipmentStatus.HAS_ARRIVED) {
      targetOrderStatus = OrderStatus.DELIVERED;
    }

    const updatedOrder = await tx.order.update({
      where: { id },
      data: {
        shipmentStatus,
        status: targetOrderStatus,
      },
    });

    let activeCourierId = courierId?.trim();
    if (!activeCourierId) {
      if (existingOrder.shipment?.courierId) {
        activeCourierId = existingOrder.shipment.courierId;
      } else {
        let defaultCourier = await tx.courier.findFirst({ where: { isActive: true } });
        if (!defaultCourier) {
          defaultCourier = await tx.courier.create({
            data: { name: "Standard Express", code: "STD", isActive: true },
          });
        }
        activeCourierId = defaultCourier.id;
      }
    }

    const finalTrackingNumber = trackingNumber?.trim() || existingOrder.shipment?.trackingNumber || `NXR-TRK-${Date.now()}`;

    if (existingOrder.shipment) {
      await tx.shipment.update({
        where: { orderId: id },
        data: {
          status: shipmentStatus,
          courierId: activeCourierId,
          trackingNumber: finalTrackingNumber,
          ...(shipmentStatus === ShipmentStatus.SHIPPED && !existingOrder.shipment.shippedAt ? { shippedAt: new Date() } : {}),
          ...(shipmentStatus === ShipmentStatus.HAS_ARRIVED ? { deliveredAt: new Date() } : {}),
        },
      });
    } else {
      await tx.shipment.create({
        data: {
          orderId: id,
          courierId: activeCourierId,
          trackingNumber: finalTrackingNumber,
          status: shipmentStatus,
          shippedAt: (shipmentStatus === ShipmentStatus.SHIPPED || shipmentStatus === ShipmentStatus.IN_TRANSIT) ? new Date() : null,
          deliveredAt: shipmentStatus === ShipmentStatus.HAS_ARRIVED ? new Date() : null,
        },
      });
    }

    return updatedOrder;
  });
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

export async function listBrands(input: SearchInput) {
  const where: Prisma.BrandWhereInput = input.search
    ? { name: { contains: input.search, mode: "insensitive" } }
    : {};

  const [items, total] = await Promise.all([
    prisma.brand.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    prisma.brand.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function getBrandById(id: string) {
  return prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
}

export async function createBrand(input: { name: string; slug: string; logo?: string }) {
  return prisma.brand.create({
    data: {
      name: input.name,
      slug: input.slug,
      logo: input.logo || null,
    },
  });
}

export async function updateBrand(input: { id: string; name?: string; slug?: string; logo?: string }) {
  const { id, ...data } = input;
  return prisma.brand.update({
    where: { id },
    data,
  });
}

export async function deleteBrand(id: string) {
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (brand && brand._count.products > 0) {
    throw new Error("Cannot delete brand that has associated products");
  }

  return prisma.brand.delete({ where: { id } });
}

export async function listProductVariants(input: SearchInput & { productId?: string }) {
  const where: Prisma.ProductVariantWhereInput = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.search
      ? {
          OR: [
            { sku: { contains: input.search, mode: "insensitive" } },
            { color: { contains: input.search, mode: "insensitive" } },
            { product: { name: { contains: input.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.productVariant.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function getVariantById(id: string) {
  return prisma.productVariant.findUnique({
    where: { id },
    include: {
      product: { select: { id: true, name: true, slug: true } },
    },
  });
}

export async function createProductVariant(input: {
  productId: string;
  sku: string;
  barcode?: string;
  color: string;
  ram: string;
  storage: string;
  weight?: number;
  price: number;
  stock: number;
  isActive?: boolean;
}) {
  return prisma.productVariant.create({
    data: {
      productId: input.productId,
      sku: input.sku,
      barcode: input.barcode || null,
      color: input.color,
      ram: input.ram,
      storage: input.storage,
      weight: input.weight || null,
      price: input.price,
      stock: input.stock,
      isActive: input.isActive ?? true,
    },
  });
}

export async function updateProductVariant(input: {
  id: string;
  sku?: string;
  barcode?: string;
  color?: string;
  ram?: string;
  storage?: string;
  weight?: number;
  price?: number;
  stock?: number;
  isActive?: boolean;
}) {
  const { id, ...data } = input;
  return prisma.productVariant.update({
    where: { id },
    data,
  });
}

export async function deleteProductVariant(id: string) {
  return prisma.productVariant.delete({ where: { id } });
}

export async function listInventoryItems(input: SearchInput & {
  status?: "all" | "low_stock" | "out_of_stock" | "in_stock";
  categoryId?: string;
}) {
  const where: Prisma.ProductVariantWhereInput = {
    product: {
      isDeleted: false,
      ...(input.categoryId ? { categoryId: input.categoryId } : {}),
    },
    ...(input.search
      ? {
          OR: [
            { sku: { contains: input.search, mode: "insensitive" } },
            { barcode: { contains: input.search, mode: "insensitive" } },
            { color: { contains: input.search, mode: "insensitive" } },
            { product: { name: { contains: input.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  if (input.status === "low_stock") {
    where.stock = { gt: 0, lte: 5 };
  } else if (input.status === "out_of_stock") {
    where.stock = 0;
  } else if (input.status === "in_stock") {
    where.stock = { gt: 5 };
  }

  const [items, total, totalVariants, totalStockAggregate, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.productVariant.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { stock: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            category: { select: { id: true, name: true } },
            brand: { select: { id: true, name: true } },
          },
        },
      },
    }),
    prisma.productVariant.count({ where }),
    prisma.productVariant.count({ where: { product: { isDeleted: false } } }),
    prisma.productVariant.aggregate({
      _sum: { stock: true },
      where: { product: { isDeleted: false } },
    }),
    prisma.productVariant.count({
      where: { stock: { gt: 0, lte: 5 }, product: { isDeleted: false } },
    }),
    prisma.productVariant.count({
      where: { stock: 0, product: { isDeleted: false } },
    }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    summary: {
      totalVariants,
      totalStock: totalStockAggregate._sum.stock ?? 0,
      lowStockCount,
      outOfStockCount,
    },
  };
}

export async function adjustStock(input: {
  variantId: string;
  type: StockMovementType;
  quantity: number;
  userId: string;
  note?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.findUnique({
      where: { id: input.variantId },
      include: { product: true },
    });

    if (!variant) {
      throw new Error("Product variant not found");
    }

    const stockBefore = variant.stock;
    let stockAfter = stockBefore;
    let quantityDelta = Math.abs(input.quantity);

    if (input.type === StockMovementType.IN) {
      if (input.quantity <= 0) {
        throw new Error("Quantity for IN adjustment must be greater than 0");
      }
      quantityDelta = input.quantity;
      stockAfter = stockBefore + quantityDelta;
    } else if (input.type === StockMovementType.OUT) {
      if (input.quantity <= 0) {
        throw new Error("Quantity for OUT adjustment must be greater than 0");
      }
      quantityDelta = input.quantity;
      stockAfter = stockBefore - quantityDelta;
      if (stockAfter < 0) {
        throw new Error(`Insufficient stock. Current stock is ${stockBefore}, requested reduction is ${quantityDelta}`);
      }
    } else if (input.type === StockMovementType.ADJUSTMENT) {
      if (input.quantity < 0) {
        throw new Error("Target stock quantity for ADJUSTMENT cannot be negative");
      }
      stockAfter = input.quantity;
      quantityDelta = Math.abs(stockAfter - stockBefore);
    }

    const updatedVariant = await tx.productVariant.update({
      where: { id: input.variantId },
      data: { stock: stockAfter },
    });

    const noteText =
      input.note?.trim() ||
      `Manual stock adjustment (${input.type}): ${stockBefore} -> ${stockAfter}`;

    const movement = await tx.stockMovement.create({
      data: {
        variantId: input.variantId,
        userId: input.userId,
        type: input.type,
        quantity: quantityDelta,
        stockBefore,
        stockAfter,
        note: noteText,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        variant: {
          include: { product: { select: { id: true, name: true } } },
        },
      },
    });

    await tx.activityLog.create({
      data: {
        userId: input.userId,
        module: "INVENTORY",
        action: `STOCK_${input.type}`,
        description: `Adjusted stock for SKU ${variant.sku} (${variant.product.name}): ${stockBefore} -> ${stockAfter}. Note: ${noteText}`,
      },
    });

    return { variant: updatedVariant, movement };
  });
}

export async function listStockMovements(input: SearchInput & {
  variantId?: string;
  type?: StockMovementType;
}) {
  const where: Prisma.StockMovementWhereInput = {
    ...(input.variantId ? { variantId: input.variantId } : {}),
    ...(input.type ? { type: input.type } : {}),
    ...(input.search
      ? {
          OR: [
            { note: { contains: input.search, mode: "insensitive" } },
            { variant: { sku: { contains: input.search, mode: "insensitive" } } },
            { variant: { product: { name: { contains: input.search, mode: "insensitive" } } } },
            { user: { name: { contains: input.search, mode: "insensitive" } } },
            { user: { email: { contains: input.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        variant: {
          select: {
            id: true,
            sku: true,
            color: true,
            ram: true,
            storage: true,
            product: { select: { id: true, name: true, thumbnail: true } },
          },
        },
      },
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return { items, total, page: input.page, pageSize: input.pageSize };
}

export async function listCouriers() {
  const couriers = await prisma.courier.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  if (couriers.length === 0) {
    await prisma.courier.createMany({
      data: [
        { name: "JNE Express", code: "JNE", isActive: true },
        { name: "J&T Express", code: "JNT", isActive: true },
        { name: "SiCepat Express", code: "SICEPAT", isActive: true },
        { name: "FedEx", code: "FEDEX", isActive: true },
        { name: "DHL Express", code: "DHL", isActive: true },
      ],
      skipDuplicates: true,
    });

    return prisma.courier.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });
  }

  return couriers;
}

export async function listShippingOrders(input: SearchInput & {
  shipmentStatus?: "ALL" | "NOT_YET_SHIPPED" | "SHIPPED" | "IN_TRANSIT" | "HAS_ARRIVED";
}) {
  const where: Prisma.OrderWhereInput = {
    OR: [
      { paymentStatus: PaymentStatus.PAID },
      { status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED] } },
    ],
    ...(input.shipmentStatus && input.shipmentStatus !== "ALL"
      ? { shipmentStatus: input.shipmentStatus as ShipmentStatus }
      : {}),
    ...(input.search
      ? {
          OR: [
            { orderNumber: { contains: input.search, mode: "insensitive" } },
            { address: { receiverName: { contains: input.search, mode: "insensitive" } } },
            { user: { name: { contains: input.search, mode: "insensitive" } } },
            { user: { email: { contains: input.search, mode: "insensitive" } } },
            { shipment: { trackingNumber: { contains: input.search, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [items, total, notYetShippedCount, shippedCount, inTransitCount, hasArrivedCount] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        address: true,
        shipment: {
          include: { courier: true },
        },
        items: {
          include: {
            variant: {
              select: {
                id: true,
                sku: true,
                color: true,
                ram: true,
                storage: true,
                product: { select: { name: true, thumbnail: true } },
              },
            },
          },
        },
      },
    }),
    prisma.order.count({ where }),
    prisma.order.count({
      where: {
        ...where,
        shipmentStatus: ShipmentStatus.NOT_YET_SHIPPED,
      },
    }),
    prisma.order.count({
      where: {
        ...where,
        shipmentStatus: ShipmentStatus.SHIPPED,
      },
    }),
    prisma.order.count({
      where: {
        ...where,
        shipmentStatus: ShipmentStatus.IN_TRANSIT,
      },
    }),
    prisma.order.count({
      where: {
        ...where,
        shipmentStatus: ShipmentStatus.HAS_ARRIVED,
      },
    }),
  ]);

  return {
    items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    summary: {
      notYetShippedCount,
      shippedCount,
      inTransitCount,
      hasArrivedCount,
    },
  };
}

