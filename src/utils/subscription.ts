import { getAdminClient } from "@/utils/certificates";

// First month is 50% off the monthly price; every renewal after that is 60% off.
export const FIRST_MONTH_DISCOUNT_PCT = 50;
export const RENEWAL_DISCOUNT_PCT = 60;

export interface SubscriptionPricing {
  offersSubscription: boolean;
  monthlyBase: number;
  renewalCount: number;
  isRenewal: boolean;
  discountPct: number;
  price: number;
}

// Server-authoritative monthly price for a user on a course, reflecting
// whether this is their first month (50% off) or a renewal (60% off).
export async function getSubscriptionPricing(courseId: string, userId: string | null): Promise<SubscriptionPricing | null> {
  const admin = getAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("offers_subscription, monthly_price")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;

  const monthlyBase = Number(course.monthly_price) || 0;

  let renewalCount = 0;
  if (userId) {
    const { data: sub } = await admin
      .from("course_subscriptions")
      .select("renewal_count")
      .eq("user_id", userId)
      .eq("course_id", courseId)
      .maybeSingle();
    renewalCount = sub?.renewal_count ?? 0;
  }

  const isRenewal = renewalCount >= 1;
  const discountPct = isRenewal ? RENEWAL_DISCOUNT_PCT : FIRST_MONTH_DISCOUNT_PCT;
  const price = Math.round(monthlyBase * (1 - discountPct / 100) * 100) / 100;

  return {
    offersSubscription: !!course.offers_subscription,
    monthlyBase,
    renewalCount,
    isRenewal,
    discountPct,
    price,
  };
}

// A subscription grants access only while its current period hasn't elapsed.
export async function hasActiveSubscription(userId: string, courseId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data: sub } = await admin
    .from("course_subscriptions")
    .select("current_period_end, status")
    .eq("user_id", userId)
    .eq("course_id", courseId)
    .maybeSingle();
  if (!sub) return false;
  if (sub.status === "cancelled") return false;
  return new Date(sub.current_period_end).getTime() > Date.now();
}

