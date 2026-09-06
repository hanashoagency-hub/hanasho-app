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
      {/* Standard iframe without physical cropping */}
      <div className="absolute inset-0 pointer-events-auto">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
          title={title}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
        ></iframe>
      </div>

      {/* Targeted overlay: blocks clicks specifically on the top-right YouTube Share / Copy Link button */}
      <div
        className="absolute top-0 right-0 w-[150px] h-[70px] z-[999] pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      ></div>

      {/* Bottom-right overlay: blocks Watch on YouTube logo */}
      <div
        className="absolute bottom-0 right-[30px] w-[180px] h-[50px] z-[999] pointer-events-auto cursor-default bg-transparent"
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => { e.stopPropagation(); }}
        onTouchMove={(e) => { e.stopPropagation(); }}
        onTouchEnd={(e) => { e.stopPropagation(); }}
      ></div>
    </div>
  );
}
