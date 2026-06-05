import React from "react";
import { Settings, Shield, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
        <p className="text-white/50">Manage your profile and preferences.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Security & Password</h2>
              <p className="text-sm text-white/50">Update your password and secure your account.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors">
            Change Password
          </button>
        </div>

        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-sm text-white/50">Manage email notifications and alerts.</p>
            </div>
          </div>
          <button className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white text-sm font-medium rounded-lg transition-colors">
            Manage Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
