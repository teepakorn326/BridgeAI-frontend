"use client";

import React, { useState, FormEvent } from "react";
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
  Brain,
} from "lucide-react";
import CoursePlayer from "@/components/CoursePlayer";
import { ProcessResponse } from "@/types";

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
    title: "Interactive Transcripts",
    desc: "Click-to-seek karaoke-style subtitles",
  },
  {
    icon: Zap,
    title: "Instant Caching",
    desc: "DynamoDB-backed for lightning-fast reloads",
  },
];

export default function HomePage() {
  const [videoURL, setVideoURL] = useState("");
  const [targetLang, setTargetLang] = useState("Thai");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courseData, setCourseData] = useState<ProcessResponse | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    "Connecting to AWS Bedrock...",
    "Processing with Claude 3 Haiku...",
    "Generating translations...",
    "Building interactive transcript...",
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    setLoadingStep(0);

    // Animate through loading steps
    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2000);

    try {
      const response = await fetch("http://localhost:8080/api/process-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: videoURL,
          target_lang: targetLang,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Server returned an error");
      }

      const data: ProcessResponse = await response.json();
      setCourseData(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to connect to server"
      );
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setCourseData(null);
    setVideoURL("");
    setError(null);
  };

  // If we have course data, show the player
  if (courseData) {
    return <CoursePlayer data={courseData} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-float-delayed" />
        <div className="absolute top-[40%] right-[20%] w-[300px] h-[300px] bg-emerald-600/5 rounded-full blur-[100px] animate-float" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0a0a0f]/60 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                StudyMind{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">
                  AI
                </span>
              </h1>
              <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] -mt-0.5">
                Creator Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">
              AWS Connected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs font-medium text-violet-300">
              Powered by AWS Bedrock &amp; Claude 3
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-5">
            Transform lectures into
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-emerald-400">
              multilingual learning
            </span>
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed">
            Generate interactive, translated study materials from any lecture
            video. Built for course creators who want to reach a global audience.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
          {FEATURES.map((feature, i) => (
            <div
              key={i}
              className="group p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-500 hover:bg-white/[0.04]"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-sm font-semibold text-white/80 mb-1">
                {feature.title}
              </h3>
              <p className="text-xs text-white/30">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* Main Form Card */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-8 backdrop-blur-sm shadow-2xl shadow-violet-500/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                <Play className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white/90">
                  Generate Course Assets
                </h3>
                <p className="text-xs text-white/30">
                  Paste a YouTube URL and select target language
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* YouTube URL Input */}
              <div>
                <label
                  htmlFor="youtube-url"
                  className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2"
                >
                  YouTube Video URL
                </label>
                <input
                  id="youtube-url"
                  type="url"
                  required
                  value={videoURL}
                  onChange={(e) => setVideoURL(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* Language Selector */}
              <div>
                <label
                  htmlFor="target-lang"
                  className="block text-xs font-medium text-white/40 uppercase tracking-wider mb-2"
                >
                  Target Language
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                  <select
                    id="target-lang"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all appearance-none cursor-pointer"
                    disabled={isLoading}
                  >
                    {LANGUAGES.map((lang) => (
                      <option
                        key={lang.code}
                        value={lang.code}
                        className="bg-[#1a1a2e] text-white"
                      >
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !videoURL}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-sm hover:from-violet-500 hover:to-blue-500 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 group shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
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
              </button>
            </form>

            {/* Loading Progress */}
            {isLoading && (
              <div className="mt-6 space-y-2">
                {loadingSteps.map((step, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs transition-all duration-500 ${
                      i <= loadingStep
                        ? "text-white/60"
                        : "text-white/15"
                    }`}
                  >
                    {i < loadingStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : i === loadingStep ? (
                      <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-white/10" />
                    )}
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom info */}
          <p className="text-center text-xs text-white/20 mt-6">
            StudyMind AI uses AWS Bedrock (Claude 3 Haiku) for translations and
            DynamoDB for intelligent caching.
          </p>
        </div>
      </main>
    </div>
  );
}
