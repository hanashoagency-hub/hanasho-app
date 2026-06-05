"use client";

import React, { useState } from 'react';
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
  MessageCircle
} from 'lucide-react';

const COURSE_MODULES = [
  {
    id: 1,
    title: "Module 1: Introduction",
    duration: "45 min",
    lessons: [
      { id: 101, title: "Welcome to the Course", duration: "5:00", isCompleted: true, isLocked: false },
      { id: 102, title: "Understanding the Basics", duration: "15:30", isCompleted: true, isLocked: false },
      { id: 103, title: "Setting up Your Environment", duration: "24:30", isCompleted: false, isLocked: false, isCurrent: true },
    ]
  },
  {
    id: 2,
    title: "Module 2: Advanced Strategies",
    duration: "2h 15m",
    lessons: [
      { id: 201, title: "Deep Dive into Core Concepts", duration: "45:00", isCompleted: false, isLocked: true },
      { id: 202, title: "Practical Application", duration: "55:00", isCompleted: false, isLocked: true },
      { id: 203, title: "Module Assessment", duration: "35:00", isCompleted: false, isLocked: true },
    ]
  },
  {
    id: 3,
    title: "Module 3: Mastery & Best Practices",
    duration: "1h 30m",
    lessons: [
      { id: 301, title: "Optimization Techniques", duration: "30:00", isCompleted: false, isLocked: true },
      { id: 302, title: "Real-world Case Studies", duration: "40:00", isCompleted: false, isLocked: true },
      { id: 303, title: "Final Project", duration: "20:00", isCompleted: false, isLocked: true },
    ]
  }
];

