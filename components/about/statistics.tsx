type Statistic = {
  value: string;
  label: string;
};

const statistics: Statistic[] = [
  { value: "10K+", label: "Happy Customers" },
  { value: "5K+", label: "Products" },
  { value: "99%", label: "Positive Reviews" },
  { value: "24/7", label: "Customer Support" },
];

export function Statistics() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((statistic) => (
            <article
              key={statistic.label}
              className="rounded-2xl border border-zinc-200 bg-gradient-to-b from-white to-zinc-50 p-6 text-center shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10"
            >
              <p className="text-4xl font-semibold tracking-tight text-zinc-950">
                {statistic.value}
              </p>
              <p className="mt-2 text-sm font-medium text-zinc-600">
                {statistic.label}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
