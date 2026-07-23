"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, User, Settings, LogOut, ArrowLeft, Trophy, Flame, Menu, X, PanelLeftClose, PanelLeftOpen } from "lucide-react";

interface DashboardSidebarProps {
  profileName: string;
  email: string;
  avatarLetter: string;
  avatarUrl?: string | null;
  xp: number;
  streakCount: number;
  isAdmin: boolean;
  themeToggle: React.ReactNode;
  children?: React.ReactNode;
}

export default function DashboardSidebar({
  profileName,
  email,
  avatarLetter,
  avatarUrl,
  xp,
  streakCount,
  isAdmin,
  themeToggle,
  children
}: DashboardSidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Initialize from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newVal = !isCollapsed;
    setIsCollapsed(newVal);
    localStorage.setItem("sidebarCollapsed", String(newVal));
  };
  
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
  const getSidebarContent = (isDesktop: boolean) => (
    <>
      <div className={`p-6 border-b border-[var(--border-color)] ${isDesktop && isCollapsed ? 'items-center flex flex-col px-2' : ''}`}>
        <div className={`flex items-center justify-between mb-6 ${isDesktop && isCollapsed ? 'flex-col gap-4' : ''}`}>
          {!isDesktop || !isCollapsed ? (
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors text-sm font-bold"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Website
            </Link>
          ) : (
            <Link href="/" title="Back to Website" className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          )}
          
          <div className="flex items-center gap-2">
            {themeToggle}
            {isDesktop && (
              <button 
                onClick={toggleCollapse} 
                className="p-1.5 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
        
        {(!isDesktop || !isCollapsed) ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-primary)] flex items-center justify-center text-[var(--on-brand)] font-bold text-lg shadow-sm flex-shrink-0 overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  avatarLetter
                )}
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
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="w-10 h-10 rounded-[12px] bg-[var(--brand-primary)] flex items-center justify-center text-[var(--on-brand)] font-bold text-lg shadow-sm overflow-hidden" title={`${profileName} (${email})`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                avatarLetter
              )}
            </div>
            <div className="flex flex-col gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--brand-primary)]" title={`${xp} XP`}>
                <Trophy className="w-4 h-4" />
              </span>
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-orange-400" title={`${streakCount} day streak`}>
                <Flame className="w-4 h-4" />
              </span>
            </div>
          </div>
        )}
      </div>

      <nav className={`flex-1 p-4 space-y-2 ${isDesktop && isCollapsed ? 'px-2' : ''}`}>
        <Link
          href="/dashboard"
          title={isDesktop && isCollapsed ? "My Profile" : undefined}
          className={`flex items-center ${isDesktop && isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm`}
        >
          <User className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" />
          {(!isDesktop || !isCollapsed) && "My Profile"}
        </Link>
        <Link
          href="/dashboard/my-courses"
          title={isDesktop && isCollapsed ? "My Courses" : undefined}
          className={`flex items-center ${isDesktop && isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm`}
        >
          <BookOpen className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" />
          {(!isDesktop || !isCollapsed) && "My Courses"}
        </Link>
        <Link
          href="/dashboard/settings"
          title={isDesktop && isCollapsed ? "Settings" : undefined}
          className={`flex items-center ${isDesktop && isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm`}
        >
          <Settings className="w-5 h-5 text-[var(--text-secondary)] flex-shrink-0" />
          {(!isDesktop || !isCollapsed) && "Settings"}
        </Link>
        <Link
          href="/leaderboard"
          title={isDesktop && isCollapsed ? "Leaderboard" : undefined}
          className={`flex items-center ${isDesktop && isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm`}
        >
          <Trophy className="w-5 h-5 text-[var(--brand-primary)] flex-shrink-0" />
          {(!isDesktop || !isCollapsed) && "Leaderboard"}
        </Link>
        {isAdmin && (
          <Link
            href="/portal-live"
            title={isDesktop && isCollapsed ? "Admin Panel" : undefined}
            className={`flex items-center ${isDesktop && isCollapsed ? 'justify-center p-3 mt-4' : 'gap-3 px-4 py-3 mt-4'} rounded-[12px] text-red-400 hover:bg-red-500/10 transition-colors font-bold border border-red-500/20 bg-red-500/5 text-sm`}
          >
            {isDesktop && isCollapsed ? <Settings className="w-5 h-5 text-red-400" /> : "Admin Panel"}
          </Link>
        )}
      </nav>

      <div className={`p-4 border-t border-[var(--border-color)] ${isDesktop && isCollapsed ? 'px-2' : ''}`}>
        <form action="/auth/signout" method="post">
          <button 
            title={isDesktop && isCollapsed ? "Sign Out" : undefined}
            className={`flex items-center w-full ${isDesktop && isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3'} rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors font-bold text-sm`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {(!isDesktop || !isCollapsed) && "Sign Out"}
          </button>
        </form>
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
        ref={drawerRef}
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
        {getSidebarContent(false)}
      </aside>

      {/* ===== Desktop Sidebar ===== */}
      <aside 
        className={`hidden md:flex bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex-col fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {getSidebarContent(true)}
      </aside>

      {/* Main Content */}
      <main 
        className={`flex-1 p-6 md:p-8 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="max-w-5xl mx-auto pt-14 md:pt-0">
          {children}
        </div>
      </main>
    </div>
  );
}
