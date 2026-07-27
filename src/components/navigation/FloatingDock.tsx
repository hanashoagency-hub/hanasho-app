"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Home, BookOpen, Users, User } from "lucide-react";
import NavButton from "./NavButton";
import { useActiveRoute } from "./useActiveRoute";

const WHATSAPP_NUMBER = "252612850007";
const WHATSAPP_TINT = "#25D366";

function WhatsAppIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill={WHATSAPP_TINT} className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

interface DockItemDef {
  kind: "route" | "external";
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  tint?: string;
}

const NAV_ITEMS: DockItemDef[] = [
  { kind: "route", href: "/", label: "Home", icon: Home },
  { kind: "route", href: "/courses", label: "Courses", icon: BookOpen },
  { kind: "external", href: `https://wa.me/${WHATSAPP_NUMBER}`, label: "WhatsApp", icon: WhatsAppIcon, tint: WHATSAPP_TINT },
  { kind: "route", href: "/community", label: "Community", icon: Users },
  { kind: "route", href: "/dashboard", label: "Profile", icon: User },
];

function DockItem({ kind, href, label, icon, tint }: DockItemDef) {
  const activeRoute = useActiveRoute(href);
  const isActive = kind === "route" && activeRoute;
  return (
    <NavButton
      href={href}
      label={label}
      icon={icon}
      isActive={isActive}
      external={kind === "external"}
      tint={tint}
    />
  );
}

export default function FloatingDock() {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const onScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => setIsScrolling(false), 220);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, [shouldReduceMotion]);

  if (pathname?.startsWith("/dashboard") || pathname?.startsWith("/portal-live")) return null;

  return (
    <motion.nav
      aria-label="Primary"
      initial={false}
      animate={{
        scale: isScrolling ? 0.95 : 1,
        opacity: isScrolling ? 0.72 : 1,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className="relative flex items-center gap-1 rounded-full border px-2.5 py-2"
        style={{
          background: "rgba(14, 42, 27, 0.55)",
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(30px) saturate(180%)",
          WebkitBackdropFilter: "blur(30px) saturate(180%)",
          boxShadow:
            "0 24px 48px -18px rgba(0,0,0,0.6), 0 8px 20px -12px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(4,23,14,0.4)",
        }}
      >
        {/* top glass highlight — a real specular edge, not a fake gradient fill */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 top-0 h-px rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)" }}
        />

        {NAV_ITEMS.map((item) => (
          <DockItem key={item.href} {...item} />
        ))}
      </div>
    </motion.nav>
  );
}
