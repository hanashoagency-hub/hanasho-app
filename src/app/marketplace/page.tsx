"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Download, 
  Star, 
  Filter, 
  PlusCircle, 
  ArrowRight,
  Sparkles,
  Code,
  Layout,
  BookOpen
} from 'lucide-react';

const products = [
  { id: 1, title: "Next.js SaaS Boilerplate", creator: "Ali Dev", price: 49, rating: 4.9, reviews: 120, category: "Templates", icon: Code },
  { id: 2, title: "Modern Dark UI Kit", creator: "Figma Som", price: 29, rating: 4.8, reviews: 85, category: "UI Kits", icon: Layout },
  { id: 3, title: "Python Web Scraper Script", creator: "Data Ninja", price: 15, rating: 4.7, reviews: 45, category: "Scripts", icon: Code },
  { id: 4, title: "Freelancing Guide for Somalis", creator: "Xirfadify", price: 0, rating: 5.0, reviews: 300, category: "E-books", icon: BookOpen },
  { id: 5, title: "E-commerce Notion Template", creator: "Systemize", price: 12, rating: 4.6, reviews: 32, category: "Templates", icon: Layout },
  { id: 6, title: "Instagram Viral Hooks PDF", creator: "Social Pro", price: 9, rating: 4.5, reviews: 210, category: "E-books", icon: BookOpen },
];

const categories = ["All", "Templates", "UI Kits", "Scripts", "E-books"];

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = activeCategory === "All" 
    ? products 
    : products.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#050505] font-sans selection:bg-white/20">
      {/* Header Spacer */}
      <div className="pt-32 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/[0.03] rounded-full blur-[100px] pointer-events-none" />
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6 flex justify-center items-center gap-3">
              <ShoppingBag className="w-8 h-8 md:w-12 md:h-12 text-[#D9D9D9]" />
              Digital Marketplace
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Discover premium tools, templates, and scripts built by top creators. 
              Elevate your digital journey or start earning by selling your own creations.
            </p>
          </div>

          {/* Sell CTA Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-white/5 to-white/[0.02] border border-white/10 p-8 md:p-12 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
              <Sparkles className="w-48 h-48 text-white" />
            </div>
            
            <div className="relative z-10 md:w-2/3">
              <span className="inline-block px-3 py-1 mb-4 rounded-full bg-white/10 text-[#D9D9D9] text-xs font-bold tracking-wider uppercase border border-white/20">
                Become a Seller
              </span>
              <h2 className="text-3xl font-bold text-white mb-4">
                Turn your digital skills into passive income.
              </h2>
              <p className="text-slate-400 mb-8 text-lg">
                Have a great notion template, a useful script, or a design kit? List it on our marketplace and start selling to thousands of learners instantly.
              </p>
              <button 
                className="px-8 py-3 bg-[#D9D9D9] hover:bg-white text-black font-semibold rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-2"
                onClick={() => alert("Seller onboarding modal will open here!")}
              >
                <PlusCircle className="w-5 h-5" /> Start Selling
              </button>
            </div>
          </div>

          {/* Filters & Grid */}
          <div className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                    activeCategory === cat 
                      ? 'bg-white text-black border-transparent shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
                      : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <select className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:border-white/30 appearance-none min-w-[160px]">
                <option>Sort by: Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => {
              const Icon = product.icon;
              return (
                <div 
                  key={product.id} 
                  className="group rounded-2xl bg-white/[0.02] border border-white/5 p-6 hover:bg-white/[0.04] hover:border-white/15 transition-all duration-300 flex flex-col"
                >
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#333] to-[#111] border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                    <Icon className="w-6 h-6 text-[#D9D9D9]" />
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#D9D9D9] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm text-slate-400">By {product.creator}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[#D9D9D9] fill-[#D9D9D9]" />
                      <span className="text-sm font-medium text-white">{product.rating}</span>
                    </div>
                    <span className="text-xs text-slate-500">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="text-2xl font-bold text-white">
                      {product.price === 0 ? 'Free' : `$${product.price}`}
                    </div>
                    <button className="p-3 rounded-xl bg-white/5 hover:bg-white/15 text-white transition-colors group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
