"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { updateProfileInfoAction } from "./actions";
import { Loader2, Upload, User, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileSettingsFormProps {
  initialFullName: string;
  initialAvatarUrl: string;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB raw upload cap, before compression
const MAX_DIMENSION = 512; // avatars never need to be larger than this

// Downscales + re-encodes the image client-side so uploads stay small and
// fast regardless of what the student's camera/phone produced.
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Image compression failed"))),
      "image/webp",
      0.85
    );
  });
}

export default function ProfileSettingsForm({ initialFullName, initialAvatarUrl }: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const router = useRouter();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previousAvatarUrl = avatarUrl; // for graceful fallback on failure

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setMessage({ text: "Please upload a JPG, PNG, or WEBP image.", type: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setMessage({ text: "Image is too large. Please choose a file under 8MB.", type: "error" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      setUploadProgress(30);
      const compressed = await compressImage(file);

      setUploadProgress(55);
      const filePath = `${user.id}/${Date.now()}.webp`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, compressed, { upsert: true, contentType: "image/webp" });

      if (uploadError) throw uploadError;

      setUploadProgress(90);
      const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(filePath);

      // Cache-bust so the new image shows immediately even if the old one
      // is still cached under a different path segment.
      const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      setAvatarUrl(freshUrl);
      setUploadProgress(100);
      setMessage({ text: "Photo uploaded — click Save Changes to apply it.", type: "success" });
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setAvatarUrl(previousAvatarUrl); // don't lose the existing avatar on failure
      setMessage({
        text: err?.message?.includes("Bucket not found")
          ? "Avatar storage isn't set up yet. Please contact support."
          : "Failed to upload image. Please try again.",
        type: "error",
      });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 600);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("fullName", fullName);
    formData.append("avatarUrl", avatarUrl);

    const result = await updateProfileInfoAction(formData);

    setIsSaving(false);

    if (result.success) {
      setMessage({ text: "Profile updated successfully!", type: "success" });
      // Let the navbar (client-side) and dashboard sidebar (server-rendered)
      // pick up the new name/avatar immediately, without a full reload.
      window.dispatchEvent(new CustomEvent("hanhub:profile-updated"));
      router.refresh();
    } else {
      setMessage({ text: result.error || "Failed to update profile", type: "error" });
    }
  };

  return (
    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 mb-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
          <User className="w-6 h-6 text-[var(--brand-primary)]" />
        </div>
        <div>
          <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Profile Information</h2>
          <p className="text-sm text-[var(--text-secondary)]">Update your name and profile photo.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {message && (
          <div className={`p-4 rounded-[12px] text-sm font-bold ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full border-2 border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden flex items-center justify-center relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-[var(--text-secondary)]" />
              )}
              <div
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm"
              >
                <Upload className="w-6 h-6 text-white" />
              </div>
              {isUploading && (
                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-black/40">
                  <div
                    className="h-full bg-[var(--brand-primary)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>

            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
              >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                {isUploading ? `Uploading... ${uploadProgress}%` : "Change Photo"}
              </button>
              <p className="text-[11px] text-[var(--text-secondary)] mt-1">JPG, PNG or WEBP, up to 8MB</p>
            </div>
          </div>

          <div className="flex-1 w-full">
            <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ahmed Ali"
              className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[12px] py-3 px-4 focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[var(--border-color)]">
          <button
            type="submit"
            disabled={isSaving || isUploading}
            className="btn-primary px-8 flex items-center gap-2"
          >
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
