"use server";

import { revalidatePath } from "next/cache";
import { getAdminClient } from "@/utils/certificates";

export async function createBookAction(bookData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("books")
      .insert({ ...bookData, is_published: true })
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/books");
    revalidatePath("/books");
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBookAction(id: string, bookData: any) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("books")
      .update(bookData)
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/books");
    revalidatePath("/books");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBookAction(id: string) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("books")
      .delete()
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/books");
    revalidatePath("/books");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleBookPublishAction(id: string, is_published: boolean) {
  try {
    const supabaseAdmin = getAdminClient();
    const { error } = await supabaseAdmin
      .from("books")
      .update({ is_published })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/portal-live/books");
    revalidatePath("/books");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAdminBooksAction() {
  try {
    const supabaseAdmin = getAdminClient();
    const { data, error } = await supabaseAdmin
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return { success: true, data: data || [] };
  } catch (error: any) {
    return { success: false, data: [] };
  }
}

export async function uploadBookCoverAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      return { success: false, error: "Only JPG, PNG, or WEBP images are allowed." };
    }
    if (file.size > 10 * 1024 * 1024) return { success: false, error: "Image must be under 10MB." };

    const supabaseAdmin = getAdminClient();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("book-covers")
      .upload(path, file, { contentType: "image/webp", upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage.from("book-covers").getPublicUrl(path);
    return { success: true, url: publicUrlData.publicUrl };
  } catch (error: any) {
    console.error("Upload Book Cover Error:", error);
    return { success: false, error: error.message || "Upload failed." };
  }
}

export async function uploadBookFileAction(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "No file provided." };
    if (!["application/pdf", "application/epub+zip"].includes(file.type)) {
      return { success: false, error: "Only PDF or ePub files are allowed." };
    }
    if (file.size > 100 * 1024 * 1024) return { success: false, error: "File must be under 100MB." };

    const supabaseAdmin = getAdminClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const path = `${Date.now()}-${safeName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("book-files")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) throw new Error(uploadError.message);

    const { data: publicUrlData } = supabaseAdmin.storage.from("book-files").getPublicUrl(path);
    return { success: true, url: publicUrlData.publicUrl, fileName: file.name };
  } catch (error: any) {
    console.error("Upload Book File Error:", error);
    return { success: false, error: error.message || "Upload failed." };
  }
}
