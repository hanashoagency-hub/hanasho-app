"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Award } from "lucide-react";
import { createDiplomaAction, updateDiplomaAction, deleteDiplomaAction, toggleDiplomaPublishAction, getAdminDiplomasAction } from "./actions";

interface Diploma {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  price_slow: number;
  price_speedy: number;
  price_onetime: number;
  duration_months: number;
  benefits: string;
  is_published: boolean;
}

export default function AdminDiplomasPage() {
  const [diplomas, setDiplomas] = useState<Diploma[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDiploma, setEditingDiploma] = useState<Diploma | null>(null);
  const [saving, setSaving] = useState(false);
  
  const defaultForm = { 
    title: "", description: "", cover_image: "", 
    price_slow: 50, price_speedy: 100, price_onetime: 300,
    duration_months: 6, benefits: ""
  };
  
  const [form, setForm] = useState(defaultForm);

  const fetchDiplomas = async () => {
    const res = await getAdminDiplomasAction();
    if (res.success) {
      setDiplomas(res.data as Diploma[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchDiplomas(); }, []);

  const openCreate = () => {
    setEditingDiploma(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (diploma: Diploma) => {
    setEditingDiploma(diploma);
    setForm({ 
      title: diploma.title, description: diploma.description || "", cover_image: diploma.cover_image || "", 
      price_slow: diploma.price_slow, price_speedy: diploma.price_speedy, price_onetime: diploma.price_onetime,
      duration_months: diploma.duration_months || 6, benefits: diploma.benefits || ""
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingDiploma) {
        await updateDiplomaAction(editingDiploma.id, form);
      } else {
        await createDiplomaAction(form);
      }
      setShowModal(false);
      fetchDiplomas();
    } catch (err) {
      alert("Error saving diploma");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto diploma-gan?")) {
      await deleteDiplomaAction(id);
      fetchDiplomas();
    }
  };

  const togglePublish = async (diploma: Diploma) => {
    await toggleDiplomaPublishAction(diploma.id, !diploma.is_published);
    fetchDiplomas();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Diploma Management</h1>
          <p className="text-white/50 mt-1">Create and manage your diploma programs.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Diploma
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : diplomas.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Award className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Diplomas Yet</h3>
          <p className="text-white/50 mb-6">Create your first diploma program to get started.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Create Diploma
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {diplomas.map((diploma) => (
            <div key={diploma.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/20 transition-colors">
              {diploma.cover_image ? (
                <img src={diploma.cover_image} alt={diploma.title} className="w-24 h-16 object-cover rounded-xl" />
              ) : (
                <div className="w-24 h-16 bg-white/5 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-white/20" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{diploma.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${diploma.is_published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                    {diploma.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-white/50 text-sm line-clamp-1">{diploma.description || "No description"}</p>
              </div>
              <div className="text-right mr-4 flex gap-4">
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Slow</p>
                  <span className="font-bold text-white">${diploma.price_slow}/mo</span>
                </div>
                <div>
                  <p className="text-white/50 text-xs uppercase tracking-wider">Speedy</p>
                  <span className="font-bold text-white">${diploma.price_speedy}/mo</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(diploma)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title={diploma.is_published ? "Unpublish" : "Publish"}>
                  {diploma.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(diploma)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(diploma.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingDiploma ? "Edit Diploma" : "Create New Diploma"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Diploma Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Cover Image URL</label>
                <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Slow Price ($)</label>
                  <input type="number" value={form.price_slow} onChange={(e) => setForm({ ...form, price_slow: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Speedy Price ($)</label>
                  <input type="number" value={form.price_speedy} onChange={(e) => setForm({ ...form, price_speedy: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">One-time Price ($)</label>
                  <input type="number" value={form.price_onetime} onChange={(e) => setForm({ ...form, price_onetime: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Duration (Months)</label>
                <input type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Benefits (One per line)</label>
                <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder="Global recognition\nIndustry ready skills..." />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingDiploma ? "Save Changes" : "Create Diploma"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
