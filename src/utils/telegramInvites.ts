import { getAdminClient } from "@/utils/certificates";
import { createChannelInvite, createCommunityInvite, revokeInvite } from "@/utils/telegram";
import { sendTelegramAccessEmail } from "@/utils/email";

interface InviteRow {
  id: string;
  user_id: string;
  course_id: string;
  channel_invite_link: string | null;
  channel_status: string;
  channel_expires_at: string | null;
  group_invite_link: string | null;
  group_status: string;
  group_expires_at: string | null;
  email_sent_at: string | null;
}

function isExpiredOrInvalid(link: string | null, status: string, expiresAt: string | null): boolean {
  if (!link || status !== "active") return true;
  if (expiresAt && new Date(expiresAt).getTime() < Date.now()) return true;
  return false;
}

// Fetches this user's Telegram VIP invite links for a course, generating
// (or regenerating any expired/revoked/missing half) as needed. Callers are
// responsible for verifying the user actually purchased the course first —
// this function does not re-check ownership.
export async function getOrCreateTelegramInvites(userId: string, courseId: string, courseTitle: string) {
  const admin = getAdminClient();

  const { data: existing } = await admin
    .from("telegram_invites")
    .select("*")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle<InviteRow>();

  const needsChannel = !existing || isExpiredOrInvalid(existing.channel_invite_link, existing.channel_status, existing.channel_expires_at);
  const needsGroup = !existing || isExpiredOrInvalid(existing.group_invite_link, existing.group_status, existing.group_expires_at);

  if (!needsChannel && !needsGroup && existing) {
    return {
      channelInviteLink: existing.channel_invite_link!,
      groupInviteLink: existing.group_invite_link!,
      isNew: false,
    };
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (needsChannel) {
    const invite = await createChannelInvite(courseTitle);
    updates.channel_invite_link = invite.inviteLink;
    updates.channel_status = "active";
    updates.channel_expires_at = invite.expiresAt;
  }
  if (needsGroup) {
    const invite = await createCommunityInvite(courseTitle);
    updates.group_invite_link = invite.inviteLink;
    updates.group_status = "active";
    updates.group_expires_at = invite.expiresAt;
  }

  if (existing) {
    await admin.from("telegram_invites").update(updates).eq("id", existing.id);
  } else {
    await admin.from("telegram_invites").insert({
      user_id: userId,
      course_id: courseId,
      ...updates,
    });
  }

  const channelInviteLink = (updates.channel_invite_link as string | undefined) ?? existing?.channel_invite_link ?? "";
  const groupInviteLink = (updates.group_invite_link as string | undefined) ?? existing?.group_invite_link ?? "";

  return {
    channelInviteLink,
    groupInviteLink,
    isNew: !existing,
  };
}

// Called right after a successful course purchase (WaafiPay or Stripe, single
// or cart checkout). Provisions the invite links and sends the one-time
// welcome email. Never throws — a Telegram/email hiccup must never surface
// as a payment failure to the user who already paid.
export async function provisionTelegramAccessForPurchase(params: {
  userId: string;
  userEmail: string | null | undefined;
  userName: string | null | undefined;
  courseId: string;
}) {
  try {
    const admin = getAdminClient();

    const { data: course } = await admin
      .from("courses")
      .select("title")
      .eq("id", params.courseId)
      .maybeSingle();
    const courseTitle = course?.title || "your course";

    await getOrCreateTelegramInvites(params.userId, params.courseId, courseTitle);

    const { data: row } = await admin
      .from("telegram_invites")
      .select("*")
      .eq("user_id", params.userId)
      .eq("course_id", params.courseId)
      .maybeSingle<InviteRow>();

    if (row && !row.email_sent_at && params.userEmail && row.channel_invite_link && row.group_invite_link) {
      await sendTelegramAccessEmail({
        to: params.userEmail,
        firstName: params.userName?.split(" ")[0] || "there",
        courseTitle,
        channelInviteLink: row.channel_invite_link,
        groupInviteLink: row.group_invite_link,
      });
      await admin.from("telegram_invites").update({ email_sent_at: new Date().toISOString() }).eq("id", row.id);
    }
  } catch (err) {
    console.error("[telegram] provisionTelegramAccessForPurchase failed (purchase itself is unaffected):", err);
  }
}

export async function revokeTelegramInvite(inviteId: string, which: "channel" | "group") {
  const admin = getAdminClient();
  const { data: row } = await admin
    .from("telegram_invites")
    .select("*")
    .eq("id", inviteId)
    .maybeSingle<InviteRow>();

  if (!row) throw new Error("Invite record not found.");

  const link = which === "channel" ? row.channel_invite_link : row.group_invite_link;
  if (link) {
    try {
      await revokeInvite(which, link);
    } catch (err) {
      // Telegram may already consider it invalid (used/expired) — that's
      // fine, we still want to mark it revoked on our side.
      console.error(`[telegram] revoke ${which} invite failed (continuing):`, err);
    }
  }

  await admin
    .from("telegram_invites")
    .update(which === "channel" ? { channel_status: "revoked" } : { group_status: "revoked" })
    .eq("id", inviteId);
}
