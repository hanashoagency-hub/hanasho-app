"use server";

import * as React from "react";
import nodemailer from "nodemailer";
import { render } from "@react-email/render";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import BroadcastEmail from "@/emails/BroadcastEmail";

// ---------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------

async function getCaller() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("role, full_name").eq("id", user.id).maybeSingle();
  return { id: user.id, email: user.email, isAdmin: profile?.role === "admin", name: profile?.full_name || "" };
}

async function emailUsers(userIds: string[], subject: string, body: string) {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT?.trim() || 587);
  const smtpUser = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !smtpUser || !pass) return;

  const admin = getAdminClient();
  const transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user: smtpUser, pass } });
  const from = process.env.EMAIL_FROM?.trim() || smtpUser;

  // Resolve emails via the auth admin API in one paginated sweep.
  const emailMap: Record<string, { email: string; name: string }> = {};
  let page = 1;
  while (page <= 20) {
    const { data } = await admin.auth.admin.listUsers({ page, perPage: 500 });
    const users = data?.users || [];
    for (const u of users) {
      if (u.email && userIds.includes(u.id)) {
        emailMap[u.id] = { email: u.email, name: (u.user_metadata?.full_name as string) || "" };
      }
    }
    if (users.length < 500) break;
    page++;
  }

  for (const id of userIds) {
    const rec = emailMap[id];
    if (!rec) continue;
    try {
      const html = await render(React.createElement(BroadcastEmail, {
        firstName: rec.name.split(" ")[0] || "there",
        subject,
        message: body,
      }));
      await transporter.sendMail({ from, to: rec.email, subject, html });
    } catch (err) {
      console.error(`[messages] email to ${rec.email} failed:`, err);
    }
  }
}

// ---------------------------------------------------------------
// Admin: audience resolution + send
// ---------------------------------------------------------------

export async function resolveAudienceAction(audience: {
  kind: "users" | "all" | "membership" | "course";
  userIds?: string[];
  membership?: string;
  courseId?: string;
}) {
  try {
    const caller = await getCaller();
    if (!caller?.isAdmin) return { success: false, userIds: [] as string[], error: "Not authorized." };
    const admin = getAdminClient();

    let ids: string[] = [];
    if (audience.kind === "users") {
      ids = audience.userIds || [];
    } else if (audience.kind === "all") {
      const { data } = await admin.from("profiles").select("id").neq("role", "admin");
      ids = (data || []).map((p: any) => p.id);
    } else if (audience.kind === "membership") {
      const { data } = await admin.from("profiles").select("id").eq("membership_type", audience.membership).neq("role", "admin");
      ids = (data || []).map((p: any) => p.id);
    } else if (audience.kind === "course") {
      const { data } = await admin.from("purchases").select("user_id").eq("course_id", audience.courseId);
      ids = [...new Set((data || []).map((p: any) => p.user_id))];
    }

    return { success: true, userIds: ids };
  } catch (error: any) {
    return { success: false, userIds: [] as string[], error: error.message };
  }
}

export async function adminSendMessageAction(params: {
  subject: string;
  body: string;
  audience: { kind: "users" | "all" | "membership" | "course"; userIds?: string[]; membership?: string; courseId?: string };
  sendInternal: boolean;
  sendEmail: boolean;
}) {
  try {
    const caller = await getCaller();
    if (!caller?.isAdmin) return { success: false, error: "Not authorized." };
    if (!params.subject.trim() || !params.body.trim()) return { success: false, error: "Subject and message are required." };
    if (!params.sendInternal && !params.sendEmail) return { success: false, error: "Choose internal message, email, or both." };

    const { userIds } = await resolveAudienceAction(params.audience);
    if (userIds.length === 0) return { success: false, error: "No recipients matched." };

    const admin = getAdminClient();

    if (params.sendInternal) {
      const { data: thread, error: threadErr } = await admin
        .from("message_threads")
        .insert({ subject: params.subject.trim(), created_by: caller.id })
        .select()
        .single();
      if (threadErr) throw new Error(threadErr.message);

      const { error: msgErr } = await admin.from("messages").insert({
        thread_id: thread.id,
        sender_id: caller.id,
        sender_is_admin: true,
        body: params.body.trim(),
      });
      if (msgErr) throw new Error(msgErr.message);

      const { error: recErr } = await admin.from("message_recipients").insert(
        userIds.map((uid) => ({ thread_id: thread.id, user_id: uid }))
      );
      if (recErr) throw new Error(recErr.message);

      await admin.from("notifications").insert(
        userIds.map((uid) => ({
          user_id: uid,
          kind: "message",
          title: `New message: ${params.subject.trim()}`,
          link: "/dashboard/messages",
        }))
      );
    }

    if (params.sendEmail) {
      // Fire-and-forget style but awaited so serverless doesn't kill it;
      // failures are logged per-recipient and never abort the send.
      await emailUsers(userIds, params.subject.trim(), params.body.trim());
    }

    return { success: true, recipients: userIds.length };
  } catch (error: any) {
    console.error("Admin Send Message Error:", error);
    return { success: false, error: error.message };
  }
}

// ---------------------------------------------------------------
// Shared: thread listing + reading (admin sees all, students see theirs)
// ---------------------------------------------------------------

