"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Heart, ShoppingCart, Menu, Package } from "lucide-react";

import Logo from "@/components/logo/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import LogoutButton from "@/components/auth/logout-button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    if (!isAuthenticated) {
      setCartCount(0);
      return;
    }
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setCartCount(data.data.totalQuantity || 0);
        }
      }
    } catch {
      // Ignore count fetch errors in background
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCartCount();

    const handleCartUpdate = () => {
      fetchCartCount();
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
    };
  }, [fetchCartCount]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Logo className="shrink-0" />

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-5 md:flex lg:gap-8">
          <Link href="/" className="text-sm font-medium transition hover:text-[#7F46FA]">
            Home
          </Link>

          <Link href="/products" className="text-sm font-medium transition hover:text-[#7F46FA]">
            Products
          </Link>

          <Link href="/categories" className="text-sm font-medium transition hover:text-[#7F46FA]">
            Categories
          </Link>

          <Link href="/about" className="text-sm font-medium transition hover:text-[#7F46FA]">
            About
          </Link>

          {isAuthenticated && (
            <Link href="/orders" className="text-sm font-medium transition hover:text-[#7F46FA] flex items-center gap-1.5">
              <Package className="h-4 w-4" />
              My Orders
            </Link>
          )}
        </nav>

        {/* Right Side */}
        <div className="hidden min-w-0 items-center gap-2 md:flex lg:gap-3">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input placeholder="Search products..." className="w-64 pl-10" />
          </div>

          {/* Wishlist */}
          <Link href="/customer/wishlist">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* Cart */}
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#7F46FA] p-0.5 text-[11px] font-bold text-white">
                  {cartCount > 99 ? "99+" : cartCount}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Auth */}
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Link href="/login">
              <Button className="bg-[#7F46FA] hover:bg-[#6D35F5]">Login</Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="h-10 w-10">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />

            <SheetContent
              side="right"
              className="w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] px-5"
            >
              <div className="mt-10 flex flex-col gap-2">
                <Link href="/" className="rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                  Home
                </Link>
                <Link href="/products" className="rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                  Products
                </Link>
                <Link href="/cart" className="flex items-center gap-2 rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                  Cart {cartCount > 0 && <Badge className="bg-[#7F46FA] text-white">{cartCount}</Badge>}
                </Link>
                {isAuthenticated && (
                  <Link href="/orders" className="rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                    My Orders
                  </Link>
                )}
                <Link href="/categories" className="rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                  Categories
                </Link>
                <Link href="/about" className="rounded-lg px-2 py-3 text-sm font-medium transition hover:bg-zinc-100">
                  About
                </Link>

                {isAuthenticated ? (
                  <div className="mt-5">
                    <LogoutButton />
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="mt-5 h-11 w-full bg-[#7F46FA] hover:bg-[#6D35F5]">Login</Button>
                  </Link>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
