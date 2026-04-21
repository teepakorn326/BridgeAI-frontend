"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import LectureStudy from "@/components/LectureStudy";
import { ProcessResponse } from "@/types";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function UdemyCourseInner() {
  const router = useRouter();
  const params = useSearchParams();
  const v = params.get("v");
  const lang = params.get("lang");

  const [data, setData] = useState<ProcessResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!v || !lang) {
      setNotFound(true);
      return;
    }
    fetch(
      `${API_BASE}/api/course?id=${encodeURIComponent(v)}&lang=${encodeURIComponent(lang)}`,
      { credentials: "include" }
    )
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load course");
        }
        return r.json();
      })
      .then((d: ProcessResponse | null) => {
        if (d) setData(d);
      })
      .catch((err) => setError(err.message));
  }, [v, lang]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button onClick={() => router.push("/home")} className="text-sm text-sky-500 hover:underline">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-16">
        <div className="max-w-xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-sm border border-border shadow-xl">
            <CardContent className="p-8 space-y-4 text-center">
              <div className="text-4xl">🎓</div>
              <h1 className="text-2xl font-bold tracking-tight">Udemy lectures</h1>
              <p className="text-sm text-muted-foreground">
                No Udemy capture yet. Open a Udemy lecture, click the BridgeAI
                icon, and choose <span className="font-medium">Save Lecture to Dashboard</span>.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" onClick={() => router.push("/home")}>
                  Back to dashboard
                </Button>
                <Button
                  className="bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                  onClick={() => router.push("/link-extension")}
                >
                  Link extension
                </Button>
              </div>
            </CardContent>
          </Card>
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

  return <LectureStudy data={data} onBack={() => router.push("/home")} />;
}

export default function UdemyCoursePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <UdemyCourseInner />
    </Suspense>
  );
}