export default function CoursePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(1);

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden font-sans selection:bg-white/20">
      
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0 z-50">
        <h1 className="text-lg font-semibold bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9] bg-clip-text text-transparent">Xirfadify</h1>
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
        flex flex-col
      `}>
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold mb-3 tracking-tight">Course Curriculum</h2>
          <div className="flex items-center text-sm text-gray-400 space-x-4">
            <span className="flex items-center"><BookOpen className="w-4 h-4 mr-1.5 text-[#D9D9D9]" /> 3 Modules</span>
            <span className="flex items-center"><Clock className="w-4 h-4 mr-1.5 text-[#D9D9D9]" /> 4h 30m</span>
          </div>
          
          <div className="mt-5 bg-white/5 rounded-full h-1.5 w-full overflow-hidden border border-white/5">
            <div className="bg-gradient-to-r from-[#D9D9D9]/60 to-white/40 w-1/4 h-full rounded-full shadow-[0_0_10px_rgba(217,217,217,0.3)]"></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right font-medium">25% Completed</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {COURSE_MODULES.map((module) => (
            <div 
              key={module.id} 
              className="rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden backdrop-blur-sm transition-all duration-300 hover:border-white/20"
            >
              <button 
                onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div className="text-left">
                  <h3 className="font-medium text-sm text-gray-200">{module.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{module.duration}</p>
                </div>
                {activeModule === module.id ? 
                  <ChevronDown className="w-4 h-4 text-gray-400" /> : 
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                }
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  activeModule === module.id ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                } overflow-hidden`}
              >
                <div className="px-2 pb-2">
                  {module.lessons.map(lesson => (
                    <button 
                      key={lesson.id}
                      disabled={lesson.isLocked}
                      className={`
                        w-full flex items-center justify-between p-3 rounded-xl text-sm mb-1 transition-all group
                        ${lesson.isCurrent 
                          ? 'bg-white/5 border border-white/15 text-[#D9D9D9] shadow-[0_0_15px_rgba(217,217,217,0.1)]' 
                          : 'hover:bg-white/5 text-gray-400 border border-transparent'}
                        ${lesson.isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center space-x-3 truncate">
                        {lesson.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-[#D9D9D9] flex-shrink-0 drop-shadow-[0_0_8px_rgba(217,217,217,0.3)]" />
                        ) : lesson.isLocked ? (
                          <Lock className="w-4 h-4 text-gray-600 flex-shrink-0" />
                        ) : lesson.isCurrent ? (
                          <PlayCircle className="w-4 h-4 text-[#D9D9D9] flex-shrink-0 drop-shadow-[0_0_8px_rgba(217,217,217,0.3)]" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0 group-hover:border-gray-400 transition-colors" />
                        )}
                        <span className={`truncate ${lesson.isCurrent ? 'font-medium' : ''}`}>{lesson.title}</span>
                      </div>
                      <span className={`text-xs flex-shrink-0 ml-2 ${lesson.isCurrent ? 'text-[#D9D9D9]/80' : 'text-gray-500'}`}>
                        {lesson.duration}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 h-[calc(100vh-65px)] md:h-screen overflow-y-auto bg-gradient-to-b from-[#050505] to-[#0a0a0a]" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
          
          {/* Breadcrumb */}
          <div className="hidden md:flex items-center text-xs md:text-sm text-gray-400 mb-8 space-x-2 font-medium">
            <span className="hover:text-white cursor-pointer transition-colors">Courses</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="hover:text-white cursor-pointer transition-colors">Mastering Next.js 14</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-gray-200 bg-white/5 px-2 py-1 rounded-md border border-white/5">Setting up Your Environment</span>
          </div>

          {/* Video Player Placeholder - Cinematic Style */}
          <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 bg-[#030303] group shadow-[0_0_40px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-white/[0.01]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/[0.03] via-transparent to-transparent"></div>
            
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <button className="relative w-20 h-20 md:w-24 md:h-24 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center group-hover:scale-105 group-hover:bg-white/15 transition-all duration-300 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_32px_rgba(217,217,217,0.15)]">
                  <PlayCircle className="w-10 h-10 md:w-12 md:h-12 text-white ml-1.5 drop-shadow-md" />
                </button>
              </div>
            </div>

            {/* Video Controls (Dummy) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
              <div className="w-full h-1.5 bg-white/20 rounded-full mb-5 cursor-pointer backdrop-blur-sm overflow-hidden">
                <div className="w-1/3 h-full bg-gradient-to-r from-[#D9D9D9]/60 to-white/40 rounded-full relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-0 group-hover:scale-100 transition-transform"></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-6">
                  <PlayCircle className="w-6 h-6 cursor-pointer hover:text-white transition-colors" />
                  <span className="font-medium tracking-wide">08:15 <span className="text-gray-400 mx-1">/</span> 24:30</span>
                </div>
                <div className="flex items-center space-x-6">
                  <span className="cursor-pointer hover:text-white text-gray-300 font-medium transition-colors bg-white/10 px-2 py-1 rounded-md">1x</span>
                  <span className="cursor-pointer hover:text-white text-gray-300 font-medium transition-colors">HD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lesson Details */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 pb-20">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <span className="px-3 py-1 text-xs font-semibold bg-white/5 text-[#D9D9D9] rounded-full border border-white/15">Module 1</span>
                  <span className="px-3 py-1 text-xs font-semibold bg-white/5 text-[#D9D9D9] rounded-full border border-white/15">Lesson 3</span>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 tracking-tight leading-tight">Setting up Your Environment</h1>
              </div>

              <div className="flex flex-wrap items-center gap-4 border-y border-white/10 py-6">
                <button className="flex items-center px-6 py-3 rounded-xl bg-gradient-to-r from-[#D9D9D9] to-[#F5F5F5] hover:from-white hover:to-white text-black font-medium transition-all shadow-[0_0_20px_rgba(217,217,217,0.15)] hover:shadow-[0_0_30px_rgba(217,217,217,0.25)] transform hover:-translate-y-0.5">
                  <CheckCircle className="w-5 h-5 mr-2.5" />
                  Mark as Complete
                </button>
                <button className="flex items-center px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all hover:border-white/20 transform hover:-translate-y-0.5">
                  <FileText className="w-5 h-5 mr-2.5 text-gray-400" />
                  Resources (2)
                </button>
              </div>

              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <BookOpen className="w-5 h-5 mr-2 text-[#D9D9D9]" />
                  About this lesson
                </h3>
                <div className="text-gray-300 space-y-4 text-base md:text-lg leading-relaxed">
                  <p>
                    In this lesson, we'll dive deep into configuring your local development environment for optimal productivity. We'll cover everything from IDE setup and recommended extensions to terminal configurations and package managers.
                  </p>
                  <p>
                    By the end of this video, you will have a rock-solid foundation that will save you countless hours of debugging environment issues down the road.
                  </p>
                </div>
                
                <div className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                  <h4 className="text-lg font-semibold text-white mb-4">Key Takeaways:</h4>
                  <ul className="space-y-3 list-none p-0 m-0">
                    {['Node.js and npm version management', 'VS Code essential extensions for this stack', 'Configuring ESLint and Prettier for automatic formatting', 'Environment variables best practices'].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="mt-1 mr-4 bg-white/10 p-1 rounded-full border border-white/15">
                          <CheckCircle className="w-3.5 h-3.5 text-[#D9D9D9] flex-shrink-0" />
                        </div>
                        <span className="text-gray-300">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Instructor / Extra info */}
            <div className="space-y-6">
              {/* Instructor Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl -mr-10 -mt-10 transition-opacity group-hover:bg-white/5"></div>
                <h3 className="font-semibold mb-5 text-gray-200 text-sm uppercase tracking-wider">Instructor</h3>
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#D9D9D9]/40 to-white/20 p-[2px] shadow-[0_0_15px_rgba(217,217,217,0.2)]">
                    <div className="w-full h-full rounded-full bg-[#050505] flex items-center justify-center">
                      <span className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#F5F5F5] to-[#D9D9D9]">AJ</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-100 text-lg">Alex Johnson</p>
                    <p className="text-sm text-gray-500">Senior Full-Stack Developer</p>
                  </div>
                </div>
              </div>

              {/* Progress Card */}
              <div className="p-6 rounded-3xl bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 shadow-xl">
                <h3 className="font-semibold mb-4 text-gray-200 text-sm uppercase tracking-wider">Course Progress</h3>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-5xl font-bold bg-gradient-to-br from-white to-gray-500 bg-clip-text text-transparent tracking-tighter">25%</span>
                  <Award className="w-10 h-10 text-[#D9D9D9]/50 drop-shadow-[0_0_10px_rgba(217,217,217,0.2)] mb-1" />
                </div>
                <div className="w-full h-1.5 bg-white/5 rounded-full mb-3 overflow-hidden">
                  <div className="w-1/4 h-full bg-gradient-to-r from-[#D9D9D9]/60 to-white/40 rounded-full"></div>
                </div>
                <p className="text-sm text-gray-400 font-medium">3 of 12 lessons completed</p>
              </div>

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
