"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, Settings, LogOut, ArrowLeft, Trophy, Flame, Menu, X } from "lucide-react";

interface DashboardSidebarProps {
  profileName: string;
  email: string;
  avatarLetter: string;
  xp: number;
  streakCount: number;
  isAdmin: boolean;
  themeToggle: React.ReactNode;
}

export default function DashboardSidebar({
  profileName,
  email,
  avatarLetter,
  xp,
  streakCount,
  isAdmin,
  themeToggle,
}: DashboardSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const drawerRef = useRef<HTMLDivElement>(null);
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

  /* ===== Sidebar Content (shared between desktop & mobile) ===== */
  const sidebarContent = (
    <>
      <div className="p-6 border-b border-[var(--border-color)]">
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Website
          </Link>
          {themeToggle}
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-primary)] flex items-center justify-center text-[var(--on-brand)] font-bold text-lg shadow-sm">
            {avatarLetter}
          </div>
          <div className="overflow-hidden">
            <h2 className="text-[var(--text-primary)] font-bold truncate font-heading">
              {profileName}
            </h2>
            <p className="text-[var(--text-secondary)] text-xs truncate">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-[var(--brand-primary)]">
            <Trophy className="w-3.5 h-3.5" /> {xp} XP
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[10px] bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-orange-400">
            <Flame className="w-3.5 h-3.5" /> {streakCount} day streak
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm"
        >
          <User className="w-5 h-5 text-[var(--brand-primary)]" />
          My Profile
        </Link>
        <Link
          href="/dashboard/my-courses"
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm"
        >
          <BookOpen className="w-5 h-5 text-[var(--brand-primary)]" />
          My Courses
        </Link>
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm"
        >
          <Settings className="w-5 h-5 text-[var(--text-secondary)]" />
          Settings
        </Link>
        <Link
          href="/leaderboard"
          className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm"
        >
          <Trophy className="w-5 h-5 text-[var(--brand-primary)]" />
          Leaderboard
        </Link>
        {isAdmin && (
          <Link
            href="/portal-live"
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-red-400 hover:bg-red-500/10 transition-colors font-bold mt-4 border border-red-500/20 bg-red-500/5 text-sm"
          >
            Admin Panel
          </Link>
        )}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <form action="/auth/signout" method="post">
          <button className="flex items-center w-full gap-3 px-4 py-3 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </form>
      </div>
    </>
  );

  return (
    <>
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
        ref={drawerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button inside drawer */}
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
    </>
  );
}
