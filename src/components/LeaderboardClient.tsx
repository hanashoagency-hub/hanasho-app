"use client";

import { useEffect, useState } from "react";
import { Trophy, Flame, Crown } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export interface LeaderboardRow {
  user_id: string;
  xp: number;
  streak_count: number;
  full_name: string | null;
}

export default function LeaderboardClient({
  initialRows,
  currentUserId,
}: {
  initialRows: LeaderboardRow[];
  currentUserId?: string;
}) {
  const [rows, setRows] = useState(initialRows);
  const supabase = createClient();

  useEffect(() => {
    const refetch = async () => {
      const { data } = await supabase
        .from("user_stats")
        .select("user_id, xp, streak_count, profiles(full_name)")
        .order("xp", { ascending: false })
        .limit(50);

      if (data) {
        setRows(
          data.map((row: any) => ({
            user_id: row.user_id,
            xp: row.xp,
            streak_count: row.streak_count,
            full_name: row.profiles?.full_name ?? null,
          }))
        );
      }
    };

    const channel = supabase
      .channel("leaderboard-user-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "user_stats" }, refetch)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);

  const nameFor = (row: LeaderboardRow) => row.full_name || "Student";
  const initials = (name: string) => name.charAt(0).toUpperCase();

  if (rows.length === 0) {
    return (
      <div className="premium-card text-center py-16">
        <Trophy className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
        <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-2">No rankings yet</h3>
        <p className="text-[var(--text-secondary)]">Be the first to earn XP and claim the top spot.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Podium */}
      <div className="grid grid-cols-3 gap-4 md:gap-6 mb-12 items-end">
        {[podium[1], podium[0], podium[2]].map((row, i) => {
          if (!row) return <div key={i} />;
          const rank = i === 1 ? 1 : i === 0 ? 2 : 3;
          const heights = { 1: "h-40 md:h-52", 2: "h-32 md:h-40", 3: "h-24 md:h-32" } as const;
          return (
            <div
              key={row.user_id}
              className={`premium-card !p-4 md:!p-6 flex flex-col items-center justify-end text-center relative ${
                rank === 1 ? "border-[var(--brand-primary)]" : ""
              } ${heights[rank as 1 | 2 | 3]} ${row.user_id === currentUserId ? "ring-2 ring-[var(--brand-primary)]" : ""}`}
            >
              {rank === 1 && <Crown className="w-6 h-6 text-[var(--brand-primary)] absolute -top-4" />}
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--brand-primary)] mb-3 text-lg">
                {initials(nameFor(row))}
              </div>
              <p className="font-heading font-bold text-[var(--text-primary)] text-sm md:text-base truncate max-w-full">
                {nameFor(row)}
              </p>
              <p className="text-xs md:text-sm font-bold text-[var(--brand-primary)] mt-1">{row.xp} XP</p>
              <span className="text-[10px] md:text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-1">
                #{rank}
              </span>
            </div>
          );
        })}
      </div>

      {/* Ranked list */}
      <div className="premium-card !p-0 overflow-hidden">
        {rest.map((row, i) => {
          const rank = i + 4;
          const isMe = row.user_id === currentUserId;
          return (
            <div
              key={row.user_id}
              className={`flex items-center gap-4 px-6 py-4 border-b border-[var(--border-color)] last:border-b-0 ${
                isMe ? "bg-[var(--brand-primary)]/5" : ""
              }`}
            >
              <span className="w-8 text-sm font-bold text-[var(--text-secondary)]">#{rank}</span>
              <div className="w-9 h-9 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--brand-primary)] text-sm flex-shrink-0">
                {initials(nameFor(row))}
              </div>
              <span className="flex-1 font-bold text-[var(--text-primary)] truncate">{nameFor(row)}</span>
              <span className="flex items-center gap-1.5 text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" /> {row.streak_count}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-primary)] w-20 justify-end">
                <Trophy className="w-3.5 h-3.5" /> {row.xp}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
