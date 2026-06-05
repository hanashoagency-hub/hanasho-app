"use client";

import React, { useState, useEffect } from "react";
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  phone_number: string;
  reference_id: string;
  status: string;
  created_at: string;
  profiles?: { full_name: string };
  courses?: { title: string };
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*, profiles(full_name), courses(title)")
        .order("created_at", { ascending: false });
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const statusIcon = (status: string) => {
    if (status === "success") return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
    return <Clock className="w-4 h-4 text-yellow-400" />;
  };

  const statusColor = (status: string) => {
    if (status === "success") return "bg-green-500/10 text-green-400 border-green-500/20";
    if (status === "failed") return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-white">WaafiPay Transactions</h1>
        <p className="text-white/50 mt-1">All payment records from EVC, Zaad, Sahal & Somnet</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Transactions Yet</h3>
          <p className="text-white/50">Payments will appear here when students purchase courses.</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/50">Student</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Course</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Method</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Phone</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Status</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white text-sm">{(tx as any).profiles?.full_name || "Unknown"}</td>
                  <td className="p-4 text-white/70 text-sm">{(tx as any).courses?.title || "—"}</td>
                  <td className="p-4 text-white font-bold text-sm">${tx.amount}</td>
                  <td className="p-4"><span className="text-xs uppercase font-bold text-white/50 bg-white/5 px-2 py-1 rounded">{tx.payment_method || "—"}</span></td>
                  <td className="p-4 text-white/50 text-sm">{tx.phone_number || "—"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border font-medium ${statusColor(tx.status)}`}>
                      {statusIcon(tx.status)} {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm">{new Date(tx.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
