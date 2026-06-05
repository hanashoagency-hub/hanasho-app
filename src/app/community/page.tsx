"use client";

import React, { useState } from 'react';
import { 
  MessageSquare, 
  Heart, 
  Share2, 
  MoreHorizontal, 
  Image as ImageIcon, 
  Link as LinkIcon,
  Send,
  Search,
  Filter,
  TrendingUp,
  Award,
  Users,
  Sparkles
} from 'lucide-react';

export default function CommunityPage() {
  const [postContent, setPostContent] = useState('');

  const posts = [
    {
      id: 1,
      author: 'Elena Rodriguez',
      avatar: 'ER',
      role: 'Pro Learner',
      time: '2 hours ago',
      content: 'Just finished the module on LangChain and built my first multi-agent system! The way agents can communicate and delegate tasks is mind-blowing. Does anyone have good resources for optimizing token usage when running multiple agents in parallel?',
      likes: 24,
      replies: 8,
      tags: ['AI Agents', 'LangChain', 'Optimization'],
      hasLiked: true,
    },
    {
      id: 2,
      author: 'Marcus Chen',
      avatar: 'MC',
      role: 'Alumni',
      time: '5 hours ago',
      content: 'I\'ve been experimenting with zero-knowledge proofs (zk-SNARKs) in my latest Web3 project. The mathematical complexity is high, but the privacy benefits for decentralized identity are totally worth it. Wrote a short guide on my blog if anyone is interested.',
      likes: 156,
      replies: 32,
      tags: ['Web3', 'ZKP', 'Privacy'],
      hasLiked: false,
    },
    {
      id: 3,
      author: 'Sarah Johnson',
      avatar: 'SJ',
      role: 'Beginner',
      time: '1 day ago',
      content: 'Struggling a bit with understanding React Server Components vs Client Components. When exactly should I be using "use client"? I keep getting hydration errors in Next.js 14.',
      likes: 12,
      replies: 15,
      tags: ['Next.js', 'React', 'Help Needed'],
      hasLiked: false,
    }
  ];

  const trendingTopics = [
    { name: '#AgenticAI', posts: 1205 },
    { name: '#SolidityOptimization', posts: 843 },
    { name: '#Nextjs14', posts: 652 },
    { name: '#Showcase', posts: 430 },
  ];

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-white/20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 pt-8 pb-4 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-[#D9D9D9] animate-pulse" />
              Community Hub
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Connect, share, and learn with fellow builders.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400 group-focus-within:text-white transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search discussions..." 
                className="w-full md:w-64 bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 transition-all"
              />
            </div>
            <button className="p-2 rounded-xl bg-white/[0.03] border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Create Post */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-4 md:p-6 backdrop-blur-sm relative overflow-hidden group focus-within:border-white/20 transition-colors">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D9D9D9] via-[#888888] to-[#555555] rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-1000"></div>
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#333] to-[#555] flex items-center justify-center font-bold text-white shrink-0 shadow-lg border border-white/10">
                ST
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your latest experiment, ask a question, or spark a discussion..."
                  className="w-full bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 p-0 min-h-[80px] text-base leading-relaxed"
                />
                
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors tooltip-trigger">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    disabled={!postContent.trim()}
                    className="px-6 py-2 bg-[#D9D9D9] hover:bg-white text-black font-semibold rounded-xl transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-2"
                  >
                    Post <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Recent Discussions</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="relative group p-4 border border-white/5 rounded-2xl bg-white/[0.02] focus-within:border-white/20 focus-within:bg-white/[0.04] transition-all duration-300">
                
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border-2 border-[#050505] flex items-center justify-center bg-white/10 text-xs font-bold text-[#D9D9D9] backdrop-blur-sm z-10 relative">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium">{post.author}</h3>
                        {post.role === 'Pro Learner' && (
                          <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-[#D9D9D9] bg-white/5 rounded-md border border-white/10">
                            <Award className="w-3 h-3" /> Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">{post.role} • {post.time}</p>
                    </div>
                  </div>
                  <button className="text-slate-500 hover:text-slate-300 p-1">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-md bg-white/5 text-xs text-slate-400 hover:bg-white/10 hover:text-slate-200 cursor-pointer transition-colors border border-white/5">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button className={`flex items-center gap-2 text-sm transition-colors ${post.hasLiked ? 'text-[#D9D9D9]' : 'text-slate-400 hover:text-white'}`}>
                    <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-[#D9D9D9] hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.replies} Reply</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
          
          <button className="w-full py-4 rounded-xl border border-dashed border-white/10 text-slate-400 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all flex items-center justify-center gap-2">
            Load More Posts
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Stats/Profile Snippet */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/15 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
              <Award className="w-24 h-24 text-[#D9D9D9]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Your Impact</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-3xl font-bold text-[#D9D9D9]">142</p>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">Reputation Points</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div>
                  <p className="text-xl font-bold text-white">12</p>
                  <p className="text-xs text-slate-500">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">48</p>
                  <p className="text-xs text-slate-500">Helpful Replies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D9D9D9]" />
              Trending Topics
            </h3>
            <div className="space-y-4">
              {trendingTopics.map((topic, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4 group-hover:text-[#D9D9D9] transition-colors">{topic.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{topic.posts} posts this week</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Mini */}
          <div className="rounded-2xl bg-white/[0.01] border border-white/5 p-5">
            <h4 className="text-sm font-bold text-slate-300 mb-2">Community Guidelines</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              Be respectful, share your knowledge, and help others grow. We're building the future together.
            </p>
            <a href="#" className="text-xs text-[#D9D9D9] hover:underline">Read full guidelines &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
}
