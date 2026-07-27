"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createAnnouncementAction(data: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data: row, error } = await supabaseAdmin
      .from("announcements")
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/announcements");
    return { success: true, data: row };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateAnnouncementAction(id: string, data: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("announcements")
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/announcements");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteAnnouncementAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("announcements").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/announcements");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleAnnouncementEnabledAction(id: string, is_enabled: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("announcements").update({ is_enabled }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/announcements");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminAnnouncementsAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return { success: true, data: [] };

    const courseIds = [...new Set(data.map((a: any) => a.course_id).filter(Boolean))];
    let coursesMap: Record<string, string> = {};
    if (courseIds.length > 0) {
      const { data: courses } = await supabaseAdmin.from("courses").select("id, title").in("id", courseIds);
      (courses || []).forEach((c: any) => { coursesMap[c.id] = c.title; });
    }

    const enriched = data.map((a: any) => ({ ...a, course_title: a.course_id ? coursesMap[a.course_id] : null }));
    return { success: true, data: enriched };
  } catch (error: any) {
    console.error("Admin Announcements Fetch Error:", error);
    return { success: false, data: [] };
  }
}
