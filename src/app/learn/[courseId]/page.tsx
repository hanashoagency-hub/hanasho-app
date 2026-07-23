"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  PlayCircle, 
  CheckCircle, 
  Lock, 
  BookOpen, 
  ChevronDown, 
  ChevronRight,
  Menu,
  X,
  Award,
  FileText,
  MessageCircle,
  Loader2,
  Megaphone,
  Download
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toggleLessonCompleteAction } from '@/app/courses/actions';
import { getPublicCourseDetailsAction } from '@/app/portal-live/actions';
import Link from 'next/link';

export default function LearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const supabase = createClient();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [currentLessonDesc, setCurrentLessonDesc] = useState("");

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [totalLessons, setTotalLessons] = useState(0);
  const [savingProgress, setSavingProgress] = useState(false);
  const [certificate, setCertificate] = useState<{ id: string; certificate_number: string } | null>(null);
  
  const [activeTab, setActiveTab] = useState<'content' | 'materials' | 'announcements'>('content');

  useEffect(() => {
    const fetchCourseData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push(`/login?next=/learn/${courseId}`);
        return;
      }

      // Check Purchase Status first
      const { data: purchase } = await supabase.from('purchases').select('*').eq('user_id', user.id).eq('course_id', courseId).single();
      if (!purchase) {
        router.push(`/courses/${courseId}`);
        return;
      }

      const res = await getPublicCourseDetailsAction(courseId);
      if (res.success && res.course) {
        setCourse(res.course);
        setModules(res.modules);
        
        const lessonCount = res.modules.reduce((sum: number, m: any) => sum + m.lessons.length, 0);
        setTotalLessons(lessonCount);

        if (res.modules.length > 0) {
          setActiveModule(res.modules[0].id);
        }
      }

      const { data: progressRows } = await supabase
        .from('lesson_progress')
        .select('lesson_id')
        .eq('user_id', user.id)
        .eq('course_id', courseId);
      if (progressRows) {
        setCompletedIds(new Set(progressRows.map((r: any) => r.lesson_id)));
      }

      const { data: cert } = await supabase
        .from('certificates')
        .select('id, certificate_number')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .maybeSingle();
      if (cert) setCertificate(cert);

      setLoading(false);
    };

    fetchCourseData();
  }, [courseId, router]);

  const playLesson = (lesson: any) => {
    setCurrentVideoId(lesson.youtube_video_id);
    setCurrentLessonId(lesson.id);
    setCurrentLessonTitle(lesson.title);
    setCurrentLessonDesc(lesson.description || "In this lesson, you will learn new concepts related to this module.");
    setActiveTab('content'); // switch to content tab when clicking a new video
  };

  const toggleComplete = async () => {
    if (!currentLessonId || savingProgress) return;
    const isDone = completedIds.has(currentLessonId);

    // Optimistic update
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (isDone) next.delete(currentLessonId);
      else next.add(currentLessonId);
      return next;
    });
    setSavingProgress(true);

    const res = await toggleLessonCompleteAction(currentLessonId, courseId, !isDone);
    setSavingProgress(false);

    if (!res.success) {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        if (isDone) next.add(currentLessonId);
        else next.delete(currentLessonId);
        return next;
      });
      alert(res.error || "Could not save your progress. Please try again.");
      return;
    }

    if (res.completedLessonIds) setCompletedIds(new Set(res.completedLessonIds));
    if (res.certificate) setCertificate(res.certificate);
  };

  const completedCount = completedIds.size;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const currentLessonDone = currentLessonId ? completedIds.has(currentLessonId) : false;

  if (loading) return <div className="min-h-screen bg-transparent flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[var(--text-secondary)]" /></div>;
  if (!course) return <div className="min-h-screen bg-transparent flex items-center justify-center text-[var(--text-primary)]">Course not found.</div>;

  return (
    <div className="min-h-screen bg-transparent text-[var(--text-primary)] flex flex-col md:flex-row overflow-hidden pt-20 md:pt-0">
      
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)] fixed top-0 w-full z-50 mt-[72px]">
        <h1 className="text-lg font-bold text-[var(--text-primary)] font-heading">Curriculum</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-[12px] border border-[var(--border-color)] hover:bg-[var(--border-color)] transition-colors text-[var(--text-primary)]"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Curriculum */}
      <aside className={`
        fixed md:relative z-40 h-[calc(100vh-72px)] md:h-screen w-full md:w-80 lg:w-96 
        bg-[var(--bg-secondary)] border-r border-[var(--border-color)] flex-shrink-0 
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col mt-[132px] md:mt-0
      `}>
        <div className="p-6 border-b border-[var(--border-color)] md:mt-24">
          <Link href={`/courses/${courseId}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] mb-4 block font-bold transition-colors">← Back to Course Details</Link>
          <h2 className="text-xl font-bold mb-3 tracking-tight font-heading">{course.title}</h2>
          
          <div className="flex items-center text-sm text-[var(--text-secondary)] space-x-4 mb-2">
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5" /> {modules.length} Modules</span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-wider">
              <span>{completedCount} / {totalLessons} lessons</span>
              <span className={progressPct === 100 ? "text-[var(--brand-primary)]" : ""}>{progressPct}%</span>
            </div>
            <div className="w-full bg-[var(--border-color)] rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 bg-[var(--brand-primary)]`}
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
            {certificate && (
              <Link
                href={`/certificate/${certificate.id}`}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-[12px] bg-[var(--brand-primary)] text-[var(--on-brand)] text-sm font-bold hover:bg-[var(--brand-hover)] transition-all"
              >
                <Award className="w-4 h-4" /> View Certificate
              </Link>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {modules.map((module, mIndex) => (
            <div 
              key={module.id} 
              className="rounded-[16px] border border-[var(--border-color)] bg-[var(--bg-primary)] overflow-hidden transition-all duration-300"
            >
              <button 
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <div className="text-left">
                  <span className="text-xs text-[var(--brand-primary)] font-bold uppercase tracking-wider">Module {mIndex + 1}</span>
                  <h3 className="font-bold text-sm text-[var(--text-primary)] mt-1 font-heading">{module.title}</h3>
                </div>
                {activeModule === module.id ? 
                  <ChevronDown className="w-4 h-4 text-[var(--text-secondary)]" /> : 
                  <ChevronRight className="w-4 h-4 text-[var(--text-secondary)]" />
                }
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  activeModule === module.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="px-2 pb-2">
                  {module.lessons.map((lesson: any) => {
                    const isPlaying = currentVideoId === lesson.youtube_video_id;
                    const isCompleted = completedIds.has(lesson.id);

                    return (
                      <button 
                        key={lesson.id}
                        onClick={() => playLesson(lesson)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-[12px] text-sm mb-1 transition-all group
                          ${isPlaying ? 'bg-[var(--border-color)] text-[var(--brand-primary)]' : 'hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'}
                        `}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
                          ) : isPlaying ? (
                            <PlayCircle className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 flex-shrink-0" />
                          )}
                          <span className={`truncate ${isPlaying ? 'font-bold' : ''}`}>{lesson.title}</span>
                        </div>
                        <span className={`text-xs flex-shrink-0 ml-2`}>
                          {lesson.duration_minutes}m
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-72px)] md:h-screen overflow-y-auto bg-[var(--bg-primary)] pt-10 md:pt-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">

          {/* Certificate Earned Banner */}
          {certificate && (
            <div className="mb-6 md:mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 md:p-6 rounded-[20px] border border-[var(--brand-primary)] bg-[var(--bg-secondary)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)] flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-[var(--on-brand)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--text-primary)] font-heading">Course Completed! 🎉</h3>
                  <p className="text-sm text-[var(--text-secondary)]">You've earned your certificate of completion.</p>
                </div>
              </div>
              <Link
                href={`/certificate/${certificate.id}`}
                className="btn-primary w-full sm:w-auto px-6 py-3 whitespace-nowrap"
              >
                View Certificate
              </Link>
            </div>
          )}

          {/* Video Player */}
          <div className="relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">
            {currentVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                title={currentLessonTitle}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-[var(--bg-secondary)]">
                <div className="relative">
                  <button className="relative w-20 h-20 md:w-24 md:h-24 rounded-full border border-[var(--border-color)] flex items-center justify-center transition-all duration-300">
                    <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-[var(--border-color)] ml-1.5" />
                  </button>
                </div>
                <p className="text-[var(--text-secondary)] text-sm font-bold">Select a lesson from the curriculum to start learning</p>
              </div>
            )}
          </div>

          <div className="mt-8 mb-6 flex items-center justify-between flex-wrap gap-4">
             <h1 className="font-heading text-2xl md:text-3xl font-bold tracking-tight">
               {currentLessonTitle || "Welcome to the Course"}
             </h1>
             
             <button
                onClick={toggleComplete}
                disabled={!currentLessonId || savingProgress}
                className={`flex items-center px-6 py-3 rounded-[20px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentLessonDone
                    ? "bg-[var(--brand-primary)] text-[var(--on-brand)]"
                    : "btn-secondary text-[var(--text-primary)] border-[var(--border-color)]"
                }`}
              >
                {savingProgress ? (
                  <Loader2 className="w-5 h-5 mr-2.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2.5" />
                )}
                {!currentLessonId
                  ? "Select a lesson"
                  : currentLessonDone
                  ? "Completed"
                  : "Mark as Complete"}
              </button>
          </div>

          {/* TABS */}
          <div className="border-b border-[var(--border-color)] flex items-center space-x-6 mb-8 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button 
              onClick={() => setActiveTab('content')}
              className={`pb-4 text-sm font-bold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'content' ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <FileText className="w-4 h-4 mr-2" /> Overview
            </button>
            <button 
              onClick={() => setActiveTab('materials')}
              className={`pb-4 text-sm font-bold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'materials' ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <Download className="w-4 h-4 mr-2" /> Materials
            </button>
            <button 
              onClick={() => setActiveTab('announcements')}
              className={`pb-4 text-sm font-bold flex items-center whitespace-nowrap border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-[var(--brand-primary)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
            >
              <Megaphone className="w-4 h-4 mr-2" /> Announcements
            </button>
          </div>

          <div className="pb-20">
            {activeTab === 'content' && (
               <div className="prose prose-invert max-w-none">
                  <div className="text-[var(--text-secondary)] space-y-4 text-base md:text-lg leading-relaxed">
                    <p>{currentLessonDesc || "Select a lesson to see its description here."}</p>
                  </div>
               </div>
            )}
            
            {activeTab === 'materials' && (
               <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8">
                  <h3 className="text-xl font-bold mb-4 font-heading">Course Materials</h3>
                  {course.materials_included ? (
                    <div className="text-[var(--text-secondary)]">
                      <p className="mb-4">The following materials are included with this course:</p>
                      <ul className="list-disc pl-5 space-y-2">
                        {course.materials_included.split('\n').map((b: string, i: number) => (
                          b.trim() && <li key={i}>{b.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-[var(--text-secondary)] italic">No specific materials have been uploaded for this course yet.</p>
                  )}
               </div>
            )}

            {activeTab === 'announcements' && (
               <div className="space-y-4">
                  {course.announcements ? (
                    <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8">
                      <h3 className="text-lg font-bold mb-2 text-[var(--brand-primary)]">Latest Update</h3>
                      <p className="text-[var(--text-secondary)]">{course.announcements}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                      <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                        <Megaphone className="w-8 h-8 text-[var(--border-color)]" />
                      </div>
                      <h3 className="text-xl font-bold font-heading mb-2">No Announcements Yet</h3>
                      <p className="text-[var(--text-secondary)] max-w-md">The instructor hasn't posted any announcements or updates for this course.</p>
                    </div>
                  )}
               </div>
            )}
          </div>
          
        </div>
      </main>

    </div>
  );
}
