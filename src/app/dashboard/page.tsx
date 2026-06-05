"use client";

import React from 'react';
import { 
  Play, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  MessageSquare
} from 'lucide-react';

export default function DashboardPage() {
  const courses = [
    {
      id: 1,
      title: 'AI Automations & Agents',
      instructor: 'Dr. Sarah Chen',
      progress: 60,
      image: 'bg-gradient-to-br from-white/10 to-white/5',
      iconColor: 'text-[#D9D9D9]',
      totalLessons: 24,
      completedLessons: 14,
    },
    {
      id: 2,
      title: 'Advanced Web3 Development',
      instructor: 'Alex Mercer',
      progress: 35,
      image: 'bg-gradient-to-br from-white/10 to-white/5',
      iconColor: 'text-[#D9D9D9]',
      totalLessons: 32,
      completedLessons: 11,
    },
    {
      id: 3,
      title: 'Machine Learning Fundamentals',
      instructor: 'Prof. James Webb',
      progress: 85,
      image: 'bg-gradient-to-br from-white/10 to-white/5',
      iconColor: 'text-[#D9D9D9]',
      totalLessons: 18,
      completedLessons: 15,
    }
  ];

  const recentActivity = [
    { id: 1, type: 'course', title: 'Completed "Introduction to LLMs"', time: '2 hours ago', icon: CheckCircle2, color: 'text-[#D9D9D9]', bg: 'bg-white/5' },
    { id: 2, type: 'achievement', title: 'Earned "Fast Learner" Badge', time: '5 hours ago', icon: Award, color: 'text-[#D9D9D9]', bg: 'bg-white/5' },
    { id: 3, type: 'forum', title: 'Replied to "Best practices for React"', time: '1 day ago', icon: MessageSquare, color: 'text-[#D9D9D9]', bg: 'bg-white/5' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight flex items-center gap-3">
            Welcome back, Student
            <Sparkles className="w-6 h-6 text-[#D9D9D9] animate-pulse" />
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base">
            You're making great progress. Keep up the momentum!
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#D9D9D9] animate-pulse" />
            <span className="text-sm font-medium text-slate-300">Daily Streak: 12 days</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column (Courses) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D9D9D9]" />
              Continue Learning
            </h2>
            <button className="text-sm text-[#D9D9D9] hover:text-white transition-colors flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id} 
                className="group relative rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden hover:border-white/20 hover:bg-white/[0.04] transition-all duration-500 flex flex-col"
              >
                <div className={`h-32 ${course.image} relative p-6 flex items-end justify-between`}>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent opacity-80" />
                  <div className="relative z-10 w-full">
                    <h3 className="text-lg font-bold text-white leading-tight mb-1">{course.title}</h3>
                    <p className="text-sm text-slate-300">{course.instructor}</p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-400">Progress</span>
                      <span className="text-white font-medium">{course.progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#D9D9D9]/60 to-white/40 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {course.completedLessons} of {course.totalLessons} lessons completed
                    </p>
                  </div>
                  
                  <button className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 group-hover:bg-[#D9D9D9] group-hover:text-black group-hover:shadow-[0_0_20px_rgba(217,217,217,0.15)]">
                    <Play className="w-4 h-4" /> Resume Course
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar Column (Notifications & Activity) */}
        <div className="space-y-8">
          {/* Notifications Panel */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">Notifications</h3>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-[#D9D9D9] text-xs font-medium">2 New</span>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex gap-4">
                <div className="w-2 h-2 rounded-full bg-[#D9D9D9] mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-200 font-medium">Live Q&A Session Starting</p>
                  <p className="text-xs text-slate-400 mt-1">Join Dr. Sarah Chen for the weekly AI Automations Q&A in 15 mins.</p>
                </div>
              </div>
              <div className="p-3 rounded-xl hover:bg-white/5 transition-colors flex gap-4 cursor-pointer">
                <div className="w-2 h-2 rounded-full bg-transparent mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-slate-300 font-medium">Assignment Graded</p>
                  <p className="text-xs text-slate-500 mt-1">Your Smart Contract assignment was graded: 98/100.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
            <div className="space-y-6">
              {recentActivity.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex gap-4 relative">
                    {idx !== recentActivity.length - 1 && (
                      <div className="absolute left-4 top-10 bottom-[-24px] w-px bg-white/5" />
                    )}
                    <div className={`w-8 h-8 rounded-full ${activity.bg} flex items-center justify-center shrink-0 z-10`}>
                      <Icon className={`w-4 h-4 ${activity.color}`} />
                    </div>
                    <div>
                      <p className="text-sm text-slate-300 font-medium">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
