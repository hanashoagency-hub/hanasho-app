"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const TELEGRAM_URL = "https://t.me/hanhub_so";
const SHOW_AFTER_MS = 1200;
const AUTO_DISMISS_MS = 50000;

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="#26A5E4" className={className}>
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 8.16l-1.61 7.593c-.12.539-.437.673-.887.42l-2.45-1.805-1.183 1.138c-.131.131-.241.241-.494.241l.177-2.5 4.55-4.113c.198-.176-.043-.274-.307-.098l-5.62 3.54-2.42-.756c-.526-.164-.536-.526.11-.78l9.46-3.65c.44-.16.826.106.674.77z" />
    </svg>
  );
}

export default function TelegramPopup() {
  const [visible, setVisible] = useState(false);

  // Shows on every page load.
  useEffect(() => {
    const showTimer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const hideTimer = setTimeout(() => setVisible(false), AUTO_DISMISS_MS);
    return () => clearTimeout(hideTimer);
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -16, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.95, transition: { duration: 0.25 } }}
          transition={{ type: "spring", stiffness: 340, damping: 28 }}
          className="fixed top-24 right-4 z-40 w-[300px] max-w-[calc(100vw-2rem)] sm:right-6"
        >
          <div
            className="relative overflow-hidden rounded-[20px] border p-4 shadow-2xl"
            style={{
              background: "rgba(14, 42, 27, 0.75)",
              borderColor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
            }}
          >
            <button
              onClick={() => setVisible(false)}
              aria-label="Close"
              className="absolute right-3 top-3 text-white/50 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-3 pr-5">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-white/5">
                <TelegramIcon className="h-7 w-7" />
              </div>
              <div>
                <p className="font-heading text-sm font-bold text-[#F2EFE7]">Ku soo biir Community-ga!</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#F2EFE7]/70">
                  Si aad u hesho updates-ka ugu dambeeyey, Casharo, iyo hagitaan BILAASH AH.
                </p>
              </div>
            </div>

            <a
              href={TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setVisible(false)}
              className="mt-3 flex items-center justify-center gap-1.5 rounded-full py-2 text-sm font-bold transition-transform hover:scale-[1.02]"
              style={{ background: "#26A5E4", color: "#fff" }}
            >
              Join Now
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
