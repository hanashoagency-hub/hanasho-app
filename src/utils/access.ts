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

  return false;
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
