"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroButtons() {
  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
      <Link href="/products" className="w-full sm:w-auto">
        <Button className="h-12 w-full bg-[#7F46FA] px-6 text-white hover:bg-[#6D35F5] sm:w-auto">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Shop Now
        </Button>
      </Link>

      <Link href="/products" className="w-full sm:w-auto">
        <Button
          variant="outline"
          className="h-12 w-full px-6 sm:w-auto"
        >
          Explore Collection
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}
