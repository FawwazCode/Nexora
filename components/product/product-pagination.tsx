import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type ProductPaginationProps = {
  page: number;
  totalPages: number;
  totalItems: number;
};

export function ProductPagination({
  page,
  totalPages,
  totalItems,
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-2"
      aria-label="Products pagination"
    >
      {page > 1 ? (
        <Link
          href={`/products?page=${page - 1}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </Link>
      ) : (
        <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-400">
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </span>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={`/products?page=${p}`}
          aria-current={p === page ? "page" : undefined}
          className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border text-sm font-medium transition ${
            p === page
              ? "border-[#7F46FA] bg-[#7F46FA] text-white"
              : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
          }`}
        >
          {p}
        </Link>
      ))}

      {page < totalPages ? (
        <Link
          href={`/products?page=${page + 1}`}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className="inline-flex h-10 cursor-not-allowed items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-100 px-3 text-sm text-zinc-400">
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </span>
      )}

      <p className="ml-3 text-sm text-zinc-500">
        {totalItems} total items
      </p>
    </nav>
  );
}