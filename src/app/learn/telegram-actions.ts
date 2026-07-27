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
