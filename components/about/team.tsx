import Image from "next/image";

type TeamMember = {
  name: string;
  position: string;
  description: string;
  avatar: string;
};

const avatar = (name: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg width="480" height="480" viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="480" height="480" rx="96" fill="#FAFAFA"/>
  <circle cx="240" cy="196" r="86" fill="${color}" fill-opacity="0.9"/>
  <rect x="124" y="292" width="232" height="118" rx="59" fill="${color}" fill-opacity="0.22"/>
  <text x="240" y="218" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="white">${name}</text>
</svg>
`)}`;

const teamMembers: TeamMember[] = [
  {
    name: "Alya Tan",
    position: "Founder & CEO",
    description: "Leads Nexora's product direction and customer experience.",
    avatar: avatar("AT", "#7F46FA"),
  },
  {
    name: "Raka Putra",
    position: "Head of Operations",
    description: "Keeps fulfillment, delivery, and service standards sharp.",
    avatar: avatar("RP", "#18181B"),
  },
  {
    name: "Maya Chen",
    position: "Product Curator",
    description: "Selects premium devices and accessories for the catalog.",
    avatar: avatar("MC", "#8B5CF6"),
  },
  {
    name: "Dimas Ardi",
    position: "Customer Success Lead",
    description: "Builds support systems that make customers feel confident.",
    avatar: avatar("DA", "#52525B"),
  },
];

export function Team() {
  return (
    <section className="bg-white px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#7F46FA]">
            Meet Our Team
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
            The people building Nexora.
          </h2>
          <p className="mt-4 text-base leading-7 text-zinc-600">
            A focused team combining ecommerce, operations, product curation,
            and customer care.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <article
              key={member.name}
              className="rounded-2xl border border-zinc-200 bg-white p-5 text-center shadow-sm shadow-zinc-950/[0.03] transition duration-300 hover:-translate-y-1 hover:border-[#7F46FA]/30 hover:shadow-xl hover:shadow-[#7F46FA]/10"
            >
              <Image
                src={member.avatar}
                alt={member.name}
                width={160}
                height={160}
                unoptimized
                className="mx-auto h-28 w-28 rounded-3xl object-cover"
              />
              <h3 className="mt-5 text-lg font-semibold text-zinc-950">
                {member.name}
              </h3>
              <p className="mt-1 text-sm font-medium text-[#7F46FA]">
                {member.position}
              </p>
              <p className="mt-3 text-sm leading-6 text-zinc-600">
                {member.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
