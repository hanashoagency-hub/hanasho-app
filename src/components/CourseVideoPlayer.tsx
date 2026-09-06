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
      className={`relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm select-none ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1`}
        title={title}
        className="absolute inset-0 w-full h-full border-0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        sandbox="allow-scripts allow-same-origin allow-presentation"
      ></iframe>
      {/* Top overlay: blocks clicking video title, share button, and copy link icon */}
      <div
        className="absolute top-0 left-0 w-full h-[75px] z-10 bg-transparent cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      ></div>
      {/* Bottom-right overlay: blocks clicking YouTube logo and Watch on YouTube link */}
      <div
        className="absolute bottom-0 right-0 w-[200px] h-[65px] z-10 bg-transparent cursor-default"
        onContextMenu={(e) => e.preventDefault()}
        onClick={(e) => e.stopPropagation()}
      ></div>
    </div>
  );
}
