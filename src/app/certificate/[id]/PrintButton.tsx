"use client";

import { Download } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-black text-sm font-semibold hover:scale-105 transition-transform"
    >
      <Download className="w-4 h-4" /> Download / Print
    </button>
  );
}
