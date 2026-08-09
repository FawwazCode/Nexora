import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function AboutCta() {
  return (
    <section className="bg-white px-4 pb-24 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-[2rem] bg-zinc-950 px-6 py-16 text-center shadow-2xl shadow-[#7F46FA]/10 sm:px-10 lg:py-20">
          <div className="absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#7F46FA]/30 blur-3xl" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to Experience Nexora?
            </h2>
            <p className="mt-4 text-base leading-7 text-zinc-300">
              Explore premium products, trusted service, and a shopping journey
              designed for modern technology buyers.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#7F46FA] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#6D3BE3] active:translate-y-0"
              >
                Shop Now
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-white/15 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15 active:translate-y-0"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
