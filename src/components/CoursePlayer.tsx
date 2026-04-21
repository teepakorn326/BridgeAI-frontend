"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import ReactPlayer from "react-player";
import {
  Play,
  Globe,
  Clock,
  ChevronLeft,
  Sparkles,
  FileText,
  HelpCircle,
  BookOpen,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { ProcessResponse, SubtitleLine } from "@/types";
import { API_BASE } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface CoursePlayerProps {
  data: ProcessResponse;
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface VocabEntry {
  term: string;
  translation: string;
  definition: string;
}

type TabKey = "transcript" | "summary" | "quiz" | "vocab";

export default function CoursePlayer({ data, onBack }: CoursePlayerProps) {
  const playerRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Tabs and study materials
  const [activeTab, setActiveTab] = useState<TabKey>("transcript");
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [vocab, setVocab] = useState<VocabEntry[] | null>(null);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<TabKey, string>>>({});

  const fetchStudyMaterial = useCallback(
    async (kind: "summarize" | "quiz" | "vocab") => {
      const res = await fetch(`${API_BASE}/api/${kind}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_url: data.video_url,
          target_lang: data.target_lang,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load ${kind}`);
      }
      return res.json();
    },
    [data.video_url, data.target_lang]
  );

  const loadSummary = useCallback(() => {
    setSummaryLoading(true);
    setErrors((e) => ({ ...e, summary: undefined }));
    fetchStudyMaterial("summarize")
      .then((r) => setSummary(r.summary))
      .catch((e) => setErrors((prev) => ({ ...prev, summary: e.message })))
      .finally(() => setSummaryLoading(false));
  }, [fetchStudyMaterial]);

  const loadQuiz = useCallback(() => {
    setQuizLoading(true);
    setErrors((e) => ({ ...e, quiz: undefined }));
    fetchStudyMaterial("quiz")
      .then((r) => setQuiz(r.quiz))
      .catch((e) => setErrors((prev) => ({ ...prev, quiz: e.message })))
      .finally(() => setQuizLoading(false));
  }, [fetchStudyMaterial]);

  const loadVocab = useCallback(() => {
    setVocabLoading(true);
    setErrors((e) => ({ ...e, vocab: undefined }));
    fetchStudyMaterial("vocab")
      .then((r) => setVocab(r.vocab))
      .catch((e) => setErrors((prev) => ({ ...prev, vocab: e.message })))
      .finally(() => setVocabLoading(false));
  }, [fetchStudyMaterial]);

  // Lazy-load each tab's data on first open
  useEffect(() => {
    if (activeTab === "summary" && summary === null && !summaryLoading && !errors.summary) {
      loadSummary();
    }
    if (activeTab === "quiz" && quiz === null && !quizLoading && !errors.quiz) {
      loadQuiz();
    }
    if (activeTab === "vocab" && vocab === null && !vocabLoading && !errors.vocab) {
      loadVocab();
    }
  }, [activeTab, summary, summaryLoading, quiz, quizLoading, vocab, vocabLoading, errors, loadSummary, loadQuiz, loadVocab]);

  const ErrorBanner = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700">
      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium">Failed to load</p>
        <p className="text-xs text-red-600/80 mt-0.5 break-words">{message}</p>
      </div>
      <Button size="sm" variant="outline" className="h-7 gap-1" onClick={onRetry}>
        <RefreshCw className="w-3 h-3" /> Retry
      </Button>
    </div>
  );

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

  const progressPercent =
    data.subtitles.length > 0
      ? Math.min(((activeIndex + 1) / data.subtitles.length) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1800px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-muted-foreground hover:text-foreground gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <Separator orientation="vertical" className="h-5" />
            <Badge
              variant="outline"
              className={`gap-1.5 text-xs ${
                data.from_cache
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-sky-50 border-sky-200 text-sky-600"
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  data.from_cache ? "bg-emerald-500" : "bg-sky-500"
                }`}
              />
              {data.from_cache ? "Loaded from cache" : "Freshly generated"}
            </Badge>
          </div>
          <Badge
            variant="outline"
            className="bg-primary/10 border-primary/20 text-primary gap-1.5"
          >
            <Globe className="w-3.5 h-3.5" />
            {data.target_lang}
          </Badge>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto p-6">
        <div className="flex gap-6 h-[calc(100vh-80px)]">
          {/* Left: Video Player (70%) */}
          <div className="flex-[7] flex flex-col min-w-0">
            {/* Video Container */}
            <Card className="overflow-hidden bg-slate-900 border-border shadow-2xl shadow-sky-500/10">
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
            </Card>

            {/* Course Info Below Video */}
            <div className="mt-5 space-y-3">
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                {data.title}
              </h1>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="gap-1.5">
                  <Play className="w-3 h-3" />
                  {data.video_id}
                </Badge>
                <Badge variant="secondary" className="gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {data.subtitles.length} segments
                </Badge>
              </div>
            </div>

            {/* Currently Playing Subtitle - Large Display */}
            {activeIndex >= 0 && (
              <Card className="mt-6 bg-gradient-to-r from-sky-500/10 to-blue-500/10 border-sky-500/20 animate-fade-in">
                <CardContent className="p-5">
                  <p className="text-lg text-foreground/90 font-medium leading-relaxed">
                    {data.subtitles[activeIndex].text_en}
                  </p>
                  <p className="text-lg text-sky-700 font-medium leading-relaxed mt-2">
                    {data.subtitles[activeIndex].text_translated}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Tabbed Study Sidebar (30%) */}
          <div className="flex-[3] flex flex-col min-w-[320px] max-w-[450px]">
            <Card className="flex flex-col h-full overflow-hidden bg-card/50 border-border">
              {/* Tab Strip */}
              <div className="flex items-center border-b border-border">
                {[
                  { key: "transcript" as const, label: "Transcript", icon: Clock },
                  { key: "summary" as const, label: "Summary", icon: FileText },
                  { key: "quiz" as const, label: "Quiz", icon: HelpCircle },
                  { key: "vocab" as const, label: "Vocab", icon: BookOpen },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex-1 px-3 py-3 text-xs font-medium uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                      activeTab === key
                        ? "border-sky-500 text-sky-700 bg-sky-500/5"
                        : "border-transparent text-muted-foreground hover:text-foreground/80 hover:bg-secondary/30"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Transcript Tab */}
              {activeTab === "transcript" && (
                <>
                  <CardHeader className="pb-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground">
                        Interactive Transcript
                      </CardTitle>
                      <Badge variant="outline" className="text-xs tabular-nums">
                        {formatTime(currentTime)}
                      </Badge>
                    </div>
                    <Progress value={progressPercent} className="h-1" />
                  </CardHeader>
                  <Separator />
                </>
              )}

              {/* Summary Tab */}
              {activeTab === "summary" && (
                <ScrollArea className="flex-1">
                  <div className="p-5">
                    {summaryLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating summary...
                      </div>
                    )}
                    {errors.summary && !summaryLoading && (
                      <ErrorBanner message={errors.summary} onRetry={loadSummary} />
                    )}
                    {summary && (
                      <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                        {summary}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Quiz Tab */}
              {activeTab === "quiz" && (
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {quizLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating quiz...
                      </div>
                    )}
                    {errors.quiz && !quizLoading && (
                      <ErrorBanner message={errors.quiz} onRetry={loadQuiz} />
                    )}
                    {quiz && quiz.length > 0 && (
                      <>
                        {quiz.map((q, qi) => {
                          const userAns = quizAnswers[qi];
                          const showResult = quizSubmitted;
                          return (
                            <Card key={qi} className="bg-secondary/30 border-border">
                              <CardContent className="p-4 space-y-3">
                                <p className="text-sm font-medium text-foreground/90">
                                  {qi + 1}. {q.question}
                                </p>
                                <div className="space-y-1.5">
                                  {q.options.map((opt, oi) => {
                                    const isSelected = userAns === oi;
                                    const isCorrect = oi === q.correct;
                                    return (
                                      <button
                                        key={oi}
                                        disabled={showResult}
                                        onClick={() =>
                                          setQuizAnswers((prev) => ({ ...prev, [qi]: oi }))
                                        }
                                        className={`w-full text-left text-xs p-2.5 rounded-lg border transition-all flex items-center gap-2 ${
                                          showResult && isCorrect
                                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                                            : showResult && isSelected && !isCorrect
                                            ? "bg-red-500/10 border-red-500/40 text-red-300"
                                            : isSelected
                                            ? "bg-sky-500/10 border-sky-500/30 text-sky-700"
                                            : "bg-background/50 border-border hover:border-sky-500/30"
                                        }`}
                                      >
                                        {showResult && isCorrect && (
                                          <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                                        )}
                                        {showResult && isSelected && !isCorrect && (
                                          <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                        )}
                                        <span>{opt}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                                {showResult && (
                                  <p className="text-xs text-muted-foreground pt-1 border-t border-border">
                                    💡 {q.explanation}
                                  </p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                        <Button
                          onClick={() => setQuizSubmitted((v) => !v)}
                          className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500"
                        >
                          {quizSubmitted ? "Reset Quiz" : "Submit Answers"}
                        </Button>
                        {quizSubmitted && (
                          <p className="text-center text-sm text-muted-foreground">
                            Score:{" "}
                            <span className="text-sky-700 font-semibold">
                              {quiz.filter((q, i) => quizAnswers[i] === q.correct).length}/
                              {quiz.length}
                            </span>
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Vocab Tab */}
              {activeTab === "vocab" && (
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-2.5">
                    {vocabLoading && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Extracting vocabulary...
                      </div>
                    )}
                    {errors.vocab && !vocabLoading && (
                      <ErrorBanner message={errors.vocab} onRetry={loadVocab} />
                    )}
                    {vocab &&
                      vocab.map((v, i) => (
                        <Card
                          key={i}
                          className="bg-secondary/30 border-border hover:border-sky-500/30 transition-all"
                        >
                          <CardContent className="p-3.5 space-y-1.5">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {v.term}
                              </span>
                              <span className="text-xs text-sky-700 font-medium truncate">
                                {v.translation}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {v.definition}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </ScrollArea>
              )}

              {/* Subtitle List (transcript tab only) */}
              {activeTab === "transcript" && (
              <ScrollArea className="flex-1">
                <div
                  ref={transcriptRef}
                  className="p-3 space-y-2"
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
                              ? "bg-gradient-to-r from-sky-500/15 to-blue-500/15 border border-sky-500/30 shadow-lg shadow-sky-500/10 scale-[1.02]"
                              : isPast
                              ? "bg-secondary/30 border border-transparent hover:bg-secondary/50 hover:border-border opacity-60 hover:opacity-100"
                              : "bg-secondary/30 border border-transparent hover:bg-secondary/50 hover:border-border"
                          }
                        `}
                      >
                        {/* Active indicator line */}
                        {active && (
                          <div className="absolute left-0 top-3 bottom-3 w-0.5 bg-gradient-to-b from-sky-500 to-blue-400 rounded-full" />
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 mb-2">
                          <Clock
                            className={`w-3 h-3 ${
                              active ? "text-primary" : "text-muted-foreground/40"
                            }`}
                          />
                          <span
                            className={`text-xs font-mono ${
                              active
                                ? "text-primary font-semibold"
                                : "text-muted-foreground/50"
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
                              ? "text-foreground font-medium"
                              : "text-foreground/60 group-hover:text-foreground/80"
                          }`}
                        >
                          {sub.text_en}
                        </p>

                        {/* Translated Text */}
                        <p
                          className={`text-sm leading-relaxed mt-1.5 ${
                            active
                              ? "text-sky-700"
                              : "text-muted-foreground/50 group-hover:text-muted-foreground/70"
                          }`}
                        >
                          {sub.text_translated}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
