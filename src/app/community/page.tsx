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
    <div className="min-h-screen bg-transparent pt-24 pb-20">
      {/* Header */}
      <div className="sticky top-[72px] z-20 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] pt-4 pb-4 px-6 md:px-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-[var(--text-primary)] tracking-tight flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-[var(--brand-primary)]" />
              Community Hub
            </h1>
            <p className="text-[var(--text-secondary)] mt-1 text-sm">Connect, share, and learn with fellow builders.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[var(--text-secondary)] group-focus-within:text-[var(--brand-primary)] transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Search discussions..." 
                className="w-full md:w-64 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-[12px] py-2 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:border-[var(--brand-primary)] transition-all"
              />
            </div>
            <button className="p-2 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-10 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Create Post */}
          <div className="premium-card !p-6 focus-within:border-[var(--brand-primary)] transition-colors">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center font-bold text-[var(--brand-primary)] shrink-0">
                ST
              </div>
              <div className="flex-1 space-y-4">
                <textarea 
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your latest experiment, ask a question, or spark a discussion..."
                  className="w-full bg-transparent border-none text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-0 p-0 min-h-[80px] text-base leading-relaxed"
                />
                
                <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 rounded-lg text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-primary)] transition-colors">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] hover:bg-[var(--bg-primary)] rounded-lg transition-colors">
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <button 
                    disabled={!postContent.trim()}
                    className="btn-primary py-2 px-6 text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Feed Divider */}
          <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1 bg-[var(--border-color)]" />
            <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Recent Discussions</span>
            <div className="h-px flex-1 bg-[var(--border-color)]" />
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="premium-card !p-6 group focus-within:border-[var(--brand-primary)] transition-all duration-300">
                
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[12px] border border-[var(--border-color)] flex items-center justify-center bg-[var(--bg-primary)] font-bold text-[var(--brand-primary)] relative">
                      {post.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[var(--text-primary)] font-bold font-heading">{post.author}</h3>
                        {post.role === 'Pro Learner' && (
                          <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-[var(--on-brand)] bg-[var(--brand-primary)] rounded-[6px]">
                            <Award className="w-3 h-3 inline mr-1" /> Pro
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-secondary)] font-medium mt-0.5">{post.role} • {post.time}</p>
                    </div>
                  </div>
                  <button className="text-[var(--text-secondary)] hover:text-[var(--brand-primary)] p-1 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="text-[var(--text-primary)] text-sm leading-relaxed mb-6">
                  {post.content}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-[8px] bg-[var(--bg-primary)] text-xs text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] cursor-pointer transition-colors font-medium">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-6 pt-4 border-t border-[var(--border-color)]">
                  <button className={`flex items-center gap-2 text-sm transition-colors font-bold ${post.hasLiked ? 'text-[var(--brand-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--brand-primary)]'}`}>
                    <Heart className={`w-5 h-5 ${post.hasLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    <span>{post.replies} Reply</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors ml-auto">
                    <Share2 className="w-5 h-5" />
                    <span className="hidden sm:inline">Share</span>
                  </button>
                </div>

              </div>
            ))}
          </div>
          
          <button className="w-full py-4 rounded-[16px] border border-dashed border-[var(--border-color)] text-[var(--text-secondary)] font-bold hover:text-[var(--brand-primary)] hover:border-[var(--brand-primary)] hover:bg-[var(--bg-secondary)] transition-all flex items-center justify-center gap-2">
            Load More Posts
          </button>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Stats/Profile Snippet */}
          <div className="premium-card relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Award className="w-24 h-24 text-[var(--brand-primary)]" />
            </div>
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-4">Your Impact</h3>
            <div className="space-y-4 relative z-10">
              <div>
                <p className="text-4xl font-bold font-heading text-[var(--brand-primary)]">142</p>
                <p className="text-xs text-[var(--text-secondary)] uppercase tracking-wider font-bold mt-1">Reputation Points</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--border-color)]">
                <div>
                  <p className="text-xl font-bold font-heading text-[var(--text-primary)]">12</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Posts</p>
                </div>
                <div>
                  <p className="text-xl font-bold font-heading text-[var(--text-primary)]">48</p>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">Helpful Replies</p>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="premium-card !p-6">
            <h3 className="text-lg font-bold font-heading text-[var(--text-primary)] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--brand-primary)]" />
              Trending Topics
            </h3>
            <div className="space-y-5">
              {trendingTopics.map((topic, idx) => (
                <div key={idx} className="group cursor-pointer">
                  <h3 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2 mb-1 group-hover:text-[var(--brand-primary)] transition-colors">{topic.name}</h3>
                  <p className="text-xs text-[var(--text-secondary)] font-medium">{topic.posts} posts this week</p>
                </div>
              ))}
            </div>
          </div>

          {/* Guidelines Mini */}
          <div className="rounded-[20px] bg-[var(--bg-primary)] border border-[var(--border-color)] p-6">
            <h4 className="text-sm font-bold font-heading text-[var(--text-primary)] mb-2">Community Guidelines</h4>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-4">
              Be respectful, share your knowledge, and help others grow. We're building the future together.
            </p>
            <a href="#" className="text-xs font-bold text-[var(--brand-primary)] hover:underline">Read full guidelines &rarr;</a>
          </div>
        </div>
      </div>
    </div>
  );
}
