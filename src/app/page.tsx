"use client";

import React, { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Sparkles,
  Globe,
  Play,
  Loader2,
  Zap,
  BookOpen,
  Languages,
  ArrowRight,
  CheckCircle2,
  History,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const LANGUAGES = [
  { code: "Thai", label: "🇹🇭 Thai" },
  { code: "Japanese", label: "🇯🇵 Japanese" },
  { code: "Korean", label: "🇰🇷 Korean" },
  { code: "Chinese", label: "🇨🇳 Chinese (Simplified)" },
  { code: "Spanish", label: "🇪🇸 Spanish" },
  { code: "French", label: "🇫🇷 French" },
  { code: "German", label: "🇩🇪 German" },
  { code: "Portuguese", label: "🇧🇷 Portuguese" },
  { code: "Arabic", label: "🇸🇦 Arabic" },
  { code: "Hindi", label: "🇮🇳 Hindi" },
];

const FEATURES = [
  {
    icon: Languages,
    title: "AI Translation",
    desc: "Powered by Claude 3 on AWS Bedrock",
  },
  {
    icon: BookOpen,
    title: "Education Portal",
    desc: "AI-powered summaries, quizzes, and vocabulary pools from your learning content",
  },
  {
    icon: Zap,
    title: "Instant Caching",
    desc: "DynamoDB-backed for lightning-fast reloads",
  },
];

interface CourseSummary {
  video_id: string;
  video_url: string;
  title: string;
  target_lang: string;
}

function extractYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    const v = u.searchParams.get("v");
    if (v) return v;
    const parts = u.pathname.split("/");
    const embedIdx = parts.indexOf("embed");
    if (embedIdx >= 0 && parts[embedIdx + 1]) return parts[embedIdx + 1];
    return null;
  } catch {
    return null;
  }
}

export default function HomePage() {
  const router = useRouter();
  const [videoURL, setVideoURL] = useState("");
  const [targetLang, setTargetLang] = useState("Thai");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recentCourses, setRecentCourses] = useState<CourseSummary[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/courses`)
      .then((r) => r.json())
      .then((data) => setRecentCourses(data.courses || []))
      .catch(() => setRecentCourses([]));
  }, []);

  const loadingSteps = [
    "Connecting to AWS Bedrock...",
    "Processing with Claude 3 Haiku...",
    "Generating translations...",
    "Building interactive transcript...",
  ];

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const id = extractYouTubeId(videoURL);
    if (!id) {
      setError("Invalid YouTube URL");
      return;
    }
    setIsLoading(true);
    setLoadingStep(0);
    router.push(`/course?v=${encodeURIComponent(id)}&lang=${encodeURIComponent(targetLang)}`);
  };

  const handleOpenRecent = (course: CourseSummary) => {
    router.push(
      `/course?v=${encodeURIComponent(course.video_id)}&lang=${encodeURIComponent(course.target_lang)}`
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Soft sky gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-sky-200/40 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-cyan-100/30 rounded-full blur-[100px] animate-float" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(rgba(14,165,233,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.4) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Bridge AI"
              width={40}
              height={40}
              className="w-10 h-10 object-contain"
              priority
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Bridge{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                  AI
                </span>
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] -mt-0.5">
                Creator Portal
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 border-emerald-200 text-emerald-600 gap-1.5"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AWS Connected
          </Badge>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge
            variant="outline"
            className="bg-sky-500/10 border-sky-500/20 text-sky-700 gap-1.5 mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            Powered by AWS Bedrock &amp; Claude 3
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Transform lectures into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500">
              multilingual learning
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Generate interactive, translated study materials from any lecture
            video. Built for course creators who want to reach a global audience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((feature, i) => (
            <Card
              key={i}
              className="group bg-card/50 border-border hover:border-primary/20 transition-all duration-500 hover:bg-card/80"
            >
              <CardContent className="p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-5 h-5 text-sky-500" />
                </div>
                <h3 className="text-sm font-semibold text-foreground/80 mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card/60 border-border backdrop-blur-sm shadow-2xl shadow-sky-500/5">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center">
                  <Play className="w-4 h-4 text-sky-500" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    Generate Course Assets
                  </CardTitle>
                  <CardDescription>
                    Paste a YouTube URL and select target language
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* YouTube URL Input */}
                <div className="space-y-2">
                  <label
                    htmlFor="youtube-url"
                    className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    YouTube Video URL
                  </label>
                  <Input
                    id="youtube-url"
                    type="url"
                    required
                    value={videoURL}
                    onChange={(e) => setVideoURL(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    disabled={isLoading}
                    className="bg-secondary/50 border-border"
                  />
                </div>

                {/* Language Selector */}
                <div className="space-y-2">
                  <label
                    htmlFor="target-lang"
                    className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
                  >
                    Target Language
                  </label>
                  <Select
                    value={targetLang}
                    onValueChange={setTargetLang}
                    disabled={isLoading}
                  >
                    <SelectTrigger
                      id="target-lang"
                      className="bg-secondary/50 border-border"
                    >
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select language" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading || !videoURL}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-lg shadow-sky-500/20 hover:shadow-sky-500/30 h-11"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{loadingSteps[loadingStep]}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Course Assets</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </Button>
              </form>

              {/* Loading Progress */}
              {isLoading && (
                <>
                  <Separator className="my-5" />
                  <div className="space-y-2.5">
                    {loadingSteps.map((step, i) => (
                      <div
                        key={i}
                        className={`flex items-center gap-2.5 text-xs transition-all duration-500 ${i <= loadingStep
                            ? "text-foreground/60"
                            : "text-muted-foreground/30"
                          }`}
                      >
                        {i < loadingStep ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : i === loadingStep ? (
                          <Loader2 className="w-4 h-4 text-primary animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border" />
                        )}
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Bottom info */}
          <p className="text-center text-xs text-muted-foreground/50 mt-6">
            Bridge AI uses AWS Bedrock (Claude 3 Haiku) for translations and
            DynamoDB for intelligent caching.
          </p>
        </div>

        {/* Recent Courses */}
        {recentCourses.length > 0 && (
          <div className="max-w-5xl mx-auto mt-20">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-4 h-4 text-sky-500" />
              <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
                Recently Generated
              </h3>
              <Badge variant="outline" className="ml-auto text-xs">
                {recentCourses.length} courses
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentCourses.map((course) => (
                <button
                  key={`${course.video_id}-${course.target_lang}`}
                  onClick={() => handleOpenRecent(course)}
                  disabled={isLoading}
                  className="group text-left bg-card/50 hover:bg-card/80 border border-border hover:border-sky-500/30 rounded-xl p-4 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-sky-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground/90 truncate">
                        {course.title || course.video_id}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-[10px] py-0 px-1.5 bg-sky-500/10 border-sky-500/20 text-sky-700"
                        >
                          {course.target_lang}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {course.video_id}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-sky-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
