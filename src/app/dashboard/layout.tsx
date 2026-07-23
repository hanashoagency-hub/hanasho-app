import React from "react";
import Link from "next/link";
import { BookOpen, User, Settings, LogOut, ArrowLeft, Trophy, Flame } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardThemeToggle from "@/components/DashboardThemeToggle";
import { recordDailyLoginAction } from "@/app/dashboard/gamification-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to get name and role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  await recordDailyLoginAction();
  const { data: stats } = await supabase
    .from("user_stats")
    .select("xp, streak_count")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-transparent flex text-[var(--text-primary)] font-body">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-[var(--border-color)]">
          <div className="flex items-center justify-between mb-6">
            <Link href="/" className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors text-sm font-bold">
              <ArrowLeft className="w-4 h-4" /> Back to Website
            </Link>
            <DashboardThemeToggle />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-primary)] flex items-center justify-center text-[var(--on-brand)] font-bold text-lg shadow-sm">
              {(profile?.full_name || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-[var(--text-primary)] font-bold truncate font-heading">{profile?.full_name || "Student"}</h2>
              <p className="text-[var(--text-secondary)] text-xs truncate">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-[var(--brand-primary)]">
              <Trophy className="w-3.5 h-3.5" /> {stats?.xp ?? 0} XP
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-orange-400">
              <Flame className="w-3.5 h-3.5" /> {stats?.streak_count ?? 0} day streak
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
            <User className="w-5 h-5 text-[var(--brand-primary)]" />
            My Profile
          </Link>
          <Link href="/dashboard/my-courses" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
            <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
            My Courses
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
            <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
            Settings
          </Link>
          <Link href="/leaderboard" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
            <Trophy className="w-5 h-5 text-[var(--brand-primary)]" />
            Leaderboard
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/portal-live" className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-red-400 hover:bg-red-500/10 transition-colors font-bold mt-4 border border-red-500/20 bg-red-500/5 text-sm">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-[var(--border-color)]">
          <form action="/auth/signout" method="post">
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
