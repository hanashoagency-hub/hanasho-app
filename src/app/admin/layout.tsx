import React from "react";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, CreditCard, LogOut, ArrowLeft } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
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
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            Dashboard
          </Link>
          <Link href="/admin/courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
            <BookOpen className="w-5 h-5 text-purple-400" />
            Courses & Modules
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
            <Users className="w-5 h-5 text-green-400" />
            Students & Users
          </Link>
          <Link href="/admin/transactions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-colors font-medium">
            <CreditCard className="w-5 h-5 text-orange-400" />
            WaafiPay Transactions
          </Link>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button className="flex items-center w-full gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors font-medium">
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
