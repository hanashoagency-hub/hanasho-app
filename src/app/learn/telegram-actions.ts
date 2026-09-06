"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { getOrCreateTelegramInvites } from "@/utils/telegramInvites";

export async function getMyTelegramInvitesAction(courseId: string) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    if (!user) return { success: false, error: "Not signed in." };

    const admin = getAdminClient();

    // Telegram VIP goes to paying members: lifetime purchasers, active monthly
    // subscribers, and students an admin has granted access to. The only
    // access type excluded is a pure free-promo enrollment.
    const { hasActiveSubscription } = await import("@/utils/subscription");
    const isSubscriber = await hasActiveSubscription(user.id, courseId);

    let hasAdminGrant = false;
    if (!isSubscriber) {
      const { data: perm } = await admin
        .from("user_permissions")
        .select("all_access, expires_at")
        .eq("user_id", user.id)
        .eq("content_kind", "course")
        .maybeSingle();
      const permOk = perm?.all_access && (!perm.expires_at || new Date(perm.expires_at).getTime() > Date.now());
      if (permOk) {
        hasAdminGrant = true;
      } else {
        const { data: grant } = await admin
          .from("user_item_grants")
          .select("expires_at")
          .eq("user_id", user.id)
          .eq("content_kind", "course")
          .eq("item_id", courseId)
          .maybeSingle();
        hasAdminGrant = !!grant && (!grant.expires_at || new Date(grant.expires_at).getTime() > Date.now());
      }
    }

    let isPaidPurchaser = false;
    if (!isSubscriber && !hasAdminGrant) {
      const { data: purchase } = await admin
        .from("purchases")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();
      if (!purchase) {
        return { success: false, error: "You do not have access to this course." };
      }
      // A purchase whose only successful transactions are free-promo is a free
      // enrollment — those don't include VIP Telegram. Legacy purchases with no
      // transaction rows predate promos and count as paid.
      const { data: txs } = await admin
        .from("transactions")
        .select("payment_method")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .eq("status", "success");
      if (txs && txs.length > 0 && txs.every((t: any) => t.payment_method === "free_promo")) {
        return { success: false, error: "VIP Telegram access is available only for paid members." };
      }
      isPaidPurchaser = true;
    }

    if (!isSubscriber && !hasAdminGrant && !isPaidPurchaser) {
      return { success: false, error: "You do not have access to this course." };
    }

    const { data: course } = await admin
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .maybeSingle();

    const invites = await getOrCreateTelegramInvites(user.id, courseId, course?.title || "your course");

    return {
      success: true,
      channelInviteLink: invites.channelInviteLink,
      groupInviteLink: invites.groupInviteLink,
    };
  } catch (error: any) {
    console.error("[telegram] getMyTelegramInvitesAction failed:", error);
    return { success: false, error: "Could not load your Telegram access right now. Please try again shortly." };
  }
}
