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

  useEffect(() => {
    if (!v || !lang) {
      setError("Missing video or language parameter");
      return;
    }

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
      .then((d: ProcessResponse) => setData(d))
      .catch((err) => setError(err.message));
  }, [v, lang]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading course...
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
