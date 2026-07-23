"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Calendar, Share2, Facebook, Twitter, Linkedin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Blog {
  id: string;
  title: string;
  slug: string;
  content: string;
  cover_image: string;
  created_at: string;
}

export default function SingleBlogPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchBlog = async () => {
      const { data } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();
        
      if (!data) {
        router.push("/blogs");
      } else {
        setBlog(data);
      }
      setLoading(false);
    };

    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--brand-primary)]" />
      </div>
    );
  }

  if (!blog) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('so-SO', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden font-body">
      {/* Header */}
      <div className="relative pt-32 pb-16 px-6 max-w-4xl mx-auto">
        <Link href="/blogs" className="inline-flex items-center gap-2 text-[var(--brand-primary)] hover:underline mb-8 font-bold">
          <ArrowLeft className="w-4 h-4" /> Back to Blogs
        </Link>
        
        <div className="flex items-center gap-4 text-sm font-bold text-[var(--text-secondary)] mb-6">
          <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {formatDate(blog.created_at)}</span>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-[var(--text-primary)] mb-8 leading-tight">
          {blog.title}
        </h1>

        {/* Share Buttons */}
        <div className="flex items-center gap-3 pt-6 border-t border-[var(--border-color)]">
          <span className="text-sm font-bold text-[var(--text-secondary)]">Share:</span>
          <button className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Twitter className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Linkedin className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--text-primary)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] transition-colors">
            <Facebook className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cover Image */}
      {blog.cover_image && (
        <div className="max-w-5xl mx-auto px-6 mb-16">
          <div className="rounded-[24px] overflow-hidden border border-[var(--border-color)] shadow-2xl">
            <img src={blog.cover_image} alt={blog.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="premium-card text-[var(--text-primary)] leading-loose text-lg whitespace-pre-wrap">
          {blog.content}
        </div>
      </div>
    </div>
  );
}
