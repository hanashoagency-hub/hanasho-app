"use client";

import React, { useState, useRef } from "react";
import { updateProfileInfoAction } from "./actions";
import { Loader2, Upload, User, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileSettingsFormProps {
  initialFullName: string;
  initialAvatarUrl: string;
}

export default function ProfileSettingsForm({ initialFullName, initialAvatarUrl }: ProfileSettingsFormProps) {
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to avatars bucket
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrlData.publicUrl);
    } catch (err: any) {
      console.error(err);
      setMessage({ text: "Failed to upload image. Did you run the SQL script to create the bucket?", type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
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
            </div>
            
            <div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="text-xs font-bold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
              >
                {isUploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ImageIcon className="w-3 h-3" />}
                {isUploading ? "Uploading..." : "Change Photo"}
              </button>
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
