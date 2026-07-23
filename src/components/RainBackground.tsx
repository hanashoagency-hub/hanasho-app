"use client";

import { useEffect, useRef } from "react";

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

export default function RainBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let drops: Drop[] = [];
    let rafId = 0;
    let running = true;

    const rainColorOf = () =>
      getComputedStyle(document.documentElement).getPropertyValue("--rain-color").trim() || "200, 230, 210";
    const rainOpacityOf = () =>
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rain-opacity")) || 0.3;

    const makeDrop = (): Drop => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: 12 + Math.random() * 18,
      speed: 4 + Math.random() * 6,
      opacity: 0.15 + Math.random() * 0.35,
    });

    const resize = () => {
      width = canvas.width = window.innerWidth * window.devicePixelRatio;
      height = canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;

      const density = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      drops = Array.from({ length: density }, makeDrop);
    };

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);

      const rgb = rainColorOf();
      const baseOpacity = rainOpacityOf();

      ctx.lineWidth = 1 * window.devicePixelRatio;
      ctx.lineCap = "round";

      for (const drop of drops) {
        ctx.strokeStyle = `rgba(${rgb}, ${drop.opacity * baseOpacity})`;
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x, drop.y + drop.length * window.devicePixelRatio);
        ctx.stroke();

        drop.y += drop.speed * window.devicePixelRatio;
        if (drop.y > height) {
          drop.y = -drop.length * window.devicePixelRatio;
          drop.x = Math.random() * width;
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const handleVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) rafId = requestAnimationFrame(draw);
      else cancelAnimationFrame(rafId);
    };

    resize();
    rafId = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 z-[-1] pointer-events-none"
    />
  );
}
