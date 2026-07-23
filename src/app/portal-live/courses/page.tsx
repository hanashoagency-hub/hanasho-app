"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, BookOpen, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createCourseAction, updateCourseAction, deleteCourseAction, togglePublishAction } from "../actions";

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  price: number;
  currency: string;
  is_published: boolean;
  created_at: string;
  total_hours?: number;
  total_lessons?: number;
  benefits?: string;
  materials_included?: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  
  const defaultForm = { 
    title: "", description: "", cover_image: "", price: 0, currency: "USD",
    total_hours: 0, total_lessons: 0, benefits: "", materials_included: "",
    lessons: [{ title: "", youtube_video_id: "", duration_minutes: 0, is_preview: false }]
  };
  
  const [form, setForm] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("courseFormDraft");
      if (saved) {
        try { return JSON.parse(saved); } catch (e) {}
      }
    }
    return defaultForm;
  });
  
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  // Save to localStorage whenever form changes, if we are NOT editing an existing course
  useEffect(() => {
    if (!editingCourse && typeof window !== "undefined") {
      localStorage.setItem("courseFormDraft", JSON.stringify(form));
    }
  }, [form, editingCourse]);

  const fetchCourses = async () => {
    const { data } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => {
    setEditingCourse(null);
    const saved = localStorage.getItem("courseFormDraft");
    if (saved) {
      try {
        setForm(JSON.parse(saved));
      } catch (e) {
        setForm(defaultForm);
      }
    } else {
      setForm(defaultForm);
    }
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setForm({ 
      title: course.title, description: course.description || "", cover_image: course.cover_image || "", 
      price: course.price, currency: course.currency,
      total_hours: course.total_hours || 0, total_lessons: course.total_lessons || 0,
      benefits: course.benefits || "", materials_included: course.materials_included || "",
      lessons: [] // Lessons are managed via Curriculum Builder for existing courses
    });
    setShowModal(true);
  };

  const parseYoutubeId = (input: string) => {
    if (!input) return "";
    const match = input.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  };

  const handleSave = async () => {
    setSaving(true);
    // Separate course fields from lessons
    const { lessons, ...courseData } = form;

    try {
      if (editingCourse) {
        const result = await updateCourseAction(editingCourse.id, courseData);
        if (!result.success) {
          alert("Cillad ayaa dhacday: " + result.error);
        } else {
          setShowModal(false);
          fetchCourses();
        }
      } else {
        // Parse YouTube IDs before sending to server
        const parsedLessons = lessons.map(l => ({
          ...l,
          youtube_video_id: parseYoutubeId(l.youtube_video_id)
        }));

        const result = await createCourseAction(courseData, parsedLessons);
        
        if (!result.success) {
          alert("Cillad ayaa dhacday. Macluumaadkaagu wuu diiday sababtoo ah: " + result.error);
        } else if (result.courseId) {
          localStorage.removeItem("courseFormDraft");
          setShowModal(false);
          fetchCourses();
          window.location.href = `/portal-live/courses/${result.courseId}`;
        }
      }
    } catch (err: any) {
      alert("System Error: " + (err.message || "An unexpected error occurred."));
    } finally {
      setSaving(false);
    }
  };

  const addLessonField = () => {
    setForm({ ...form, lessons: [...form.lessons, { title: "", youtube_video_id: "", duration_minutes: 0, is_preview: false }] });
  };

  const updateLessonField = (index: number, field: string, value: any) => {
    const newLessons = [...form.lessons];
    (newLessons[index] as any)[field] = value;
    setForm({ ...form, lessons: newLessons });
  };

  const removeLessonField = (index: number) => {
    const newLessons = form.lessons.filter((_, i) => i !== index);
    setForm({ ...form, lessons: newLessons });
  };

  const handleDelete = async (id: string) => {
    if (confirm("Ma hubtaa inaad tirtirto koorsadan?")) {
      await deleteCourseAction(id);
      fetchCourses();
    }
  };

  const togglePublish = async (course: Course) => {
    await togglePublishAction(course.id, !course.is_published);
    fetchCourses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">Course Management</h1>
          <p className="text-white/50 mt-1">Create and manage your courses, modules, and lessons.</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
          <Plus className="w-5 h-5" /> New Course
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-20 bg-[#0A0A0A] border border-white/10 rounded-2xl">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Courses Yet</h3>
          <p className="text-white/50 mb-6">Create your first course to get started.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform">
            <Plus className="w-5 h-5" /> Create Course
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <div key={course.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 flex items-center gap-6 group hover:border-white/20 transition-colors">
              {course.cover_image ? (
                <img src={course.cover_image} alt={course.title} className="w-24 h-16 object-cover rounded-xl" />
              ) : (
                <div className="w-24 h-16 bg-white/5 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white/20" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-white">{course.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${course.is_published ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"}`}>
                    {course.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="text-white/50 text-sm line-clamp-1">{course.description || "No description"}</p>
              </div>
              <div className="text-right mr-4">
                <span className="text-xl font-bold text-white">${course.price}</span>
                <p className="text-white/50 text-xs">{course.currency}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/portal-live/courses/${course.id}`} className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors" title="Manage Modules & Lessons">
                  <BookOpen className="w-4 h-4" />
                </Link>
                <button onClick={() => togglePublish(course)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title={course.is_published ? "Unpublish" : "Publish"}>
                  {course.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(course)} className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 transition-colors" title="Edit">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(course.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors" title="Delete">
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
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 w-full max-w-4xl shadow-2xl my-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{editingCourse ? "Edit Course" : "Create New Course & Lessons"}</h2>
              <button onClick={() => setShowModal(false)} className="text-white/50 hover:text-white">✕</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Course Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2">Course Details</h3>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Course Title</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. Web Development Basics" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder="What will students learn?" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Cover Image URL</label>
                <input value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Price</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Currency</label>
                  <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-white/20">
                    <option value="USD">USD</option>
                    <option value="SLSH">SLSH (Somali Shilling)</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Total Lessons</label>
                  <input type="number" value={form.total_lessons} onChange={(e) => setForm({ ...form, total_lessons: parseInt(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. 12" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-1">Total Hours</label>
                  <input type="number" step="0.5" value={form.total_hours} onChange={(e) => setForm({ ...form, total_hours: parseFloat(e.target.value) || 0 })} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="e.g. 4.5" />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 block mb-1">Benefits (What you will learn)</label>
                <textarea value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none" placeholder="E.g. Build real world apps, Learn advanced React..." />
              </div>

              </div>

              {/* Right Column: Lessons Builder (Only shown during creation) */}
              {!editingCourse ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white/80 border-b border-white/10 pb-2 flex justify-between items-center">
                    <span>Lessons & Videos</span>
                    <button onClick={addLessonField} className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" /> Add Lesson
                    </button>
                  </h3>
                  
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}>
                    {form.lessons.map((lesson, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 relative group">
                        <button onClick={() => removeLessonField(idx)} className="absolute top-3 right-3 text-red-400/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <div className="mb-3 pr-8">
                          <input value={lesson.title} onChange={(e) => updateLessonField(idx, 'title', e.target.value)} className="w-full bg-transparent border-b border-white/10 py-1 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 text-sm font-medium" placeholder={`Lesson ${idx + 1} Title`} />
                        </div>
                        <div className="space-y-3">
                          <div>
                            <label className="text-xs text-white/50 mb-1 block">YouTube URL / Embed Link</label>
                            <input value={lesson.youtube_video_id} onChange={(e) => updateLessonField(idx, 'youtube_video_id', e.target.value)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="https://youtube.com/..." />
                          </div>
                          <div className="flex gap-4">
                            <div className="flex-1">
                              <label className="text-xs text-white/50 mb-1 block">Duration (min)</label>
                              <input type="number" value={lesson.duration_minutes} onChange={(e) => updateLessonField(idx, 'duration_minutes', parseInt(e.target.value) || 0)} className="w-full bg-black/30 border border-white/10 rounded-lg py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="e.g. 10" />
                            </div>
                            <div className="flex-1 flex items-end pb-2">
                              <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer hover:text-white">
                                <input type="checkbox" checked={lesson.is_preview} onChange={(e) => updateLessonField(idx, 'is_preview', e.target.checked)} className="rounded bg-black/30 border-white/20 text-white" />
                                Free Preview
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {form.lessons.length === 0 && (
                      <div className="text-center py-8 text-white/30 text-sm border border-dashed border-white/10 rounded-xl">
                        No lessons added. <button onClick={addLessonField} className="text-white hover:underline">Add one now</button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <BookOpen className="w-12 h-12 text-white/20 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Curriculum Builder</h3>
                  <p className="text-white/50 text-sm mb-6">To manage lessons and modules for an existing course, please use the Curriculum Builder.</p>
                  <Link href={`/portal-live/courses/${editingCourse.id}`} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2">
                    Open Curriculum Builder <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-8 border-t border-white/10 pt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 py-3 rounded-xl bg-white text-black font-semibold hover:scale-[1.02] transition-transform disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingCourse ? "Save Changes" : "Create Course"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
