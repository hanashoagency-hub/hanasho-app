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
