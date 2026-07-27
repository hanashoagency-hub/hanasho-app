"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import { getActiveAnnouncementsAction } from "@/app/portal-live/actions";

const REFRESH_INTERVAL_MS = 60_000;

const THEME_STYLES: Record<string, { bg: string; border: string; accent: string }> = {
  lime: { bg: "linear-gradient(180deg, rgba(199,242,51,0.14) 0%, rgba(199,242,51,0.04) 100%)", border: "rgba(199,242,51,0.35)", accent: "#C7F233" },
  blue: { bg: "linear-gradient(180deg, rgba(59,130,246,0.16) 0%, rgba(59,130,246,0.05) 100%)", border: "rgba(59,130,246,0.35)", accent: "#3B82F6" },
  red: { bg: "linear-gradient(180deg, rgba(239,68,68,0.16) 0%, rgba(239,68,68,0.05) 100%)", border: "rgba(239,68,68,0.35)", accent: "#EF4444" },
  yellow: { bg: "linear-gradient(180deg, rgba(234,179,8,0.16) 0%, rgba(234,179,8,0.05) 100%)", border: "rgba(234,179,8,0.35)", accent: "#EAB308" },
  purple: { bg: "linear-gradient(180deg, rgba(168,85,247,0.16) 0%, rgba(168,85,247,0.05) 100%)", border: "rgba(168,85,247,0.35)", accent: "#A855F7" },
};

function useCountdown(endAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endAt) return;
    const tick = () => setRemaining(Math.max(0, new Date(endAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (remaining === null) return null;
  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: remaining <= 0 };
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center min-w-[44px]">
      <span className="font-heading text-lg md:text-xl font-bold text-[#F2EFE7] tabular-nums">{String(value).padStart(2, "0")}</span>
      <span className="text-[9px] uppercase tracking-wider text-[#F2EFE7]/50">{label}</span>
    </div>
  );
}

function BannerCard({ a, onDismiss }: { a: any; onDismiss: () => void }) {
  const theme = THEME_STYLES[a.color_theme] || THEME_STYLES.lime;
  const countdown = useCountdown(a.show_countdown ? a.end_at : null);

  if (countdown?.expired) return null;

  return (
    <div
      className="relative overflow-hidden rounded-[18px] border p-4 sm:p-5"
      style={{
        background: theme.bg,
        borderColor: theme.border,
        backdropFilter: "blur(20px) saturate(160%)",
        WebkitBackdropFilter: "blur(20px) saturate(160%)",
      }}
    >
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="absolute right-3 top-3 text-[#F2EFE7]/40 hover:text-[#F2EFE7] transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 pr-6">
        {a.icon && <div className="text-3xl flex-shrink-0">{a.icon}</div>}

        <div className="flex-1 min-w-0">
          <p className="font-heading font-bold text-[#F2EFE7] text-base sm:text-lg leading-snug">{a.title}</p>
          {a.description && <p className="text-sm text-[#F2EFE7]/70 mt-0.5 leading-relaxed">{a.description}</p>}
        </div>

        {countdown && (
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <CountdownUnit value={countdown.days} label="Days" />
            <CountdownUnit value={countdown.hours} label="Hrs" />
            <CountdownUnit value={countdown.minutes} label="Min" />
            <CountdownUnit value={countdown.seconds} label="Sec" />
          </div>
        )}

        {a.button_text && a.button_link && (
          <Link
            href={a.button_link}
            className="flex-shrink-0 text-center px-5 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105"
            style={{ background: theme.accent, color: "#04170E" }}
          >
            {a.button_text}
          </Link>
        )}
      </div>
    </div>
  );
}

export default function AnnouncementBanner({ placement, courseId }: { placement: string; courseId?: string }) {
  const pathname = usePathname();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const isAdmin = pathname?.startsWith("/portal-live");

  useEffect(() => {
    if (isAdmin) return;
    let cancelled = false;
    const fetchAnnouncements = async () => {
      const res = await getActiveAnnouncementsAction(placement, courseId);
      if (!cancelled && res.success) setAnnouncements(res.data);
    };
    fetchAnnouncements();
    const id = setInterval(fetchAnnouncements, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [placement, courseId, isAdmin]);

  if (isAdmin) return null;

  const visible = announcements.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  // Placements that render at the very top of the page sit directly under the
  // fixed header, so they need enough top padding to clear it (≈88px mobile /
  // ≈104px desktop). Placements embedded lower in a page (course viewer,
  // dashboard, checkout) already have their own offset, so keep it tight.
  const TOP_OF_PAGE = ["site_wide", "homepage", "courses_page"];
  const topPad = TOP_OF_PAGE.includes(placement) ? "pt-24 md:pt-28" : "pt-4";

  return (
    <div className={`mx-auto max-w-5xl px-4 sm:px-6 ${topPad} space-y-3`}>
      {visible.map((a) => (
        <BannerCard key={a.id} a={a} onDismiss={() => setDismissed((prev) => new Set(prev).add(a.id))} />
      ))}
    </div>
  );
}