export async function getMyThreadsAction(folder: "inbox" | "archived" | "trash" | "starred" | "sent") {
  try {
    const caller = await getCaller();
    if (!caller) return { success: false, threads: [] };
    const admin = getAdminClient();

    if (caller.isAdmin) {
      // Admin view: sent = threads they created; inbox = threads with student replies.
      const { data: threads } = await admin
        .from("message_threads")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(100);

      const rows = threads || [];
      const threadIds = rows.map((t: any) => t.id);
      const countsMap: Record<string, number> = {};
      const lastFromStudent: Record<string, boolean> = {};
      if (threadIds.length > 0) {
        const { data: msgs } = await admin
          .from("messages")
          .select("thread_id, sender_is_admin, created_at")
          .in("thread_id", threadIds)
          .order("created_at", { ascending: true });
        for (const m of msgs || []) {
          countsMap[m.thread_id] = (countsMap[m.thread_id] || 0) + 1;
          lastFromStudent[m.thread_id] = !m.sender_is_admin;
        }
      }

      const enriched = rows.map((t: any) => ({
        ...t,
        message_count: countsMap[t.id] || 0,
        has_student_reply: !!lastFromStudent[t.id],
        is_read: true, is_starred: false,
      }));

      const filtered = folder === "inbox"
        ? enriched.filter((t: any) => t.has_student_reply)
        : folder === "sent"
          ? enriched
          : [];
      return { success: true, threads: filtered };
    }

    // Student view: driven by their recipient rows.
    let query = admin
      .from("message_recipients")
      .select("*, message_threads(*)")
      .eq("user_id", caller.id);

    if (folder === "starred") query = query.eq("is_starred", true).neq("folder", "trash");
    else if (folder === "sent") query = query.neq("folder", "trash");
    else query = query.eq("folder", folder);

    const { data } = await query;
    const threads = (data || [])
      .filter((r: any) => r.message_threads)
      .map((r: any) => ({
        ...r.message_threads,
        is_read: r.is_read,
        is_starred: r.is_starred,
        folder: r.folder,
      }))
      .sort((a: any, b: any) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

    return { success: true, threads };
  } catch (error: any) {
    console.error("Get Threads Error:", error);
    return { success: false, threads: [] };
  }
}

export async function getThreadMessagesAction(threadId: string) {
  try {
    const caller = await getCaller();
    if (!caller) return { success: false, messages: [], subject: "" };
    const admin = getAdminClient();

    if (!caller.isAdmin) {
      const { data: recipient } = await admin
        .from("message_recipients")
        .select("id")
        .eq("thread_id", threadId)
        .eq("user_id", caller.id)
        .maybeSingle();
      if (!recipient) return { success: false, messages: [], subject: "" };

      await admin.from("message_recipients").update({ is_read: true }).eq("thread_id", threadId).eq("user_id", caller.id);
      await admin.from("notifications").update({ is_read: true }).eq("user_id", caller.id).eq("kind", "message");
    }

    const { data: thread } = await admin.from("message_threads").select("subject").eq("id", threadId).maybeSingle();
    const { data: messages } = await admin
      .from("messages")
      .select("*, profiles(full_name, avatar_url)")
      .eq("thread_id", threadId)
      .order("created_at", { ascending: true });

    return { success: true, messages: messages || [], subject: thread?.subject || "" };
  } catch (error: any) {
    console.error("Get Thread Messages Error:", error);
    return { success: false, messages: [], subject: "" };
  }
}

export async function replyToThreadAction(threadId: string, body: string) {
  try {
    const caller = await getCaller();
    if (!caller) return { success: false, error: "Not signed in." };
    if (!body.trim()) return { success: false, error: "Message is empty." };
    const admin = getAdminClient();

    if (!caller.isAdmin) {
      const { data: recipient } = await admin
        .from("message_recipients")
        .select("id")
        .eq("thread_id", threadId)
        .eq("user_id", caller.id)
        .maybeSingle();
      if (!recipient) return { success: false, error: "You are not part of this conversation." };
    }

    const { error: msgErr } = await admin.from("messages").insert({
      thread_id: threadId,
      sender_id: caller.id,
      sender_is_admin: caller.isAdmin,
      body: body.trim(),
    });
    if (msgErr) throw new Error(msgErr.message);

    await admin.from("message_threads").update({ last_message_at: new Date().toISOString() }).eq("id", threadId);

    if (caller.isAdmin) {
      // Admin replied: mark unread for all student recipients + notify.
      const { data: recipients } = await admin.from("message_recipients").select("user_id").eq("thread_id", threadId);
      const ids = (recipients || []).map((r: any) => r.user_id);
      if (ids.length > 0) {
        await admin.from("message_recipients").update({ is_read: false }).eq("thread_id", threadId);
        await admin.from("notifications").insert(
          ids.map((uid: string) => ({ user_id: uid, kind: "message", title: "New reply from HanHub", link: "/dashboard/messages" }))
        );
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Reply Error:", error);
    return { success: false, error: error.message };
  }
}

export async function setThreadStateAction(threadId: string, patch: { is_read?: boolean; is_starred?: boolean; folder?: string }) {
  try {
    const caller = await getCaller();
    if (!caller) return { success: false };
    const admin = getAdminClient();
    await admin.from("message_recipients").update(patch).eq("thread_id", threadId).eq("user_id", caller.id);
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getUnreadCountAction() {
  try {
    const caller = await getCaller();
    if (!caller) return { count: 0 };
    const admin = getAdminClient();
    const { count } = await admin
      .from("message_recipients")
      .select("id", { count: "exact", head: true })
      .eq("user_id", caller.id)
      .eq("is_read", false)
      .eq("folder", "inbox");
    return { count: count || 0 };
  } catch {
    return { count: 0 };
  }
}
