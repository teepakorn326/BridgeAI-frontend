"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import { Play, Globe, Clock, ChevronRight, Sparkles } from "lucide-react";
import { ProcessResponse, SubtitleLine } from "@/types";

interface CoursePlayerProps {
  data: ProcessResponse;
  onBack: () => void;
}

export default function CoursePlayer({ data, onBack }: CoursePlayerProps) {
  const playerRef = useRef<HTMLVideoElement>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Track current time via timeupdate event on the underlying video element
  const handleTimeUpdate = useCallback(
    (e: React.SyntheticEvent<HTMLVideoElement>) => {
      const time = e.currentTarget.currentTime;
      setCurrentTime(time);

      const newIndex = data.subtitles.findIndex(
        (sub) => time >= sub.start_seconds && time < sub.end_seconds
      );

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex);
      }
    },
    [data.subtitles, activeIndex]
  );

  // Auto-scroll to active subtitle
  useEffect(() => {
    if (activeIndex >= 0 && transcriptRef.current) {
      const activeElement = transcriptRef.current.querySelector(
        `[data-index="${activeIndex}"]`
      );
      if (activeElement) {
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeIndex]);

  const handleSeek = (startSeconds: number) => {
    if (playerRef.current) {
      playerRef.current.currentTime = startSeconds;
      playerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isActive = (sub: SubtitleLine): boolean => {
    return currentTime >= sub.start_seconds && currentTime < sub.end_seconds;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Top Navigation */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors group"
            >
              <ChevronRight className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
              Back to Dashboard
            </button>
            <div className="w-px h-5 bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/40">
                {data.from_cache ? "Loaded from cache" : "Freshly generated"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Globe className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-white/70">
              {data.target_lang}
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="flex gap-6 h-[calc(100vh-80px)]">
          {/* Left: Video Player (70%) */}
          <div className="flex-[7] flex flex-col min-w-0">
            {/* Video Container */}
            <div className="relative w-full rounded-2xl overflow-hidden bg-black/50 border border-white/5 shadow-2xl shadow-violet-500/5">
              <div className="aspect-video">
                <ReactPlayer
                  ref={playerRef}
                  src={data.video_url}
                  width="100%"
                  height="100%"
                  playing={isPlaying}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onTimeUpdate={handleTimeUpdate}
                  controls
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                      },
                    },
                  } as any}
                />
              </div>
            </div>

            {/* Course Info Below Video */}
            <div className="mt-5 space-y-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {data.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-white/40">
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5" />
                  <span>Video ID: {data.video_id}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{data.subtitles.length} translated segments</span>
                </div>
              </div>
            </div>

            {/* Currently Playing Subtitle - Large Display */}
            {activeIndex >= 0 && (
              <div className="mt-6 p-5 rounded-xl bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-500/20 backdrop-blur-sm animate-fade-in">
                <p className="text-lg text-white/90 font-medium leading-relaxed">
                  {data.subtitles[activeIndex].text_en}
                </p>
                <p className="text-lg text-violet-300 font-medium leading-relaxed mt-2">
                  {data.subtitles[activeIndex].text_translated}
                </p>
              </div>
            )}
          </div>

          {/* Right: Interactive Transcript (30%) */}
          <div className="flex-[3] flex flex-col min-w-[320px] max-w-[450px]">
            <div className="rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col h-full overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white/80 uppercase tracking-wider">
                    Interactive Transcript
                  </h2>
                  <span className="text-xs text-white/30 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        data.subtitles.length > 0
                          ? Math.min(
                              ((activeIndex + 1) / data.subtitles.length) * 100,
                              100
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Subtitle List */}
              <div
                ref={transcriptRef}
                className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin"
              >
                {data.subtitles.map((sub, index) => {
                  const active = isActive(sub);
                  const isPast = currentTime >= sub.end_seconds;

                  return (
                    <button
                      key={index}
                      data-index={index}
                      onClick={() => handleSeek(sub.start_seconds)}
                      className={`
                        w-full text-left p-3.5 rounded-xl transition-all duration-300 group relative
                        ${
                          active
                            ? "bg-gradient-to-r from-violet-500/15 to-blue-500/15 border border-violet-500/30 shadow-lg shadow-violet-500/10 scale-[1.02]"
                            : isPast
                            ? "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/5 opacity-60 hover:opacity-100"
                            : "bg-white/[0.02] border border-transparent hover:bg-white/[0.04] hover:border-white/5"
                        }
                      `}
                    >
                      {/* Active indicator line */}
                      {active && (
                        <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-violet-400 to-blue-400 rounded-full" />
                      )}

                      {/* Timestamp */}
                      <div className="flex items-center gap-2 mb-2">
                        <Clock
                          className={`w-3 h-3 ${
                            active ? "text-violet-400" : "text-white/20"
                          }`}
                        />
                        <span
                          className={`text-xs font-mono ${
                            active
                              ? "text-violet-400 font-semibold"
                              : "text-white/30"
                          }`}
                        >
                          {formatTime(sub.start_seconds)} —{" "}
                          {formatTime(sub.end_seconds)}
                        </span>
                      </div>

                      {/* English Text */}
                      <p
                        className={`text-sm leading-relaxed ${
                          active
                            ? "text-white font-medium"
                            : "text-white/60 group-hover:text-white/80"
                        }`}
                      >
                        {sub.text_en}
                      </p>

                      {/* Translated Text */}
                      <p
                        className={`text-sm leading-relaxed mt-1.5 ${
                          active
                            ? "text-violet-300"
                            : "text-white/30 group-hover:text-white/50"
                        }`}
                      >
                        {sub.text_translated}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
