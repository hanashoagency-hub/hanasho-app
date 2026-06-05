"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

function getAdminClient() {
  // Hardcoded fallbacks to completely bypass Vercel environment variable issues
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://worerikjebqpeibrepgz.supabase.co";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcmVyaWtqZWJxcGVpYnJlcGd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYzNTk4NiwiZXhwIjoyMDk2MjExOTg2fQ.rHBeYbUnD0WNCgUduf95ddjBx3cSrsTeoPtXMu0Y9dU";
  return createClient(url, key);
}

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

    revalidatePath("/admin/courses");
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

    revalidatePath("/admin/courses");
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

    revalidatePath("/admin/courses");
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

    revalidatePath("/admin/courses");
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

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
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

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
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

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
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

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
