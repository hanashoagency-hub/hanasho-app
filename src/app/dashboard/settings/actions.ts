"use server";

import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { revalidatePath } from "next/cache";

export async function updateProfileInfoAction(formData: FormData) {
  try {
    // Identify the caller from their own session — never trust a client-supplied id.
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const fullName = formData.get("fullName") as string;
    const avatarUrl = formData.get("avatarUrl") as string;

    const updates: any = {};
    if (fullName !== null && fullName !== undefined) updates.full_name = fullName;
    if (avatarUrl !== null && avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    if (Object.keys(updates).length === 0) {
      return { success: true };
    }

    // Write via the admin client (same pattern as every other write path in
    // this app) — only ever scoped to the session-verified user's own id.
    const admin = getAdminClient();
    const { error } = await admin
      .from("profiles")
      .update(updates)
      .eq("id", user.id);

    if (error) {
      console.error(`[settings] Failed to update profile for user ${user.id}:`, error);
      return { success: false, error: "Failed to update profile. Please try again." };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");

    return { success: true };
  } catch (err: any) {
    console.error("[settings] Unexpected error updating profile:", err);
    return { success: false, error: "An unexpected error occurred. Please try again." };
  }
}
