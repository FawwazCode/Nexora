import type { LucideIcon } from "lucide-react";
import {
  Gamepad2,
  Headphones,
  Laptop,
  Mouse,
  Smartphone,
  Watch,
} from "lucide-react";

type Category = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const categories: Category[] = [
  {
    title: "Laptop",
    description: "Powerful machines for work, creation, and entertainment.",
    icon: Laptop,
  },
  {
    title: "Smartphone",
    description: "Flagship phones with premium performance and design.",
    icon: Smartphone,
  },
  {
    title: "Audio",
    description: "Immersive sound for music, calls, and gaming.",
    icon: Headphones,
  },
  {
    title: "Gaming",
    description: "Gear built for competitive and console-grade play.",
    icon: Gamepad2,
  },
  {
    title: "Wearable",
    description: "Smart devices for health, fitness, and daily life.",
    icon: Watch,
  },
  {
    title: "Accessories",
    description: "Essential add-ons to complete your tech setup.",
    icon: Mouse,
  },
];

function CategoryCard({ title, description, icon: Icon }: Category) {
  return (
    <button
      type="button"
      aria-label={`Shop ${title}`}
      className="group flex h-full cursor-pointer flex-col items-start rounded-lg border border-zinc-200 bg-white p-5 text-left shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/40 hover:shadow-xl hover:shadow-[#7F46FA]/10 active:scale-[0.98]"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-900 transition duration-300 group-hover:bg-[#7F46FA] group-hover:text-white">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>

      <span className="mt-5 text-base font-semibold text-zinc-950">
        {title}
      </span>

      <span className="mt-2 text-sm leading-6 text-zinc-600">
        {description}
      </span>
    </button>
  );
}

export function Categories() {
  return (
    <section
      aria-labelledby="categories-heading"
      className="bg-white px-4 py-20 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="categories-heading"
            className="text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl"
          >
            Shop by Category
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600 sm:text-lg">
            Explore our most popular product categories.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => (
            <CategoryCard key={category.title} {...category} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;