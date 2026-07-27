"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import MessagesClient from "@/components/MessagesClient";

export default function StudentMessagesPage() {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <MessageSquare className="w-7 h-7 text-[var(--brand-primary)]" /> System Messages
        </h1>
        <p className="text-[var(--text-secondary)]">Messages from the HanHub team. Reply any time — we read everything.</p>
      </header>

      <MessagesClient isAdmin={false} />
    </div>
  );
}
