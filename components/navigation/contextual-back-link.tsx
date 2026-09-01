import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { auth } from "@/lib/auth";

function getBackHref(role?: string | null) {
  if (!role) {
    return "/";
  }

  return role === "CUSTOMER" ? "/customer" : "/dashboard";
}

export default async function ContextualBackLink() {
  const session = await auth();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const href = getBackHref(role);

  return (
    <Link
      href={href}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 shadow-sm transition hover:border-[#7F46FA]/40 hover:bg-[#7F46FA]/5 hover:text-[#6035D2] active:translate-y-px"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Back
    </Link>
  );
}
