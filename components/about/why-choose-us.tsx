import {
  CreditCard,
  Headphones,
  PackageCheck,
  RotateCcw,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Premium Quality",
    description: "Curated technology from trusted brands and reliable makers.",
    icon: ShieldCheck,
  },
  {
    title: "Fast Shipping",
    description: "Quick nationwide delivery with clear shipment updates.",
    icon: Truck,
  },
  {
    title: "Secure Payment",
    description: "Protected checkout flows designed for customer confidence.",
    icon: CreditCard,
  },
  {
    title: "24/7 Customer Support",
    description: "Helpful support when customers need guidance or answers.",
    icon: Headphones,
  },
  {
    title: "Easy Returns",
    description: "Simple return handling for a smoother post-purchase journey.",
    icon: RotateCcw,
  },
  {
    title: "Trusted by Thousands",
    description: "A growing community of customers choosing Nexora daily.",
    icon: PackageCheck,
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
            Why Choose Nexora
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Premium service at every step.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            We combine careful curation, thoughtful design, and dependable
            operations to make buying technology feel effortless.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950 transition duration-300">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-950">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
