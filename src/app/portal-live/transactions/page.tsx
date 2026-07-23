"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Loader2, CreditCard, CheckCircle, XCircle, Clock, Search, Filter } from "lucide-react";
import { getAdminTransactionsAction } from "../actions";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAdminTransactionsAction();
      setTransactions((res.transactions || []) as Transaction[]);
      setLoading(false);
    };
    fetchData();
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

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
      const studentName = tx.profiles?.full_name?.toLowerCase() || "";
      const courseTitle = tx.courses?.title?.toLowerCase() || "";
      const phone = tx.phone_number || "";
      const ref = tx.reference_id?.toLowerCase() || "";
      const search = searchTerm.toLowerCase();
      
      const matchesSearch = studentName.includes(search) || courseTitle.includes(search) || phone.includes(search) || ref.includes(search);
      
      return matchesStatus && matchesSearch;
    });
  }, [transactions, searchTerm, statusFilter]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">WaafiPay Transactions</h1>
          <p className="text-white/50 mt-1">All payment records from EVC, Zaad, Sahal & Somnet</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search student, phone, ref..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-white/30 w-64"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-white/30 appearance-none min-w-[120px]"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <CreditCard className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Transactions Found</h3>
          <p className="text-white/50">Try adjusting your search or filters.</p>
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
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white text-sm">
                    <div className="font-medium">{tx.profiles?.full_name || "Unknown Student"}</div>
                    <div className="text-xs text-white/40 mt-0.5 font-mono">{tx.reference_id}</div>
                  </td>
                  <td className="p-4 text-white/70 text-sm">{tx.courses?.title || "—"}</td>
                  <td className="p-4 text-white font-bold text-sm">${tx.amount}</td>
                  <td className="p-4"><span className="text-xs uppercase font-bold text-white/50 bg-white/5 px-2 py-1 rounded">{tx.payment_method || "—"}</span></td>
                  <td className="p-4 text-white/50 text-sm font-mono">{tx.phone_number || "—"}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border font-medium ${statusColor(tx.status)}`}>
                      {statusIcon(tx.status)} {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString()} <span className="text-xs opacity-50 ml-1">{new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
