"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { REWARDS } from "@/utils/gamification";
import { revalidatePath } from "next/cache";

/**
 * Records today's login for the signed-in user (streak + XP).
 * Safe to call on every dashboard load — the underlying SQL function
 * no-ops if today was already recorded.
 */
export async function recordDailyLoginAction() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = getAdminClient();
  const { data, error } = await admin.rpc("record_daily_login", { p_user_id: user.id });
  if (error) {
    console.error("record_daily_login failed:", error.message);
    return null;
  }
  return data?.[0] ?? null;
}

export async function claimRewardAction(rewardCode: string) {
  const reward = REWARDS.find((r) => r.code === rewardCode);
  if (!reward) return { success: false, error: "Unknown reward." };

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated." };

  const admin = getAdminClient();

  const { data: stats } = await admin
    .from("user_stats")
    .select("xp")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!stats || stats.xp < reward.xpRequired) {
    return { success: false, error: "You don't have enough XP for this reward yet." };
  }

  const { data: existing } = await admin
    .from("reward_claims")
    .select("id")
    .eq("user_id", user.id)
    .eq("reward_code", rewardCode)
    .maybeSingle();

  if (existing) {
    return { success: false, error: "Already claimed." };
  }

  const { error: claimError } = await admin
    .from("reward_claims")
    .insert({ user_id: user.id, reward_code: rewardCode });
  if (claimError) return { success: false, error: claimError.message };

  const { data: badge } = await admin
    .from("badges")
    .select("id")
    .eq("code", reward.badgeCode)
    .maybeSingle();

  if (badge) {
    await admin
      .from("user_badges")
      .upsert({ user_id: user.id, badge_id: badge.id }, { onConflict: "user_id,badge_id" });
  }

  revalidatePath("/dashboard");
  revalidatePath("/leaderboard");
  return { success: true };
}
