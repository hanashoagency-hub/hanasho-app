"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Search,
  ExternalLink,
  Flame,
  Bitcoin,
  Server,
} from "lucide-react";
import {
  tools,
  categories,
  cryptoExchanges,
  hostingProviders,
  type Tool,
  type ExternalListing,
} from "@/data/ai-tools";

function ToolBadges({ item }: { item: Tool | ExternalListing }) {
  if (!item.isNew && !item.isTrending) return null;
  return (
    <div className="absolute top-4 right-4 flex gap-2">
      {item.isNew && (
        <span className="px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-[var(--on-brand)] bg-[var(--brand-primary)] rounded-[6px]">
          New
        </span>
      )}
      {item.isTrending && (
        <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-bold tracking-wider uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-[6px]">
          <Flame className="w-3 h-3" /> Trending
        </span>
      )}
    </div>
  );
}

const categoryIcons: Record<string, React.ElementType> = {
  "Artificial Intelligence": Flame,
  "Productivity": Server,
  "Writing": Sparkles,
  "Image Generation": Search,
  "Video Generation": Flame,
  "Coding AI": Server,
  "Marketing AI": Sparkles,
  "SEO Tools": Search,
};

function ToolCard({ item }: { item: Tool | ExternalListing }) {
  // Use category icon if it exists in our map, otherwise fallback to a default
  const IconComponent = "category" in item ? categoryIcons[item.category as string] || ExternalLink : ExternalLink;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="premium-card relative group flex flex-col"
    >
      <ToolBadges item={item} />
      <div className="flex items-center gap-3 mb-2 pr-16">
        <div className="w-8 h-8 rounded-[8px] bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center flex-shrink-0 group-hover:border-[var(--brand-primary)] transition-colors">
          <IconComponent className="w-4 h-4 text-[var(--brand-primary)]" />
        </div>
        <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
          {item.name}
        </h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6 flex-1 mt-1">
        {item.description}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {item.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-bold text-[var(--text-secondary)] bg-[var(--bg-primary)] border border-[var(--border-color)] px-2 py-1 rounded-[6px]"
            >
              {tag}
            </span>
          ))}
        </div>
        <ExternalLink className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--brand-primary)] transition-colors flex-shrink-0" />
      </div>
    </a>
  );
}

export default function AiToolsPage() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const filteredTools = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((tool) => {
      const matchesCategory = activeCategory === "All" || tool.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        tool.name.toLowerCase().includes(q) ||
        tool.description.toLowerCase().includes(q) ||
        tool.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, activeCategory]);

  return (
    <div className="min-h-screen bg-transparent pb-24 relative overflow-hidden">
      {/* Hero */}
      <div className="pt-32 pb-12 px-6 md:px-10">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold font-heading text-[var(--text-primary)] tracking-tight mb-6 flex justify-center items-center gap-4">
            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-[var(--brand-primary)]" />
            AI Tools Explorer
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
            Discover the newest and most important digital tools — from AI assistants to coding
            copilots, curated for the modern digital professional.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools by name, feature, or tag..."
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[16px] py-4 pl-14 pr-6 focus:outline-none focus:border-[var(--brand-primary)] transition-colors"
          />
        </div>

        {/* Category Filters */}
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-3 mb-16">
          {["All", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-[12px] text-sm font-bold transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-[var(--brand-primary)] text-[var(--on-brand)] border-transparent"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:border-[var(--brand-primary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tool Grid */}
        <div className="max-w-7xl mx-auto">
          {filteredTools.length === 0 ? (
            <div className="text-center py-20 premium-card">
              <Search className="w-12 h-12 text-[var(--text-secondary)] mx-auto mb-4" />
              <h2 className="font-heading text-2xl font-bold text-[var(--text-primary)] mb-2">No tools found</h2>
              <p className="text-[var(--text-secondary)]">Try a different search term or category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTools.map((tool) => (
                <ToolCard key={tool.name} item={tool} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Best Crypto Exchanges */}
      <section className="py-16 px-6 md:px-10 border-t border-[var(--border-color)] bg-[var(--bg-secondary)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="inline-flex rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] p-3">
              <Bitcoin className="h-6 w-6 text-[var(--brand-primary)]" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Best Crypto Exchanges
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cryptoExchanges.map((item) => (
              <ToolCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Hosting Providers */}
      <section className="py-16 px-6 md:px-10 border-t border-[var(--border-color)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-10">
            <div className="inline-flex rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] p-3">
              <Server className="h-6 w-6 text-[var(--brand-primary)]" />
            </div>
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
              Best Hosting Providers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hostingProviders.map((item) => (
              <ToolCard key={item.name} item={item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
