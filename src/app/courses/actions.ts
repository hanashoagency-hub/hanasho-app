"use server";

import { createClient as createServerClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/certificates";
import { LESSON_COMPLETE_XP, FIRST_LESSON_BADGE_CODE } from "@/utils/gamification";
import { revalidatePath } from "next/cache";

// Human-readable, verifiable certificate number, e.g. HAN-7F3A9C21
function generateCertificateNumber() {
  const rand = Math.random().toString(16).slice(2, 10).toUpperCase();
  return `HAN-${rand}`;
}

// Total number of lessons in a course (lessons -> modules -> course).
async function getCourseLessonCount(
  admin: ReturnType<typeof getAdminClient>,
  courseId: string
) {
  const { data, error } = await admin
    .from("lessons")
    .select("id, modules!inner(course_id)")
    .eq("modules.course_id", courseId);
  if (error) throw new Error(error.message);
  return data?.length ?? 0;
}

type ProgressResult = {
  success: boolean;
  error?: string;
  completedLessonIds?: string[];
  totalLessons?: number;
  completedCount?: number;
  certificate?: { id: string; certificate_number: string } | null;
};

/**
 * Toggle completion for a single lesson for the signed-in user.
 * When the course reaches 100% completion, a certificate is auto-issued.
 */
export async function toggleLessonCompleteAction(
  lessonId: string,
  courseId: string,
  completed: boolean
): Promise<ProgressResult> {
  try {
    // Identify the current user from their session cookies.
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated." };

    const admin = getAdminClient();

    // Only enrolled students can record progress.
    const { data: purchase } = await admin
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("course_id", courseId)
      .maybeSingle();
    if (!purchase)
      return { success: false, error: "You must purchase this course first." };

    let isNewCompletion = false;
    if (completed) {
      const { data: existingRow } = await admin
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId)
        .maybeSingle();
      isNewCompletion = !existingRow;

      const { error } = await admin
        .from("lesson_progress")
        .upsert(
          { user_id: user.id, lesson_id: lessonId, course_id: courseId },
          { onConflict: "user_id,lesson_id" }
        );
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin
        .from("lesson_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("lesson_id", lessonId);
      if (error) throw new Error(error.message);
    }

    // Recompute progress for this course.
    const { data: progressRows, error: progressError } = await admin
      .from("lesson_progress")
      .select("lesson_id")
      .eq("user_id", user.id)
      .eq("course_id", courseId);
    if (progressError) throw new Error(progressError.message);

    const completedLessonIds = (progressRows || []).map((r) => r.lesson_id);
    const totalLessons = await getCourseLessonCount(admin, courseId);
    const completedCount = completedLessonIds.length;

    // Issue a certificate if the course is fully complete and none exists yet.
    let certificate: ProgressResult["certificate"] = null;
    if (totalLessons > 0 && completedCount >= totalLessons) {
      certificate = await ensureCertificate(admin, user.id, courseId);
    }

    if (isNewCompletion) {
      await admin.rpc("award_xp", {
        p_user_id: user.id,
        p_amount: LESSON_COMPLETE_XP,
        p_reason: "lesson_complete",
      });

      const { count: totalCompletedEver } = await admin
        .from("lesson_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if ((totalCompletedEver ?? 0) === 1) {
        const { data: badge } = await admin
          .from("badges")
          .select("id")
          .eq("code", FIRST_LESSON_BADGE_CODE)
          .maybeSingle();
        if (badge) {
          await admin
            .from("user_badges")
            .upsert({ user_id: user.id, badge_id: badge.id }, { onConflict: "user_id,badge_id" });
        }
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/my-courses");
    revalidatePath("/leaderboard");

    return {
      success: true,
      completedLessonIds,
      totalLessons,
      completedCount,
      certificate,
    };
  } catch (error: any) {
    console.error("toggleLessonCompleteAction error:", error);
    return { success: false, error: error.message };
  }
}

async function ensureCertificate(
  admin: ReturnType<typeof getAdminClient>,
  userId: string,
  courseId: string
) {
  // Return existing certificate if already issued.
  const { data: existing } = await admin
    .from("certificates")
    .select("id, certificate_number")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (existing) return existing;

  // Snapshot student name + course title so the certificate is self-contained.
  const [{ data: profile }, { data: course }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", userId).maybeSingle(),
    admin.from("courses").select("title").eq("id", courseId).maybeSingle(),
  ]);

  const { data: created, error } = await admin
    .from("certificates")
    .insert({
      certificate_number: generateCertificateNumber(),
      user_id: userId,
      course_id: courseId,
      student_name: profile?.full_name || "Student",
      course_title: course?.title || "Course",
    })
    .select("id, certificate_number")
    .single();

  // On a rare unique-constraint race, fetch the row that won.
  if (error) {
    const { data: winner } = await admin
      .from("certificates")
      .select("id, certificate_number")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    if (winner) return winner;
    throw new Error(error.message);
  }

  return created;
}

export async function submitCourseReviewAction(courseId: string, rating: number, reviewText: string) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in to leave a review." };
    }

    // Verify the user has purchased the course
    const { data: purchase } = await supabase
      .from('purchases')
      .select('id')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (!purchase) {
      return { success: false, error: "You can only review courses you have purchased." };
    }

    const { error } = await supabase
      .from('course_reviews')
      .insert({
        course_id: courseId,
        user_id: user.id,
        rating,
        review_text: reviewText
      });

    if (error) {
      // If it's a unique constraint violation, they already reviewed it
      if (error.code === '23505') {
        return { success: false, error: "You have already reviewed this course." };
      }
      console.error("Error submitting review:", error);
      return { success: false, error: "Failed to submit review." };
    }

    revalidatePath(`/courses/${courseId}`);
    revalidatePath('/courses');

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "An unexpected error occurred." };
  }
}

