import { getAdminClient } from "@/utils/certificates";

function notExpired(expiresAt: string | null): boolean {
  return !expiresAt || new Date(expiresAt).getTime() > Date.now();
}

// True when the user can access this item via purchase OR an admin-granted
// permission (blanket "all access" for the kind — which inherently covers
// future items — or an individual unexpired grant). Free promotions are
// checked separately by callers since they aren't per-user.
export async function hasContentAccess(userId: string, contentKind: "course" | "book" | "digital_product", itemId: string): Promise<boolean> {
  const admin = getAdminClient();

  const { data: purchase } = await admin
    .from("purchases")
    .select("id")
    .eq("user_id", userId)
    .eq("course_id", itemId)
    .maybeSingle();
  if (purchase) return true;

  const { data: perm } = await admin
    .from("user_permissions")
    .select("all_access, expires_at")
    .eq("user_id", userId)
    .eq("content_kind", contentKind)
    .maybeSingle();
  if (perm?.all_access && notExpired(perm.expires_at)) return true;

  const { data: grant } = await admin
    .from("user_item_grants")
    .select("expires_at")
    .eq("user_id", userId)
    .eq("content_kind", contentKind)
    .eq("item_id", itemId)
    .maybeSingle();
  if (grant && notExpired(grant.expires_at)) return true;

  // An active monthly subscription grants course access for its period.
  if (contentKind === "course") {
    const { hasActiveSubscription } = await import("@/utils/subscription");
    if (await hasActiveSubscription(userId, itemId)) return true;
  }

  return false;
}

// Every course id a user can currently access: purchases + active
// subscriptions + individual grants + (if they hold blanket all-access for
// courses) every published course. Used to populate "My Courses" so
// admin-granted and subscribed courses show up, not just direct purchases.
export async function getAccessibleCourseIds(userId: string): Promise<string[]> {
  const admin = getAdminClient();
  const ids = new Set<string>();

  const { data: purchases } = await admin.from("purchases").select("course_id").eq("user_id", userId);
  (purchases || []).forEach((p: any) => p.course_id && ids.add(p.course_id));

  const { data: subs } = await admin
    .from("course_subscriptions")
    .select("course_id, current_period_end, status")
    .eq("user_id", userId);
  (subs || []).forEach((s: any) => {
    if (s.status !== "cancelled" && new Date(s.current_period_end).getTime() > Date.now()) ids.add(s.course_id);
  });

  const { data: grants } = await admin
    .from("user_item_grants")
    .select("item_id, expires_at")
    .eq("user_id", userId)
    .eq("content_kind", "course");
  (grants || []).forEach((g: any) => {
    if (notExpired(g.expires_at)) ids.add(g.item_id);
  });

  const { data: perm } = await admin
    .from("user_permissions")
    .select("all_access, expires_at")
    .eq("user_id", userId)
    .eq("content_kind", "course")
    .maybeSingle();
  if (perm?.all_access && notExpired(perm.expires_at)) {
    const { data: allCourses } = await admin.from("courses").select("id").eq("is_published", true);
    (allCourses || []).forEach((c: any) => ids.add(c.id));
  }

  return [...ids];
}

// Account-level gate: suspended/banned users lose access to gated content.
export async function isAccountActive(userId: string): Promise<boolean> {
  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("account_status")
    .eq("id", userId)
    .maybeSingle();
  const status = profile?.account_status || "active";
  return status !== "suspended" && status !== "banned";
}
