"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Loader2, Calendar, User, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  created_at: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });
        
      setBlogs(data || []);
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('so-SO', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] mb-6 flex justify-center items-center gap-4">
            <BookOpen className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
            Xirfadify Blog
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Read the latest insights on tech, business, and digital skills.
          </p>
        </div>
      </div>

      {/* Blogs Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-[var(--text-secondary)]" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-20 premium-card">
            <BookOpen className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
            <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">No Articles Yet</h2>
            <p className="text-[var(--text-secondary)]">We are writing amazing content. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div 
                key={blog.id}
                className="premium-card !p-0 flex flex-col overflow-hidden group"
              >
                {/* Image */}
                <div className="h-52 relative overflow-hidden bg-[var(--bg-primary)] flex items-center justify-center border-b border-[var(--border-color)]">
                  {blog.cover_image ? (
                    <img 
                      src={blog.cover_image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <BookOpen className="w-12 h-12 text-[var(--text-secondary)]" />
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-4 text-xs font-bold text-[var(--text-secondary)] mb-4">
                    <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(blog.created_at)}</span>
                  </div>
                  
                  <h3 className="font-heading text-xl font-bold text-[var(--text-primary)] mb-3 line-clamp-2 leading-snug group-hover:text-[var(--brand-primary)] transition-colors">
                    {blog.title}
                  </h3>
                  
                  <p className="text-sm text-[var(--text-secondary)] mb-8 line-clamp-3 flex-grow leading-relaxed">
                    {blog.content.replace(/[#*`_\[\]]/g, '').slice(0, 150)}...
                  </p>
                  
                  <Link 
                    href={`/blogs/${blog.slug}`}
                    className="btn-secondary w-full py-3 px-4 flex items-center justify-center gap-2 mt-auto"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
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
