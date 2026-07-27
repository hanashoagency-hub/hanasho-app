"use server";

import { getAdminClient } from "@/utils/certificates";
import { getOrCreateTelegramInvites, revokeTelegramInvite } from "@/utils/telegramInvites";

export async function getAllTelegramInvitesAction() {
  try {
    const admin = getAdminClient();

    const { data: invites, error } = await admin
      .from("telegram_invites")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!invites || invites.length === 0) return { success: true, invites: [] };

    const userIds = [...new Set(invites.map((i: any) => i.user_id).filter(Boolean))];
    const courseIds = [...new Set(invites.map((i: any) => i.course_id).filter(Boolean))];

    const profilesMap: Record<string, string> = {};
    const emailMap: Record<string, string> = {};
    const coursesMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await admin.from("profiles").select("id, full_name").in("id", userIds);
      (profiles || []).forEach((p: any) => { profilesMap[p.id] = p.full_name || "Unknown"; });

      // Emails only live in auth.users, not profiles — resolved via the admin auth API.
      const { data: usersPage } = await admin.auth.admin.listUsers({ perPage: 1000 });
      (usersPage?.users || []).forEach((u: any) => {
        if (userIds.includes(u.id)) emailMap[u.id] = u.email || "";
      });
    }

    if (courseIds.length > 0) {
      const { data: courses } = await admin.from("courses").select("id, title").in("id", courseIds);
      (courses || []).forEach((c: any) => { coursesMap[c.id] = c.title || "Untitled course"; });
    }

    const enriched = invites.map((i: any) => ({
      ...i,
      user_name: profilesMap[i.user_id] || "Unknown",
      user_email: emailMap[i.user_id] || "",
      course_title: coursesMap[i.course_id] || "Unknown course",
    }));

    return { success: true, invites: enriched };
  } catch (error: any) {
    console.error("Admin Telegram Invites Fetch Error:", error);
    return { success: false, invites: [] };
  }
}

export async function regenerateTelegramInviteAction(inviteId: string, which: "channel" | "group") {
  try {
    const admin = getAdminClient();
    const { data: row } = await admin.from("telegram_invites").select("*").eq("id", inviteId).maybeSingle();
    if (!row) throw new Error("Invite record not found.");

    // Force-expire the target half so getOrCreateTelegramInvites regenerates it.
    await admin
      .from("telegram_invites")
      .update(which === "channel" ? { channel_status: "expired" } : { group_status: "expired" })
      .eq("id", inviteId);

    const { data: course } = await admin.from("courses").select("title").eq("id", row.course_id).maybeSingle();
    await getOrCreateTelegramInvites(row.user_id, row.course_id, course?.title || "the course");

    return { success: true };
  } catch (error: any) {
    console.error("Regenerate Telegram Invite Error:", error);
    return { success: false, error: error.message };
  }
}

export async function revokeTelegramInviteAction(inviteId: string, which: "channel" | "group") {
  try {
    await revokeTelegramInvite(inviteId, which);
    return { success: true };
  } catch (error: any) {
    console.error("Revoke Telegram Invite Error:", error);
    return { success: false, error: error.message };
  }
}
