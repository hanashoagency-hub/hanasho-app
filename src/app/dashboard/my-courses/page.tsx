import React from "react";
import { createClient } from "@/utils/supabase/server";
import { BookOpen, PlayCircle } from "lucide-react";
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
        <h1 className="text-3xl font-bold text-white mb-2">My Courses</h1>
        <p className="text-white/50">Access all the courses you've enrolled in.</p>
      </div>

      {purchasedCourses.length === 0 ? (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No courses yet</h2>
          <p className="text-white/50 mb-6 max-w-md">
            You haven't enrolled in any courses yet. Explore our marketplace to find the perfect course for you.
          </p>
          <Link
            href="/courses"
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#F5F5F5] transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchasedCourses.map((course: any) => (
            <div key={course.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group">
              <div className="aspect-video bg-white/5 relative overflow-hidden">
                {course.cover_image ? (
                  <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-white/50 mb-6 line-clamp-2">{course.description}</p>
                <Link
                  href={`/courses/${course.id}`}
                  className="block w-full py-3 bg-white/10 hover:bg-white/20 text-center text-white text-sm font-bold rounded-xl transition-colors"
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
