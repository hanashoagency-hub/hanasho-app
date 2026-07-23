export interface UserStats {
  user_id: string;
  xp: number;
  streak_count: number;
  longest_streak: number;
  last_active_date: string | null;
}

export interface Badge {
  id: string;
  code: string;
  label: string;
  description: string | null;
  icon: string | null;
  xp_threshold: number | null;
}

export interface Reward {
  code: string;
  label: string;
  description: string;
  xpRequired: number;
  badgeCode: string;
}

// XP-threshold rewards a student can manually claim from the dashboard once eligible.
// Claiming records the claim and awards the matching badge (badges are also
// auto-granted by award_xp(), so claiming here is mainly a celebratory action).
export const REWARDS: Reward[] = [
  {
    code: "bronze_100",
    label: "Bronze Learner",
    description: "Reach 100 XP to unlock this badge.",
    xpRequired: 100,
    badgeCode: "bronze_learner",
  },
  {
    code: "silver_500",
    label: "Silver Learner",
    description: "Reach 500 XP to unlock this badge.",
    xpRequired: 500,
    badgeCode: "silver_learner",
  },
  {
    code: "gold_1500",
    label: "Gold Learner",
    description: "Reach 1500 XP to unlock this badge.",
    xpRequired: 1500,
    badgeCode: "gold_learner",
  },
];

export const LESSON_COMPLETE_XP = 15;
export const FIRST_LESSON_BADGE_CODE = "first_lesson";
