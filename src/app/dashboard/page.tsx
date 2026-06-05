import React from "react";
import { BookOpen, Clock, Award } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch purchased courses
  const { data: purchases } = await supabase
    .from("purchases")
    .select("course_id, courses(id, title, cover_image, description)")
    .eq("user_id", user.id);

  const purchasedCourses = purchases?.map(p => p.courses) || [];

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">My Learning Dashboard</h1>
        <p className="text-white/60">Pick up where you left off and track your progress.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-blue-500/10">
            <BookOpen className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-white">{purchasedCourses.length}</h3>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-purple-500/10">
            <Clock className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Hours Learned</p>
            <h3 className="text-2xl font-bold text-white">0.0</h3>
          </div>
        </div>
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-green-500/10">
            <Award className="w-7 h-7 text-green-400" />
          </div>
          <div>
            <p className="text-white/50 text-sm font-medium mb-1">Certificates</p>
            <h3 className="text-2xl font-bold text-white">0</h3>
          </div>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6">My Enrolled Courses</h2>
        {purchasedCourses.length === 0 ? (
          <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-10 text-center">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">You haven't enrolled in any courses yet</h3>
            <p className="text-white/50 mb-6">Explore our marketplace to find the perfect course for you.</p>
            <Link href="/courses" className="inline-flex bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map((course: any) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group hover:border-white/30 transition-all">
                <div className="aspect-video w-full relative overflow-hidden bg-white/5">
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-white/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-white/50 text-sm line-clamp-2 mb-4">{course.description}</p>
                  
                  {/* Progress Bar Dummy */}
                  <div className="w-full bg-white/10 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                  <p className="text-xs text-white/40 text-right">0% Complete</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
