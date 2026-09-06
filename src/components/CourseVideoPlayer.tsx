"use client";

import React, { useRef, useEffect, useState } from "react";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  if (!videoId) return null;

  return (
    <>
      {/* Global styles that prevent selecting/copying from the player area */}
      <style jsx global>{`
        .yt-secure-player {
          position: relative;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .yt-secure-player::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          z-index: 999;
          background: linear-gradient(to bottom, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.85) 60%, transparent 100%);
          pointer-events: auto;
          cursor: default;
        }
        .yt-secure-player::after {
          content: '';
          position: absolute;
          bottom: 0;
          right: 30px;
          width: 180px;
          height: 50px;
          z-index: 999;
          pointer-events: auto;
          cursor: default;
        }
        .yt-secure-player iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          z-index: 1;
        }
        .yt-secure-title {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 56px;
          z-index: 1000;
          display: flex;
          align-items: center;
          padding: 0 20px;
          pointer-events: auto;
          cursor: default;
          background: linear-gradient(to bottom, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.90) 55%, transparent 100%);
        }
      `}</style>

      <div
        ref={containerRef}
        className={`yt-secure-player relative w-full aspect-video rounded-[20px] md:rounded-[24px] overflow-hidden border border-[var(--border-color)] bg-black shadow-sm ${className}`}
        onContextMenu={(e) => e.preventDefault()}
      >
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&playsinline=1&fs=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onLoad={() => setIframeLoaded(true)}
        ></iframe>

        {/* Solid title bar overlay — sits above ::before pseudo-element with z-1000 */}
        <div
          className="yt-secure-title"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="text-white text-sm md:text-base font-bold truncate max-w-[90%] font-heading drop-shadow-lg">
            {title}
          </span>
        </div>
      </div>
    </>
  );
}
