"use client";

import { useState, useTransition } from "react";
import { Award, Check, Lock, Trophy } from "lucide-react";
import { REWARDS } from "@/utils/gamification";
import { claimRewardAction } from "@/app/dashboard/gamification-actions";

export interface EarnedBadge {
  code: string;
  label: string;
}

export default function RewardsWidget({
  xp,
  claimedCodes,
  earnedBadges,
}: {
  xp: number;
  claimedCodes: string[];
  earnedBadges: EarnedBadge[];
}) {
  const [claimed, setClaimed] = useState<string[]>(claimedCodes);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [pendingCode, setPendingCode] = useState<string | null>(null);

  const handleClaim = (code: string) => {
    setError(null);
    setPendingCode(code);
    startTransition(async () => {
      const result = await claimRewardAction(code);
      if (result.success) {
        setClaimed((prev) => [...prev, code]);
      } else {
        setError(result.error || "Something went wrong.");
      }
      setPendingCode(null);
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-[var(--text-primary)]">Rewards</h2>
        <span className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-primary)]">
          <Trophy className="w-4 h-4" /> {xp} XP
        </span>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-[12px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {REWARDS.map((reward) => {
          const isClaimed = claimed.includes(reward.code);
          const isEligible = xp >= reward.xpRequired;
          return (
            <div key={reward.code} className="premium-card flex flex-col">
              <div className="mb-4 inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 w-fit">
                <Award className="h-6 w-6 text-[var(--brand-primary)]" />
              </div>
              <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-2">{reward.label}</h3>
              <p className="text-sm text-[var(--text-secondary)] mb-6 flex-1">{reward.description}</p>
              <button
                onClick={() => handleClaim(reward.code)}
                disabled={!isEligible || isClaimed || (pending && pendingCode === reward.code)}
                className={`inline-flex items-center justify-center gap-2 py-2.5 rounded-[12px] text-sm font-bold transition-all ${
                  isClaimed
                    ? "bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] cursor-default"
                    : isEligible
                    ? "bg-[var(--brand-primary)] text-[var(--on-brand)] hover:bg-[var(--brand-hover)]"
                    : "bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] cursor-not-allowed"
                }`}
              >
                {isClaimed ? (
                  <>
                    <Check className="w-4 h-4" /> Claimed
                  </>
                ) : isEligible ? (
                  pending && pendingCode === reward.code ? (
                    "Claiming..."
                  ) : (
                    "Claim Reward"
                  )
                ) : (
                  <>
                    <Lock className="w-4 h-4" /> {reward.xpRequired} XP required
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4">
            Badges Earned
          </h3>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.map((badge) => (
              <span
                key={badge.code}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-sm font-bold text-[var(--text-primary)]"
              >
                <Award className="w-4 h-4 text-[var(--brand-primary)]" /> {badge.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
