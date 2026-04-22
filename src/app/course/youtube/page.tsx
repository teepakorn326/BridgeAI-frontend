"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CoursePlayer from "@/components/CoursePlayer";
import { ProcessResponse } from "@/types";
import { API_BASE } from "@/lib/api";

function YoutubeCourseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const v = params.get("v");
  const lang = params.get("lang");

  const [data, setData] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!v || !lang) {
      setError("This lecture link is missing a video or language. Head back to the dashboard and open it from there.");
      return;
    }

    setProgress(3);
    const tick = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) return p;
        const remaining = 95 - p;
        return Math.min(95, p + Math.max(0.4, remaining * 0.04));
      });
    }, 400);

    const videoUrl = `https://www.youtube.com/watch?v=${v}`;
    fetch(`${API_BASE}/api/process-course`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ video_url: videoUrl, target_lang: lang }),
    })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load course");
        }
        return r.json();
      })
      .then((d: ProcessResponse) => {
        setProgress(100);
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => clearInterval(tick));

    return () => clearInterval(tick);
  }, [v, lang]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="text-4xl">📼</div>
          <h1 className="text-lg font-semibold tracking-tight">We couldn&apos;t load this lecture</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{error}</p>
          <button
            onClick={() => router.push("/home")}
            className="text-sm text-sky-500 hover:underline"
          >
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    const pct = Math.floor(progress);
    const label =
      pct < 30
        ? "Fetching transcript"
        : pct < 70
        ? "Translating segments"
        : pct < 100
        ? "Finalising subtitles"
        : "Ready";
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="w-full max-w-sm px-6 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{label}…</span>
            </div>
            <span
              className="font-mono tabular-nums text-foreground"
              aria-live="polite"
            >
              {pct}%
            </span>
          </div>
          <div
            className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full bg-foreground/80 transition-[width] duration-300 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  return <CoursePlayer data={data} onBack={() => router.push("/home")} />;
}

export default function YoutubeCoursePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <YoutubeCourseInner />
    </Suspense>
  );
}
