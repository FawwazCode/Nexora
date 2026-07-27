import Link from "next/link";

import { ProductGrid } from "@/components/product/product-grid";
import { ProductPagination } from "@/components/product/product-pagination";
import { ProductSearch } from "@/components/product/product-search";
import type { Product } from "@/components/product/types";

export const metadata = {
  title: "Products | Nexora",
  description:
    "Explore premium smartphones, laptops, audio gear, gaming devices, wearables, and accessories at Nexora.",
};

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
    id: "prod_001",
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
    id: "prod_002",
    slug: "galaxy-ultra-z",
    name: "Galaxy Ultra Z",
    category: "Smartphone",
    image: productImage("#FAFAFA", "#A78BFA", "Phone"),
    rating: 4.8,
    price: 1299,
    originalPrice: 1399,
    stock: 32,
    featured: true,
  },
  {
    id: "prod_003",
    slug: "aura-pods-max",
    name: "Aura Pods Max",
    category: "Audio",
    image: productImage("#F5F3FF", "#7F46FA", "Audio"),
    rating: 4.7,
    price: 549,
    stock: 41,
    featured: false,
  },
  {
    id: "prod_004",
    slug: "strix-gaming-hub",
    name: "Strix Gaming Hub",
    category: "Gaming",
    image: productImage("#F4F4F5", "#111827", "Gaming"),
    rating: 4.8,
    price: 899,
    originalPrice: 999,
    stock: 12,
    featured: true,
  },
  {
    id: "prod_005",
    slug: "orbit-watch-s",
    name: "Orbit Watch S",
    category: "Wearable",
    image: productImage("#FFFFFF", "#C4B5FD", "Watch"),
    rating: 4.6,
    price: 399,
    originalPrice: 449,
    stock: 26,
    featured: false,
  },
  {
    id: "prod_006",
    slug: "precision-mouse-pro",
    name: "Precision Mouse Pro",
    category: "Accessories",
    image: productImage("#F8FAFC", "#94A3B8", "Mouse"),
    rating: 4.5,
    price: 129,
    stock: 64,
    featured: false,
  },
  {
    id: "prod_007",
    slug: "zenbook-air-14",
    name: "ZenBook Air 14",
    category: "Laptop",
    image: productImage("#FDFDFD", "#DDD6FE", "Laptop"),
    rating: 4.7,
    price: 1499,
    originalPrice: 1699,
    stock: 21,
    featured: false,
  },
  {
    id: "prod_008",
    slug: "nothing-phone-prism",
    name: "Nothing Phone Prism",
    category: "Smartphone",
    image: productImage("#FAFAFA", "#E5E7EB", "Phone"),
    rating: 4.6,
    price: 799,
    stock: 28,
    featured: false,
  },
  {
    id: "prod_009",
    slug: "studio-buds-pro",
    name: "Studio Buds Pro",
    category: "Audio",
    image: productImage("#F5F3FF", "#A78BFA", "Buds"),
    rating: 4.7,
    price: 249,
    originalPrice: 299,
    stock: 55,
    featured: true,
  },
  {
    id: "prod_010",
    slug: "nova-controller-elite",
    name: "Nova Controller Elite",
    category: "Gaming",
    image: productImage("#F9FAFB", "#7F46FA", "Pad"),
    rating: 4.5,
    price: 179,
    stock: 37,
    featured: false,
  },
  {
    id: "prod_011",
    slug: "pulse-band-active",
    name: "Pulse Band Active",
    category: "Wearable",
    image: productImage("#FFFFFF", "#C4B5FD", "Band"),
    rating: 4.4,
    price: 149,
    originalPrice: 199,
    stock: 43,
    featured: false,
  },
  {
    id: "prod_012",
    slug: "magnetic-charging-dock",
    name: "Magnetic Charging Dock",
    category: "Accessories",
    image: productImage("#F8FAFC", "#CBD5E1", "Dock"),
    rating: 4.6,
    price: 89,
    stock: 76,
    featured: false,
  },
];

export default function ProductsPage() {
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
        <ProductSearch />

        <div className="mt-10">
          <ProductGrid products={products} />
        </div>

        <div className="mt-12">
          <ProductPagination />
        </div>
      </section>
    </main>
  );
}
