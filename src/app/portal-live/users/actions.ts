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
