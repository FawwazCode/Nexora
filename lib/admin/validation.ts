import { z } from "zod";
import { OrderStatus, PaymentStatus, Role, ShipmentStatus } from "@prisma/client";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const searchQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().optional().or(z.literal("")),
  brandId: z.string().min(1),
  categoryId: z.string().min(1).optional().or(z.literal("")),
  isFeatured: z.coerce.boolean().default(false),
  isPublished: z.coerce.boolean().default(false),
  sku: z.string().trim().min(1),
  price: z.coerce.number().nonnegative(),
  stock: z.coerce.number().int().nonnegative(),
  color: z.string().trim().min(1).default("Default"),
  ram: z.string().trim().default("8GB"),
  storage: z.string().trim().default("256GB"),
  barcode: z.string().trim().optional().or(z.literal("")),
});

export const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  description: z.string().trim().optional().or(z.literal("")),
  isActive: z.coerce.boolean().default(true),
});

export const categoryUpdateSchema = categoryCreateSchema.partial().extend({
  id: z.string().min(1),
});

export const customerListSchema = searchQuerySchema.extend({
  status: z.enum(["active", "inactive"]).optional(),
});

export const orderListSchema = searchQuerySchema.extend({
  status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
});

export const orderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const settingsSchema = z.object({
  storeName: z.string().trim().min(2).default("Nexora"),
  storeTagline: z.string().trim().optional().or(z.literal("")),
  storeLogo: z.string().trim().optional().or(z.literal("")),
  supportEmail: z.string().trim().email().optional().or(z.literal("")),
  supportPhone: z.string().trim().optional().or(z.literal("")),
  taxRate: z.coerce.number().nonnegative().optional(),
  shippingFee: z.coerce.number().nonnegative().optional(),
  currency: z.string().trim().min(3).default("USD"),
});

export const roleUpdateSchema = z.object({
  role: z.nativeEnum(Role),
});

export const customerToggleSchema = z.object({
  isActive: z.coerce.boolean(),
});
