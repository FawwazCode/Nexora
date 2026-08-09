// components/home/hero-image.tsx
import { Headphones, Laptop, Smartphone } from "lucide-react";

const productIcons = [
  {
    label: "Laptop",
    icon: Laptop,
    className: "left-6 top-8 rotate-[-8deg]",
  },
  {
    label: "Smartphone",
    icon: Smartphone,
    className: "right-6 top-16 rotate-[8deg]",
  },
  {
    label: "Headphone",
    icon: Headphones,
    className: "bottom-8 left-1/2 -translate-x-1/2 rotate-[-3deg]",
  },
] as const;

export function HeroImage() {
  return (
    <div className="relative mx-auto flex w-full max-w-xl items-center justify-center lg:max-w-none">
      <div className="absolute -left-8 top-12 h-24 w-24 rounded-full bg-[#7F46FA]/15 blur-2xl" />
      <div className="absolute -right-6 bottom-10 h-32 w-32 rounded-full bg-fuchsia-300/20 blur-3xl" />
      <div className="absolute right-10 top-0 h-3 w-3 animate-pulse rounded-full bg-[#7F46FA]" />
      <div className="absolute bottom-8 left-8 h-4 w-4 rounded-full bg-[#7F46FA]/30" />

      <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-[#F7F3FF] to-zinc-100 p-6 shadow-2xl shadow-[#7F46FA]/15 transition duration-500 hover:-translate-y-1 hover:shadow-[#7F46FA]/25 sm:aspect-square sm:max-w-lg">
        <div className="absolute inset-x-10 top-8 h-32 rounded-full bg-[#7F46FA]/20 blur-3xl" />

        <div className="relative h-full rounded-[2rem] border border-white/80 bg-white/70 p-5 shadow-xl shadow-zinc-950/[0.06] backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">Nexora Picks</p>
              <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-950">
                Premium Setup
              </p>
            </div>
            <div className="rounded-full bg-[#7F46FA] px-3 py-1 text-xs font-semibold text-white">
              New
            </div>
          </div>

          <div className="relative mt-10 h-[72%] rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-800 to-[#7F46FA] p-5 shadow-2xl shadow-zinc-950/20">
            <div className="absolute inset-5 rounded-[1.5rem] border border-white/10" />
            <div className="absolute left-1/2 top-10 h-28 w-28 -translate-x-1/2 rounded-full bg-white/15 blur-2xl" />

            {productIcons.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className={`absolute ${item.className} rounded-2xl border border-white/20 bg-white/90 p-4 text-zinc-950 shadow-xl shadow-zinc-950/20 backdrop-blur transition duration-300 hover:scale-105`}
                  aria-label={item.label}
                >
                  <Icon className="h-8 w-8" aria-hidden="true" />
                </div>
              );
            })}

            <div className="absolute bottom-6 right-6 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-white backdrop-blur">
              <p className="text-xs text-white/70">Exclusive Deals</p>
              <p className="text-lg font-semibold">Up to 40%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeroImage;