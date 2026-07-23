import React from "react";
import { Users, BookOpen, CreditCard, TrendingUp } from "lucide-react";
import { getAdminClient } from "@/utils/certificates";

export default async function AdminDashboardPage() {
  const supabaseAdmin = getAdminClient();

  // Fetch counts
  const { count: studentCount } = await supabaseAdmin.from("profiles").select("*", { count: "exact", head: true });
  const { count: courseCount } = await supabaseAdmin.from("courses").select("*", { count: "exact", head: true }).eq("is_published", true);
  
  // Fetch transactions to calculate revenue and show recents
  const { data: transactions } = await supabaseAdmin
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  let totalRevenue = 0;
  const recentTransactions = transactions?.slice(0, 5) || [];
  
  transactions?.forEach((tx) => {
    if (tx.status === "success") {
      totalRevenue += Number(tx.amount) || 0;
    }
  });

  const stats = [
    { title: "Total Students", value: studentCount?.toString() || "0", icon: Users },
    { title: "Active Courses", value: courseCount?.toString() || "0", icon: BookOpen },
    { title: "Waafi Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: CreditCard },
    { title: "Transactions", value: transactions?.length.toString() || "0", icon: TrendingUp },
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
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 border border-[var(--border-color)] rounded-[12px]">
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{tx.phone_number}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{new Date(tx.created_at).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--brand-primary)]">+${tx.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-[12px]">
              <p className="text-[var(--text-secondary)]">No transactions yet.</p>
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6">
          <h2 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-6">Action Required</h2>
          <div className="text-center py-10 border border-dashed border-[var(--border-color)] rounded-[12px] bg-red-500/5">
            <h3 className="font-bold text-red-400 mb-2">IMPORTANT: Run Database Migration</h3>
            <p className="text-[var(--text-secondary)] text-sm mb-4 px-4">
              If courses aren't unlocking after a successful WaafiPay purchase, you MUST run the database update script in your Supabase SQL Editor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
