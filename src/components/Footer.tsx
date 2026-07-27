"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/i18n/LanguageProvider";

const SOCIAL_LINKS = [
  {
    name: "X (Twitter)",
    href: "https://x.com/buzuri19?s=21&t=NzGHHTopaAqY0gX1Imp8GQ",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/hanhub.so?igsh=bzhlNTc3aThkeHR5",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://youtube.com/@hanhub_so?si=TW--uXMme7FhB7of",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    name: "Telegram",
    href: "https://t.me/hanhub_so",
    icon: (props: { className?: string }) => (
      <svg viewBox="0 0 24 24" fill="currentColor" className={props.className}>
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.593c-.12.539-.437.673-.887.42l-2.45-1.805-1.183 1.138c-.131.131-.241.241-.494.241l.177-2.5 4.55-4.113c.198-.176-.043-.274-.307-.098l-5.62 3.54-2.42-.756c-.526-.164-.536-.526.11-.78l9.46-3.65c.44-.16.826.106.674.77z" />
      </svg>
    ),
  },
];

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
          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-color)] text-[var(--text-secondary)] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
