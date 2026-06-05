"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlayCircle,
  Star,
  Clock,
  BookOpen,
  Loader2
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchCourses = async () => {
      // Fetch only published courses
      const { data } = await supabase
        .from("courses")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
        
      setCourses(data || []);
      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-white/20 pb-24">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.03] blur-[120px] rounded-full pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-[#F5F5F5] via-[#D9D9D9] to-[#888888] bg-clip-text text-transparent">
            Explore Our Premium Catalog
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Master the skills of the future. From AI to Web3, Memecoins to Digital Marketing, accelerate your career with XIRFADIFY.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-white/50" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-sm">
            <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Courses Available</h2>
            <p className="text-gray-400">We are currently preparing some amazing courses. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="flex flex-col bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-300 group shadow-lg shadow-black/50"
              >
                {/* Image */}
                <div className="h-48 relative overflow-hidden bg-white/5 flex items-center justify-center">
                  {course.cover_image ? (
                    <img 
                      src={course.cover_image} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <PlayCircle className="w-12 h-12 text-white" />
                  </div>
                  
                  {/* Price Tag */}
                  <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                    <span className="font-bold text-white">
                      {course.price > 0 ? `$${course.price}` : "FREE"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-3 flex-grow">{course.description}</p>
                  
                  <Link 
                    href={`/courses/${course.id}`}
                    className="w-full py-3 px-4 bg-white hover:bg-[#F5F5F5] text-black text-center rounded-xl font-bold transition-all duration-300 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    Enroll Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
