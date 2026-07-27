"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Search, Heart, ShoppingCart, Menu } from "lucide-react";

import Logo from "@/components/logo/logo";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import LogoutButton from "@/components/auth/logout-button";

export default function Navbar() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">

        {/* Logo */}
        <Logo />

        {/* Desktop Menu */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium transition hover:text-[#7F46FA]"
          >
            Home
          </Link>

          <Link
            href="/products"
            className="text-sm font-medium transition hover:text-[#7F46FA]"
          >
            Products
          </Link>

          <Link
            href="/categories"
            className="text-sm font-medium transition hover:text-[#7F46FA]"
          >
            Categories
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium transition hover:text-[#7F46FA]"
          >
            About
          </Link>
        </nav>

        {/* Right Side */}
        <div className="hidden items-center gap-3 md:flex">

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

            <Input
              placeholder="Search products..."
              className="w-64 pl-10"
            />
          </div>

          {/* Wishlist */}
          <Button
            variant="ghost"
            size="icon"
          >
            <Heart className="h-5 w-5" />
          </Button>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <ShoppingCart className="h-5 w-5" />

            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full bg-[#7F46FA] p-0 text-xs">
              0
            </Badge>
          </Button>

          {/* Auth */}
          {isAuthenticated ? (
            <LogoutButton />
          ) : (
            <Link href="/login">
              <Button className="bg-[#7F46FA] hover:bg-[#6D35F5]">
                Login
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden">

          <Sheet>

              <Button
                variant="ghost"
                size="icon"
              >
                <Menu className="h-6 w-6" />
              </Button>

            <SheetContent side="right">

              <div className="mt-8 flex flex-col gap-5">

                <Link href="/">Home</Link>

                <Link href="/products">Products</Link>

                <Link href="/categories">Categories</Link>

                <Link href="/about">About</Link>

                {isAuthenticated ? (
                  <div className="mt-5">
                    <LogoutButton />
                  </div>
                ) : (
                  <Link href="/login">
                    <Button className="mt-5 bg-[#7F46FA] hover:bg-[#6D35F5]">
                      Login
                    </Button>
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