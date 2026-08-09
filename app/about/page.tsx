import type { Metadata } from "next";

import { AboutCta } from "@/components/about/about-cta";
import { AboutHero } from "@/components/about/about-hero";
import { CompanyStory } from "@/components/about/company-story";
import { CoreValues } from "@/components/about/core-values";
import { MissionVision } from "@/components/about/mission-vision";
import { Statistics } from "@/components/about/statistics";
import { Team } from "@/components/about/team";
import { WhyChooseUs } from "@/components/about/why-choose-us";

export const metadata: Metadata = {
  title: "About Nexora | Premium Tech Store",
  description:
    "Learn about Nexora, a premium technology ecommerce store focused on trusted products, modern service, and customer satisfaction.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
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
