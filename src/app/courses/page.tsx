"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  PlayCircle,
  BookOpen,
  Loader2,
  ArrowRight
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
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] mb-6 flex justify-center items-center gap-4">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
            Explore Our Premium Catalog
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Master the skills of the future. From AI to Web3, Memecoins to Digital Marketing, accelerate your career with XIRFADIFY.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px]">
            <BookOpen className="w-16 h-16 text-[var(--border-color)] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">No Courses Available</h2>
            <p className="text-[var(--text-secondary)]">We are currently preparing some amazing courses. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course) => (
              <div 
                key={course.id}
                className="premium-card !p-0 flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <div className="h-52 relative overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center border-b border-[var(--border-color)]">
                  {course.cover_image ? (
                    <img 
                      src={course.cover_image} 
                      alt={course.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-[var(--text-secondary)]" />
                  )}
                  <div className="absolute inset-0 bg-[#071E16]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm">
                    <PlayCircle className="w-12 h-12 text-[var(--brand-primary)]" />
                  </div>
                  
                  {/* Price Tag */}
                  <div className="absolute bottom-4 right-4 bg-[var(--bg-primary)] px-4 py-1.5 rounded-[12px] border border-[var(--border-color)] shadow-sm">
                    <span className="font-bold text-[var(--brand-primary)] text-sm">
                      {course.price > 0 ? `$${course.price}` : "FREE"}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-3 line-clamp-2 leading-snug">{course.title}</h3>
                  <p className="text-sm text-[var(--text-secondary)] mb-8 line-clamp-3 flex-grow leading-relaxed">{course.description}</p>
                  
                  <Link 
                    href={`/courses/${course.id}`}
                    className="btn-primary w-full py-3 px-4 flex items-center justify-center gap-2"
                  >
                    Enroll Now <ArrowRight className="w-4 h-4" />
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
