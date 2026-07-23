"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { LayoutDashboard, BookOpen, Users, CreditCard, LogOut, ArrowLeft, ShieldAlert, Loader2, FileText, Menu, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const touchStartX = useRef(0);
  const touchCurrentX = useRef(0);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Swipe-to-close
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchCurrentX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const diff = touchStartX.current - touchCurrentX.current;
    if (diff > 80) {
      setDrawerOpen(false);
    }
  }, []);

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

      const userEmail = user.email?.toLowerCase()?.trim();

      // Check if the email matches the owner's specific email exactly
      if (userEmail === "hanhub.agency@gmail.com") {
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
        <div className="text-center bg-[var(--bg-secondary)] border border-red-500/20 rounded-[24px] p-10 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-red-400" />
          </div>
          <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">Access Denied</h2>
          <p className="text-[var(--text-secondary)] mb-8">You do not have admin privileges to access this page.</p>
          <Link
            href="/dashboard"
            className="btn-secondary"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/portal-live", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal-live/courses", label: "Courses & Modules", icon: BookOpen },
    { href: "/portal-live/blogs", label: "Blogs & Articles", icon: FileText },
    { href: "/portal-live/users", label: "Students & Users", icon: Users },
    { href: "/portal-live/transactions", label: "WaafiPay Transactions", icon: CreditCard },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  /* ===== Sidebar Content (shared between desktop & mobile) ===== */
  const sidebarContent = (
    <>
      <div className="p-6 border-b border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-2 mb-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors text-sm font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Website
        </Link>
        <h2 className="text-xl font-heading font-bold text-[var(--text-primary)] tracking-wider mt-4">
          HANASHO <span className="text-[var(--brand-primary)]">ADMIN</span>
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/portal-live" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] font-bold text-sm transition-colors ${
                isActive
                  ? "bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] bg-transparent hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)]'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <button
          onClick={handleSignOut}
          className="flex items-center w-full gap-3 px-4 py-3 rounded-[12px] text-red-400 hover:bg-red-500/10 transition-colors font-bold text-sm"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-transparent flex text-[var(--text-primary)] font-body">
      {/* ===== Mobile Hamburger Button ===== */}
      <button
        onClick={() => setDrawerOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-[12px] bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* ===== Mobile Overlay ===== */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          drawerOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* ===== Mobile Drawer ===== */}
      <aside
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors z-10"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
        {sidebarContent}
      </aside>

      {/* ===== Desktop Sidebar (unchanged) ===== */}
      <aside className="hidden md:flex w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex-col fixed inset-y-0 left-0 z-50">
        {sidebarContent}
      </aside>

      {/* Main Content — full width on mobile, offset on desktop */}
      <main className="flex-1 md:ml-64 p-6 md:p-8">
        <div className="max-w-6xl mx-auto pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}

