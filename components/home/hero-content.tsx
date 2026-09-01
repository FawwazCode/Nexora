// components/home/hero-content.tsx
import { HeroBadge } from "@/components/home/hero-badge";
import HeroButtons from "@/components/home/hero-buttons";

const stats = [
  { value: "1000+", label: "Products" },
  { value: "24/7", label: "Support" },
  { value: "Free", label: "Shipping" },
] as const;

export function HeroContent() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center lg:mx-0 lg:items-start lg:text-left">
      <HeroBadge />

      <h1 className="mt-7 max-w-4xl text-4xl font-semibold tracking-tight text-zinc-950 sm:text-6xl lg:text-7xl">
        Discover the Future of Technology
      </h1>

      <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
        Premium gadgets with exclusive deals, trusted brands, and fast
        nationwide delivery.
      </p>

      <div className="mt-9">
        <HeroButtons />
      </div>

      <dl className="mt-12 grid w-full max-w-md grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-zinc-200/80 bg-white/80 px-4 py-4 shadow-sm shadow-zinc-950/[0.03] backdrop-blur"
          >
            <dt className="text-sm font-medium text-zinc-500">{stat.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default HeroContent;
