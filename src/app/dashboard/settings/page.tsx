import React from "react";
import { Shield, Bell } from "lucide-react";
import ProfileSettingsForm from "./ProfileSettingsForm";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)] mb-2">Account Settings</h1>
        <p className="text-[var(--text-secondary)]">Manage your profile and preferences.</p>
      </div>

      <ProfileSettingsForm 
        initialFullName={profile?.full_name || ""} 
        initialAvatarUrl={profile?.avatar_url || ""} 
      />

      <div className="space-y-6">
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
              <Shield className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Security & Password</h2>
              <p className="text-sm text-[var(--text-secondary)]">Update your password and secure your account.</p>
            </div>
          </div>
          <button className="btn-secondary px-6 py-2 text-sm">
            Change Password
          </button>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
              <Bell className="w-6 h-6 text-[var(--brand-primary)]" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-[var(--text-primary)]">Notifications</h2>
              <p className="text-sm text-[var(--text-secondary)]">Manage email notifications and alerts.</p>
            </div>
          </div>
          <button className="btn-secondary px-6 py-2 text-sm">
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}

