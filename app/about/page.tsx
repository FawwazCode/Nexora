import type { Metadata } from "next";

import { AboutCta } from "@/components/about/about-cta";
import { AboutHero } from "@/components/about/about-hero";
import { CompanyStory } from "@/components/about/company-story";
import { CoreValues } from "@/components/about/core-values";
import { MissionVision } from "@/components/about/mission-vision";
import { Statistics } from "@/components/about/statistics";
import { Team } from "@/components/about/team";
import { WhyChooseUs } from "@/components/about/why-choose-us";
import ContextualBackLink from "@/components/navigation/contextual-back-link";

export const metadata: Metadata = {
  title: "About Nexora | Premium Tech Store",
  description:
    "Learn about Nexora, a premium technology ecommerce store focused on trusted products, modern service, and customer satisfaction.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <ContextualBackLink />
      </div>
      <AboutHero />
      <CompanyStory />
      <MissionVision />
      <WhyChooseUs />
      <Statistics />
      <CoreValues />
      <Team />
      <AboutCta />
    </main>
  );
}
