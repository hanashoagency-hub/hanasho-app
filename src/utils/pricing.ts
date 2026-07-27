import { getAdminClient } from "@/utils/certificates";
import { getCoursePromotionAction } from "@/app/portal-live/actions";

export interface EffectivePrice {
  basePrice: number;
  finalPrice: number;
  promoPct: number;
  couponPct: number;
  appliedPct: number;
  couponId: string | null;
  couponError: string | null;
  isFree: boolean;
}

export async function validateCoupon(code: string, courseId: string): Promise<{ pct: number; couponId: string | null; error: string | null }> {
  const admin = getAdminClient();
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { pct: 0, couponId: null, error: null };

  const { data: coupon } = await admin
    .from("coupons")
    .select("*")
    .eq("code", normalized)
    .maybeSingle();

  if (!coupon) return { pct: 0, couponId: null, error: "Invalid coupon code." };
  if (!coupon.is_active) return { pct: 0, couponId: null, error: "This coupon is no longer active." };
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { pct: 0, couponId: null, error: "This coupon has expired." };
  }
  if (coupon.max_uses !== null && coupon.used_count >= coupon.max_uses) {
    return { pct: 0, couponId: null, error: "This coupon has reached its usage limit." };
  }
  if (coupon.course_id && coupon.course_id !== courseId) {
    return { pct: 0, couponId: null, error: "This coupon doesn't apply to this course." };
  }

  const pct = Math.min(100, Math.max(0, Number(coupon.discount_percentage) || 0));
  return { pct, couponId: coupon.id, error: null };
}

// Single server-side source of truth for what a course actually costs right
// now, combining the announcement-driven promotion and an optional coupon.
// Discounts do NOT stack — the single best discount wins.
export async function getEffectiveCoursePrice(courseId: string, couponCode?: string | null): Promise<EffectivePrice | null> {
  const admin = getAdminClient();

  const { data: course } = await admin
    .from("courses")
    .select("id, price")
    .eq("id", courseId)
    .maybeSingle();
  if (!course) return null;

  const basePrice = Number(course.price) || 0;

  const promo = await getCoursePromotionAction(courseId);
  const promoPct = promo.isFree ? 100 : promo.discountPercentage;

  let couponPct = 0;
  let couponId: string | null = null;
  let couponError: string | null = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode, courseId);
    couponPct = result.pct;
    couponId = result.couponId;
    couponError = result.error;
  }

  const appliedPct = Math.max(promoPct, couponPct);
  const finalPrice = Math.round(basePrice * (1 - appliedPct / 100) * 100) / 100;

  return {
    basePrice,
    finalPrice,
    promoPct,
    couponPct,
    appliedPct,
    couponId: couponPct >= promoPct ? couponId : null,
    couponError,
    isFree: appliedPct >= 100,
  };
}

export async function incrementCouponUse(couponId: string) {
  const admin = getAdminClient();
  const { data: coupon } = await admin.from("coupons").select("used_count").eq("id", couponId).maybeSingle();
  if (coupon) {
    await admin.from("coupons").update({ used_count: (coupon.used_count || 0) + 1 }).eq("id", couponId);
  }
}
