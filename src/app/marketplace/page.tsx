"use client";

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Download, 
  Star, 
  Filter, 
  PlusCircle, 
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
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      {/* Header Spacer */}
      <div className="pt-32 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Hero Section */}
          <div className="text-center mb-16 relative">
            <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] tracking-tight mb-6 flex justify-center items-center gap-4">
              <ShoppingBag className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
              Digital Marketplace
            </h1>
            <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
              Discover premium tools, templates, and scripts built by top creators. 
              Elevate your digital journey or start earning by selling your own creations.
            </p>
          </div>

          {/* Sell CTA Banner */}
          <div className="premium-card !p-8 md:!p-12 mb-16 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12">
              <Sparkles className="w-48 h-48 text-[var(--brand-primary)]" />
            </div>
            
            <div className="relative z-10 md:w-2/3">
              <span className="inline-block px-4 py-1.5 mb-6 rounded-[8px] bg-[var(--bg-primary)] text-[var(--brand-primary)] text-xs font-bold tracking-wider uppercase border border-[var(--border-color)]">
                Become a Seller
              </span>
              <h2 className="text-3xl font-bold font-heading text-[var(--text-primary)] mb-4">
                Turn your digital skills into passive income.
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 text-lg leading-relaxed">
                Have a great notion template, a useful script, or a design kit? List it on our marketplace and start selling to thousands of learners instantly.
              </p>
              <button 
                className="btn-primary"
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
                  className={`px-6 py-2.5 rounded-[12px] text-sm font-bold transition-all duration-300 border ${
                    activeCategory === cat 
                      ? 'bg-[var(--brand-primary)] text-[var(--on-brand)] border-transparent'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-secondary)]" />
              <select className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] font-bold text-sm rounded-[12px] py-3 pl-12 pr-6 focus:outline-none focus:border-[var(--brand-primary)] appearance-none min-w-[180px] cursor-pointer">
                <option>Sort by: Popular</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => {
              const Icon = product.icon;
              return (
                <div 
                  key={product.id} 
                  className="premium-card flex flex-col group"
                >
                  <div className="w-16 h-16 rounded-[16px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mb-6 group-hover:border-[var(--brand-primary)] group-hover:scale-105 transition-all duration-500">
                    <Icon className="w-7 h-7 text-[var(--brand-primary)]" />
                  </div>
                  
                  <div className="mb-4 flex-1">
                    <span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2 block">
                      {product.category}
                    </span>
                    <h3 className="text-xl font-bold font-heading text-[var(--text-primary)] mb-2 group-hover:text-[var(--brand-primary)] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-sm font-medium text-[var(--text-secondary)]">By {product.creator}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-8">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-[var(--brand-primary)] fill-[var(--brand-primary)]" />
                      <span className="text-sm font-bold text-[var(--text-primary)]">{product.rating}</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--text-secondary)]">({product.reviews} reviews)</span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t border-[var(--border-color)] mt-auto">
                    <div className="text-2xl font-bold font-heading text-[var(--text-primary)]">
                      {product.price === 0 ? 'Free' : `$${product.price}`}
                    </div>
                    <button className="p-3 rounded-[12px] bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--brand-primary)] text-[var(--brand-primary)] transition-colors group-hover:bg-[var(--brand-primary)] group-hover:text-[var(--on-brand)]">
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
