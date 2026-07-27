"use server";

import { getAdminClient } from "@/utils/certificates";

export async function createUser(data: { name: string; email: string; password?: string; role: string }) {
  const supabaseAdmin = getAdminClient();
  
  // 1. Create auth user
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password || undefined,
    email_confirm: true,
    user_metadata: {
      full_name: data.name
    }
  });

  if (authError) {
    return { error: authError.message };
  }

  const userId = authData.user.id;

  // 2. Insert into profiles (id might be sufficient if role is automatically generated, but we set role)
  const { error: profileError } = await supabaseAdmin.from("profiles").upsert({
    id: userId,
    full_name: data.name,
    role: data.role,
  });

  if (profileError) {
    return { error: profileError.message };
  }

  return { success: true };
}

export async function updateUserStatusAction(userId: string, fields: {
  membership_type?: string;
  subscription_status?: string;
  account_status?: string;
}) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin.from("profiles").update(fields).eq("id", userId);
    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getUserAccessAction(userId: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const [permsRes, grantsRes, coursesRes, booksRes] = await Promise.all([
      supabaseAdmin.from("user_permissions").select("*").eq("user_id", userId),
      supabaseAdmin.from("user_item_grants").select("*").eq("user_id", userId),
      supabaseAdmin.from("courses").select("id, title").order("created_at", { ascending: false }),
      supabaseAdmin.from("books").select("id, title").order("created_at", { ascending: false }),
    ]);
    return {
      success: true,
      permissions: permsRes.data || [],
      grants: grantsRes.data || [],
      courses: coursesRes.data || [],
      books: booksRes.data || [],
    };
  } catch (error: any) {
    return { success: false, permissions: [], grants: [], courses: [], books: [], error: error.message };
  }
}

export async function saveUserAccessAction(userId: string, payload: {
  permissions: { content_kind: string; all_access: boolean; can_download: boolean; expires_at: string | null }[];
  grants: { content_kind: string; item_id: string; expires_at: string | null }[];
}) {
  try {
    const supabaseAdmin = getAdminClient();

    for (const p of payload.permissions) {
      const { error } = await supabaseAdmin.from("user_permissions").upsert(
        { user_id: userId, ...p, updated_at: new Date().toISOString() },
        { onConflict: "user_id,content_kind" }
      );
      if (error) throw new Error(error.message);
    }

    // Replace item grants wholesale — the modal always submits the full set.
    const kinds = [...new Set(payload.grants.map((g) => g.content_kind).concat(payload.permissions.map((p) => p.content_kind)))];
    for (const kind of kinds) {
      const { error: delErr } = await supabaseAdmin
        .from("user_item_grants").delete().eq("user_id", userId).eq("content_kind", kind);
      if (delErr) throw new Error(delErr.message);
    }
    if (payload.grants.length > 0) {
      const { error: insErr } = await supabaseAdmin
        .from("user_item_grants")
        .insert(payload.grants.map((g) => ({ user_id: userId, ...g })));
      if (insErr) throw new Error(insErr.message);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Save User Access Error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserCredentials(data: { userId: string; email?: string; password?: string }) {
  const supabaseAdmin = getAdminClient();

  const updates: any = {};
  if (data.email) updates.email = data.email;
  if (data.password) updates.password = data.password;
  
  if (Object.keys(updates).length === 0) {
    return { error: "No updates provided" };
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, updates);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
