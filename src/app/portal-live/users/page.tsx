"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Users, Search, Shield, ShieldOff, Plus, Edit2, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createUser, updateUserCredentials } from "./actions";

interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  role: string;
  phone: string;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  // Modals state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isEditCredsModalOpen, setIsEditCredsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);

  // Form states
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "student" });
  const [credsData, setCredsData] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleRole = async (user: Profile) => {
    const newRole = user.role === "admin" ? "student" : "admin";
    await supabase.from("profiles").update({ role: newRole }).eq("id", user.id);
    fetchUsers();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    const res = await createUser(formData);
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsAddUserModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "student" });
      fetchUsers();
    }
    setSubmitting(false);
  };

  const handleEditCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setErrorMsg("");
    const res = await updateUserCredentials({
      userId: selectedUser.id,
      email: credsData.email || undefined,
      password: credsData.password || undefined,
    });
    if (res.error) {
      setErrorMsg(res.error);
    } else {
      setIsEditCredsModalOpen(false);
      setSelectedUser(null);
      setCredsData({ email: "", password: "" });
    }
    setSubmitting(false);
  };

  const openEditModal = (user: Profile) => {
    setSelectedUser(user);
    setCredsData({ email: "", password: "" }); // Clear fields so they only update if typed
    setIsEditCredsModalOpen(true);
  };

  const filtered = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Students & Users</h1>
          <p className="text-white/50 mt-1">{users.length} registered users</p>
        </div>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add New User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Search users..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Users className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
          <p className="text-white/50">Users will appear here after they register.</p>
        </div>
      ) : (
        <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4 text-sm font-medium text-white/50">User</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Role</th>
                <th className="text-left p-4 text-sm font-medium text-white/50">Joined</th>
                <th className="text-right p-4 text-sm font-medium text-white/50">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-bold">
                          {(user.full_name || "?")[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">{user.full_name || "No name"}</p>
                        <p className="text-white/40 text-xs">{user.id.slice(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${user.role === "admin" ? "bg-purple-500/10 text-purple-400 border border-purple-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-white/50 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => openEditModal(user)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors" title="Edit Credentials">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => toggleRole(user)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors" title={user.role === "admin" ? "Remove admin" : "Make admin"}>
                      {user.role === "admin" ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Add New User</h2>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 flex flex-col gap-4">
              {errorMsg && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{errorMsg}</div>}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Email</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Password</label>
                <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">Role</label>
                <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50">
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button disabled={submitting} type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium mt-4 flex items-center justify-center disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Credentials Modal */}
      {isEditCredsModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Edit Credentials</h2>
              <button onClick={() => setIsEditCredsModalOpen(false)} className="text-white/50 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEditCredentials} className="p-6 flex flex-col gap-4">
              <p className="text-sm text-white/50 mb-2">Updating credentials for {selectedUser.full_name}</p>
              {errorMsg && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{errorMsg}</div>}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">New Email (Optional)</label>
                <input type="email" value={credsData.email} onChange={e => setCredsData({ ...credsData, email: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" placeholder="Leave blank to keep current" />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1">New Password (Optional)</label>
                <input type="password" value={credsData.password} onChange={e => setCredsData({ ...credsData, password: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500/50" placeholder="Leave blank to keep current" />
              </div>
              <button disabled={submitting || (!credsData.email && !credsData.password)} type="submit" className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium mt-4 flex items-center justify-center disabled:opacity-50 transition-colors">
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Credentials"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

