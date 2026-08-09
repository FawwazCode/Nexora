"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Trash2, ArrowLeft, Loader2, Package } from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/navbar/navbar";

type WishlistItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  thumbnail: string | null;
  categoryName: string;
  brandName: string;
  price: number;
  stock: number;
  variantId: string | null;
  createdAt: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default function CustomerWishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingVariantId, setAddingVariantId] = useState<string | null>(null);
  const [removingProductId, setRemovingProductId] = useState<string | null>(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch wishlist");
      }
      const data: WishlistItem[] = await res.json();
      setItems(data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleAddToCart = async (item: WishlistItem) => {
    if (!item.variantId) {
      toast.error("Variant not found for this product");
      return;
    }

    try {
      setAddingVariantId(item.variantId);
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: item.variantId, quantity: 1 }),
      });

      if (!res.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success(`${item.name} added to cart!`);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error adding to cart");
    } finally {
      setAddingVariantId(null);
    }
  };

  const handleRemoveFromWishlist = async (productId: string, productName: string) => {
    try {
      setRemovingProductId(productId);
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to remove item");
      }

      toast.success(`${productName} removed from wishlist`);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Remove failed");
    } finally {
      setRemovingProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-[#7F46FA] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customer Portal
          </Link>
        </div>

        {/* Wishlist Header Banner */}
        <div className="rounded-3xl border border-zinc-200 bg-gradient-to-r from-purple-900 via-[#7F46FA] to-indigo-900 p-8 text-white shadow-md mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
              <Heart className="w-8 h-8 text-red-400 fill-red-400" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-purple-200">Personal Collection</p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Saved Wishlist</h1>
              <p className="mt-1 text-sm text-purple-100">
                {items.length} saved product(s) in your favorite collection.
              </p>
            </div>
          </div>
        </div>

        {/* Wishlist Grid Content */}
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7F46FA] mb-3" />
            <p className="text-sm font-medium text-zinc-600">Loading your wishlist items...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-purple-50 text-[#7F46FA] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-zinc-900">Your wishlist is currently empty</h2>
            <p className="mt-2 text-sm text-zinc-500">
              Save products you love while browsing our catalog and come back anytime to move them to your cart.
            </p>
            <div className="mt-6">
              <Link href="/products">
                <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9] text-white gap-2">
                  <ShoppingBag className="w-4 h-4" /> Explore Catalog
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col hover:border-[#7F46FA]/30 hover:shadow-xl transition duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-square bg-zinc-50 overflow-hidden">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400">
                      <Package className="w-12 h-12" />
                    </div>
                  )}

                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId, item.name)}
                    disabled={removingProductId === item.productId}
                    className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 rounded-full shadow-sm backdrop-blur transition"
                    title="Remove from Wishlist"
                  >
                    {removingProductId === item.productId ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Info & Actions */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant="secondary" className="bg-purple-50 text-[#6035D2]">
                        {item.categoryName}
                      </Badge>
                      <span className="text-xs font-semibold text-zinc-500">{item.brandName}</span>
                    </div>

                    <h3 className="mt-3 font-bold text-zinc-900 text-base line-clamp-2">
                      <Link href={`/products/${item.slug}`} className="hover:text-[#7F46FA] transition">
                        {item.name}
                      </Link>
                    </h3>

                    <p className="mt-2 text-lg font-extrabold text-zinc-900">
                      {currencyFormatter.format(item.price)}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      {item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex gap-2">
                    <Button
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0 || addingVariantId === item.variantId}
                      className="flex-1 bg-[#7F46FA] hover:bg-[#6D3BE3] text-white gap-2 font-medium"
                    >
                      {addingVariantId === item.variantId ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <ShoppingBag className="w-4 h-4" />
                      )}
                      <span>{item.stock === 0 ? "Out of Stock" : "Add to Cart"}</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
