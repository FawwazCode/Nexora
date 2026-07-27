import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Product } from "@/components/product/types";

type ProductCardProps = {
  product: Product;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10">
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
          unoptimized
        />

        <button
          type="button"
          aria-label={`Add ${product.name} to wishlist`}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/90 text-zinc-700 shadow-sm backdrop-blur transition duration-300 hover:border-[#7F46FA]/30 hover:bg-[#7F46FA] hover:text-white active:scale-95"
        >
          <Heart className="h-4 w-4" aria-hidden="true" />
        </button>

        {product.featured ? (
          <Badge className="absolute left-4 top-4 bg-[#7F46FA] text-white hover:bg-[#7F46FA]">
            Featured
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge
            variant="secondary"
            className="rounded-full bg-[#7F46FA]/10 text-[#6035D2] hover:bg-[#7F46FA]/10"
          >
            {product.category}
          </Badge>

          <div className="flex items-center gap-1 text-sm font-medium text-zinc-700">
            <Star
              className="h-4 w-4 fill-[#7F46FA] text-[#7F46FA]"
              aria-hidden="true"
            />
            <span>{product.rating.toFixed(1)}</span>
          </div>
        </div>

        <h2 className="mt-4 line-clamp-2 text-base font-semibold leading-6 text-zinc-950">
          <Link
            href={`/products/${product.slug}`}
            className="outline-none transition hover:text-[#7F46FA] focus-visible:text-[#7F46FA]"
          >
            {product.name}
          </Link>
        </h2>

        <div className="mt-4 flex items-end gap-2">
          <p className="text-xl font-semibold tracking-tight text-zinc-950">
            {currencyFormatter.format(product.price)}
          </p>
          {hasDiscount ? (
            <p className="pb-0.5 text-sm text-zinc-400 line-through">
              {currencyFormatter.format(product.originalPrice ?? product.price)}
            </p>
          ) : null}
        </div>

        <p className="mt-2 text-sm text-zinc-500">
          {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </p>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button
            type="button"
            className="bg-[#7F46FA] text-white shadow-sm shadow-[#7F46FA]/20 transition hover:bg-[#6D3BE3]"
            disabled={product.stock === 0}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Add
          </Button>
          <Button variant="outline">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
