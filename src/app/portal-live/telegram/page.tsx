"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, Search, Send, Users, RefreshCw, Ban, ExternalLink } from "lucide-react";
import { getAllTelegramInvitesAction, regenerateTelegramInviteAction, revokeTelegramInviteAction } from "./actions";

interface InviteRow {
  id: string;
  user_id: string;
  course_id: string;
  user_name: string;
  user_email: string;
  course_title: string;
  channel_invite_link: string | null;
  channel_status: string;
  group_invite_link: string | null;
  group_status: string;
  created_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/10 text-green-400 border-green-500/20",
    revoked: "bg-red-500/10 text-red-400 border-red-500/20",
    expired: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || styles.expired}`}>
      {status}
    </span>
  );
}

export default function AdminTelegramPage() {
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const fetchInvites = async () => {
    const res = await getAllTelegramInvitesAction();
    if (res.success) setInvites(res.invites as InviteRow[]);
    setLoading(false);
  };

  useEffect(() => { fetchInvites(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return invites;
    return invites.filter((i) =>
      i.user_email.toLowerCase().includes(q) ||
      i.user_name.toLowerCase().includes(q) ||
      i.course_title.toLowerCase().includes(q)
    );
  }, [invites, search]);

  const handleRegenerate = async (inviteId: string, which: "channel" | "group") => {
    const key = `${inviteId}-regen-${which}`;
    setBusyKey(key);
    await regenerateTelegramInviteAction(inviteId, which);
    await fetchInvites();
    setBusyKey(null);
  };

  const handleRevoke = async (inviteId: string, which: "channel" | "group") => {
    if (!confirm(`Revoke this user's ${which} invite?`)) return;
    const key = `${inviteId}-revoke-${which}`;
    setBusyKey(key);
    await revokeTelegramInviteAction(inviteId, which);
    await fetchInvites();
    setBusyKey(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Telegram VIP Access</h1>
          <p className="text-white/50 mt-1">Every unique invite link generated for course purchasers.</p>
        </div>
        <div className="relative">
          <Search className="w-4 h-4 text-white/30 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email, name, or course..."
            className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 w-72"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Send className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Invites Yet</h3>
          <p className="text-white/50">Invite links appear here automatically after a course purchase.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((invite) => (
            <div key={invite.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-4 pb-4 border-b border-white/5">
                <div>
                  <p className="font-bold text-white">{invite.user_name}</p>
                  <p className="text-sm text-white/40">{invite.user_email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white/70">{invite.course_title}</p>
                  <p className="text-xs text-white/30">{new Date(invite.created_at).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Send className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-white/80">Channel</span>
                    <StatusBadge status={invite.channel_status} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {invite.channel_invite_link && invite.channel_status === "active" && (
                      <a href={invite.channel_invite_link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10" title="Open link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRegenerate(invite.id, "channel")}
                      disabled={busyKey === `${invite.id}-regen-channel`}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-40"
                      title="Regenerate"
                    >
                      {busyKey === `${invite.id}-regen-channel` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRevoke(invite.id, "channel")}
                      disabled={invite.channel_status === "revoked" || busyKey === `${invite.id}-revoke-channel`}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                      title="Revoke"
                    >
                      {busyKey === `${invite.id}-revoke-channel` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white/5 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Users className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span className="text-sm text-white/80">Community</span>
                    <StatusBadge status={invite.group_status} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {invite.group_invite_link && invite.group_status === "active" && (
                      <a href={invite.group_invite_link} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10" title="Open link">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={() => handleRegenerate(invite.id, "group")}
                      disabled={busyKey === `${invite.id}-regen-group`}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 disabled:opacity-40"
                      title="Regenerate"
                    >
                      {busyKey === `${invite.id}-regen-group` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleRevoke(invite.id, "group")}
                      disabled={invite.group_status === "revoked" || busyKey === `${invite.id}-revoke-group`}
                      className="p-1.5 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30"
                      title="Revoke"
                    >
                      {busyKey === `${invite.id}-revoke-group` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
