import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

const heroImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="960" height="760" viewBox="0 0 960 760" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="960" height="760" rx="72" fill="#FAFAFA"/>
  <circle cx="740" cy="152" r="210" fill="#7F46FA" fill-opacity="0.14"/>
  <circle cx="210" cy="610" r="230" fill="#7F46FA" fill-opacity="0.1"/>
  <rect x="166" y="118" width="628" height="482" rx="54" fill="white" stroke="#E4E4E7" stroke-width="2"/>
  <rect x="222" y="174" width="246" height="306" rx="36" fill="#18181B"/>
  <rect x="492" y="174" width="246" height="144" rx="32" fill="#F4F4F5"/>
  <rect x="492" y="344" width="246" height="136" rx="32" fill="#F5F3FF"/>
  <circle cx="345" cy="328" r="72" fill="#7F46FA"/>
  <rect x="274" y="510" width="412" height="28" rx="14" fill="#E4E4E7"/>
  <rect x="274" y="552" width="260" height="22" rx="11" fill="#D4D4D8"/>
</svg>
`)}`;

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#7F46FA]/10 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100svh-8rem)] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:min-h-[calc(100svh-5rem)] lg:grid-cols-2 lg:gap-12 lg:px-8 lg:py-24">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7F46FA]/20 bg-[#7F46FA]/10 px-4 py-2 text-sm font-medium text-[#6035D2]">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            About Nexora
          </div>

          <h1 className="mt-7 text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-7xl">
            Technology Meets Premium Shopping
          </h1>

          <p className="mt-6 max-w-xl text-base leading-8 text-zinc-600 sm:text-lg">
            Nexora is a premium tech store built for people who want trusted
            gadgets, modern service, secure checkout, and a refined shopping
            experience from discovery to delivery.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#7F46FA] px-6 text-sm font-semibold text-white shadow-lg shadow-[#7F46FA]/20 transition hover:-translate-y-0.5 hover:bg-[#6D3BE3] active:translate-y-0 sm:w-auto"
            >
              Explore Products
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 w-full items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-semibold text-zinc-950 shadow-sm transition hover:-translate-y-0.5 hover:border-[#7F46FA]/30 hover:bg-zinc-50 active:translate-y-0 sm:w-auto"
            >
              Contact Us
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-6 top-10 h-32 w-32 rounded-full bg-[#7F46FA]/20 blur-3xl" />
          <div className="absolute -left-4 bottom-10 h-24 w-24 rounded-full bg-fuchsia-300/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl shadow-[#7F46FA]/10 sm:rounded-[2rem]">
            <Image
              src={heroImage}
              alt="Premium ecommerce technology illustration"
              width={960}
              height={760}
              priority
              unoptimized
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
