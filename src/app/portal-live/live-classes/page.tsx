"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Video, Calendar, Clock } from "lucide-react";
import { createLiveClassAction, updateLiveClassAction, deleteLiveClassAction, toggleLiveClassPublishAction, getAdminLiveClassesAction } from "./actions";

interface ZoomClass {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  price: number;
  start_date: string;
  schedule: string;
  duration_weeks: number;
  zoom_link: string;
  is_published: boolean;
}

export default function AdminLiveClassesPage() {
  const [classes, setClasses] = useState<ZoomClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ZoomClass | null>(null);
  const [saving, setSaving] = useState(false);
  
  const defaultForm = { 
    title: "", description: "", cover_image: "", 
    price: 150, start_date: new Date().toISOString().split('T')[0], schedule: "Sat & Sun 8:00 PM",
    duration_weeks: 4, zoom_link: ""
  };
  
  const [form, setForm] = useState(defaultForm);

  const fetchClasses = async () => {
    const res = await getAdminLiveClassesAction();
    if (res.success) {
      setClasses(res.data as ZoomClass[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchClasses(); }, []);

  const openCreate = () => {
    setEditingClass(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (cls: ZoomClass) => {
    setEditingClass(cls);
    setForm({ 
      title: cls.title, description: cls.description || "", cover_image: cls.cover_image || "", 
      price: cls.price, start_date: new Date(cls.start_date).toISOString().split('T')[0], schedule: cls.schedule || "",
      duration_weeks: cls.duration_weeks || 4, zoom_link: cls.zoom_link || ""
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingClass) {
        await updateLiveClassAction(editingClass.id, form);
      } else {
        await createLiveClassAction(form);
      }
      setShowModal(false);
      fetchClasses();
    } catch (err) {
      alert("Error saving class");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto class-kan?")) {
      await deleteLiveClassAction(id);
      fetchClasses();
    }
  };

  const togglePublish = async (cls: ZoomClass) => {
    await toggleLiveClassPublishAction(cls.id, !cls.is_published);
    fetchClasses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Live Classes Management</h1>
          <p className="text-white/50 mt-1">Create and manage your zoom cohorts.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Class
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Video className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Live Classes Yet</h3>
          <p className="text-white/50 mb-6">Schedule your first live class to get started.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Schedule Class
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls) => (
            <div key={cls.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row md:items-center gap-6 group hover:border-white/20 transition-colors">
              {cls.cover_image ? (
                <img src={cls.cover_image} alt={cls.title} className="w-full md:w-24 h-32 md:h-16 object-cover rounded-xl" />
              ) : (
                <div className="w-full md:w-24 h-32 md:h-16 bg-white/5 rounded-xl flex items-center justify-center">
                  <Video className="w-6 h-6 text-white/20" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{cls.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${cls.is_published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                    {cls.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm mt-2">
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(cls.start_date).toLocaleDateString()}</div>
                  <div className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {cls.schedule}</div>
                </div>
              </div>
              <div className="text-right mr-4 flex flex-col items-end">
                <span className="font-bold text-white text-xl">${cls.price}</span>
                <span className="text-white/50 text-xs">Fee</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(cls)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title={cls.is_published ? "Unpublish" : "Publish"}>
                  {cls.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(cls)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(cls.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
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
              <h2 className="text-2xl font-bold text-white">{editingClass ? "Edit Class" : "Schedule New Class"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Class Title</label>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Price ($)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Duration (Weeks)</label>
                  <input type="number" value={form.duration_weeks} onChange={(e) => setForm({ ...form, duration_weeks: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Start Date</label>
                  <input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 [color-scheme:dark]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Schedule</label>
                  <input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. Sat & Sun 8:00 PM" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Zoom Meeting Link</label>
                <input value={form.zoom_link} onChange={(e) => setForm({ ...form, zoom_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="https://zoom.us/j/..." />
              </div>
            </div>
            
            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingClass ? "Save Changes" : "Schedule Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
