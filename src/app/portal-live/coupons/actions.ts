"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createCouponAction(data: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("coupons").insert({
      ...data,
      code: String(data.code || "").trim().toUpperCase(),
    });
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCouponAction(id: string, data: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("coupons").update({
      ...data,
      code: String(data.code || "").trim().toUpperCase(),
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCouponAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCouponActiveAction(id: string, is_active: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("coupons").update({ is_active }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminCouponsAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    if (!data || data.length === 0) return { success: true, data: [] };

    const courseIds = [...new Set(data.map((c: any) => c.course_id).filter(Boolean))];
    const coursesMap: Record<string, string> = {};
    if (courseIds.length > 0) {
      const { data: courses } = await supabaseAdmin.from("courses").select("id, title").in("id", courseIds);
      (courses || []).forEach((c: any) => { coursesMap[c.id] = c.title; });
    }

    return { success: true, data: data.map((c: any) => ({ ...c, course_title: c.course_id ? coursesMap[c.course_id] : null })) };
  } catch (error: any) {
    console.error("Admin Coupons Fetch Error:", error);
    return { success: false, data: [] };
  }
}
