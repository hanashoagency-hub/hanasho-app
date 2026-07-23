import React from "react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardThemeToggle from "@/components/DashboardThemeToggle";
import DashboardSidebar from "@/components/DashboardSidebar";
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
    <DashboardSidebar
      profileName={profile?.full_name || "Student"}
      email={user.email || ""}
      avatarLetter={(profile?.full_name || user.email || "?")[0].toUpperCase()}
      avatarUrl={profile?.avatar_url || null}
      xp={stats?.xp ?? 0}
      streakCount={stats?.streak_count ?? 0}
      isAdmin={profile?.role === "admin"}
      themeToggle={<DashboardThemeToggle />}
    >
      {children}
    </DashboardSidebar>
  );
}

