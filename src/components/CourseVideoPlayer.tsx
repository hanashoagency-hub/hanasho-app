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
      className={`relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-black shadow-sm select-none group ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 
        Iframe container with overflow-hidden:
        Shifting top: -12% and setting height: 124% crops out YouTube's top header bar
        (which contains YouTube's title, Share button, and Copy Link icon).
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-auto">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
          title={title}
          className="absolute top-[-12%] left-0 w-full h-[124%] border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>

      {/* Top Overlay: Shows lesson title and intercepts any top pointer events */}
      <div
        className="absolute top-0 left-0 right-0 h-[65px] z-20 bg-gradient-to-b from-black/95 via-black/60 to-transparent pointer-events-auto cursor-default flex items-center justify-between px-6 select-none"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <span className="text-white/95 text-sm md:text-base font-bold truncate max-w-[90%] font-heading drop-shadow-md">
          {title}
        </span>
      </div>

      {/* Bottom-right Overlay: Blocks YouTube logo / "Watch on YouTube" button */}
      <div
        className="absolute bottom-0 right-[40px] w-[160px] h-[55px] z-20 bg-transparent pointer-events-auto cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      ></div>
    </div>
  );
}
