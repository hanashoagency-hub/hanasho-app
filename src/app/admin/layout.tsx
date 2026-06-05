"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, CreditCard, LogOut, ArrowLeft, ShieldAlert, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Check role in profiles table
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching profile role:", error);
      }

      const userRole = profile?.role?.toLowerCase()?.trim();
      const userEmail = user.email?.toLowerCase()?.trim();

      // Check if role is admin OR if the email matches the owner's email as a fallback
      if (userRole === "admin" || userEmail === "hanasho.agency@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="text-center bg-[#0A0A0A] border border-red-500/20 rounded-3xl p-10 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-white/60 mb-8">You do not have admin privileges to access this page.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-white font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, color: "text-blue-400" },
    { href: "/admin/courses", label: "Courses & Modules", icon: BookOpen, color: "text-purple-400" },
    { href: "/admin/users", label: "Students & Users", icon: Users, color: "text-green-400" },
    { href: "/admin/transactions", label: "WaafiPay Transactions", icon: CreditCard, color: "text-orange-400" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#050505] flex text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 flex flex-col fixed inset-y-0 left-0 z-50">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2 mb-2 text-white/50 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          <h2 className="text-xl font-heading font-bold text-white tracking-wider">
            HANASHO <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">ADMIN</span>
          </h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                  isActive
                    ? "bg-white/5 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className={`w-5 h-5 ${item.color}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleSignOut}
            className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
