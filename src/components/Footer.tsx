"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
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
              Akademiyada ugu horeysa ee Soomaaliyeed oo ku barta dhallinyarada
              xirfadaha digital-ka iyo dakhliga online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-[var(--text-primary)] mb-4 text-sm uppercase tracking-widest">
              Xiriiriyayaal
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/about", label: "Annaga" },
                { href: "/services", label: "Services & Portfolio" },
                { href: "/courses", label: "Koorsooyinka" },
                { href: "/ai-tools", label: "AI Tools" },
                { href: "/blogs", label: "Blog" },
                { href: "/marketplace", label: "Marketplace" },
                { href: "/community", label: "Community" },
                { href: "/leaderboard", label: "Leaderboard" },
                { href: "/dashboard", label: "Dashboard" },
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
              Koorsooyinka
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
              Nala Soo Xiriir
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
            © {new Date().getFullYear()} Hanhub.so. Xuquuqda oo dhan way ilaalisan yihiin.
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
