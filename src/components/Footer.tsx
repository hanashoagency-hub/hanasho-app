"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <footer style={{ borderColor: 'var(--silver-border)', backgroundColor: 'var(--bg-primary)' }} className="border-t group">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <img
                src="/assets/hanasho-dark-logo.png"
                alt="Hanasho"
                className="h-16 md:h-20 w-auto object-contain block group-[[data-theme='grey']_&]:hidden"
              />
              <img
                src="/assets/hanasho-grey-logo.png"
                alt="Hanasho"
                className="h-16 md:h-20 w-auto object-contain hidden group-[[data-theme='grey']_&]:block"
              />
            </Link>
            <p className="text-sm text-white/50 leading-relaxed">
              Akademiyada ugu horeysa ee Soomaaliyeed oo ku barta dhallinyarada
              xirfadaha digital-ka iyo dakhliga online.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-widest">
              Xiriiriyayaal
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/#about", label: "Annaga" },
                { href: "/services", label: "Services & Portfolio" },
                { href: "/courses", label: "Koorsooyinka" },
                { href: "/marketplace", label: "Marketplace" },
                { href: "/community", label: "Community" },
                { href: "/dashboard", label: "Dashboard" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-widest">
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
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {course}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white mb-4 text-sm uppercase tracking-widest">
              Nala Soo Xiriir
            </h4>
            <ul className="space-y-3 text-sm text-white/50">
              <li>📧 info@hanasho.io</li>
              <li>📱 WhatsApp Support</li>
              <li>📍 Mogadishu, Somalia</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} hanasho.io. Xuquuqda oo dhan way ilaalisan yihiin.
          </p>
          <div className="flex gap-6">
            {["Twitter", "Instagram", "YouTube", "TikTok"].map((social) => (
              <a
                key={social}
                href="#"
                className="text-xs text-white/30 transition-colors hover:text-white"
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
