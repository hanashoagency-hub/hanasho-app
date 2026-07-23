"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createDiplomaAction(diplomaData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("diplomas")
      .insert({ ...diplomaData, is_published: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/diplomas");
    revalidatePath("/diplomas");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateDiplomaAction(id: string, diplomaData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("diplomas")
      .update(diplomaData)
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/diplomas");
    revalidatePath("/diplomas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteDiplomaAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("diplomas")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/diplomas");
    revalidatePath("/diplomas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleDiplomaPublishAction(id: string, is_published: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("diplomas")
      .update({ is_published })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/diplomas");
    revalidatePath("/diplomas");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminDiplomasAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("diplomas")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [] };
  }
}
