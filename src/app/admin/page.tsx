import React from "react";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Students", value: "0", icon: Users, color: "text-green-400", bg: "bg-green-400/10" },
    { title: "Active Courses", value: "0", icon: BookOpen, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Total Revenue", value: "$0.00", icon: CreditCard, color: "text-orange-400", bg: "bg-orange-400/10" },
    { title: "Active Subscriptions", value: "0", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
  ];

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Welcome, Admin</h1>
        <p className="text-white/60">Here's an overview of your LMS platform.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-7 h-7 ${stat.color}`} />
            </div>
            <div>
              <p className="text-white/50 text-sm font-medium mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recent WaafiPay Transactions</h2>
          <div className="text-center py-10">
            <p className="text-white/50">No transactions yet.</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-6">Recently Registered Students</h2>
          <div className="text-center py-10">
            <p className="text-white/50">No students registered yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
