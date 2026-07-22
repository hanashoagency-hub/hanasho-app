import React from "react";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const stats = [
    { title: "Total Students", value: "0", icon: Users },
    { title: "Active Courses", value: "0", icon: BookOpen },
    { title: "Total Revenue", value: "$0.00", icon: CreditCard },
    { title: "Active Subscriptions", value: "0", icon: TrendingUp },
  ];

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-3xl font-heading font-bold text-[var(--text-primary)] mb-2">Welcome, Admin</h1>
        <p className="text-[var(--text-secondary)]">Here's an overview of your LMS platform.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-[12px] flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)]`}>
              <stat.icon className={`w-6 h-6 text-[var(--brand-primary)]`} />
            </div>
            <div>
              <p className="text-[var(--text-secondary)] text-sm font-bold uppercase tracking-wider mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold font-heading text-[var(--text-primary)]">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-6">Recent WaafiPay Transactions</h2>
          <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-[12px]">
            <p className="text-[var(--text-secondary)]">No transactions yet.</p>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-6">Recently Registered Students</h2>
          <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-[12px]">
            <p className="text-[var(--text-secondary)]">No students registered yet.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
