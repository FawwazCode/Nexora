import Link from "next/link";
import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductSearch } from "@/components/product/product-search";
import { listPublishedProducts } from "@/lib/products";

export const metadata = {
  title: "Products | Nexora",
  description:
    "Explore premium smartphones, laptops, audio gear, gaming devices, wearables, and accessories at Nexora.",
};

export default async function ProductsPage({ searchParams }: { searchParams?: Promise<{ search?: string; category?: string; price?: string; sort?: string; page?: string }> }) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = Number(resolvedSearchParams.page ?? 1);
  const products = await listPublishedProducts({
    page,
    pageSize: 12,
    search: resolvedSearchParams.search,
    categorySlug: resolvedSearchParams.category && resolvedSearchParams.category !== "all" ? resolvedSearchParams.category : undefined,
    priceRange: resolvedSearchParams.price && resolvedSearchParams.price !== "all" ? resolvedSearchParams.price : undefined,
    sort: resolvedSearchParams.sort,
  });

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-[#7F46FA]/5 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="transition hover:text-[#7F46FA]">
                  Home
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-zinc-950">Products</li>
            </ol>
          </nav>

          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
              Nexora Collection
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-6xl">
              Explore Our Products
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              Discover premium smartphones, laptops, audio gear, wearables, and
              accessories curated for modern work, play, and everyday life.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductSearch
          initialSearch={resolvedSearchParams.search ?? ""}
          initialCategory={resolvedSearchParams.category ?? "all"}
          initialPrice={resolvedSearchParams.price ?? "all"}
          initialSort={resolvedSearchParams.sort ?? "featured"}
        />

        <div className="mt-10">
          <ProductGrid products={products.items} />
        </div>

        <div className="mt-12">
          <ProductPagination page={products.page} totalPages={Math.max(1, Math.ceil(products.total / products.pageSize))} totalItems={products.total} />
        </div>
      </section>
    </main>
  );
}
