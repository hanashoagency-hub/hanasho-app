"use client";

import { Play } from "lucide-react";

// TODO: replace with the real HanHub tutorial playlist/video URL once available.
const TUTORIAL_URL = "https://www.youtube.com/@hanhub";

export default function TutorialButton() {
  return (
    <a
      href={TUTORIAL_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-primary)] text-[var(--on-brand)] shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg animate-tutorial-pulse"
      aria-label="Watch HanHub tutorials on YouTube"
      title="Watch tutorials"
    >
      <Play className="h-6 w-6 fill-current" />
    </a>
  );
}
