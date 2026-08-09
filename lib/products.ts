import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { Product } from "@/components/product/types";

type ProductListInput = {
  search?: string;
  categorySlug?: string | null;
  priceRange?: string | null;
  sort?: string | null;
  page?: number;
  pageSize?: number;
};

const productInclude = {
  brand: {
    select: { id: true, name: true },
  },
  category: {
    select: { id: true, name: true, slug: true },
  },
  variants: {
    select: { id: true, price: true, stock: true, sku: true, isActive: true },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.ProductInclude;

function buildProductImage(label: string) {
  const svg = `
    <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" rx="64" fill="#F8FAFC"/>
      <circle cx="640" cy="150" r="180" fill="#7F46FA" fill-opacity="0.18"/>
      <rect x="190" y="210" width="420" height="360" rx="44" fill="white" fill-opacity="0.9"/>
      <text x="400" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#18181B">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function mapProduct(
  product: Prisma.ProductGetPayload<{ include: typeof productInclude }>
): Product {
  const primaryVariant = product.variants[0];
  const price = Number(primaryVariant?.price ?? 0);

  let image = buildProductImage(product.name);

  if (
    product.thumbnail &&
    product.thumbnail.trim() !== ""
  ) {
    image = product.thumbnail;
  }

  return {
    id: product.id,
    variantId: primaryVariant?.id,
    slug: product.slug,
    name: product.name,
    category: product.category?.name ?? "Uncategorized",

    image,

    rating: 4.7,
    price,
    originalPrice: price,
    stock: primaryVariant?.stock ?? 0,
    featured: product.isFeatured,
    description: product.description,
    shortDescription: product.shortDescription,
    brandName: product.brand?.name ?? "Nexora",
  };
}

function buildProductWhere(input: ProductListInput) {
  const where: Prisma.ProductWhereInput = {
    isDeleted: false,
    isPublished: true,
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" } },
            { description: { contains: input.search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(input.categorySlug
      ? { category: { slug: input.categorySlug } }
      : {}),
    ...(input.priceRange
      ? {
          variants: {
            some: {
              price: {
                ...(input.priceRange === "under-500"
                  ? { lt: 500 }
                  : input.priceRange === "500-1000"
                    ? { gte: 500, lt: 1000 }
                    : input.priceRange === "over-1000"
                      ? { gte: 1000 }
                      : {}),
              },
            },
          },
        }
      : {}),
  };

  return where;
}

export async function listPublishedProducts(input: ProductListInput = {}) {
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 12;
  const where = buildProductWhere(input);

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ isFeatured: "desc" as const }, { createdAt: "desc" as const }],
      include: productInclude,
    }),
    prisma.product.count({ where }),
  ]);

  const products = items.map(mapProduct);

  if (input.sort === "price-asc") {
    products.sort((a, b) => a.price - b.price);
  } else if (input.sort === "price-desc") {
    products.sort((a, b) => b.price - a.price);
  } else if (input.sort === "newest") {
    products.sort((a, b) => (a.id > b.id ? -1 : 1));
  }

  return {
    items: products,
    total,
    page,
    pageSize,
  };
}

export async function getPublishedProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      isDeleted: false,
      isPublished: true,
    },
    include: productInclude,
  });

  return product ? mapProduct(product) : null;
}
