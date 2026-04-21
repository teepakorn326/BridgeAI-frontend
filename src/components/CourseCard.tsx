"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type Platform = "youtube" | "udemy" | "coursera" | "echo360" | "other";

const PLATFORM_META: Record<
  Platform,
  { label: string; gradient: string; initial: string }
> = {
  youtube: {
    label: "YouTube",
    gradient: "from-red-500 to-rose-600",
    initial: "YT",
  },
  udemy: {
    label: "Udemy",
    gradient: "from-violet-500 to-purple-700",
    initial: "UD",
  },
  coursera: {
    label: "Coursera",
    gradient: "from-blue-500 to-indigo-700",
    initial: "CS",
  },
  echo360: {
    label: "Echo360",
    gradient: "from-emerald-500 to-teal-700",
    initial: "E360",
  },
  other: {
    label: "Video",
    gradient: "from-slate-500 to-slate-700",
    initial: "··",
  },
};

export function detectPlatform(url: string): Platform {
  if (/youtube\.com|youtu\.be/i.test(url)) return "youtube";
  if (/udemy\.com/i.test(url)) return "udemy";
  if (/coursera\.org/i.test(url)) return "coursera";
  if (/echo360\./i.test(url)) return "echo360";
  return "other";
}

export function platformMeta(platform: Platform) {
  return PLATFORM_META[platform];
}

interface CourseCardProps {
  videoId: string;
  videoUrl: string;
  title: string;
  targetLang: string;
  onClick?: () => void;
  size?: "default" | "large";
}

export function CourseCard({
  videoId,
  videoUrl,
  title,
  targetLang,
  onClick,
  size = "default",
}: CourseCardProps) {
  const platform = detectPlatform(videoUrl);
  const meta = PLATFORM_META[platform];
  const ytThumb =
    platform === "youtube"
      ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
      : null;
  const [imgFailed, setImgFailed] = useState(false);

  const width =
    size === "large"
      ? "w-[280px] md:w-[320px] flex-shrink-0"
      : "w-full";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group text-left ${width} focus:outline-none`}
    >
      <div className="relative aspect-video rounded-xl overflow-hidden border border-border bg-muted">
        {ytThumb && !imgFailed ? (
          <>
            <img
              src={ytThumb}
              alt=""
              onError={() => setImgFailed(true)}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
          </>
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br ${meta.gradient} flex items-center justify-center`}
          >
            <span className="text-white/90 text-2xl font-semibold tracking-tight">
              {meta.label}
            </span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-1 rounded-md bg-background/90 backdrop-blur text-foreground/80">
            {meta.label}
          </span>
        </div>
      </div>
      <div className="pt-3 px-0.5">
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-sky-700 transition-colors">
          {title || videoId}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <Badge
            variant="outline"
            className="text-[10px] py-0 px-1.5 bg-sky-50 border-sky-200 text-sky-700"
          >
            {targetLang}
          </Badge>
          <span className="text-[11px] text-muted-foreground truncate">
            {videoId}
          </span>
        </div>
      </div>
    </button>
  );
}
