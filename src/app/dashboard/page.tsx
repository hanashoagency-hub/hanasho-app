import React from "react";
import { BookOpen, Clock, Award } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import RewardsWidget from "@/components/RewardsWidget";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch purchased courses
  const { data: purchases } = await supabase
    .from("purchases")
    .select("course_id, courses(id, title, cover_image, description)")
    .eq("user_id", user.id);

  const purchasedCourses = (purchases?.map(p => p.courses) || []) as any[];
  const courseIds = purchasedCourses.map((c: any) => c.id).filter(Boolean);

  // Certificates earned
  const { data: certificates } = await supabase
    .from("certificates")
    .select("id, course_id")
    .eq("user_id", user.id);
  const certByCourse = new Map<string, string>();
  (certificates || []).forEach((c: any) => certByCourse.set(c.course_id, c.id));

  // Completed lessons (with duration for hours-learned stat)
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("course_id, lessons(duration_minutes)")
    .eq("user_id", user.id);

  const completedByCourse = new Map<string, number>();
  let totalMinutes = 0;
  (progress || []).forEach((row: any) => {
    completedByCourse.set(row.course_id, (completedByCourse.get(row.course_id) || 0) + 1);
    totalMinutes += row.lessons?.duration_minutes || 0;
  });

  // Total lessons per purchased course (lessons -> modules -> course)
  const totalByCourse = new Map<string, number>();
  if (courseIds.length > 0) {
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("id, modules!inner(course_id)")
      .in("modules.course_id", courseIds);
    (allLessons || []).forEach((l: any) => {
      const cid = l.modules?.course_id;
      if (cid) totalByCourse.set(cid, (totalByCourse.get(cid) || 0) + 1);
    });
  }

  const hoursLearned = (totalMinutes / 60).toFixed(1);
  const certificateCount = certificates?.length || 0;

  // Gamification: XP, claimed rewards, earned badges
  const { data: stats } = await supabase
    .from("user_stats")
    .select("xp")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: claims } = await supabase
    .from("reward_claims")
    .select("reward_code")
    .eq("user_id", user.id);

  const { data: badgeRows } = await supabase
    .from("user_badges")
    .select("badges(code, label)")
    .eq("user_id", user.id);

  const earnedBadges = (badgeRows || [])
    .map((row: any) => row.badges)
    .filter(Boolean)
    .map((b: any) => ({ code: b.code, label: b.label }));

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">My Learning Dashboard</h1>
        <p className="text-[var(--text-secondary)]">Pick up where you left off and track your progress.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-[12px] flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <BookOpen className="w-6 h-6 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-bold mb-1 uppercase tracking-wider">Enrolled Courses</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading">{purchasedCourses.length}</h3>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-[12px] flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <Clock className="w-6 h-6 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-bold mb-1 uppercase tracking-wider">Hours Learned</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading">{hoursLearned}</h3>
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-[12px] flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]">
            <Award className="w-6 h-6 text-[var(--brand-primary)]" />
          </div>
          <div>
            <p className="text-[var(--text-secondary)] text-sm font-bold mb-1 uppercase tracking-wider">Certificates</p>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-heading">{certificateCount}</h3>
          </div>
        </div>
      </div>

      {/* Rewards & Badges */}
      <div className="mb-10">
        <RewardsWidget
          xp={stats?.xp ?? 0}
          claimedCodes={(claims || []).map((c: any) => c.reward_code)}
          earnedBadges={earnedBadges}
        />
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] mb-6">My Enrolled Courses</h2>
        {purchasedCourses.length === 0 ? (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[24px] p-10 text-center">
            <BookOpen className="w-12 h-12 text-[var(--border-color)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 font-heading">You haven't enrolled in any courses yet</h3>
            <p className="text-[var(--text-secondary)] mb-6">Explore our marketplace to find the perfect course for you.</p>
            <Link href="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedCourses.map((course: any) => {
              const total = totalByCourse.get(course.id) || 0;
              const done = completedByCourse.get(course.id) || 0;
              const pct = total > 0 ? Math.round((done / total) * 100) : 0;
              const certId = certByCourse.get(course.id);
              return (
              <Link key={course.id} href={`/courses/${course.id}`} className="premium-card !p-0 overflow-hidden group">
                <div className="aspect-video w-full relative overflow-hidden bg-[var(--bg-primary)] border-b border-[var(--border-color)]">
                  {course.cover_image ? (
                    <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-[var(--text-secondary)]" />
                    </div>
                  )}
                  {certId && (
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] bg-[var(--brand-primary)] text-[var(--on-brand)] text-xs font-bold">
                      <Award className="w-3.5 h-3.5" /> Certified
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors line-clamp-1">{course.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-6 leading-relaxed">{course.description}</p>

                  <div className="w-full bg-[var(--border-color)] rounded-full h-2 mb-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all bg-[var(--brand-primary)]`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-bold text-right">{pct}% Complete</p>
                </div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
