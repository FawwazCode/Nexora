
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Plus, Minus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type AddToCartButtonProps = {
  variantId?: string;
  stock: number;
};

export function AddToCartButton({ variantId, stock }: AddToCartButtonProps) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < stock) {
      setQuantity((prev) => prev + 1);
    } else {
      toast.error(`Maximum available stock is ${stock}`);
    }
  };

  const handleAddToCart = async () => {
    if (!variantId) {
      toast.error("Product variant not available");
      return;
    }

    if (stock <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity }),
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

      toast.success("Added to cart successfully!");
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add item");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      {/* Quantity Selector */}
      {stock > 0 && (
        <div className="flex items-center rounded-xl border border-zinc-200 bg-zinc-50 p-1">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isAdding}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white hover:text-zinc-950 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>

          <span className="w-12 text-center text-sm font-semibold text-zinc-900">
            {quantity}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= stock || isAdding}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white hover:text-zinc-950 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add To Cart Button */}
      <Button
        type="button"
        className="flex-1 bg-[#7F46FA] text-white shadow-sm shadow-[#7F46FA]/20 transition hover:bg-[#6D3BE3] disabled:opacity-50"
        disabled={stock <= 0 || isAdding || !variantId}
        onClick={handleAddToCart}
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to cart
          </>
        )}
      </Button>
    </div>
  );
}
