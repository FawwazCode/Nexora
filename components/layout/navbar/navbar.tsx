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
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
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
        <div className="hidden items-center gap-3 md:flex">
          {/* Search */}
          <div className="relative">
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              }
            />

            <SheetContent side="right">
              <div className="mt-8 flex flex-col gap-5">
                <Link href="/">Home</Link>
                <Link href="/products">Products</Link>
                <Link href="/cart" className="flex items-center gap-2">
                  Cart {cartCount > 0 && <Badge className="bg-[#7F46FA] text-white">{cartCount}</Badge>}
                </Link>
                {isAuthenticated && <Link href="/orders">My Orders</Link>}
                <Link href="/categories">Categories</Link>
                <Link href="/about">About</Link>

                {isAuthenticated ? (
                  <div className="mt-5">
                    <LogoutButton />
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="mt-5 bg-[#7F46FA] hover:bg-[#6D35F5]">Login</Button>
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