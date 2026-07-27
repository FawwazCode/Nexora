import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ProductFilter } from "@/components/product/product-filter";

const categoryOptions = [
  { label: "All categories", value: "all" },
  { label: "Laptop", value: "laptop" },
  { label: "Smartphone", value: "smartphone" },
  { label: "Audio", value: "audio" },
  { label: "Gaming", value: "gaming" },
  { label: "Wearable", value: "wearable" },
  { label: "Accessories", value: "accessories" },
];

const priceOptions = [
  { label: "Any price", value: "all" },
  { label: "Under $500", value: "under-500" },
  { label: "$500 - $1,000", value: "500-1000" },
  { label: "$1,000+", value: "over-1000" },
];

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to high", value: "price-asc" },
  { label: "Price: High to low", value: "price-desc" },
  { label: "Top rated", value: "rating" },
];

export function ProductSearch() {
  return (
    <form className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-950/[0.03]">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="space-y-2">
          <label htmlFor="search" className="text-sm font-medium text-zinc-700">
            Search
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
              aria-hidden="true"
            />
            <Input
              id="search"
              name="search"
              type="search"
              placeholder="Search premium tech..."
              className="h-11 rounded-xl border-zinc-200 pl-10 focus-visible:ring-[#7F46FA]/20"
            />
          </div>
        </div>

        <ProductFilter
          id="category"
          label="Category"
          options={categoryOptions}
        />
        <ProductFilter id="price" label="Price" options={priceOptions} />
        <ProductFilter id="sort" label="Sort" options={sortOptions} />
      </div>
    </form>
  );
}
