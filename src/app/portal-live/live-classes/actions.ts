"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createLiveClassAction(classData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("zoom_classes")
      .insert({ ...classData, is_published: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/live-classes");
    revalidatePath("/live-classes");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLiveClassAction(id: string, classData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("zoom_classes")
      .update(classData)
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/live-classes");
    revalidatePath("/live-classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLiveClassAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("zoom_classes")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/live-classes");
    revalidatePath("/live-classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleLiveClassPublishAction(id: string, is_published: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("zoom_classes")
      .update({ is_published })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/live-classes");
    revalidatePath("/live-classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminLiveClassesAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("zoom_classes")
      .select("*")
      .order("start_date", { ascending: true });
      
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [] };
  }
}
