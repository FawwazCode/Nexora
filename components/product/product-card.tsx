"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [isWishlisting, setIsWishlisting] = useState(false);
  const hasDiscount =
    typeof product.originalPrice === "number" &&
    product.originalPrice > product.price;

  const handleAddClick = async () => {
    if (product.stock === 0) {
      toast.error("Product is out of stock");
      return;
    }

    if (!product.variantId) {
      toast.error("Variant not found for this product");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: product.variantId, quantity: 1 }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error("Please login to add items to your cart");
          router.push("/login");
          return;
        }
        throw new Error(data.message || "Failed to add to cart");
      }

      toast.success(`${product.name} added to cart!`);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const [isSaved, setIsSaved] = useState(false);

  const handleWishlistClick = async () => {
    setIsWishlisting(true);
    try {
      if (isSaved) {
        const response = await fetch(`/api/wishlist?productId=${product.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please login to save items");
            router.push("/login");
            return;
          }
          throw new Error("Failed to remove from wishlist");
        }
        setIsSaved(false);
        toast.success(`${product.name} removed from wishlist!`);
      } else {
        const response = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!response.ok) {
          if (response.status === 401) {
            toast.error("Please login to save items");
            router.push("/login");
            return;
          }
          throw new Error("Failed to add to wishlist");
        }
        setIsSaved(true);
        toast.success(`${product.name} saved to wishlist!`);
      }
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Wishlist update failed");
    } finally {
      setIsWishlisting(false);
    }
  };

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
          aria-label={`Save ${product.name} to wishlist`}
          onClick={handleWishlistClick}
          disabled={isWishlisting}
          className={`absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm backdrop-blur transition duration-300 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
            isSaved
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "border-white/80 bg-white/90 text-zinc-700 hover:border-[#7F46FA]/30 hover:bg-[#7F46FA] hover:text-white"
          }`}
        >
          <Heart className={`h-4 w-4 ${isSaved ? "fill-red-600 text-red-600" : ""}`} aria-hidden="true" />
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
            disabled={product.stock === 0 || isAdding}
            onClick={handleAddClick}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {isAdding ? "Adding..." : "Add"}
          </Button>
          <Button variant="outline">
            <Link href={`/products/${product.slug}`}>Details</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
