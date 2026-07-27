"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Send, PenSquare, Users, X } from "lucide-react";
import MessagesClient from "@/components/MessagesClient";
import { adminSendMessageAction, resolveAudienceAction } from "@/app/messages/actions";
import { getAdminCoursesAction } from "../actions";
import { createClient } from "@/utils/supabase/client";

const MEMBERSHIPS = ["free", "premium", "vip", "lifetime"];

export default function AdminMessagesPage() {
  const [showCompose, setShowCompose] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const supabase = createClient();

  const [audKind, setAudKind] = useState<"all" | "users" | "membership" | "course">("all");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [membership, setMembership] = useState("premium");
  const [courseId, setCourseId] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sendInternal, setSendInternal] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  const [recipientCount, setRecipientCount] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, role").neq("role", "admin").order("full_name");
      setStudents(data || []);
      const cRes = await getAdminCoursesAction();
      if (cRes.success) setCourses(cRes.data);
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    const count = async () => {
      const res = await resolveAudienceAction({
        kind: audKind,
        userIds: [...selectedUsers],
        membership,
        courseId,
      });
      if (!cancelled) setRecipientCount(res.success ? res.userIds.length : null);
    };
    count();
    return () => { cancelled = true; };
  }, [audKind, selectedUsers, membership, courseId]);

  const handleSend = async () => {
    setSending(true);
    setResult(null);
    const res = await adminSendMessageAction({
      subject,
      body,
      audience: { kind: audKind, userIds: [...selectedUsers], membership, courseId },
      sendInternal,
      sendEmail,
    });
    setSending(false);
    if (res.success) {
      setResult({ ok: true, text: `Sent to ${res.recipients} recipient(s).` });
      setSubject("");
      setBody("");
      setSelectedUsers(new Set());
      setRefreshKey((k) => k + 1);
      setTimeout(() => setShowCompose(false), 1200);
    } else {
      setResult({ ok: false, text: res.error || "Send failed. If tables are missing, run rbac-messaging-community-schema.sql." });
    }
  };

  const filteredStudents = students.filter((s) => (s.full_name || "").toLowerCase().includes(userSearch.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Messages</h1>
          <p className="text-white/50 mt-1">Send messages to students and manage conversations.</p>
        </div>
        <button onClick={() => setShowCompose(true)} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <PenSquare className="w-5 h-5" /> Compose
        </button>
      </div>

      <MessagesClient key={refreshKey} isAdmin />

      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Compose Message</h2>
              <button onClick={() => setShowCompose(false)} className="text-white/50 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-2">Send To</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {([["all", "All Students"], ["users", "Selected Students"], ["membership", "By Membership"], ["course", "Course Students"]] as const).map(([k, label]) => (
                    <button key={k} onClick={() => setAudKind(k)} className={`py-2.5 rounded-xl border text-xs font-bold transition-all ${audKind === k ? "bg-white/10 border-white text-white" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {audKind === "users" && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search students..." className="w-full mb-2 bg-[#0A0A0A] border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none" />
                  <div className="max-h-36 overflow-y-auto space-y-1">
                    {filteredStudents.map((s) => (
                      <label key={s.id} className="flex items-center gap-2 text-sm text-white/70 cursor-pointer py-1 px-2 rounded-lg hover:bg-white/5">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(s.id)}
                          onChange={() => setSelectedUsers((prev) => {
                            const next = new Set(prev);
                            if (next.has(s.id)) next.delete(s.id); else next.add(s.id);
                            return next;
                          })}
                          className="rounded"
                        />
                        {s.full_name || s.id.slice(0, 8)}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {audKind === "membership" && (
                <select value={membership} onChange={(e) => setMembership(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white capitalize focus:outline-none">
                  {MEMBERSHIPS.map((m) => <option key={m} value={m} className="bg-[#0A0A0A] capitalize">{m} members</option>)}
                </select>
              )}

              {audKind === "course" && (
                <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none">
                  <option value="" className="bg-[#0A0A0A]">Select a course...</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.title}</option>)}
                </select>
              )}

              <p className="text-xs text-white/40 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                {recipientCount === null ? "Counting..." : `${recipientCount} recipient(s) will receive this.`}
              </p>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Subject</label>
                <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Message</label>
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" />
              </div>

              <div className="flex flex-wrap gap-5">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={sendInternal} onChange={(e) => setSendInternal(e.target.checked)} className="rounded" />
                  Internal message (dashboard)
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="rounded" />
                  Email
                </label>
              </div>

              {result && (
                <div className={`p-3 rounded-xl border text-sm ${result.ok ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"}`}>
                  {result.text}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowCompose(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button
                onClick={handleSend}
                disabled={sending || !subject.trim() || !body.trim() || (!sendInternal && !sendEmail) || !recipientCount}
                className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Send</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
