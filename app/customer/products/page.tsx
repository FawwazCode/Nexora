import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/components/product/types";

const productImage = (from: string, to: string, label: string) => {
  const svg = `
    <svg width="800" height="800" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="800" height="800" rx="64" fill="${from}"/>
      <circle cx="640" cy="150" r="180" fill="${to}" fill-opacity="0.36"/>
      <circle cx="180" cy="640" r="220" fill="#7F46FA" fill-opacity="0.18"/>
      <rect x="190" y="210" width="420" height="360" rx="44" fill="white" fill-opacity="0.82"/>
      <rect x="230" y="250" width="340" height="250" rx="34" fill="${to}" fill-opacity="0.22"/>
      <text x="400" y="430" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" fill="#18181B">${label}</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const products: Product[] = [
  {
    id: "cust_001",
    slug: "nexbook-pro-16",
    name: "NexBook Pro 16",
    category: "Laptop",
    image: productImage("#F8FAFC", "#CBD5E1", "Laptop"),
    rating: 4.9,
    price: 2399,
    originalPrice: 2599,
    stock: 18,
    featured: true,
  },
  {
    id: "cust_002",
    slug: "galaxy-ultra-z",
    name: "Galaxy Ultra Z",
    category: "Smartphone",
    image: productImage("#FAFAFA", "#A78BFA", "Phone"),
    rating: 4.8,
    price: 1299,
    stock: 32,
    featured: true,
  },
  {
    id: "cust_003",
    slug: "aura-pods-max",
    name: "Aura Pods Max",
    category: "Audio",
    image: productImage("#F5F3FF", "#7F46FA", "Audio"),
    rating: 4.7,
    price: 549,
    stock: 41,
    featured: false,
  },
];

export default async function CustomerProductsPage() {
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
        <ProductGrid products={products} />
      </section>
    </main>
  );
}
