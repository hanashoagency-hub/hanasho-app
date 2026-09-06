"use client";

import React from "react";

interface CourseVideoPlayerProps {
  videoId: string;
  title: string;
  className?: string;
}

export default function CourseVideoPlayer({
  videoId,
  title,
  className = "",
}: CourseVideoPlayerProps) {
  if (!videoId) return null;

  return (
    <div
      className={`relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm select-none group ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
        title={title}
        className="absolute inset-0 w-full h-full border-0 pointer-events-auto"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>

      {/* Top overlay: Covers YouTube's top title bar, Share button, and Copy link button */}
      <div
        className="absolute top-0 left-0 right-0 h-[80px] z-10 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-auto cursor-default flex items-start justify-between px-6 pt-4 select-none"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="text-white/95 text-sm md:text-base font-bold truncate max-w-[85%] font-heading drop-shadow-md">
          {title}
        </span>
      </div>

      {/* Bottom-right logo overlay: Blocks clicking YouTube logo / Watch on YouTube link */}
      <div
        className="absolute bottom-0 right-[45px] w-[150px] h-[55px] z-10 bg-transparent pointer-events-auto cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      ></div>
    </div>
  );
}
