import Link from "next/link";
import {
  ArrowRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Play,
  Send,
} from "lucide-react";

import Logo from "@/components/logo/logo";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const customerService = [
  { label: "FAQ", href: "/faq" },
  { label: "Shipping", href: "/shipping" },
  { label: "Returns", href: "/returns" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

const socialLinks = [
  { label: "Facebook", href: "https://facebook.com", icon: Globe },
  { label: "Instagram", href: "https://instagram.com", icon: MessageCircle },
  { label: "Twitter", href: "https://twitter.com", icon: Send },
  { label: "YouTube", href: "https://youtube.com", icon: Play },
];

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#05070b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.9fr] xl:grid-cols-[1.15fr_0.7fr_0.7fr_0.95fr]">
          <div className="space-y-6">
            <Logo
              className="w-fit"
              brandClassName="text-white"
              subtitleClassName="text-zinc-400"
            />
            <p className="max-w-sm text-sm leading-7 text-zinc-300 sm:text-base">
              Discover premium technology, curated essentials, and exceptional
              service designed to elevate every digital experience.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-100 shadow-sm transition duration-200 hover:border-[#9b87ff] hover:bg-[#7F46FA]/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]"
                    aria-label={item.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-200">
              Quick Links
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-md px-0 py-1 transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-200">
              Customer Service
            </h3>
            <ul className="mt-5 space-y-3 text-sm text-zinc-300">
              {customerService.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="inline-flex rounded-md px-0 py-1 transition duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.25)] backdrop-blur sm:p-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-200">
              Contact
            </h3>
            <ul className="mt-5 space-y-4 text-sm text-zinc-300">
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" />
                <span>hirogest23@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" />
                <span>+6285939859097</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#a78bfa]" />
                <span>Jl. Pangkalan Jati IV</span>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm font-semibold text-white">Newsletter</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="newsletter-email">
                  Email address
                </label>
                <input
                  id="newsletter-email"
                  type="email"
                  placeholder="Email address"
                  className="h-11 min-h-[44px] flex-1 rounded-xl border border-white/10 bg-zinc-950/70 px-3 text-sm text-zinc-100 placeholder:text-zinc-400 outline-none transition focus:border-[#a78bfa] focus:ring-2 focus:ring-[#a78bfa]/30"
                />
                <button className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-[#7F46FA] px-4 text-sm font-semibold text-white transition duration-200 hover:bg-[#8b5cf6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a78bfa] focus-visible:ring-offset-2 focus-visible:ring-offset-[#05070b]">
                  Subscribe
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Nexora. All rights reserved.</p>
          <p>Premium technology for modern living</p>
        </div>
      </div>
    </footer>
  );
}