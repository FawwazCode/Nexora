import Image from "next/image";

const storyImage = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="900" height="720" viewBox="0 0 900 720" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="720" rx="56" fill="#F8FAFC"/>
  <circle cx="178" cy="160" r="142" fill="#7F46FA" fill-opacity="0.12"/>
  <circle cx="730" cy="548" r="180" fill="#7F46FA" fill-opacity="0.1"/>
  <rect x="142" y="122" width="616" height="442" rx="44" fill="white" stroke="#E4E4E7" stroke-width="2"/>
  <rect x="192" y="180" width="240" height="300" rx="34" fill="#18181B"/>
  <rect x="464" y="180" width="244" height="78" rx="24" fill="#F4F4F5"/>
  <rect x="464" y="282" width="244" height="78" rx="24" fill="#F5F3FF"/>
  <rect x="464" y="384" width="164" height="78" rx="24" fill="#EDE9FE"/>
  <circle cx="312" cy="330" r="78" fill="#7F46FA"/>
</svg>
`)}`;

export function CompanyStory() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-50 shadow-xl shadow-zinc-950/[0.04]">
          <Image
            src={storyImage}
            alt="Nexora premium shopping experience"
            width={900}
            height={720}
            unoptimized
            className="h-auto w-full"
          />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
            Our Story
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            Built to make premium technology easier to trust.
          </h2>
          <div className="mt-6 space-y-5 text-base leading-8 text-zinc-600">
            <p>
              Nexora was created to simplify the way people discover and buy
              technology. We saw how difficult it can be to compare quality,
              service, delivery, and support across many stores, so we built a
              calmer and more reliable shopping experience.
            </p>
            <p>
              Our focus is simple: curated products, transparent information,
              secure checkout, and service that respects the customer. From
              flagship smartphones to everyday accessories, every touchpoint is
              designed to feel clear, fast, and premium.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
