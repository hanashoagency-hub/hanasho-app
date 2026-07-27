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

    const { data: purchase } = await admin
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();

    if (!purchase) {
      return { success: false, error: "You have not purchased this course." };
    }

    // Free-promotion enrollments own the course but NOT the VIP Telegram —
    // that stays exclusive to paid members. Legacy purchases with no
    // transaction rows predate free promos and are treated as paid.
    const { data: txs } = await admin
      .from("transactions")
      .select("payment_method")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .eq("status", "success");
    if (txs && txs.length > 0 && txs.every((t: any) => t.payment_method === "free_promo")) {
      return { success: false, error: "VIP Telegram access is available only for paid members." };
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
