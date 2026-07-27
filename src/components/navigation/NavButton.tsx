"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface NavButtonProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  isActive: boolean;
  /** Opens in a new tab as a plain external link instead of Next.js client-side routing. */
  external?: boolean;
  /** Permanent brand-color halo (e.g. WhatsApp green) for action items that aren't a route. */
  tint?: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const ACCENT = "#C7F233";
const TEXT = "#F2EFE7";

export default function NavButton({ href, label, icon: Icon, isActive, external, tint }: NavButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const spring = shouldReduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 34, mass: 0.9 };

  const addRipple = (e: React.PointerEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || e.pointerType === "mouse") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
  };

  const removeRipple = (id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  };

  const content = (
    <motion.div
      layout
      transition={spring}
      onPointerDown={addRipple}
      whileHover={shouldReduceMotion ? undefined : { y: -3, scale: 1.04 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
      className={`relative flex min-h-11 items-center gap-2 overflow-hidden rounded-full px-3.5 py-2 cursor-pointer select-none ${
        isActive ? "" : "hover:opacity-90"
      }`}
      style={{ color: isActive ? TEXT : `${TEXT}8c` }}
    >
      {isActive && (
        <motion.span
          layoutId="dock-active-pill"
          transition={spring}
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${ACCENT}38 0%, ${ACCENT}14 100%)`,
            boxShadow: `0 0 0 1px ${ACCENT}59, 0 0 18px ${ACCENT}59, inset 0 1px 0 rgba(255,255,255,0.25)`,
          }}
        />
      )}

      {tint && !isActive && (
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full"
          style={{
            background: `linear-gradient(180deg, ${tint}38 0%, ${tint}14 100%)`,
            boxShadow: `0 0 0 1px ${tint}59, inset 0 1px 0 rgba(255,255,255,0.2)`,
          }}
        />
      )}

      <AnimatePresence>
        {ripples.map((r) => (
          <motion.span
            key={r.id}
            initial={{ opacity: 0.35, scale: 0 }}
            animate={{ opacity: 0, scale: 3.2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            onAnimationComplete={() => removeRipple(r.id)}
            className="pointer-events-none absolute h-8 w-8 rounded-full"
            style={{
              left: r.x - 16,
              top: r.y - 16,
              background: `radial-gradient(circle, ${(tint ?? ACCENT)}73 0%, transparent 70%)`,
            }}
          />
        ))}
      </AnimatePresence>

      <motion.span
        layout
        transition={spring}
        animate={{ scale: isActive ? 1.05 : 1 }}
        className="relative z-10 flex items-center justify-center"
      >
        <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.4 : 2} />
      </motion.span>

      <motion.span
        layout
        initial={false}
        animate={{
          maxWidth: isActive ? 96 : 0,
          opacity: isActive ? 1 : 0,
          marginLeft: isActive ? 2 : 0,
        }}
        transition={spring}
        className="relative z-10 overflow-hidden whitespace-nowrap text-[13px] font-semibold tracking-tight"
      >
        {label}
      </motion.span>
    </motion.div>
  );

  const wrapperClassName =
    "relative block rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#C7F233] focus-visible:ring-offset-2 focus-visible:ring-offset-[#04170E]";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className={wrapperClassName}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} aria-current={isActive ? "page" : undefined} aria-label={label} className={wrapperClassName}>
      {content}
    </Link>
  );
}
