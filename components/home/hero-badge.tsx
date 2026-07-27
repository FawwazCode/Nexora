// components/home/hero-badge.tsx
import { Sparkles } from "lucide-react";

export function HeroBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-[#7F46FA]/20 bg-[#7F46FA]/10 px-4 py-2 text-sm font-medium text-[#5F2FD6] shadow-sm shadow-[#7F46FA]/10">
      <Sparkles className="h-4 w-4" aria-hidden="true" />
      <span>Premium Tech Store</span>
    </div>
  );
}

export default HeroBadge;