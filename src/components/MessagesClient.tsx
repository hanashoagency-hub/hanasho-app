"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, Inbox, Send, Star, Archive, Trash2, Mail, MailOpen, ChevronLeft, RefreshCw } from "lucide-react";
import {
  getMyThreadsAction,
  getThreadMessagesAction,
  replyToThreadAction,
  setThreadStateAction,
} from "@/app/messages/actions";

const POLL_MS = 30_000;

type Folder = "inbox" | "sent" | "starred" | "archived" | "trash";

const STUDENT_FOLDERS: { key: Folder; label: string; icon: any }[] = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "starred", label: "Starred", icon: Star },
  { key: "archived", label: "Archived", icon: Archive },
  { key: "trash", label: "Trash", icon: Trash2 },
];

const ADMIN_FOLDERS: { key: Folder; label: string; icon: any }[] = [
  { key: "inbox", label: "Replies", icon: Inbox },
  { key: "sent", label: "All Sent", icon: Send },
];

export default function MessagesClient({ isAdmin }: { isAdmin: boolean }) {
  const [folder, setFolder] = useState<Folder>(isAdmin ? "sent" : "inbox");
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [openThread, setOpenThread] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);

  const folders = isAdmin ? ADMIN_FOLDERS : STUDENT_FOLDERS;

  const fetchThreads = useCallback(async (target: Folder) => {
    const res = await getMyThreadsAction(target);
    if (res.success) setThreads(res.threads);
    setLoading(false);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchThreads(folder);
    const id = setInterval(() => fetchThreads(folder), POLL_MS);
    return () => clearInterval(id);
  }, [folder, fetchThreads]);

  const openConversation = async (t: any) => {
    setOpenThread(t);
    setThreadLoading(true);
    const res = await getThreadMessagesAction(t.id);
    if (res.success) setMessages(res.messages);
    setThreadLoading(false);
    if (!isAdmin && !t.is_read) fetchThreads(folder);
  };

  const handleReply = async () => {
    if (!reply.trim() || !openThread) return;
    setSending(true);
    const res = await replyToThreadAction(openThread.id, reply);
    if (res.success) {
      setReply("");
      const refreshed = await getThreadMessagesAction(openThread.id);
      if (refreshed.success) setMessages(refreshed.messages);
    }
    setSending(false);
  };

  const mutateThread = async (t: any, patch: { is_starred?: boolean; folder?: string; is_read?: boolean }) => {
    await setThreadStateAction(t.id, patch);
    fetchThreads(folder);
  };

  const filtered = threads.filter((t) => t.subject?.toLowerCase().includes(search.toLowerCase()));

  if (openThread) {
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] overflow-hidden">
        <div className="flex items-center gap-3 p-4 border-b border-[var(--border-color)]">
          <button onClick={() => { setOpenThread(null); fetchThreads(folder); }} className="p-2 rounded-lg hover:bg-[var(--border-color)] text-[var(--text-primary)]">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="font-heading font-bold text-[var(--text-primary)] truncate flex-1">{openThread.subject}</h2>
        </div>

        <div className="p-4 space-y-4 max-h-[50vh] overflow-y-auto">
          {threadLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" /></div>
          ) : messages.map((m) => (
            <div key={m.id} className={`max-w-[85%] rounded-[16px] px-4 py-3 ${m.sender_is_admin === isAdmin ? "ml-auto bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/25" : "bg-[var(--bg-primary)] border border-[var(--border-color)]"}`}>
              <p className="text-xs font-bold text-[var(--brand-primary)] mb-1">
                {m.sender_is_admin ? "HanHub Team" : (m.profiles?.full_name || "Student")}
              </p>
              <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">{m.body}</p>
              <p className="text-[10px] text-[var(--text-secondary)] mt-2">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border-color)] flex gap-3">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            placeholder="Write a reply..."
            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] py-2.5 px-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] resize-none"
          />
          <button
            onClick={handleReply}
            disabled={sending || !reply.trim()}
            className="px-5 rounded-[12px] bg-[var(--brand-primary)] text-[var(--on-brand)] font-bold text-sm disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4">
      <div className="flex md:flex-col gap-1 overflow-x-auto">
        {folders.map((f) => (
          <button
            key={f.key}
            onClick={() => setFolder(f.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-sm font-bold whitespace-nowrap transition-colors ${folder === f.key ? "bg-[var(--bg-secondary)] text-[var(--brand-primary)] border border-[var(--border-color)]" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
          >
            <f.icon className="w-4 h-4" /> {f.label}
          </button>
        ))}
        <button onClick={() => fetchThreads(folder)} className="flex items-center gap-2 px-4 py-2.5 rounded-[12px] text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search messages..."
          className="w-full mb-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[12px] py-2.5 px-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
        />

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-[var(--text-secondary)]" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[16px]">
            <Mail className="w-10 h-10 text-[var(--border-color)] mx-auto mb-3" />
            <p className="text-[var(--text-secondary)] text-sm">No messages here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={`flex items-center gap-3 p-4 rounded-[14px] border cursor-pointer transition-colors ${!t.is_read && !isAdmin ? "bg-[var(--brand-primary)]/8 border-[var(--brand-primary)]/30" : "bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-[var(--brand-primary)]/40"}`}
                onClick={() => openConversation(t)}
              >
                {!isAdmin ? (
                  t.is_read ? <MailOpen className="w-4 h-4 text-[var(--text-secondary)] flex-shrink-0" /> : <Mail className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
                ) : (
                  <Mail className={`w-4 h-4 flex-shrink-0 ${t.has_student_reply ? "text-[var(--brand-primary)]" : "text-[var(--text-secondary)]"}`} />
                )}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${!t.is_read && !isAdmin ? "font-bold text-[var(--text-primary)]" : "text-[var(--text-primary)]"}`}>{t.subject}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {new Date(t.last_message_at).toLocaleString()}
                    {isAdmin && t.has_student_reply ? " · student replied" : ""}
                  </p>
                </div>
                {!isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => mutateThread(t, { is_starred: !t.is_starred })} className={`p-1.5 rounded-lg hover:bg-[var(--border-color)] ${t.is_starred ? "text-yellow-400" : "text-[var(--text-secondary)]"}`} title="Star">
                      <Star className={`w-3.5 h-3.5 ${t.is_starred ? "fill-current" : ""}`} />
                    </button>
                    {t.folder !== "archived" && (
                      <button onClick={() => mutateThread(t, { folder: "archived" })} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)]" title="Archive">
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {t.folder !== "trash" ? (
                      <button onClick={() => mutateThread(t, { folder: "trash" })} className="p-1.5 rounded-lg text-red-400/70 hover:bg-red-500/10" title="Trash">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button onClick={() => mutateThread(t, { folder: "inbox" })} className="p-1.5 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--border-color)]" title="Restore">
                        <Inbox className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
