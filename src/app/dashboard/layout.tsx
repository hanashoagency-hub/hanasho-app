"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BookOpen, 
  BarChart2, 
  Bell, 
  Bot, 
  Users, 
  Activity, 
  Settings, 
  LogOut 
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Overview', href: '/dashboard', icon: Activity },
  { name: 'Enrolled Courses', href: '/dashboard/courses', icon: BookOpen },
  { name: 'Progress', href: '/dashboard/progress', icon: BarChart2 },
  { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
  { name: 'AI Assistant', href: '/dashboard/ai', icon: Bot },
  { name: 'Community', href: '/community', icon: Users },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 flex flex-col md:flex-row font-sans selection:bg-white/20">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/[0.02] border-r border-white/5 backdrop-blur-xl flex flex-col sticky top-0 md:h-screen z-10">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#333] to-[#555] flex items-center justify-center text-white font-bold text-xl group-hover:shadow-[0_0_20px_rgba(217,217,217,0.15)] transition-all">
              X
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 tracking-tight">
              XIRFADIFY
            </span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Menu
          </div>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-white/5 to-white/[0.02] text-[#D9D9D9] border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.03)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#D9D9D9]' : 'text-slate-500'}`} />
                <span className="font-medium text-sm">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-1">
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent transition-all w-full text-left">
            <Settings className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 border border-transparent transition-all w-full text-left">
            <LogOut className="w-5 h-5 text-slate-500" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-0 p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
