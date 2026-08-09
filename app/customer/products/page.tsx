import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { ProductGrid } from "@/components/product/product-grid";
import { listPublishedProducts } from "@/lib/products";

export default async function CustomerProductsPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.CUSTOMER && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

  const products = await listPublishedProducts({ page: 1, pageSize: 12 });

  return (
    <main className="min-h-screen bg-white">
      <section className="border-b border-zinc-200 bg-gradient-to-b from-[#7F46FA]/5 to-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="text-sm text-zinc-500">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/dashboard" className="transition hover:text-[#7F46FA]">
                  Dashboard
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="font-medium text-zinc-950">Store Products</li>
            </ol>
          </nav>

          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">Customer Area</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Browse Products in Our Store
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              Explore featured electronics and accessories curated for your next upgrade.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ProductGrid products={products.items} />
      </section>
    </main>
  );
}
