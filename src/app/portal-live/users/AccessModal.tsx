"use client";

import React, { useState, useEffect } from "react";
import { Loader2, X, BookOpen, BookMarked, Infinity as InfinityIcon } from "lucide-react";
import { getUserAccessAction, saveUserAccessAction, updateUserStatusAction } from "./actions";

const MEMBERSHIPS = ["free", "premium", "vip", "lifetime"];
const SUB_STATUSES = ["active", "expired", "suspended", "cancelled"];
const ACCOUNT_STATUSES = ["active", "suspended", "banned", "pending_verification", "inactive"];

interface KindState {
  all_access: boolean;
  can_download: boolean;
  expires_at: string | null;
  selectedIds: Set<string>;
}

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AccessModal({ user, onClose, onSaved }: { user: any; onClose: () => void; onSaved: () => void }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [membership, setMembership] = useState(user.membership_type || "free");
  const [subStatus, setSubStatus] = useState(user.subscription_status || "active");
  const [accountStatus, setAccountStatus] = useState(user.account_status || "active");

  const [courses, setCourses] = useState<any[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [kindState, setKindState] = useState<Record<string, KindState>>({
    course: { all_access: false, can_download: true, expires_at: null, selectedIds: new Set() },
    book: { all_access: false, can_download: true, expires_at: null, selectedIds: new Set() },
  });

  useEffect(() => {
    const load = async () => {
      const res = await getUserAccessAction(user.id);
      if (res.success) {
        setCourses(res.courses);
        setBooks(res.books);
        const next: Record<string, KindState> = {
          course: { all_access: false, can_download: true, expires_at: null, selectedIds: new Set() },
          book: { all_access: false, can_download: true, expires_at: null, selectedIds: new Set() },
        };
        for (const p of res.permissions) {
          if (next[p.content_kind]) {
            next[p.content_kind].all_access = p.all_access;
            next[p.content_kind].can_download = p.can_download;
            next[p.content_kind].expires_at = p.expires_at;
          }
        }
        for (const g of res.grants) {
          next[g.content_kind]?.selectedIds.add(g.item_id);
        }
        setKindState(next);
      }
      setLoading(false);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  const updateKind = (kind: string, patch: Partial<KindState>) => {
    setKindState((prev) => ({ ...prev, [kind]: { ...prev[kind], ...patch } }));
  };

  const toggleItem = (kind: string, itemId: string) => {
    setKindState((prev) => {
      const ids = new Set(prev[kind].selectedIds);
      if (ids.has(itemId)) ids.delete(itemId); else ids.add(itemId);
      return { ...prev, [kind]: { ...prev[kind], selectedIds: ids } };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    const statusRes = await updateUserStatusAction(user.id, {
      membership_type: membership,
      subscription_status: subStatus,
      account_status: accountStatus,
    });

    const permissions = Object.entries(kindState).map(([kind, s]) => ({
      content_kind: kind,
      all_access: s.all_access,
      can_download: s.can_download,
      expires_at: s.expires_at,
    }));
    const grants = Object.entries(kindState).flatMap(([kind, s]) =>
      s.all_access ? [] : [...s.selectedIds].map((item_id) => ({ content_kind: kind, item_id, expires_at: s.expires_at }))
    );

    const accessRes = await saveUserAccessAction(user.id, { permissions, grants });
    setSaving(false);

    if (!statusRes.success || !accessRes.success) {
      setError(statusRes.error || accessRes.error || "Could not save. If tables are missing, run rbac-messaging-community-schema.sql in Supabase.");
      return;
    }
    onSaved();
    onClose();
  };

  const renderKindSection = (kind: "course" | "book", label: string, Icon: any, items: any[]) => {
    const s = kindState[kind];
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
        <p className="font-bold text-white flex items-center gap-2"><Icon className="w-4 h-4 text-[#C7F233]" /> {label}</p>

        <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
          <input type="checkbox" checked={s.all_access} onChange={(e) => updateKind(kind, { all_access: e.target.checked })} className="rounded" />
          <span className="flex items-center gap-1.5">Access all {label.toLowerCase()} <span className="text-white/40 text-xs flex items-center gap-1">(<InfinityIcon className="w-3 h-3" /> includes all future {label.toLowerCase()} automatically)</span></span>
        </label>

        {kind === "book" && (
          <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
            <input type="checkbox" checked={s.can_download} onChange={(e) => updateKind(kind, { can_download: e.target.checked })} className="rounded" />
            Download permission (unchecked = read only)
          </label>
        )}

        <div>
          <label className="text-xs font-medium text-white/50 block mb-1">Expiry (empty = lifetime access)</label>
          <input
            type="datetime-local"
            value={toLocalInputValue(s.expires_at)}
            onChange={(e) => updateKind(kind, { expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        {!s.all_access && (
          <div>
            <p className="text-xs font-medium text-white/50 mb-2">Individual {label.toLowerCase()} ({s.selectedIds.size} selected)</p>
            <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
              {items.length === 0 ? (
                <p className="text-xs text-white/30">No {label.toLowerCase()} exist yet.</p>
              ) : items.map((item) => (
                <label key={item.id} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5">
                  <input type="checkbox" checked={s.selectedIds.has(item.id)} onChange={() => toggleItem(kind, item.id)} className="rounded" />
                  <span className="truncate">{item.title}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-white">Access Permissions</h2>
            <p className="text-white/40 text-sm">{user.full_name || user.id}</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-white/50" /></div>
          ) : (
            <>
              {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1">Membership</label>
                  <select value={membership} onChange={(e) => setMembership(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none capitalize">
                    {MEMBERSHIPS.map((m) => <option key={m} value={m} className="bg-[#0A0A0A] capitalize">{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1">Subscription</label>
                  <select value={subStatus} onChange={(e) => setSubStatus(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none capitalize">
                    {SUB_STATUSES.map((sst) => <option key={sst} value={sst} className="bg-[#0A0A0A] capitalize">{sst}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-white/70 block mb-1">Account Status</label>
                  <select value={accountStatus} onChange={(e) => setAccountStatus(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 px-3 text-white text-sm focus:outline-none capitalize">
                    {ACCOUNT_STATUSES.map((a) => <option key={a} value={a} className="bg-[#0A0A0A] capitalize">{a.replace("_", " ")}</option>)}
                  </select>
                </div>
              </div>

              {renderKindSection("course", "Courses", BookOpen, courses)}
              {renderKindSection("book", "Books", BookMarked, books)}

              <p className="text-xs text-white/40 leading-relaxed">
                Suspended or banned accounts lose access to all gated content regardless of grants. Purchases always keep working — permissions only ever ADD access on top of them.
              </p>
            </>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-white/10 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || loading} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.01] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Access"}
          </button>
        </div>
      </div>
    </div>
  );
}
