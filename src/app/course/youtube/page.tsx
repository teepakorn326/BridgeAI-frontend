"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import CoursePlayer from "@/components/CoursePlayer";
import { ProcessResponse } from "@/types";
import { API_BASE } from "@/lib/api";

type Stage = "fetching" | "translating" | "finalising";
type RawSegment = { start: number; end: number; text: string };
type TranslatedSegment = RawSegment & { translation: string };

const BATCH_SIZE = 50;

// Stage weights — should sum to 100. Progress flows linearly within each stage.
const STAGE_WEIGHTS: Record<Stage, [number, number]> = {
  fetching: [0, 15],
  translating: [15, 90],
  finalising: [90, 100],
};

function YoutubeCourseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const v = params.get("v");
  const lang = params.get("lang");

  const [data, setData] = useState<ProcessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<Stage>("fetching");

  useEffect(() => {
    if (!v || !lang) {
      setError("This lecture link is missing a video or language. Head back to the dashboard and open it from there.");
      return;
    }

    let cancelled = false;

    const setStageProgress = (s: Stage, fraction: number) => {
      if (cancelled) return;
      setStage(s);
      const [start, end] = STAGE_WEIGHTS[s];
      const clamped = Math.max(0, Math.min(1, fraction));
      setProgress(start + (end - start) * clamped);
    };

    const videoUrl = `https://www.youtube.com/watch?v=${v}`;

    (async () => {
      try {
        // ── Stage 1: fetch transcript (or cache hit) ──────────────────────
        setStageProgress("fetching", 0);
        const fetchRes = await fetch(`${API_BASE}/api/fetch-transcript`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoUrl, target_lang: lang }),
        });
        if (!fetchRes.ok) {
          const err = await fetchRes.json().catch(() => ({}));
          throw new Error(err.error || "Failed to fetch transcript");
        }
        const fetchData = await fetchRes.json();

        if (fetchData.cached) {
          if (cancelled) return;
          setProgress(100);
          setData(fetchData.cached as ProcessResponse);
          return;
        }

        setStageProgress("fetching", 1);

        // ── Stage 2: batch-translate ──────────────────────────────────────
        const segments: RawSegment[] = fetchData.segments || [];
        if (segments.length === 0) {
          throw new Error("Transcript is empty");
        }

        const totalBatches = Math.ceil(segments.length / BATCH_SIZE);
        const translated: TranslatedSegment[] = [];
        setStageProgress("translating", 0);

        for (let i = 0; i < totalBatches; i++) {
          if (cancelled) return;
          const batch = segments.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
          const res = await fetch(`${API_BASE}/api/translate-segments`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ segments: batch, target_lang: lang }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Translation failed");
          }
          const { segments: out } = await res.json();
          translated.push(...(out as TranslatedSegment[]));
          setStageProgress("translating", (i + 1) / totalBatches);
        }

        // ── Stage 3: save + receive final ProcessResponse ─────────────────
        setStageProgress("finalising", 0);
        const subtitles = translated.map((t) => ({
          start_seconds: t.start,
          end_seconds: t.end,
          text_en: t.text,
          text_translated: t.translation,
        }));
        const ingestRes = await fetch(`${API_BASE}/api/ingest-course`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            source: "youtube",
            source_url: fetchData.video_url,
            title: fetchData.title,
            target_lang: lang,
            subtitles,
          }),
        });
        if (!ingestRes.ok) {
          const err = await ingestRes.json().catch(() => ({}));
          throw new Error(err.error || "Failed to save course");
        }
        const final: ProcessResponse = await ingestRes.json();
        if (cancelled) return;
        setProgress(100);
        setData(final);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load course");
      }
    })();

    return () => {
      cancelled = true;
    };
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
      stage === "fetching"
        ? "Fetching transcript"
        : stage === "translating"
        ? "Translating segments"
        : "Finalising subtitles";
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
