"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function HeroButtons() {
  return (
    <div className="mt-8 flex flex-wrap gap-4">
      <Link href="/products">
        <Button className="h-12 bg-[#7F46FA] px-6 text-white hover:bg-[#6D35F5]">
          <ShoppingBag className="mr-2 h-5 w-5" />
          Shop Now
        </Button>
      </Link>

      <Link href="/products">
        <Button
          variant="outline"
          className="h-12 px-6"
        >
          Explore Collection
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}