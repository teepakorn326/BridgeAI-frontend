"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  FileText,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Loader2,
  Send,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { ProcessResponse } from "@/types";
import { API_BASE } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LectureStudyProps {
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

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
}

type TabKey = "summary" | "quiz" | "vocab" | "chat";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
  { key: "vocab", label: "Vocab", icon: BookOpen },
  { key: "chat", label: "Chat", icon: MessageCircle },
];

export default function LectureStudy({ data, onBack }: LectureStudyProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [vocab, setVocab] = useState<VocabEntry[] | null>(null);
  const [vocabLoading, setVocabLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<TabKey, string>>>({});

  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchMaterial = useCallback(
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

  useEffect(() => {
    if (activeTab === "summary" && summary === null && !summaryLoading && !errors.summary) {
      setSummaryLoading(true);
      fetchMaterial("summarize")
        .then((r) => setSummary(r.summary))
        .catch((e) => setErrors((p) => ({ ...p, summary: e.message })))
        .finally(() => setSummaryLoading(false));
    }
    if (activeTab === "quiz" && quiz === null && !quizLoading && !errors.quiz) {
      setQuizLoading(true);
      fetchMaterial("quiz")
        .then((r) => setQuiz(r.quiz))
        .catch((e) => setErrors((p) => ({ ...p, quiz: e.message })))
        .finally(() => setQuizLoading(false));
    }
    if (activeTab === "vocab" && vocab === null && !vocabLoading && !errors.vocab) {
      setVocabLoading(true);
      fetchMaterial("vocab")
        .then((r) => setVocab(r.vocab))
        .catch((e) => setErrors((p) => ({ ...p, vocab: e.message })))
        .finally(() => setVocabLoading(false));
    }
  }, [activeTab, summary, summaryLoading, quiz, quizLoading, vocab, vocabLoading, errors, fetchMaterial]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMsgs, chatLoading]);

  const sendChat = async () => {
    const text = chatInput.trim();
    if (!text || chatLoading) return;
    const next: ChatMsg[] = [...chatMsgs, { role: "user", content: text }];
    setChatMsgs(next);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_id: data.video_id,
          video_url: data.video_url,
          target_lang: data.target_lang,
          messages: next,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Chat failed");
      }
      const { answer } = await res.json();
      setChatMsgs((msgs) => [...msgs, { role: "assistant", content: answer }]);
    } catch (err) {
      setChatMsgs((msgs) => [
        ...msgs,
        { role: "assistant", content: `Error: ${(err as Error).message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const correctCount =
    quiz && quizSubmitted
      ? quiz.reduce((n, q, i) => n + (quizAnswers[i] === q.correct ? 1 : 0), 0)
      : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ChevronLeft className="w-4 h-4" /> Back
          </Button>
          {data.video_url && (
            <a
              href={data.video_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-sky-600 hover:underline flex items-center gap-1"
            >
              Open source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            {data.source && (
              <Badge variant="outline" className="text-xs capitalize">
                {data.source}
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {data.target_lang}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.subtitles.length} segments
            </Badge>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = activeTab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                  active
                    ? "border-sky-500 text-sky-600"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "summary" && (
          <Card className="bg-card/60 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-base">Lecture summary</CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </div>
              )}
              {errors.summary && (
                <p className="text-sm text-destructive">{errors.summary}</p>
              )}
              {summary && (
                <div className="text-sm whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {summary}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "quiz" && (
          <Card className="bg-card/60 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-base">Comprehension quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              {quizLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </div>
              )}
              {errors.quiz && (
                <p className="text-sm text-destructive">{errors.quiz}</p>
              )}
              {quiz &&
                quiz.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <p className="text-sm font-medium">
                      {i + 1}. {q.question}
                    </p>
                    <div className="grid gap-2">
                      {q.options.map((opt, j) => {
                        const chosen = quizAnswers[i] === j;
                        const isCorrect = q.correct === j;
                        const show = quizSubmitted;
                        return (
                          <button
                            key={j}
                            type="button"
                            disabled={quizSubmitted}
                            onClick={() =>
                              setQuizAnswers((p) => ({ ...p, [i]: j }))
                            }
                            className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                              show && isCorrect
                                ? "border-emerald-500/50 bg-emerald-500/10"
                                : show && chosen && !isCorrect
                                ? "border-red-500/50 bg-red-500/10"
                                : chosen
                                ? "border-sky-500/50 bg-sky-500/10"
                                : "border-border hover:bg-card"
                            }`}
                          >
                            <span className="inline-flex items-center gap-2">
                              {show && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              )}
                              {show && chosen && !isCorrect && (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && (
                      <p className="text-xs text-muted-foreground pl-1">
                        {q.explanation}
                      </p>
                    )}
                  </div>
                ))}
              {quiz && (
                <div className="flex items-center gap-3 pt-2">
                  {!quizSubmitted ? (
                    <Button
                      onClick={() => setQuizSubmitted(true)}
                      disabled={Object.keys(quizAnswers).length !== quiz.length}
                      className="bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                    >
                      Submit answers
                    </Button>
                  ) : (
                    <>
                      <Badge variant="outline" className="text-sm">
                        {correctCount} / {quiz.length} correct
                      </Badge>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizSubmitted(false);
                        }}
                      >
                        Retry
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "vocab" && (
          <Card className="bg-card/60 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-base">Vocabulary pool</CardTitle>
            </CardHeader>
            <CardContent>
              {vocabLoading && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </div>
              )}
              {errors.vocab && (
                <p className="text-sm text-destructive">{errors.vocab}</p>
              )}
              {vocab && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {vocab.map((v, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border bg-card/50 p-3"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm">{v.term}</p>
                        <Badge variant="outline" className="text-xs">
                          {v.translation}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {v.definition}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "chat" && (
          <Card className="bg-card/60 backdrop-blur-sm border border-border">
            <CardHeader>
              <CardTitle className="text-base">Ask the lecture</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-3" ref={chatScrollRef as unknown as React.RefObject<HTMLDivElement>}>
                <div className="space-y-3 pr-2">
                  {chatMsgs.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Ask anything about this lecture. Answers are grounded in the transcript.
                    </p>
                  )}
                  {chatMsgs.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                          m.role === "user"
                            ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                            : "bg-card border border-border"
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{m.content}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-card border border-border rounded-2xl px-3.5 py-2 text-sm flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Thinking...
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendChat();
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask about the lecture..."
                  disabled={chatLoading}
                  className="flex-1 h-10 rounded-md border border-border bg-secondary/50 px-3 text-sm outline-none focus:border-sky-500"
                />
                <Button
                  type="submit"
                  disabled={!chatInput.trim() || chatLoading}
                  className="bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
