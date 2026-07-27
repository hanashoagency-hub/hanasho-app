"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createCourseAction(courseData: any, lessons: any[]) {
  try {
    const supabaseAdmin = getAdminClient();
    // Insert Course
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .insert({ ...courseData, is_published: true })
      .select()
      .single();

    if (courseError) throw new Error("Course Error: " + courseError.message);
    if (!course) throw new Error("No course returned after insert.");

    // Create default module
    const { data: mod, error: modError } = await supabaseAdmin
      .from("modules")
      .insert({ course_id: course.id, title: "Module 1", sort_order: 0 })
      .select()
      .single();

    if (modError) throw new Error("Module Error: " + modError.message);

    // Insert Lessons
    if (mod && lessons.length > 0) {
      const validLessons = lessons
        .filter((l) => l.title || l.youtube_video_id)
        .map((l, i) => ({
          module_id: mod.id,
          title: l.title || `Lesson ${i + 1}`,
          youtube_video_id: l.youtube_video_id, // assume already parsed on client
          duration_minutes: l.duration_minutes,
          is_preview: l.is_preview,
          sort_order: i,
        }));

      if (validLessons.length > 0) {
        const { error: lessonError } = await supabaseAdmin
          .from("lessons")
          .insert(validLessons);
        
        if (lessonError) throw new Error("Lessons Error: " + lessonError.message);
      }
    }

    revalidatePath("/portal-live/courses");
    revalidatePath("/courses");
    
    return { success: true, courseId: course.id };
  } catch (error: any) {
    console.error("Admin Create Course Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCourseAction(id: string, courseData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("courses")
      .update(courseData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath("/courses");
    
    return { success: true };
  } catch (error: any) {
    console.error("Admin Update Course Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCourseAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("courses")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath("/courses");
    
    return { success: true };
  } catch (error: any) {
    console.error("Admin Delete Course Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function togglePublishAction(id: string, is_published: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("courses")
      .update({ is_published })
      .eq("id", id);

    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath("/courses");
    
    return { success: true };
  } catch (error: any) {
    console.error("Admin Publish Course Action Error:", error);
    return { success: false, error: error.message };
  }
}

export async function createModuleAction(courseId: string, title: string, sortOrder: number) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("modules")
      .insert({ course_id: courseId, title, sort_order: sortOrder })
      .select()
      .single();

    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath(`/portal-live/courses/${courseId}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteModuleAction(id: string, courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("modules").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath(`/portal-live/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createLessonAction(moduleId: string, lessonData: any, courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("lessons").insert({
      module_id: moduleId,
      ...lessonData
    });
    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath(`/portal-live/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadCourseCoverAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      return { success: false, error: "Only JPG, PNG, or WEBP images are allowed." };
    }
    if (file.size > 10 * 1024 * 1024) return { success: false, error: "Image must be under 10MB." };

    const supabaseAdmin = getAdminClient();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("course-covers")
      .upload(path, file, { contentType: "image/webp", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage.from("course-covers").getPublicUrl(path);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error("Upload Course Cover Error:", error);
    return { success: false, error: error.message || "Upload failed." };
  }
}

export async function uploadLessonPdfAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (file.type !== "application/pdf") return { success: false, error: "Only PDF files are allowed." };
    if (file.size > 50 * 1024 * 1024) return { success: false, error: "PDF must be under 50MB." };

    const supabaseAdmin = getAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("lesson-pdfs")
      .upload(path, file, { contentType: "application/pdf", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage.from("lesson-pdfs").getPublicUrl(path);
    return { success: true, url: publicUrlData.publicUrl, fileName: file.name };
  } catch (error: any) {
    console.error("Upload Lesson PDF Error:", error);
    return { success: false, error: error.message || "Upload failed." };
  }
}

export async function updateLessonAction(id: string, lessonData: any, courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("lessons").update(lessonData).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath(`/portal-live/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLessonAction(id: string, courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("lessons").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/portal-live/courses");
    revalidatePath(`/portal-live/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminCoursesAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Admin Fetch Courses Error:", error);
    return { success: false, data: [] };
  }
}

export async function getPublicCoursesAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
      
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Public Fetch Courses Error:", error);
    return { success: false, data: [] };
  }
}

export async function getCourseEnrollmentCountsAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("purchases")
      .select("course_id");

    if (error) throw new Error(error.message);

    const counts: Record<string, number> = {};
    (data || []).forEach((row: any) => {
      if (!row.course_id) return;
      counts[row.course_id] = (counts[row.course_id] || 0) + 1;
    });

    return { success: true, counts };
  } catch (error: any) {
    console.error("Course Enrollment Counts Error:", error);
    return { success: false, counts: {} as Record<string, number> };
  }
}

export async function getPublicBooksAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("books")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Public Fetch Books Error:", error);
    return { success: false, data: [] };
  }
}

export async function getPublicBookDetailsAction(bookId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("books")
      .select("*")
      .eq("id", bookId)
      .eq("is_published", true)
      .single();

    if (error || !data) throw new Error("Book fetch error");
    return { success: true, book: data };
  } catch (error: any) {
    console.error("Public Fetch Book Details Error:", error);
    return { success: false, book: null };
  }
}

export async function getAdminModulesWithLessonsAction(courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    // Fetch course
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();
      
    if (courseError) throw new Error("Course fetch error: " + courseError.message);

    // Fetch modules
    const { data: mods, error: modError } = await supabaseAdmin
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });
      
    if (modError) throw new Error("Modules fetch error: " + modError.message);

    // Fetch lessons for these modules
    const modulesWithLessons = [];
    for (const mod of mods || []) {
      const { data: lessons } = await supabaseAdmin
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("sort_order", { ascending: true });
      modulesWithLessons.push({ ...mod, lessons: lessons || [] });
    }

    return { 
      success: true, 
      courseTitle: course?.title || "", 
      modules: modulesWithLessons 
    };
  } catch (error: any) {
    console.error("Admin Fetch Modules Error:", error);
    return { success: false, courseTitle: "", modules: [] };
  }
}

export async function getPublicCourseDetailsAction(courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    
    // Fetch course
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("is_published", true)
      .single();
      
    if (courseError || !course) throw new Error("Course fetch error");

    // Fetch modules
    const { data: mods } = await supabaseAdmin
      .from("modules")
      .select("*")
      .eq("course_id", courseId)
      .order("sort_order", { ascending: true });

    const modulesWithLessons = [];
    for (const mod of mods || []) {
      const { data: lessons } = await supabaseAdmin
        .from("lessons")
        .select("*")
        .eq("module_id", mod.id)
        .order("sort_order", { ascending: true });
      modulesWithLessons.push({ ...mod, lessons: lessons || [] });
    }

    return { 
      success: true, 
      course, 
      modules: modulesWithLessons 
    };
  } catch (error: any) {
    console.error("Public Fetch Course Details Error:", error);
    return { success: false, course: null, modules: [] };
  }
}

export async function getCheckoutItemAction(table: string, id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from(table)
      .select("*")
      .eq("id", id)
      .single();
      
    if (error || !data) throw new Error("Item not found");
    return { success: true, item: data };
  } catch (error: any) {
    console.error("Checkout Item Fetch Error:", error);
    return { success: false, item: null };
  }
}

export async function checkPurchaseStatusAction(userId: string, courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("purchases")
      .select("id")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
      
    return { purchased: !!data };
  } catch (error: any) {
    console.error("Purchase Status Check Error:", error);
    return { purchased: false };
  }
}

export async function getAdminTransactionsAction() {
  try {
    const supabaseAdmin = getAdminClient();
    
    // Fetch transactions without joins (foreign keys may not be set up)
    const { data: transactions, error } = await supabaseAdmin
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Transactions fetch error:", error);
      return { success: false, transactions: [] };
    }

    if (!transactions || transactions.length === 0) {
      return { success: true, transactions: [] };
    }

    // Resolve user names
    const userIds = [...new Set(transactions.map(t => t.user_id).filter(Boolean))];
    const courseIds = [...new Set(transactions.map(t => t.course_id).filter(Boolean))];
    
    let profilesMap: Record<string, string> = {};
    let coursesMap: Record<string, string> = {};

    if (userIds.length > 0) {
      const { data: profiles } = await supabaseAdmin
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      (profiles || []).forEach((p: any) => { profilesMap[p.id] = p.full_name || "Unknown"; });
    }

    if (courseIds.length > 0) {
      const { data: courses } = await supabaseAdmin
        .from("courses")
        .select("id, title")
        .in("id", courseIds);
      (courses || []).forEach((c: any) => { coursesMap[c.id] = c.title || "—"; });
    }

    // Enrich transactions
    const enriched = transactions.map(tx => ({
      ...tx,
      profiles: { full_name: profilesMap[tx.user_id] || "Unknown" },
      courses: { title: coursesMap[tx.course_id] || "—" },
    }));

    return { success: true, transactions: enriched };
  } catch (error: any) {
    console.error("Admin Transactions Fetch Error:", error);
    return { success: false, transactions: [] };
  }
}

export async function getAdminStatsAction() {
  try {
    const supabaseAdmin = getAdminClient();
    
    const { count: studentCount } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    const { count: courseCount } = await supabaseAdmin
      .from("courses")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    const { data: transactions } = await supabaseAdmin
      .from("transactions")
      .select("amount, status")
      .eq("status", "success");

    let totalRevenue = 0;
    (transactions || []).forEach((tx: any) => {
      totalRevenue += Number(tx.amount) || 0;
    });

    return {
      success: true,
      studentCount: studentCount || 0,
      courseCount: courseCount || 0,
      totalRevenue,
      totalTransactions: transactions?.length || 0,
    };
  } catch (error: any) {
    console.error("Admin Stats Fetch Error:", error);
    return { success: false, studentCount: 0, courseCount: 0, totalRevenue: 0, totalTransactions: 0 };
  }
}

export async function getActiveAnnouncementsAction(placement: string, courseId?: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const nowIso = new Date().toISOString();

    let query = supabaseAdmin
      .from("announcements")
      .select("*")
      .eq("is_enabled", true)
      .lte("start_at", nowIso)
      .or(`end_at.is.null,end_at.gt.${nowIso}`)
      .order("is_pinned", { ascending: false })
      .order("priority", { ascending: false });

    if (placement === "course_page" && courseId) {
      query = query.eq("placement", "course_page").eq("course_id", courseId);
    } else {
      query = query.eq("placement", placement);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    console.error("Active Announcements Fetch Error:", error);
    return { success: false, data: [] };
  }
}

// Full access check: purchase OR admin grant OR active free promotion,
// gated on the account not being suspended/banned.
export async function checkCourseAccessAction(userId: string, courseId: string) {
  try {
    const { hasContentAccess, isAccountActive } = await import("@/utils/access");
    if (!(await isAccountActive(userId))) return { access: false, reason: "account" };
    if (await hasContentAccess(userId, "course", courseId)) return { access: true, reason: "granted" };
    const promo = await getCoursePromotionAction(courseId);
    if (promo.isFree) return { access: true, reason: "promo" };
    return { access: false, reason: "none" };
  } catch (error: any) {
    console.error("Course Access Check Error:", error);
    return { access: false, reason: "error" };
  }
}

export async function getCheckoutPriceAction(courseId: string, couponCode?: string | null) {
  const failure = {
    success: false as boolean,
    basePrice: 0, finalPrice: 0, promoPct: 0, couponPct: 0, appliedPct: 0,
    couponId: null as string | null, couponError: null as string | null, isFree: false,
  };
  try {
    const { getEffectiveCoursePrice } = await import("@/utils/pricing");
    const price = await getEffectiveCoursePrice(courseId, couponCode);
    if (!price) return failure;
    return { success: true, ...price };
  } catch (error: any) {
    console.error("Checkout Price Error:", error);
    return failure;
  }
}

const DISCOUNT_ANNOUNCEMENT_TYPES = ["discount", "flash_sale", "limited_time_offer"];

// Resolves the strongest active promotion for a course from Announcements —
// used to drive REAL access/pricing (free access bypass, discounted
// checkout), not just banner display. Server-only source of truth: never
// trust a client-reported discount.
export async function getCoursePromotionAction(courseId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const nowIso = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("announcements")
      .select("*")
      .eq("is_enabled", true)
      .eq("course_id", courseId)
      .lte("start_at", nowIso)
      .or(`end_at.is.null,end_at.gt.${nowIso}`)
      .in("announcement_type", ["free_course_promo", ...DISCOUNT_ANNOUNCEMENT_TYPES]);

    if (error) throw new Error(error.message);
    const rows = data || [];

    const freePromo = rows.find((r: any) => r.announcement_type === "free_course_promo");
    if (freePromo) {
      return { success: true, isFree: true, discountPercentage: 100, endsAt: freePromo.end_at as string | null };
    }

    const discountPromo = rows
      .filter((r: any) => DISCOUNT_ANNOUNCEMENT_TYPES.includes(r.announcement_type) && Number(r.discount_percentage) > 0)
      .sort((a: any, b: any) => Number(b.discount_percentage) - Number(a.discount_percentage))[0];

    if (discountPromo) {
      return { success: true, isFree: false, discountPercentage: Number(discountPromo.discount_percentage), endsAt: discountPromo.end_at as string | null };
    }

    return { success: true, isFree: false, discountPercentage: 0, endsAt: null };
  } catch (error: any) {
    console.error("Course Promotion Fetch Error:", error);
    return { success: true, isFree: false, discountPercentage: 0, endsAt: null };
  }
}
