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
  Clock,
  FileText,
  MessageCircle,
  ShoppingCart,
  Loader2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function CoursePage() {
  const params = useParams();
  const courseId = params.id as string;
  const router = useRouter();
  const supabase = createClient();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<string | null>(null);
  
  const [course, setCourse] = useState<any>(null);
  const [modules, setModules] = useState<any[]>([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [currentLessonTitle, setCurrentLessonTitle] = useState("");
  const [currentLessonDesc, setCurrentLessonDesc] = useState("");

  useEffect(() => {
    const fetchCourseData = async () => {
      // 1. Fetch Auth state
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Fetch Course Details
      const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
      if (courseData) setCourse(courseData);

      // 3. Fetch Modules and Lessons
      const { data: mods } = await supabase.from('modules').select('*').eq('course_id', courseId).order('sort_order');
      if (mods) {
        const modulesWithLessons = await Promise.all(mods.map(async (mod) => {
          const { data: lessons } = await supabase.from('lessons').select('*').eq('module_id', mod.id).order('sort_order');
          return { ...mod, lessons: lessons || [] };
        }));
        setModules(modulesWithLessons);
        
        if (modulesWithLessons.length > 0) {
          setActiveModule(modulesWithLessons[0].id);
        }
      }

      // 4. Check Purchase Status
      if (user) {
        const { data: purchase } = await supabase.from('purchases').select('*').eq('user_id', user.id).eq('course_id', courseId).single();
        if (purchase) {
          setHasPurchased(true);
        }
      }

      setLoading(false);
    };

    fetchCourseData();
  }, [courseId]);

  const playLesson = (lesson: any) => {
    if (!hasPurchased && !lesson.is_preview) {
      router.push(`/checkout/${courseId}`);
      return;
    }
    setCurrentVideoId(lesson.youtube_video_id);
    setCurrentLessonTitle(lesson.title);
    setCurrentLessonDesc(lesson.description || "In this lesson, you will learn new concepts related to this module.");
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white/50" /></div>;
  if (!course) return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">Course not found.</div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/20 pt-20 md:pt-0">
      
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl fixed top-0 w-full z-50 mt-16">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9] bg-clip-text text-transparent">Curriculum</h1>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar - Curriculum */}
      <aside className={`
        fixed md:relative z-40 h-[calc(100vh-65px)] md:h-screen w-full md:w-80 lg:w-96 
        bg-[#0a0a0a]/90 md:bg-[#0a0a0a]/40 backdrop-blur-2xl border-r border-white/10 flex-shrink-0 
        transition-transform duration-300 ease-in-out md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col mt-32 md:mt-0
      `}>
        <div className="p-6 border-b border-white/10 md:mt-24">
          <Link href="/courses" className="text-sm text-gray-400 hover:text-white mb-4 block">← Back to Courses</Link>
          <h2 className="text-xl font-bold mb-3 tracking-tight">{course.title}</h2>
          <div className="flex items-center text-sm text-gray-400 space-x-4">
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5 text-[#D9D9D9]" /> {modules.length} Modules</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {modules.map((module, mIndex) => (
            <div 
              key={module.id} 
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/20"
            >
              <button 
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="text-left">
                  <span className="text-xs text-white/40 font-bold uppercase">Module {mIndex + 1}</span>
                  <h3 className="font-medium text-sm text-gray-200 mt-1">{module.title}</h3>
                </div>
                {activeModule === module.id ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  activeModule === module.id ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="px-2 pb-2">
                  {module.lessons.map((lesson: any) => {
                    const isLocked = !hasPurchased && !lesson.is_preview;
                    const isPlaying = currentVideoId === lesson.youtube_video_id;

                    return (
                      <button 
                        key={lesson.id}
                        onClick={() => playLesson(lesson)}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-xl text-sm mb-1 transition-all group
                          ${isPlaying ? 'bg-white/5 border border-white/15 text-[#D9D9D9] shadow-[0_0_15px_rgba(217,217,217,0.1)]' : 'hover:bg-white/5 text-gray-400 border border-transparent'}
                        `}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-red-400/70 flex-shrink-0" />
                          ) : isPlaying ? (
                            <PlayCircle className="w-4 h-4 text-[#D9D9D9] flex-shrink-0 drop-shadow-[0_0_8px_rgba(217,217,217,0.3)]" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors flex-shrink-0" />
                          )}
                          <span className={`truncate ${isPlaying ? 'font-medium' : ''}`}>{lesson.title}</span>
                        </div>
                        <span className={`text-xs flex-shrink-0 ml-2 text-gray-500`}>
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
      <main className="flex-1 h-[calc(100vh-65px)] md:h-screen overflow-y-auto bg-gradient-to-b from-[#050505] to-[#0a0a0a] pt-10 md:pt-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
          
          {/* Video Player Placeholder - Cinematic Style */}
          <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#030303] group shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
            {currentVideoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&rel=0`}
                title={currentLessonTitle}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent"></div>
                
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                  <div className="relative">
                    <button className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center transition-all duration-300">
                      <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-white/30 ml-1.5" />
                    </button>
                  </div>
                  <p className="text-white/50 text-sm font-medium">Select a lesson from the curriculum to start learning</p>
                </div>
              </>
            )}
          </div>

          {/* Lesson Details */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pb-20">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
                  {currentLessonTitle || course.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-y border-white/10 py-6">
                {!hasPurchased ? (
                  <Link href={`/checkout/${courseId}`} className="flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transform hover:-translate-y-0.5 text-lg">
                    <ShoppingCart className="w-5 h-5 mr-2.5" />
                    Buy Full Course for ${course.price}
                  </Link>
                ) : (
                  <button className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#D9D9D9] to-[#F5F5F5] hover:from-white hover:to-white text-black font-medium transition-all shadow-[0_0_20px_rgba(217,217,217,0.15)] transform hover:-translate-y-0.5">
                    <CheckCircle className="w-5 h-5 mr-2.5" />
                    Mark as Complete
                  </button>
                )}
                <button className="flex items-center px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-white/20 transform hover:-translate-y-0.5">
                  <FileText className="w-5 h-5 mr-2.5 text-gray-400" />
                  Resources
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-[#D9D9D9]" />
                  About this {currentLessonTitle ? "lesson" : "course"}
                </h3>
                <div className="text-gray-300 space-y-4 text-base md:text-lg leading-relaxed">
                  <p>{currentLessonDesc || course.description}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Instructor / Extra info */}
            <div className="space-y-6">
              {/* Support Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/15 backdrop-blur-xl shadow-[0_0_30px_rgba(217,217,217,0.05)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl border border-white/15">
                    <MessageCircle className="w-5 h-5 text-[#D9D9D9]" />
                  </div>
                  <h3 className="font-semibold text-white text-lg">Need Help?</h3>
                </div>
                <p className="text-sm text-white/50 mb-6 leading-relaxed">Join our community discord to ask questions, share your progress, and network with peers.</p>
                <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-[#D9D9D9] transition-all text-sm font-semibold hover:shadow-[0_0_15px_rgba(217,217,217,0.15)] transform hover:-translate-y-0.5">
                  Join Discord Community
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </main>

    </div>
  );
}
