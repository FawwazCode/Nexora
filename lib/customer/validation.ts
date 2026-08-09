import { z } from "zod";

export const addToCartSchema = z.object({
  variantId: z.string().min(1, "Variant ID is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
});

export const checkoutSchema = z.object({
  receiverName: z.string().trim().min(2, "Receiver name must be at least 2 characters"),
  phone: z.string().trim().min(6, "Phone number must be at least 6 characters"),
  fullAddress: z.string().trim().min(5, "Full address must be at least 5 characters"),
  province: z.string().trim().min(2, "Province is required"),
  city: z.string().trim().min(2, "City is required"),
  district: z.string().trim().optional().default("District"),
  postalCode: z.string().trim().min(3, "Postal code is required"),
  notes: z.string().trim().optional(),
});
