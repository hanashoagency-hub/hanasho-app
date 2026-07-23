"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function Footer() {
  const pathname = usePathname();
  const { dict } = useLanguage();
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] mt-auto">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <img
                src="/assets/logo.png"
                alt="HanHub"
                className="h-16 md:h-20 w-auto object-contain"
              />
            </Link>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {dict.footer.tagline}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-widest">
              {dict.footer.quickLinks}
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: dict.nav.about },
                { href: "/services", label: dict.nav.services },
                { href: "/courses", label: dict.nav.courses },
                { href: "/ai-tools", label: dict.nav.aiTools },
                { href: "/blogs", label: dict.nav.blog },
                { href: "/marketplace", label: dict.nav.marketplace },
                { href: "/community", label: dict.nav.community },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/dashboard", label: dict.nav.dashboard },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-heading font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-widest">
              {dict.footer.coursesHeading}
            </h4>
            <ul className="space-y-3">
              {[
                "AI & Automations",
                "Digital Marketing",
                "Web3 & Crypto",
                "Freelancing",
                "Trading Strategy",
              ].map((course) => (
                <li key={course}>
                  <Link
                    href="/courses"
                    className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
                  >
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-widest">
              {dict.footer.contactHeading}
            </h4>
            <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
              <li>📧 info@hanhub.so</li>
              <li>📱 WhatsApp Support</li>
              <li>📍 Mogadishu, Somalia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--border-color)] pt-8 md:flex-row">
          <p className="text-xs text-[var(--text-secondary)]">
            © {new Date().getFullYear()} Hanhub.so. {dict.footer.rights}
          </p>
          <div className="flex gap-6">
            {["Twitter", "Instagram", "YouTube", "TikTok"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-[var(--text-secondary)] transition-colors hover:text-[var(--brand-primary)]"
              >
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
