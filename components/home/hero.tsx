// components/home/hero.tsx
import { HeroContent } from "@/components/home/hero-content";
import { HeroImage } from "@/components/home/hero-image";

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-white">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-[#7F46FA]/10 blur-3xl" />
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-10 lg:grid-cols-2 lg:px-8 lg:pb-24 lg:pt-12">
        <HeroContent />
        <HeroImage />
      </div>
    </section>
  );
}

export default Hero;