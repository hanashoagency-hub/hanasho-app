"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, FileText, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createBlogAction, updateBlogAction, deleteBlogAction } from "./actions";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [form, setForm] = useState({ title: "", slug: "", content: "", cover_image: "", is_published: true });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const fetchBlogs = async () => {
    const { data, error } = await supabase.from("blogs").select("*").order("created_at", { ascending: false });
    if (error) console.error(error);
    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchBlogs(); }, []);

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setForm(prev => ({ ...prev, title: newTitle, slug: generateSlug(newTitle) }));
  };

  const openCreate = () => {
    setEditingBlog(null);
    setForm({ title: "", slug: "", content: "", cover_image: "", is_published: true });
    setShowModal(true);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({ 
      title: blog.title, 
      slug: blog.slug, 
      content: blog.content, 
      cover_image: blog.cover_image || "", 
      is_published: blog.is_published 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingBlog) {
        const result = await updateBlogAction(editingBlog.id, form);
        if (!result.success) alert("Error: " + result.error);
        else { setShowModal(false); fetchBlogs(); }
      } else {
        const result = await createBlogAction(form);
        if (!result.success) alert("Error: " + result.error);
        else { setShowModal(false); fetchBlogs(); }
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto maqaalkan? (Are you sure?)")) {
      await deleteBlogAction(id);
      fetchBlogs();
    }
  };

  const togglePublish = async (blog: Blog) => {
    await updateBlogAction(blog.id, { is_published: !blog.is_published });
    fetchBlogs();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[var(--brand-primary)]" /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)]">Manage Blogs</h1>
          <p className="text-[var(--text-secondary)] mt-1">Create and manage your articles and news.</p>
        </div>
        <button onClick={openCreate} className="btn-primary py-2 px-4 rounded-[12px] flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Blog
        </button>
      </div>

      <div className="grid gap-4">
        {blogs.map(blog => (
          <div key={blog.id} className="premium-card !p-4 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {blog.cover_image ? (
                <img src={blog.cover_image} alt={blog.title} className="w-20 h-20 rounded-[8px] object-cover border border-[var(--border-color)]" />
              ) : (
                <div className="w-20 h-20 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[var(--text-secondary)]" />
                </div>
              )}
              <div>
                <h3 className="font-bold text-[var(--text-primary)] font-heading">{blog.title}</h3>
                <p className="text-sm text-[var(--text-secondary)]">/{blog.slug}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button 
                onClick={() => togglePublish(blog)}
                className={`p-2 rounded-[8px] flex items-center gap-2 text-sm transition-colors ${
                  blog.is_published ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                }`}
                title={blog.is_published ? "Unpublish" : "Publish"}
              >
                {blog.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden md:inline">{blog.is_published ? "Published" : "Draft"}</span>
              </button>
              
              <button onClick={() => openEdit(blog)} className="p-2 rounded-[8px] bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                <Edit className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(blog.id)} className="p-2 rounded-[8px] bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {blogs.length === 0 && (
          <div className="text-center py-12 premium-card">
            <FileText className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] font-medium">No blogs found. Create your first one!</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#05180D]/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 max-w-3xl w-full shadow-2xl my-8">
            <h2 className="text-xl font-bold font-heading text-[var(--text-primary)] mb-6">
              {editingBlog ? "Edit Blog" : "Create New Blog"}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Title</label>
                <input 
                  type="text" 
                  value={form.title} 
                  onChange={handleTitleChange}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Slug (URL)</label>
                <input 
                  type="text" 
                  value={form.slug} 
                  onChange={e => setForm({...form, slug: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Cover Image URL</label>
                <input 
                  type="text" 
                  value={form.cover_image} 
                  onChange={e => setForm({...form, cover_image: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-1">Content (Markdown supported)</label>
                <textarea 
                  value={form.content} 
                  onChange={e => setForm({...form, content: e.target.value})}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] p-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-primary)] h-64 font-mono text-sm"
                  placeholder="# Header 1&#10;Write your content here..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 rounded-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="btn-primary py-2 px-6 rounded-[12px] flex items-center gap-2 disabled:opacity-50 text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Saving..." : "Save Blog"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
