import { Gem, HeartHandshake, Lightbulb, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type CoreValue = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const values: CoreValue[] = [
  {
    title: "Quality",
    description: "We choose products and experiences that feel reliable.",
    icon: Gem,
  },
  {
    title: "Innovation",
    description: "We use technology to make shopping clearer and faster.",
    icon: Lightbulb,
  },
  {
    title: "Integrity",
    description: "We communicate honestly and build with customer trust.",
    icon: Shield,
  },
  {
    title: "Customer First",
    description: "Every decision is shaped around the customer journey.",
    icon: HeartHandshake,
  },
];

export function CoreValues() {
  return (
    <section className="bg-zinc-50/70 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
            Our Core Values
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Principles behind every Nexora experience.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((value) => {
            const Icon = value.icon;

            return (
              <article
                key={value.title}
                className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7F46FA]/10 text-[#7F46FA]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-zinc-950">
                  {value.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  {value.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
