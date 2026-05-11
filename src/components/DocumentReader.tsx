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
  CheckCircle2,
  XCircle,
  X,
  Layers,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  DocumentResponse,
  DocumentChatCitation,
  DocumentLesson,
} from "@/types";
import { API_BASE } from "@/lib/api";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DocumentReaderProps {
  data: DocumentResponse;
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
  citations?: DocumentChatCitation[];
}

type TabKey = "summary" | "lesson" | "quiz" | "vocab" | "chat";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "summary", label: "Summary", icon: FileText },
  { key: "lesson", label: "Lesson", icon: Layers },
  { key: "quiz", label: "Quiz", icon: HelpCircle },
  { key: "vocab", label: "Vocab", icon: BookOpen },
  { key: "chat", label: "Chat", icon: MessageCircle },
];

// Active citation popover state — shared by Summary, Lesson, and Chat tabs
// since the Document tab no longer exists. Clicking a [N] pill anywhere
// surfaces the cited source block in a small fixed panel at bottom-right.
interface ActiveCitation {
  page: number;
  order: number;
  textEN: string;
  textTranslated: string;
}

export default function DocumentReader({ data, onBack }: DocumentReaderProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("summary");

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryCites, setSummaryCites] = useState<DocumentChatCitation[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [lessons, setLessons] = useState<DocumentLesson[] | null>(null);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [openChapter, setOpenChapter] = useState<number>(0);
  const [lessonAnswers, setLessonAnswers] = useState<Record<string, number>>({});
  const [lessonSubmitted, setLessonSubmitted] = useState<Record<number, boolean>>({});

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

  const [activeCitation, setActiveCitation] = useState<ActiveCitation | null>(null);

  // Resolve a citation (which has page+order but only EN text) into the
  // full block including translated text — needed for the popover.
  const showCitation = useCallback(
    (cite: DocumentChatCitation) => {
      const blk = data.blocks.find(
        (b) => b.page === cite.page && b.order === cite.order
      );
      setActiveCitation({
        page: cite.page,
        order: cite.order,
        textEN: cite.text_en,
        textTranslated: blk?.text_translated || "",
      });
    },
    [data.blocks]
  );

  // ESC closes the citation popover.
  useEffect(() => {
    if (!activeCitation) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveCitation(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeCitation]);

  const fetchMaterial = useCallback(
    async (kind: "summary" | "quiz" | "vocab" | "lesson") => {
      const res = await fetch(`${API_BASE}/api/document/${kind}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: data.document_id,
          target_lang: data.target_lang,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to load ${kind}`);
      }
      return res.json();
    },
    [data.document_id, data.target_lang]
  );

  useEffect(() => {
    if (activeTab === "summary" && summary === null && !summaryLoading && !errors.summary) {
      setSummaryLoading(true);
      fetchMaterial("summary")
        .then((r) => {
          setSummary(r.summary);
          setSummaryCites(r.citations || []);
        })
        .catch((e) => setErrors((p) => ({ ...p, summary: e.message })))
        .finally(() => setSummaryLoading(false));
    }
    if (activeTab === "lesson" && lessons === null && !lessonsLoading && !errors.lesson) {
      setLessonsLoading(true);
      fetchMaterial("lesson")
        .then((r) => setLessons(r.lessons || []))
        .catch((e) => setErrors((p) => ({ ...p, lesson: e.message })))
        .finally(() => setLessonsLoading(false));
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
  }, [activeTab, summary, summaryLoading, lessons, lessonsLoading, quiz, quizLoading, vocab, vocabLoading, errors, fetchMaterial]);

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
      const res = await fetch(`${API_BASE}/api/document/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: data.document_id,
          target_lang: data.target_lang,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Chat failed");
      }
      const { answer, citations } = await res.json();
      setChatMsgs((msgs) => [
        ...msgs,
        { role: "assistant", content: answer, citations: citations || [] },
      ]);
    } catch (err) {
      setChatMsgs((msgs) => [
        ...msgs,
        { role: "assistant", content: `Error: ${(err as Error).message}` },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Replace inline [N] markers with citation pills. On click, surfaces the
  // cited block in the bottom-right popover.
  const injectCites = (
    node: React.ReactNode,
    byN: Map<number, DocumentChatCitation>
  ): React.ReactNode => {
    if (typeof node === "string") {
      if (byN.size === 0 || !node.includes("[")) return node;
      const parts = node.split(/(\[\d+\])/g);
      if (parts.length === 1) return node;
      return parts.map((p, i) => {
        const m = p.match(/^\[(\d+)\]$/);
        if (!m) return <React.Fragment key={i}>{p}</React.Fragment>;
        const cite = byN.get(parseInt(m[1], 10));
        if (!cite) return <React.Fragment key={i}>{p}</React.Fragment>;
        const label = cite.page > 0 ? `p.${cite.page}` : `#${cite.order + 1}`;
        return (
          <button
            key={i}
            type="button"
            onClick={() => showCitation(cite)}
            title={cite.text_en}
            className="inline-flex items-center gap-0.5 mx-0.5 px-1.5 py-0.5 rounded-md
                       bg-sky-500/15 border border-sky-500/30 text-sky-700
                       text-[10px] font-semibold font-mono hover:bg-sky-500/25"
          >
            📄 {label}
          </button>
        );
      });
    }
    if (Array.isArray(node)) {
      return node.map((c, i) => (
        <React.Fragment key={i}>{injectCites(c, byN)}</React.Fragment>
      ));
    }
    return node;
  };

  // Build a markdown renderer that knows which citation map to apply.
  // Used for both summary and lesson summaries.
  const renderMarkdownWithCites = (
    content: string,
    citations: DocumentChatCitation[]
  ) => {
    const byN = new Map(citations.map((c) => [c.n, c]));
    const wrap = (
      tag: "p" | "li" | "strong" | "em" | "h4" | "h5" | "h6" | "td" | "th" | "h1" | "h2" | "h3"
    ) => {
      const MarkdownNode = ({ children }: { children?: React.ReactNode }) =>
        React.createElement(tag, {}, injectCites(children, byN));
      MarkdownNode.displayName = `MarkdownNode(${tag})`;
      return MarkdownNode;
    };
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: wrap("p"),
          li: wrap("li"),
          strong: wrap("strong"),
          em: wrap("em"),
          h1: wrap("h1"),
          h2: wrap("h2"),
          h3: wrap("h3"),
          h4: wrap("h4"),
          h5: wrap("h5"),
          h6: wrap("h6"),
          td: wrap("td"),
          th: wrap("th"),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  const renderChatAnswer = (content: string, citations?: DocumentChatCitation[]) => {
    const byN = new Map((citations || []).map((c) => [c.n, c]));
    const wrap = (
      tag: "p" | "li" | "strong" | "em" | "h4" | "h5" | "h6" | "td" | "th"
    ) => {
      const MarkdownNode = ({ children }: { children?: React.ReactNode }) =>
        React.createElement(tag, {}, injectCites(children, byN));
      MarkdownNode.displayName = `MarkdownNode(${tag})`;
      return MarkdownNode;
    };
    return (
      <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
                      prose-p:my-1.5 prose-p:leading-relaxed
                      prose-headings:font-semibold prose-headings:tracking-tight
                      prose-h1:text-sm prose-h2:text-sm prose-h3:text-sm
                      prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5
                      prose-strong:text-foreground prose-code:text-[0.85em]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: wrap("p"),
            li: wrap("li"),
            strong: wrap("strong"),
            em: wrap("em"),
            h1: wrap("h4"),
            h2: wrap("h4"),
            h3: wrap("h5"),
            h4: wrap("h5"),
            h5: wrap("h6"),
            h6: wrap("h6"),
            td: wrap("td"),
            th: wrap("th"),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
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
        </div>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs uppercase">
              {data.source}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.target_lang}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {data.blocks.length} blocks
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
              <CardTitle className="text-base">Document summary</CardTitle>
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
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none text-foreground/90
                                prose-headings:font-semibold prose-headings:tracking-tight
                                prose-h1:text-2xl prose-h1:mt-0 prose-h1:mb-4
                                prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
                                prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                                prose-p:leading-relaxed
                                prose-blockquote:border-l-2 prose-blockquote:border-primary/60
                                prose-blockquote:bg-muted/40 prose-blockquote:py-1 prose-blockquote:px-3
                                prose-blockquote:not-italic prose-blockquote:text-foreground/85
                                prose-table:text-sm prose-th:bg-muted/50 prose-th:font-medium
                                prose-code:font-mono prose-code:text-[0.85em]
                                prose-hr:border-border/60">
                  {renderMarkdownWithCites(summary, summaryCites)}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === "lesson" && (
          <div className="space-y-3">
            {lessonsLoading && (
              <Card className="bg-card/60 border border-border">
                <CardContent className="p-6 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" /> Splitting into chapters and generating quizzes...
                </CardContent>
              </Card>
            )}
            {errors.lesson && (
              <p className="text-sm text-destructive">{errors.lesson}</p>
            )}
            {lessons && lessons.length === 0 && (
              <p className="text-sm text-muted-foreground">No chapters generated.</p>
            )}
            {lessons &&
              lessons.map((lesson, i) => {
                const isOpen = openChapter === i;
                const submitted = !!lessonSubmitted[i];
                return (
                  <Card
                    key={i}
                    className="bg-card/60 backdrop-blur-sm border border-border"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenChapter(isOpen ? -1 : i)}
                      className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-secondary/30"
                    >
                      <div>
                        <div className="text-[10px] font-mono text-muted-foreground mb-0.5">
                          Chapter {String(i + 1).padStart(2, "0")}
                        </div>
                        <div className="text-base font-semibold tracking-tight">
                          {lesson.title_en}
                        </div>
                        <div className="text-sm text-sky-700 mt-0.5">
                          {lesson.title_translated}
                        </div>
                      </div>
                      <ChevronLeft
                        className={`w-4 h-4 text-muted-foreground transition-transform mt-1 ${
                          isOpen ? "-rotate-90" : "rotate-180"
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <CardContent className="border-t border-border pt-4 space-y-5">
                        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
                                        prose-p:leading-relaxed prose-p:my-1.5
                                        prose-strong:text-foreground prose-headings:tracking-tight
                                        prose-h1:text-base prose-h2:text-base prose-h3:text-sm">
                          {renderMarkdownWithCites(lesson.summary, lesson.summary_citations)}
                        </div>

                        {lesson.quiz && lesson.quiz.length > 0 && (
                          <div className="space-y-4 pt-3 border-t border-border/60">
                            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                              Chapter quiz
                            </div>
                            {lesson.quiz.map((q, qi) => {
                              const key = `${i}-${qi}`;
                              const chosen = lessonAnswers[key];
                              return (
                                <div key={qi} className="space-y-2">
                                  <p className="text-sm font-medium">
                                    {qi + 1}. {q.question}
                                  </p>
                                  <div className="grid gap-2">
                                    {q.options.map((opt, oi) => {
                                      const isChosen = chosen === oi;
                                      const isCorrect = q.correct === oi;
                                      return (
                                        <button
                                          key={oi}
                                          type="button"
                                          disabled={submitted}
                                          onClick={() =>
                                            setLessonAnswers((p) => ({ ...p, [key]: oi }))
                                          }
                                          className={`text-left text-sm px-3 py-2 rounded-lg border transition ${
                                            submitted && isCorrect
                                              ? "border-emerald-500/50 bg-emerald-500/10"
                                              : submitted && isChosen && !isCorrect
                                              ? "border-red-500/50 bg-red-500/10"
                                              : isChosen
                                              ? "border-sky-500/50 bg-sky-500/10"
                                              : "border-border hover:bg-card"
                                          }`}
                                        >
                                          <span className="inline-flex items-center gap-2">
                                            {submitted && isCorrect && (
                                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                            )}
                                            {submitted && isChosen && !isCorrect && (
                                              <XCircle className="w-4 h-4 text-red-600" />
                                            )}
                                            {opt}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                  {submitted && (
                                    <p className="text-xs text-muted-foreground pl-1">
                                      {q.explanation}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {!submitted ? (
                              <Button
                                size="sm"
                                onClick={() =>
                                  setLessonSubmitted((p) => ({ ...p, [i]: true }))
                                }
                                disabled={lesson.quiz.some((_, qi) => lessonAnswers[`${i}-${qi}`] === undefined)}
                                className="bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                              >
                                Check answers
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setLessonSubmitted((p) => ({ ...p, [i]: false }));
                                  setLessonAnswers((prev) => {
                                    const next = { ...prev };
                                    lesson.quiz.forEach((_, qi) => {
                                      delete next[`${i}-${qi}`];
                                    });
                                    return next;
                                  });
                                }}
                              >
                                Retry
                              </Button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
          </div>
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
              <CardTitle className="text-base">Ask the document</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] mb-3" ref={chatScrollRef as unknown as React.RefObject<HTMLDivElement>}>
                <div className="space-y-3 pr-2">
                  {chatMsgs.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      Ask anything about this document. Click [N] pills to see the cited block.
                    </p>
                  )}
                  {chatMsgs.map((m, i) => (
                    <div
                      key={i}
                      className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                          m.role === "user"
                            ? "bg-gradient-to-r from-sky-600 to-blue-600 text-white"
                            : "bg-card border border-border"
                        }`}
                      >
                        {m.role === "assistant" ? (
                          renderChatAnswer(m.content, m.citations)
                        ) : (
                          <div className="whitespace-pre-wrap">{m.content}</div>
                        )}
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
                  placeholder="Ask about the document..."
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

      {activeCitation && (
        <div className="fixed bottom-6 right-6 w-[min(420px,calc(100vw-3rem))] z-50 animate-fade-in">
          <Card className="bg-card border border-sky-500/40 shadow-2xl">
            <div className="flex items-start justify-between p-3 border-b border-border">
              <div className="text-xs font-medium text-muted-foreground">
                Source · {activeCitation.page > 0 ? `page ${activeCitation.page}` : `block #${activeCitation.order + 1}`}
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close citation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-3 space-y-2 text-sm leading-relaxed max-h-[40vh] overflow-y-auto">
              <p className="text-foreground/90 whitespace-pre-wrap">
                {activeCitation.textEN}
              </p>
              {activeCitation.textTranslated && (
                <p className="text-sky-700 whitespace-pre-wrap border-t border-border/60 pt-2">
                  {activeCitation.textTranslated}
                </p>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
