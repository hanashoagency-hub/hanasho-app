import React from "react";
import Link from "next/link";
import { BookOpen, User, Settings, LogOut, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile to get name and role
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-6 text-white/50 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {(profile?.full_name || user.email || "?")[0].toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-white font-semibold truncate">{profile?.full_name || "Student"}</h2>
              <p className="text-white/40 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
            <User className="w-5 h-5 text-blue-400" />
            My Profile
          </Link>
          <Link href="/dashboard/my-courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
            <BookOpen className="w-5 h-5 text-purple-400" />
            My Courses
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
            <Settings className="w-5 h-5 text-gray-400" />
            Settings
          </Link>
          {profile?.role === 'admin' && (
            <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-white/5 transition-colors font-medium mt-4 border border-red-500/20 bg-red-500/5">
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/auth/signout" method="post">
            <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-white/50 hover:bg-white/5 hover:text-white transition-colors font-medium">
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
