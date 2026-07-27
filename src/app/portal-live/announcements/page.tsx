"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, Megaphone, Pin } from "lucide-react";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  deleteAnnouncementAction,
  toggleAnnouncementEnabledAction,
  getAdminAnnouncementsAction,
} from "./actions";
import { getAdminCoursesAction } from "../actions";

const THEMES = ["lime", "blue", "red", "yellow", "purple"];
const TYPES = [
  { value: "free_course_promo", label: "Free Course Promotion" },
  { value: "limited_time_offer", label: "Limited-Time Offer" },
  { value: "flash_sale", label: "Flash Sale" },
  { value: "discount", label: "Discount" },
  { value: "important_notice", label: "Important Notice" },
  { value: "maintenance_notice", label: "Maintenance Notice" },
  { value: "new_course_launch", label: "New Course Launch" },
  { value: "general", label: "General Announcement" },
];
const PLACEMENTS = [
  { value: "homepage", label: "Homepage" },
  { value: "courses_page", label: "Courses Page" },
  { value: "course_page", label: "Individual Course Page" },
  { value: "dashboard", label: "Dashboard" },
  { value: "checkout", label: "Checkout Page" },
  { value: "site_wide", label: "Entire Website" },
];

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function computeStatus(a: any): { label: string; cls: string } {
  const now = Date.now();
  const start = new Date(a.start_at).getTime();
  const end = a.end_at ? new Date(a.end_at).getTime() : null;
  if (!a.is_enabled) return { label: "Draft", cls: "bg-white/5 text-white/40 border-white/10" };
  if (start > now) return { label: "Scheduled", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" };
  if (end && end < now) return { label: "Expired", cls: "bg-red-500/10 text-red-400 border-red-500/20" };
  return { label: "Published", cls: "bg-green-500/10 text-green-400 border-green-500/20" };
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const defaultForm = {
    title: "", description: "", button_text: "", button_link: "",
    color_theme: "lime", icon: "🎉",
    announcement_type: "general", placement: "site_wide", course_id: "",
    show_countdown: false, is_pinned: false, is_enabled: true, priority: 0,
    start_at: new Date().toISOString(), end_at: "" as string | null,
  };
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    const [aRes, cRes] = await Promise.all([getAdminAnnouncementsAction(), getAdminCoursesAction()]);
    if (aRes.success) setAnnouncements(aRes.data);
    if (cRes.success) setCourses(cRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setShowModal(true);
  };

  const openEdit = (a: any) => {
    setEditing(a);
    setForm({
      title: a.title, description: a.description || "", button_text: a.button_text || "", button_link: a.button_link || "",
      color_theme: a.color_theme, icon: a.icon || "",
      announcement_type: a.announcement_type, placement: a.placement, course_id: a.course_id || "",
      show_countdown: a.show_countdown, is_pinned: a.is_pinned, is_enabled: a.is_enabled, priority: a.priority,
      start_at: a.start_at, end_at: a.end_at,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, end_at: form.end_at || null, course_id: form.placement === "course_page" ? (form.course_id || null) : null };
      if (editing) {
        await updateAnnouncementAction(editing.id, payload);
      } else {
        await createAnnouncementAction(payload);
      }
      setShowModal(false);
      fetchData();
    } catch {
      alert("Error saving announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this announcement?")) {
      await deleteAnnouncementAction(id);
      fetchData();
    }
  };

  const toggleEnabled = async (a: any) => {
    await toggleAnnouncementEnabledAction(a.id, !a.is_enabled);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Announcement Manager</h1>
          <p className="text-white/50 mt-1">Create, schedule, and manage promotional banners across the site.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Announcement
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <Megaphone className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Announcements Yet</h3>
          <p className="text-white/50 mb-6">Create your first banner to promote a course, sale, or notice.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Create Announcement
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {announcements.map((a) => {
            const status = computeStatus(a);
            return (
              <div key={a.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="text-3xl flex-shrink-0">{a.icon || "📣"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {a.is_pinned && <Pin className="w-3.5 h-3.5 text-yellow-400" />}
                    <h3 className="font-bold text-white truncate">{a.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${status.cls}`}>{status.label}</span>
                    {a.show_countdown && <span className="text-xs px-2 py-0.5 rounded-full border bg-purple-500/10 text-purple-300 border-purple-500/20">Countdown</span>}
                  </div>
                  <p className="text-white/40 text-sm truncate">
                    {PLACEMENTS.find((p) => p.value === a.placement)?.label}
                    {a.placement === "course_page" && a.course_title ? ` — ${a.course_title}` : ""}
                    {" · "}{TYPES.find((t) => t.value === a.announcement_type)?.label}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleEnabled(a)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title={a.is_enabled ? "Disable" : "Enable"}>
                    {a.is_enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => openEdit(a)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-6 overflow-y-auto">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-2xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editing ? "Edit Announcement" : "New Announcement"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Icon</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-3 text-white text-center text-xl focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="🎉" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Title</label>
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Free for 3 Days" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Button Text</label>
                  <input value={form.button_text} onChange={(e) => setForm({ ...form, button_text: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Claim Now" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Button Link</label>
                  <input value={form.button_link} onChange={(e) => setForm({ ...form, button_link: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="/courses" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Type</label>
                  <select value={form.announcement_type} onChange={(e) => setForm({ ...form, announcement_type: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                    {TYPES.map((t) => <option key={t.value} value={t.value} className="bg-[#0A0A0A]">{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Color Theme</label>
                  <select value={form.color_theme} onChange={(e) => setForm({ ...form, color_theme: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                    {THEMES.map((t) => <option key={t} value={t} className="bg-[#0A0A0A]">{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Placement</label>
                  <select value={form.placement} onChange={(e) => setForm({ ...form, placement: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                    {PLACEMENTS.map((p) => <option key={p.value} value={p.value} className="bg-[#0A0A0A]">{p.label}</option>)}
                  </select>
                </div>
                {form.placement === "course_page" && (
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-1">Course</label>
                    <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                      <option value="" className="bg-[#0A0A0A]">Select a course...</option>
                      {courses.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.title}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Start</label>
                  <input type="datetime-local" value={toLocalInputValue(form.start_at)} onChange={(e) => setForm({ ...form, start_at: new Date(e.target.value).toISOString() })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">End (optional)</label>
                  <input type="datetime-local" value={toLocalInputValue(form.end_at)} onChange={(e) => setForm({ ...form, end_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Priority (higher shows first)</label>
                <input type="number" value={form.priority} onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
              </div>

              <div className="flex flex-wrap gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={form.show_countdown} onChange={(e) => setForm({ ...form, show_countdown: e.target.checked })} className="rounded" />
                  Show live countdown
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={form.is_pinned} onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })} className="rounded" />
                  Pin to top
                </label>
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm({ ...form, is_enabled: e.target.checked })} className="rounded" />
                  Enabled (published)
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? "Save Changes" : "Create Announcement"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
