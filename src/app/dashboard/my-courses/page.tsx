import React from "react";
import { createClient } from "@/utils/supabase/server";
import { BookOpen, PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function MyCoursesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch purchased courses
  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      course_id,
      courses (
        id,
        title,
        description,
        cover_image
      )
    `)
    .eq("user_id", user.id);

  const purchasedCourses = purchases?.map((p: any) => p.courses) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">My Courses</h1>
        <p className="text-[var(--text-secondary)]">Access all the courses you've enrolled in.</p>
      </div>

      {purchasedCourses.length === 0 ? (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[16px] flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-[var(--text-secondary)]" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">No courses yet</h2>
          <p className="text-[var(--text-secondary)] mb-6 max-w-md">
            You haven't enrolled in any courses yet. Explore our marketplace to find the perfect course for you.
          </p>
          <Link
            href="/courses"
            className="btn-primary"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course: any) => (
            <div key={course.id} className="premium-card !p-0 overflow-hidden group">
              <div className="aspect-video bg-[var(--bg-primary)] relative overflow-hidden border-b border-[var(--border-color)]">
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-[var(--text-secondary)]" />
                  </div>
                )}
                <div className="absolute inset-0 bg-[#071E16]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                  <PlayCircle className="w-12 h-12 text-[var(--brand-primary)]" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] mb-6 line-clamp-2 leading-relaxed">{course.description}</p>
                <Link
                  href={`/courses/${course.id}`}
                  className="btn-secondary w-full py-3"
                >
                  Continue Learning
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
