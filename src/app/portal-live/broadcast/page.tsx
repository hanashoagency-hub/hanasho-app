"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Mail, Send, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { getBroadcastRecipientsAction, sendBroadcastAction } from "./actions";

export default function AdminBroadcastPage() {
  const [filter, setFilter] = useState<"google" | "all">("all");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCountLoading(true);
    getBroadcastRecipientsAction(filter).then((res) => {
      if (!cancelled) {
        setRecipientCount(res.success ? res.recipients.length : null);
        setCountLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [filter]);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return;
    if (!confirm(`Send this email to ${recipientCount ?? "all matching"} users? This cannot be undone.`)) return;

    setSending(true);
    setResult(null);
    const res = await sendBroadcastAction({ subject: subject.trim(), message: message.trim(), filter });
    setSending(false);

    if (res.success) {
      setResult({ ok: true, text: `Sent to ${res.sent} of ${res.total} recipients${res.failed ? ` (${res.failed} failed — check server logs)` : ""}.` });
      setSubject("");
      setMessage("");
    } else {
      setResult({ ok: false, text: res.error || "Broadcast failed." });
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">Email Broadcast</h1>
        <p className="text-white/50 mt-1">Send an announcement email to your registered users from hanasho.agency@gmail.com.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 space-y-5">
          <div>
            <label className="text-sm font-medium text-gray-300 block mb-2">Audience</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFilter("all")}
                className={`py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${filter === "all" ? "bg-white/10 border-white text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}
              >
                <Users className="w-4 h-4" /> All users
              </button>
              <button
                onClick={() => setFilter("google")}
                className={`py-3 rounded-xl border text-sm font-bold transition-all flex items-center justify-center gap-2 ${filter === "google" ? "bg-white/10 border-white text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}
              >
                <Mail className="w-4 h-4" /> Google sign-ups only
              </button>
            </div>
            <p className="text-xs text-white/40 mt-2 flex items-center gap-1.5">
              {countLoading ? (
                <><Loader2 className="w-3 h-3 animate-spin" /> Counting recipients...</>
              ) : recipientCount !== null ? (
                <>{recipientCount} recipient{recipientCount === 1 ? "" : "s"} will receive this email.</>
              ) : (
                "Could not count recipients."
              )}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1">Subject</label>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. New course launching this week 🎉" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-300 block mb-1">Message</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={8} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder={"Write your announcement here.\n\nEach blank line becomes a new paragraph. Every email opens with \"Hello {first name},\" automatically."} />
          </div>

          {result && (
            <div className={`p-4 rounded-xl border text-sm flex items-center gap-2 ${result.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
              {result.ok ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
              {result.text}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim() || countLoading || !recipientCount}
            className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-4 rounded-xl hover:scale-[1.01] transition-transform disabled:opacity-50"
          >
            {sending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Sending... (this can take a few minutes)</>
            ) : (
              <><Send className="w-5 h-5" /> Send Broadcast</>
            )}
          </button>
        </div>

        <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 flex gap-3 text-sm text-yellow-200/80">
          <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
          <p>Gmail allows roughly 500 emails per day on a standard account. If your audience is larger than that, split the broadcast across days or move to a dedicated email provider.</p>
        </div>
      </div>
    </div>
  );
}
