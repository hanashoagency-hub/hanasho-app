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
      className={`relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-black shadow-sm select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>

      {/* Top overlay: covers YouTube title bar, Share button, Copy Link button */}
      <div
        className="absolute top-0 left-0 right-0 h-[60px] z-[999] pointer-events-auto cursor-default"
        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 55%, transparent 100%)' }}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onContextMenu={(e) => e.preventDefault()}
      >
        <div className="flex items-center h-full px-5">
          <span className="text-white text-sm md:text-base font-bold truncate max-w-[90%] font-heading drop-shadow-lg">
            {title}
          </span>
        </div>
      </div>

      {/* Bottom-right overlay: blocks Watch on YouTube logo */}
      <div
        className="absolute bottom-0 right-[30px] w-[180px] h-[50px] z-[999] pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onContextMenu={(e) => e.preventDefault()}
      ></div>
    </div>
  );
}
