import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

const pages = [1, 2, 3] as const;

export function ProductPagination() {
  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Products pagination"
    >
      <Button variant="outline" className="h-10 rounded-xl px-3">
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">Previous</span>
      </Button>

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === 1 ? "default" : "outline"}
          className={
            page === 1
              ? "h-10 w-10 rounded-xl bg-[#7F46FA] text-white hover:bg-[#6D3BE3]"
              : "h-10 w-10 rounded-xl"
          }
          aria-current={page === 1 ? "page" : undefined}
        >
          {page}
        </Button>
      ))}

      <Button variant="outline" className="h-10 rounded-xl px-3">
        <span className="sr-only sm:not-sr-only">Next</span>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </nav>
  );
}
