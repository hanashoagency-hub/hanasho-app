"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, TicketPercent, Power } from "lucide-react";
import { createCouponAction, updateCouponAction, deleteCouponAction, toggleCouponActiveAction, getAdminCouponsAction } from "./actions";
import { getAdminCoursesAction } from "../actions";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const defaultForm = {
    code: "", discount_percentage: 10, course_id: "",
    max_uses: "" as string | number, expires_at: "" as string | null, is_active: true,
  };
  const [form, setForm] = useState(defaultForm);

  const fetchData = async () => {
    const [cRes, coursesRes] = await Promise.all([getAdminCouponsAction(), getAdminCoursesAction()]);
    if (cRes.success) setCoupons(cRes.data);
    if (coursesRes.success) setCourses(coursesRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setFormError("");
    setShowModal(true);
  };

  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      code: c.code, discount_percentage: c.discount_percentage, course_id: c.course_id || "",
      max_uses: c.max_uses ?? "", expires_at: c.expires_at, is_active: c.is_active,
    });
    setFormError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormError("");
    const payload = {
      code: form.code,
      discount_percentage: Number(form.discount_percentage) || 0,
      course_id: form.course_id || null,
      max_uses: form.max_uses === "" ? null : Number(form.max_uses),
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    };
    const res = editing ? await updateCouponAction(editing.id, payload) : await createCouponAction(payload);
    setSaving(false);
    if (!res.success) {
      setFormError(res.error?.includes("duplicate") ? "That code already exists." : res.error || "Could not save coupon.");
      return;
    }
    setShowModal(false);
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this coupon?")) {
      await deleteCouponAction(id);
      fetchData();
    }
  };

  const toggleActive = async (c: any) => {
    await toggleCouponActiveAction(c.id, !c.is_active);
    fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Coupon Codes</h1>
          <p className="text-white/50 mt-1">Create discount codes students can apply at checkout.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Coupon
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <TicketPercent className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Coupons Yet</h3>
          <p className="text-white/50 mb-6">Create your first discount code.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Create Coupon
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((c) => {
            const expired = c.expires_at && new Date(c.expires_at).getTime() < Date.now();
            const usedUp = c.max_uses !== null && c.used_count >= c.max_uses;
            return (
              <div key={c.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <TicketPercent className="w-6 h-6 text-[#C7F233]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-mono font-bold text-white text-lg tracking-wider">{c.code}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/10 text-green-400 border-green-500/20">{c.discount_percentage}% off</span>
                    {!c.is_active && <span className="text-xs px-2 py-0.5 rounded-full border bg-white/5 text-white/40 border-white/10">Disabled</span>}
                    {expired && <span className="text-xs px-2 py-0.5 rounded-full border bg-red-500/10 text-red-400 border-red-500/20">Expired</span>}
                    {usedUp && <span className="text-xs px-2 py-0.5 rounded-full border bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Used up</span>}
                  </div>
                  <p className="text-white/40 text-sm truncate">
                    {c.course_title ? `Only: ${c.course_title}` : "All courses"}
                    {" · "}Used {c.used_count}{c.max_uses !== null ? ` / ${c.max_uses}` : ""}
                    {c.expires_at ? ` · Expires ${new Date(c.expires_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleActive(c)} className={`p-2 rounded-lg transition-colors ${c.is_active ? "bg-white/5 text-green-400 hover:bg-white/10" : "bg-white/5 text-white/30 hover:bg-white/10"}`} title={c.is_active ? "Disable" : "Enable"}>
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(c)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
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
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-lg shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editing ? "Edit Coupon" : "New Coupon"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>

            {formError && <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{formError}</div>}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Code</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="WELCOME20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Discount %</label>
                  <input type="number" min={1} max={100} value={form.discount_percentage} onChange={(e) => setForm({ ...form, discount_percentage: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Course (optional — leave empty for all courses)</label>
                <select value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                  <option value="" className="bg-[#0A0A0A]">All courses</option>
                  {courses.map((c: any) => <option key={c.id} value={c.id} className="bg-[#0A0A0A]">{c.title}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Max uses (optional)</label>
                  <input type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="Unlimited" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Expires (optional)</label>
                  <input type="datetime-local" value={toLocalInputValue(form.expires_at)} onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="rounded" />
                Active (can be redeemed)
              </label>
            </div>

            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.code.trim() || !form.discount_percentage} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editing ? "Save Changes" : "Create Coupon"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
