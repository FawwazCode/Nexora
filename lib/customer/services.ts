import { Prisma, StockMovementType, OrderStatus, PaymentStatus, ShipmentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function getCustomerCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  thumbnail: true,
                  isPublished: true,
                  isDeleted: true,
                },
              },
              images: true,
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                    thumbnail: true,
                    isPublished: true,
                    isDeleted: true,
                  },
                },
                images: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  const items = cart.items.map((item) => {
    const price = Number(item.variant.price);
    const subtotal = price * item.quantity;
    const thumbnail = item.variant.images[0]?.imageUrl || item.variant.product.thumbnail || null;

    return {
      id: item.id,
      variantId: item.variantId,
      productId: item.variant.productId,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      thumbnail,
      sku: item.variant.sku,
      color: item.variant.color,
      price,
      stock: item.variant.stock,
      quantity: item.quantity,
      subtotal,
      isActive: item.variant.isActive && item.variant.product.isPublished && !item.variant.product.isDeleted,
    };
  });

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const grandTotal = items.reduce((acc, item) => acc + item.subtotal, 0);

  return {
    cartId: cart.id,
    items,
    totalQuantity,
    grandTotal,
  };
}

export async function getCartItemsCount(userId: string): Promise<number> {
  const cart = await prisma.cart.findUnique({
    where: { userId },
    select: {
      items: {
        select: { quantity: true },
      },
    },
  });

  if (!cart) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}

export async function addToCart(userId: string, input: { variantId: string; quantity: number }) {
  const variant = await prisma.productVariant.findUnique({
    where: { id: input.variantId },
    include: { product: true },
  });

  if (!variant || !variant.isActive) {
    throw new Error("Product variant is no longer available");
  }

  if (!variant.product || !variant.product.isPublished || variant.product.isDeleted) {
    throw new Error("Product is no longer available");
  }

  if (variant.stock <= 0) {
    throw new Error("Product is out of stock");
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, variantId: input.variantId },
  });

  const targetQuantity = (existingItem?.quantity ?? 0) + input.quantity;

  if (targetQuantity > variant.stock) {
    throw new Error(`Stock not sufficient. Maximum available: ${variant.stock}`);
  }

  if (existingItem) {
    return prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: targetQuantity },
    });
  }

  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      variantId: input.variantId,
      quantity: input.quantity,
    },
  });
}

export async function updateCartItemQuantity(userId: string, cartItemId: string, quantity: number) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: {
      cart: true,
      variant: { include: { product: true } },
    },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new Error("Cart item not found");
  }

  if (quantity <= 0) {
    return prisma.cartItem.delete({ where: { id: cartItemId } });
  }

  const variant = cartItem.variant;
  if (!variant || !variant.isActive || !variant.product || !variant.product.isPublished || variant.product.isDeleted) {
    throw new Error("Product is no longer available");
  }

  if (quantity > variant.stock) {
    throw new Error(`Quantity exceeds available stock (${variant.stock})`);
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
  });
}

export async function removeCartItem(userId: string, cartItemId: string) {
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true },
  });

  if (!cartItem || cartItem.cart.userId !== userId) {
    throw new Error("Cart item not found");
  }

  return prisma.cartItem.delete({ where: { id: cartItemId } });
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return { count: 0 };

  return prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
}

export async function createOrderFromCart(
  userId: string,
  checkoutData: {
    receiverName: string;
    phone: string;
    fullAddress: string;
    province: string;
    city: string;
    district?: string;
    postalCode: string;
    notes?: string;
  }
) {
  return prisma.$transaction(
    async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: {
          items: {
            include: {
              variant: {
                include: { product: true },
              },
            },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Your cart is empty");
      }

      for (const item of cart.items) {
        const variant = item.variant;

        if (!variant || !variant.isActive) {
          throw new Error("Stock has changed. Please review your cart.");
        }

        if (!variant.product || !variant.product.isPublished || variant.product.isDeleted) {
          throw new Error("Stock has changed. Please review your cart.");
        }

        if (variant.stock < item.quantity) {
          throw new Error("Stock has changed. Please review your cart.");
        }
      }

      const subtotalNumber = cart.items.reduce(
        (sum, item) => sum + item.quantity * Number(item.variant.price),
        0
      );

      const shippingCostNumber = 0; // Default shipping cost
      const grandTotalNumber = subtotalNumber + shippingCostNumber;

      const address = await tx.address.create({
        data: {
          userId,
          label: "Shipping Address",
          receiverName: checkoutData.receiverName,
          phone: checkoutData.phone,
          province: checkoutData.province,
          city: checkoutData.city,
          district: checkoutData.district || "District",
          postalCode: checkoutData.postalCode,
          fullAddress: checkoutData.fullAddress,
          isDefault: false,
        },
      });

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `NXR-${dateStr}-${randomSuffix}`;

      const order = await tx.order.create({
        data: {
          userId,
          addressId: address.id,
          orderNumber,
          subtotal: subtotalNumber,
          shippingCost: shippingCostNumber,
          grandTotal: grandTotalNumber,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          shipmentStatus: ShipmentStatus.NOT_YET_SHIPPED,
          items: {
            createMany: {
              data: cart.items.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                price: item.variant.price,
              })),
            },
          },
        },
      });

      for (const item of cart.items) {
        const updateResult = await tx.productVariant.updateMany({
          where: {
            id: item.variantId,
            isActive: true,
            stock: {
              gte: item.quantity,
            },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error("Stock has changed. Please review your cart.");
        }

        const freshVariant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          select: { stock: true },
        });

        const stockAfter = freshVariant?.stock ?? 0;
        const stockBefore = stockAfter + item.quantity;

        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            userId,
            type: StockMovementType.OUT,
            quantity: item.quantity,
            stockBefore,
            stockAfter,
            note: `Customer Order ${orderNumber}`,
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return order;
    },
    { maxWait: 5000, timeout: 10000 }
  );
}

export async function processManualPayment(userId: string, orderId: string, amountInput: number) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: { payment: true },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.paymentStatus === PaymentStatus.PAID) {
      throw new Error("This order has already been paid.");
    }

    const grandTotal = Number(order.grandTotal);

    if (amountInput < grandTotal) {
      throw new Error("Nominal pembayaran kurang");
    }

    const changeAmount = amountInput - grandTotal;

    const updatedOrder = await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
      },
    });

    const payment = await tx.payment.upsert({
      where: { orderId },
      update: {
        method: "MANUAL",
        status: PaymentStatus.PAID,
        amount: grandTotal,
        paidAmount: amountInput,
        changeAmount: changeAmount,
        paidAt: new Date(),
        note: "Manual Payment Verification",
      },
      create: {
        orderId,
        method: "MANUAL",
        status: PaymentStatus.PAID,
        amount: grandTotal,
        paidAmount: amountInput,
        changeAmount: changeAmount,
        paidAt: new Date(),
        note: "Manual Payment Verification",
      },
    });

    return {
      order: updatedOrder,
      payment,
      changeAmount,
    };
  });
}

export async function listCustomerOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      address: true,
      payment: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  thumbnail: true,
                },
              },
              images: true,
            },
          },
        },
      },
    },
  });
}

export async function getCustomerOrderDetail(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      address: true,
      payment: true,
      shipment: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  thumbnail: true,
                },
              },
              images: true,
            },
          },
        },
      },
    },
  });

  return order;
}

