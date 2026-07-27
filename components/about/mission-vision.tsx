import { Eye, Target } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type MissionVisionCard = {
  title: string;
  icon: LucideIcon;
  points: string[];
};

const cards: MissionVisionCard[] = [
  {
    title: "Mission",
    icon: Target,
    points: [
      "Deliver high-quality products.",
      "Provide an easy and secure shopping experience.",
      "Build customer trust.",
    ],
  },
  {
    title: "Vision",
    icon: Eye,
    points: [
      "Become a leading modern ecommerce platform.",
      "Deliver innovation through technology.",
      "Create long-term customer satisfaction.",
    ],
  },
];

export function MissionVision() {
  return (
    <section className="bg-zinc-50/70 px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
            Direction
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Our Mission & Vision
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <article
                key={card.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#7F46FA]/10 text-[#7F46FA]">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-zinc-950">
                  {card.title}
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-zinc-600">
                  {card.points.map((point) => (
                    <li key={point} className="flex gap-3">
                      <span
                        className="mt-2 h-1.5 w-1.5 rounded-full bg-[#7F46FA]"
                        aria-hidden="true"
                      />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
