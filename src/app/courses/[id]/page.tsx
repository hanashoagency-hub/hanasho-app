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
  ShoppingCart,
  Loader2,
  Star
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toggleLessonCompleteAction } from '@/app/courses/actions';
import { getPublicCourseDetailsAction } from '@/app/portal-live/actions';
import Link from 'next/link';
import CourseReviewSection from './CourseReviewSection';

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
  const [user, setUser] = useState<any>(null);

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    const fetchCourseData = async () => {
      // 1. Fetch Auth state
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      // 2 & 3. Fetch Course Details, Modules, and Lessons
      const res = await getPublicCourseDetailsAction(courseId);
      if (res.success && res.course) {
        setCourse(res.course);
        setModules(res.modules);

        if (res.modules.length > 0) {
          setActiveModule(res.modules[0].id);
        }
      } else {
        // If course is not found or not published
        router.push("/courses");
        return;
      }

      // 4. Fetch Reviews
      const { data: reviewData } = await supabase
        .from('course_reviews')
        .select(`
          id, rating, review_text, created_at, user_id,
          profiles ( full_name, avatar_url )
        `)
        .eq('course_id', courseId)
        .order('created_at', { ascending: false });
        
      if (reviewData) {
        setReviews(reviewData);
        if (currentUser) {
          setHasReviewed(reviewData.some(r => r.user_id === currentUser.id));
        }
      }

      // 5. Check Purchase Status
      if (currentUser) {
        const { data: purchase } = await supabase.from('purchases').select('*').eq('user_id', currentUser.id).eq('course_id', courseId).single();
        if (purchase) {
          setHasPurchased(true);
        }
      }

      setLoading(false);
    };

    fetchCourseData();
  }, [courseId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "New";

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
          <Link href="/courses" className="text-sm text-[var(--text-secondary)] hover:text-[var(--brand-primary)] mb-4 block font-bold transition-colors">← Back to Courses</Link>
          <h2 className="text-xl font-bold mb-3 tracking-tight font-heading">{course.title}</h2>
          
          <div className="flex items-center text-sm text-[var(--text-secondary)] space-x-4 mb-2">
            <span className="flex items-center text-yellow-400 font-bold"><Star className="w-4 h-4 mr-1 fill-current" /> {averageRating}</span>
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5" /> {modules.length} Modules</span>
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
                    const isLocked = !hasPurchased && !lesson.is_preview;

                    return (
                      <div 
                        key={lesson.id}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-[12px] text-sm mb-1 transition-all group
                          hover:bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent
                        `}
                      >
                        <div className="flex items-center space-x-3 truncate">
                          {isLocked ? (
                            <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-[var(--brand-primary)] flex-shrink-0" />
                          )}
                          <span className={`truncate`}>{lesson.title}</span>
                        </div>
                        <span className={`text-xs flex-shrink-0 ml-2`}>
                          {lesson.duration_minutes}m
                        </span>
                      </div>
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

          {/* Course Cover Image Placeholder instead of Video Player */}
          <div className="relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm">
            {course.cover_image ? (
              <img src={course.cover_image} alt={course.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center flex-col gap-4 bg-[var(--bg-secondary)]">
                <BookOpen className="w-16 h-16 text-[var(--border-color)]" />
                <p className="text-[var(--text-secondary)] font-bold">{course.title}</p>
              </div>
            )}
          </div>

          {/* Lesson Details */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pb-20">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">
                  {course.title}
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-y border-[var(--border-color)] py-6">
                {!hasPurchased ? (
                  user ? (
                    <Link href={`/checkout/${courseId}?type=course`} className="btn-primary py-3">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Buy Full Course for ${course.price}
                    </Link>
                  ) : (
                    <Link href={`/register?next=/checkout/${courseId}?type=course`} className="btn-primary py-3">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Create Account to Buy (${course.price})
                    </Link>
                  )
                ) : (
                  <Link href={`/learn/${courseId}`} className="flex items-center px-6 py-3 rounded-[20px] font-bold transition-all bg-[var(--brand-primary)] text-[var(--on-brand)]">
                    <PlayCircle className="w-5 h-5 mr-2.5" />
                    Go to Course Content
                  </Link>
                )}
                <button className="flex items-center px-6 py-3 rounded-[20px] bg-[var(--bg-secondary)] border border-[var(--border-color)] transition-all font-bold hover:border-[var(--brand-primary)]">
                  <FileText className="w-5 h-5 mr-2 text-[var(--text-secondary)]" />
                  Resources
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-[var(--brand-primary)]" />
                  About this course
                </h3>
                <div className="text-[var(--text-secondary)] space-y-4 text-base md:text-lg leading-relaxed">
                  <p>{course.description}</p>
                  
                  {course.benefits && (
                    <div className="mt-8">
                      <h4 className="font-bold text-white mb-2">What you will learn:</h4>
                      <ul className="list-disc pl-5">
                        {course.benefits.split('\n').map((b: string, i: number) => (
                          b.trim() && <li key={i}>{b.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {course.materials_included && (
                    <div className="mt-6">
                      <h4 className="font-bold text-white mb-2">Materials Included:</h4>
                      <p>{course.materials_included}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* REVIEWS SECTION */}
              <CourseReviewSection 
                courseId={courseId} 
                hasPurchased={hasPurchased} 
                reviews={reviews} 
                hasReviewed={hasReviewed} 
              />
            </div>

            {/* Right Column - Support Card */}
            <div className="space-y-6">
              <div className="p-6 rounded-[24px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-[var(--bg-primary)] rounded-[16px] border border-[var(--border-color)]">
                    <MessageCircle className="w-6 h-6 text-[var(--brand-primary)]" />
                  </div>
                  <h3 className="font-heading font-bold text-[var(--text-primary)] text-xl">Need Help?</h3>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-8 leading-relaxed">Join our community discord to ask questions, share your progress, and network with peers.</p>
                <button className="btn-secondary w-full py-3">
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

