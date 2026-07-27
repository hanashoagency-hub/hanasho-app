"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, GripVertical, Play, FileText, ChevronDown, ChevronRight, Loader2, ArrowLeft, Edit, Check, X, Upload } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { createModuleAction, deleteModuleAction, createLessonAction, updateLessonAction, deleteLessonAction, getAdminModulesWithLessonsAction, uploadLessonPdfAction } from "../../actions";

interface Module {
  id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  lesson_type: 'video' | 'pdf';
  youtube_video_id: string;
  pdf_url: string;
  duration_minutes: number;
  is_preview: boolean;
  sort_order: number;
}

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [courseTitle, setCourseTitle] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", lesson_type: "video" as 'video' | 'pdf', youtube_video_id: "", pdf_url: "", pdf_name: "", duration_minutes: 0, is_preview: false });
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const supabase = createClient();

  const resetLessonForm = () => setLessonForm({ title: "", lesson_type: "video", youtube_video_id: "", pdf_url: "", pdf_name: "", duration_minutes: 0, is_preview: false });

  const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError("");
    setUploadingPdf(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await uploadLessonPdfAction(formData);
      if (res.success && res.url) {
        setLessonForm((f) => ({ ...f, pdf_url: res.url!, pdf_name: res.fileName || file.name }));
      } else {
        setPdfError(res.error || "Upload failed.");
      }
    } catch {
      setPdfError("Upload failed. Please try again.");
    } finally {
      setUploadingPdf(false);
      e.target.value = "";
    }
  };

  const fetchData = async () => {
    const res = await getAdminModulesWithLessonsAction(courseId);
    if (res.success) {
      setCourseTitle(res.courseTitle);
      setModules(res.modules as Module[]);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [courseId]);

  const toggleModule = (id: string) => {
    const next = new Set(expandedModules);
    if (next.has(id)) next.delete(id); else next.add(id);
    setExpandedModules(next);
  };

  const addModule = async () => {
    if (!newModuleTitle.trim()) return;
    setAddingModule(true);
    await createModuleAction(courseId, newModuleTitle, modules.length);
    setNewModuleTitle("");
    setAddingModule(false);
    fetchData();
  };

  const deleteModule = async (id: string) => {
    if (confirm("Delete this module and all its lessons?")) {
      await deleteModuleAction(id, courseId);
      fetchData();
    }
  };

  const addLesson = async (moduleId: string) => {
    if (!lessonForm.title.trim()) return;
    if (lessonForm.lesson_type === 'pdf' && !lessonForm.pdf_url) return;

    const lessonData = {
      title: lessonForm.title,
      lesson_type: lessonForm.lesson_type,
      youtube_video_id: lessonForm.lesson_type === 'video' ? parseYoutubeId(lessonForm.youtube_video_id) : null,
      pdf_url: lessonForm.lesson_type === 'pdf' ? lessonForm.pdf_url : null,
      duration_minutes: lessonForm.duration_minutes,
      is_preview: lessonForm.is_preview,
    };

    if (editingLessonId) {
      await updateLessonAction(editingLessonId, lessonData, courseId);
    } else {
      const mod = modules.find(m => m.id === moduleId);
      await createLessonAction(moduleId, { ...lessonData, sort_order: mod ? mod.lessons.length : 0 }, courseId);
    }

    resetLessonForm();
    setAddingLessonTo(null);
    setEditingLessonId(null);
    fetchData();
  };

  const openEditLesson = (moduleId: string, lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      lesson_type: lesson.lesson_type,
      youtube_video_id: lesson.youtube_video_id || "",
      pdf_url: lesson.pdf_url || "",
      pdf_name: lesson.pdf_url ? "Existing file" : "",
      duration_minutes: lesson.duration_minutes || 0,
      is_preview: lesson.is_preview,
    });
    setEditingLessonId(lesson.id);
    setAddingLessonTo(moduleId);
    setPdfError("");
  };

  const cancelLessonForm = () => {
    setAddingLessonTo(null);
    setEditingLessonId(null);
    resetLessonForm();
    setPdfError("");
  };

  const deleteLesson = async (id: string) => {
    await deleteLessonAction(id, courseId);
    fetchData();
  };

  // Extract YouTube video ID from URL or plain ID
  const parseYoutubeId = (input: string) => {
    const match = input.match(/(?:v=|youtu\.be\/|\/embed\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : input;
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal-live/courses" className="p-2 rounded-lg bg-white/5 text-white/50 hover:bg-white/10 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-white">{courseTitle}</h1>
          <p className="text-white/50 mt-1">Curriculum Builder — Add modules, YouTube lessons, and PDF lessons</p>
        </div>
      </div>

      {/* Modules List */}
      <div className="space-y-4 mb-8">
        {modules.map((mod, modIndex) => (
          <div key={mod.id} className="bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden">
            {/* Module Header */}
            <div className="flex items-center gap-3 p-5 cursor-pointer hover:bg-white/5 transition-colors" onClick={() => toggleModule(mod.id)}>
              <GripVertical className="w-5 h-5 text-white/20" />
              {expandedModules.has(mod.id) ? <ChevronDown className="w-5 h-5 text-white/50" /> : <ChevronRight className="w-5 h-5 text-white/50" />}
              <div className="flex-1">
                <span className="text-xs font-bold text-white/30 uppercase tracking-wider">Module {modIndex + 1}</span>
                <h3 className="text-lg font-bold text-white">{mod.title}</h3>
              </div>
              <span className="text-sm text-white/40 mr-4">{mod.lessons.length} lessons</span>
              <button onClick={(e) => { e.stopPropagation(); deleteModule(mod.id); }} className="p-2 rounded-lg text-red-400/50 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Lessons */}
            {expandedModules.has(mod.id) && (
              <div className="border-t border-white/5 px-5 pb-5">
                {mod.lessons.map((lesson, lessonIndex) => (
                  <div key={lesson.id} className="flex items-center gap-3 py-3 px-3 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-sm font-bold text-white/30">{lessonIndex + 1}</span>
                    {lesson.lesson_type === 'pdf' ? (
                      <FileText className="w-5 h-5 text-blue-400" />
                    ) : (
                      <Play className="w-5 h-5 text-red-400" />
                    )}
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">{lesson.title}</p>
                      <p className="text-white/30 text-xs">
                        {lesson.lesson_type === 'pdf'
                          ? "PDF document"
                          : `${lesson.duration_minutes} min • ${lesson.youtube_video_id || "No video"}`}
                        {lesson.is_preview && <span className="text-green-400"> • Free Preview</span>}
                      </p>
                    </div>
                    <button onClick={() => openEditLesson(mod.id, lesson)} className="p-1.5 rounded-lg text-white/0 group-hover:text-white/40 hover:!text-white transition-all">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteLesson(lesson.id)} className="p-1.5 rounded-lg text-red-400/0 group-hover:text-red-400/50 hover:!text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {/* Add Lesson Form */}
                {addingLessonTo === mod.id ? (
                  <div className="mt-3 p-4 bg-white/5 rounded-xl border border-white/10 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/40">{editingLessonId ? "Editing Lesson" : "New Lesson"}</p>
                    <input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="Lesson title" />

                    <div className="flex gap-2">
                      {(['video', 'pdf'] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setLessonForm({ ...lessonForm, lesson_type: t })}
                          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm font-bold transition-colors ${
                            lessonForm.lesson_type === t ? "bg-white/10 border-white text-white" : "bg-white/5 border-white/10 text-white/40 hover:bg-white/10"
                          }`}
                        >
                          {t === 'video' ? <Play className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                          {t === 'video' ? 'Video' : 'PDF'}
                        </button>
                      ))}
                    </div>

                    {lessonForm.lesson_type === 'video' ? (
                      <div className="grid grid-cols-2 gap-3">
                        <input value={lessonForm.youtube_video_id} onChange={(e) => setLessonForm({ ...lessonForm, youtube_video_id: parseYoutubeId(e.target.value) })} className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="YouTube URL or Video ID" />
                        <input type="number" value={lessonForm.duration_minutes} onChange={(e) => setLessonForm({ ...lessonForm, duration_minutes: parseInt(e.target.value) || 0 })} className="bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-white/20" placeholder="Duration (min)" />
                      </div>
                    ) : (
                      <div>
                        {pdfError && <p className="text-red-400 text-xs mb-2">{pdfError}</p>}
                        {lessonForm.pdf_url ? (
                          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm text-white">
                            <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <span className="truncate flex-1">{lessonForm.pdf_name}</span>
                            <button type="button" onClick={() => setLessonForm({ ...lessonForm, pdf_url: "", pdf_name: "" })} className="text-white/40 hover:text-red-400">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className={`flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed text-sm cursor-pointer transition-colors ${uploadingPdf ? "border-white/10 text-white/30" : "border-white/20 text-white/50 hover:border-white/40 hover:text-white"}`}>
                            {uploadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            {uploadingPdf ? "Uploading..." : "Click to upload PDF"}
                            <input type="file" accept="application/pdf" onChange={handlePdfSelect} disabled={uploadingPdf} className="hidden" />
                          </label>
                        )}
                      </div>
                    )}

                    <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                      <input type="checkbox" checked={lessonForm.is_preview} onChange={(e) => setLessonForm({ ...lessonForm, is_preview: e.target.checked })} className="rounded" />
                      Free Preview (visible without purchase)
                    </label>
                    <div className="flex gap-2">
                      <button onClick={cancelLessonForm} className="flex-1 py-2 rounded-lg border border-white/10 text-white/60 text-sm hover:bg-white/5 transition-colors">Cancel</button>
                      <button
                        onClick={() => addLesson(mod.id)}
                        disabled={!lessonForm.title.trim() || uploadingPdf || (lessonForm.lesson_type === 'pdf' && !lessonForm.pdf_url)}
                        className="flex-1 py-2 rounded-lg bg-white text-black text-sm font-semibold disabled:opacity-50 hover:scale-[1.02] transition-transform"
                      >
                        {editingLessonId ? "Save Changes" : "Add Lesson"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => { setAddingLessonTo(mod.id); setEditingLessonId(null); resetLessonForm(); setPdfError(""); }} className="mt-3 flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors px-3 py-2">
                    <Plus className="w-4 h-4" /> Add Lesson
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Module */}
      <div className="bg-[#0A0A0A] border border-dashed border-white/10 rounded-2xl p-6">
        <div className="flex gap-3">
          <input value={newModuleTitle} onChange={(e) => setNewModuleTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addModule()} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/20" placeholder="New module title (e.g. Introduction)" />
          <button onClick={addModule} disabled={addingModule || !newModuleTitle.trim()} className="flex items-center gap-2 bg-white text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition-transform disabled:opacity-50">
            {addingModule ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Add Module</>}
          </button>
        </div>
      </div>
    </div>
  );
}
