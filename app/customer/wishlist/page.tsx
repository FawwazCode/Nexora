import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import type { Product } from "@/components/product/types";

const wishlistProducts: Product[] = [
  {
    id: "wish_001",
    slug: "galaxy-ultra-z",
    name: "Galaxy Ultra Z",
    category: "Smartphone",
    image: "",
    rating: 4.8,
    price: 1299,
    stock: 32,
    featured: true,
  },
  {
    id: "wish_002",
    slug: "aura-pods-max",
    name: "Aura Pods Max",
    category: "Audio",
    image: "",
    rating: 4.7,
    price: 549,
    stock: 41,
    featured: false,
  },
];

export default async function CustomerWishlistPage() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;

  if (!session?.user) {
    redirect("/login");
  }

  if (role !== Role.CUSTOMER && role !== Role.SUPER_ADMIN) {
    redirect("/dashboard");
  }

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
              <li className="font-medium text-zinc-950">Wishlist</li>
            </ol>
          </nav>

          <div className="mt-8 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">Customer Area</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl">
              Your Wishlist
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-600 sm:text-lg">
              Save the products you love and come back anytime.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {wishlistProducts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
            <p className="text-lg font-medium text-zinc-800">Your wishlist is empty.</p>
            <p className="mt-2 text-sm text-zinc-500">Start adding products you love from the store.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-[#7F46FA]">{product.category}</p>
                    <h2 className="mt-2 text-xl font-semibold text-zinc-950">{product.name}</h2>
                    <p className="mt-2 text-sm text-zinc-600">${product.price}</p>
                  </div>
                  <Link href={`/products/${product.slug}`} className="text-sm font-medium text-[#7F46FA] hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
