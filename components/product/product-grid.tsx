import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/components/product/types";

type ProductGridProps = {
  products: Product[];
};

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#7F46FA]/10 text-[#7F46FA]">
          <PackageSearch className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-zinc-950">
          No products found
        </h2>
        <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
          Try clearing your filters or searching for another premium device.
        </p>
        <Button className="mt-6 bg-[#7F46FA] text-white hover:bg-[#6D3BE3]">
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
