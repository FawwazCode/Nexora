import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AddToCartButton } from "@/components/product/add-to-cart-button";
import { getPublishedProductBySlug } from "@/lib/products";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found | Nexora",
    };
  }

  return {
    title: `${product.name} | Nexora`,
    description:
      product.description ??
      product.shortDescription ??
      "Product details",
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getPublishedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-center">
          {/* Product Image */}
          <div className="w-full lg:w-1/2">
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-zinc-100">
              {product.image ? (
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-zinc-400">
                  No image available
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex w-full flex-col justify-center lg:w-1/2">
            <nav
              aria-label="Breadcrumb"
              className="text-sm text-zinc-500"
            >
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="transition hover:text-[#7F46FA]"
                  >
                    Dashboard
                  </Link>
                </li>

                <li>/</li>

                <li>
                  <Link
                    href="/products"
                    className="transition hover:text-[#7F46FA]"
                  >
                    Products
                  </Link>
                </li>

                <li>/</li>

                <li className="font-medium text-zinc-950">
                  {product.name}
                </li>
              </ol>
            </nav>

            <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
              {product.brandName}
            </p>

            <h1 className="mt-3 text-4xl font-bold text-zinc-950">
              {product.name}
            </h1>

            <p className="mt-6 text-zinc-600">
              {product.shortDescription || product.description}
            </p>

            <p className="mt-8 text-4xl font-bold text-[#7F46FA]">
              ${product.price.toFixed(2)}
            </p>

            <div className="mt-8 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
              <div className="flex justify-between">
                <span className="text-zinc-500">Category</span>

                <span className="font-medium">
                  {product.category}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Stock</span>

                <span className="font-medium">
                  {product.stock > 0
                    ? `${product.stock} Available`
                    : "Out of stock"}
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <AddToCartButton
                variantId={product.variantId}
                stock={product.stock}
              />

              <div className="pt-2">
                <Link href="/products">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    Back to products
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}