"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Service role client bypasses RLS
function getAdminClient() {
  const url = "https://worerikjebqpeibrepgz.supabase.co";
  const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvcmVyaWtqZWJxcGVpYnJlcGd6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDYzNTk4NiwiZXhwIjoyMDk2MjExOTg2fQ.rHBeYbUnD0WNCgUduf95ddjBx3cSrsTeoPtXMu0Y9dU";
  return createClient(url, key);
}

export async function createBlogAction(blogData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("blogs")
      .insert(blogData)
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/blogs");
    revalidatePath("/blogs");
    return { success: true, blog: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBlogAction(id: string, blogData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("blogs")
      .update(blogData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/blogs");
    revalidatePath("/blogs");
    revalidatePath(`/blogs/${data.slug}`);
    return { success: true, blog: data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBlogAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("blogs")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/blogs");
    revalidatePath("/blogs");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
