import { Trophy } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import LeaderboardClient, { type LeaderboardRow } from "@/components/LeaderboardClient";

export const metadata = {
  title: "Leaderboard — Hanhub.so",
  description: "See who's leading the HanHub community in XP, streaks, and achievements.",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("user_stats")
    .select("user_id, xp, streak_count, profiles(full_name)")
    .order("xp", { ascending: false })
    .limit(50);

  const rows: LeaderboardRow[] = (data || []).map((row: any) => ({
    user_id: row.user_id,
    xp: row.xp,
    streak_count: row.streak_count,
    full_name: row.profiles?.full_name ?? null,
  }));

  return (
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      <div className="pt-32 pb-16 px-6">
        <div className="max-w-5xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] tracking-tight mb-6 flex justify-center items-center gap-4">
            <Trophy className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
            Live Leaderboard
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Earn XP by learning daily and completing lessons. Rankings update live as students
            across HanHub grow their streaks and XP.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <LeaderboardClient initialRows={rows} currentUserId={user?.id} />
        </div>
      </div>
    </div>
  );
}
