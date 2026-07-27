"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Gift, Clock } from "lucide-react";
import { getPublicCoursesAction, getFreePromoMapAction } from "@/app/portal-live/actions";

function Countdown({ endAt }: { endAt: string | null }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endAt) return;
    const tick = () => setRemaining(Math.max(0, new Date(endAt).getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endAt]);

  if (!endAt || remaining === null) return null;
  const d = Math.floor(remaining / 86400000);
  const h = Math.floor((remaining % 86400000) / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return (
    <span className="flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] tabular-nums">
      <Clock className="w-3 h-3" /> {d > 0 ? `${d}d ` : ""}{String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export default function FreeOffersWidget() {
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const [promoRes, coursesRes] = await Promise.all([getFreePromoMapAction(), getPublicCoursesAction()]);
      if (promoRes.success && coursesRes.success) {
        const list = (coursesRes.data || [])
          .filter((c: any) => c.id in promoRes.map)
          .map((c: any) => ({ ...c, promo_ends_at: promoRes.map[c.id] }));
        setOffers(list);
      }
    };
    load();
  }, []);

  if (offers.length === 0) return null;

  return (
    <div className="mb-10 bg-[var(--bg-secondary)] border border-[var(--brand-primary)]/30 rounded-[20px] p-6">
      <h2 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
        <Gift className="w-5 h-5 text-[var(--brand-primary)]" /> Today&apos;s Free Offers
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {offers.map((c) => (
          <div key={c.id} className="flex items-center gap-4 p-3 rounded-[14px] bg-[var(--bg-primary)] border border-[var(--border-color)]">
            {c.cover_image ? (
              <img src={c.cover_image} alt={c.title} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-12 rounded-lg bg-[var(--border-color)] flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--text-primary)] truncate">{c.title}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs font-bold text-green-400">FREE <span className="line-through text-[var(--text-secondary)] font-normal">${c.price}</span></span>
                <Countdown endAt={c.promo_ends_at} />
              </div>
            </div>
            <Link href={`/courses/${c.id}`} className="flex-shrink-0 px-4 py-2 rounded-full bg-[var(--brand-primary)] text-[var(--on-brand)] text-xs font-bold hover:scale-105 transition-transform">
              Enroll Free
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
