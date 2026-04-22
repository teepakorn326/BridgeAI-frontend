"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Loader2, X, ChevronRight } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CourseCard,
  detectPlatform,
  platformMeta,
  Platform,
} from "@/components/CourseCard";

const LANGUAGES = [
  { code: "Thai", label: "Thai" },
  { code: "Chinese", label: "Chinese (Simplified)" },
  { code: "Japanese", label: "Japanese" },
  { code: "Korean", label: "Korean" },
  { code: "Vietnamese", label: "Vietnamese" },
  { code: "Indonesian", label: "Indonesian" },
  { code: "Spanish", label: "Spanish" },
  { code: "French", label: "French" },
  { code: "German", label: "German" },
  { code: "Portuguese", label: "Portuguese" },
  { code: "Arabic", label: "Arabic" },
  { code: "Hindi", label: "Hindi" },
];

const PLATFORM_TABS: Platform[] = ["youtube", "coursera", "udemy", "echo360"];

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
  const { user, loading: authLoading } = useAuth();
  const { t } = useT();

  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [videoURL, setVideoURL] = useState("");
  const [targetLang, setTargetLang] = useState("Thai");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<Platform | "all">("all");

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/home");
  }, [authLoading, user, router]);

  const loadCourses = useCallback(() => {
    setLoadingCourses(true);
    setCoursesError(null);
    fetch(`${API_BASE}/api/courses`, { credentials: "include" })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Server returned ${r.status}`);
        return r.json();
      })
      .then((data) => setCourses(data.courses || []))
      .catch((err) => {
        setCourses([]);
        setCoursesError(err.message || "Could not reach the server");
      })
      .finally(() => setLoadingCourses(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    loadCourses();
  }, [user, loadCourses]);

  const firstName = useMemo(() => {
    if (!user) return "";
    if (user.first_name) return user.first_name;
    return user.email.split("@")[0];
  }, [user]);

  const continueCourses = useMemo(() => courses.slice(0, 6), [courses]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();
    return courses.filter((c) => {
      const matchesPlatform =
        platformFilter === "all" || detectPlatform(c.video_url) === platformFilter;
      const matchesSearch =
        !term ||
        (c.title || "").toLowerCase().includes(term) ||
        c.video_id.toLowerCase().includes(term) ||
        c.target_lang.toLowerCase().includes(term);
      return matchesPlatform && matchesSearch;
    });
  }, [courses, search, platformFilter]);

  const platformCounts = useMemo(() => {
    const counts: Record<string, number> = { all: courses.length };
    for (const p of PLATFORM_TABS) counts[p] = 0;
    for (const c of courses) {
      const p = detectPlatform(c.video_url);
      counts[p] = (counts[p] || 0) + 1;
    }
    return counts;
  }, [courses]);

  const openCourse = (course: CourseSummary) => {
    const platform = detectPlatform(course.video_url);
    const route = PLATFORM_TABS.includes(platform) ? platform : "youtube";
    router.push(
      `/course/${route}?v=${encodeURIComponent(course.video_id)}&lang=${encodeURIComponent(course.target_lang)}`
    );
  };

  const submitLecture = () => {
    setFormError(null);
    const id = extractYouTubeId(videoURL);
    if (!id) {
      setFormError(t("home.addPanel.invalidUrl"));
      return;
    }
    setSubmitting(true);
    // Safety net: re-enable the button if navigation never completes.
    setTimeout(() => setSubmitting(false), 8000);
    router.push(
      `/course/youtube?v=${encodeURIComponent(id)}&lang=${encodeURIComponent(targetLang)}`
    );
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {t<string>("home.welcome")}, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1.5">
              {t("home.subtitle")}
            </p>
          </div>
          <Button
            onClick={() => setShowAdd((v) => !v)}
            size="lg"
            className="h-11 px-5 gap-2"
          >
            {showAdd ? (
              <>
                <X className="w-4 h-4" />
                {t("home.addPanel.cancel")}
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {t("home.addLecture")}
              </>
            )}
          </Button>
        </div>

        {showAdd && (
          <div className="mb-10 rounded-2xl border border-border bg-card p-6 animate-fade-in">
            <h2 className="text-lg font-semibold tracking-tight">
              {t("home.addPanel.title")}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {t("home.addPanel.description")}
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitLecture();
              }}
              className="mt-5 grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="video-url"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {t("home.addPanel.urlLabel")}
                </label>
                <Input
                  id="video-url"
                  type="url"
                  required
                  value={videoURL}
                  onChange={(e) => {
                    setVideoURL(e.target.value);
                    if (formError) setFormError(null);
                  }}
                  placeholder={t("home.addPanel.urlPlaceholder")}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="lang"
                  className="text-xs font-medium text-muted-foreground uppercase tracking-wider"
                >
                  {t("home.addPanel.langLabel")}
                </label>
                <Select
                  value={targetLang}
                  onValueChange={setTargetLang}
                  disabled={submitting}
                >
                  <SelectTrigger id="lang">
                    <SelectValue />
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
              <Button
                type="submit"
                disabled={submitting || !videoURL}
                className="h-10"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  t("home.addPanel.submit")
                )}
              </Button>
            </form>
            {formError && (
              <p className="mt-3 text-sm text-destructive">{formError}</p>
            )}
          </div>
        )}

        {continueCourses.length > 0 && (
          <section className="mb-14">
            {/* <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                {t("home.continueTitle")}
              </h2>
              <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
            </div> */}
            {/* <div className="flex gap-4 overflow-x-auto scrollbar-thin pb-3 -mx-6 px-6">
              {continueCourses.map((c) => (
                <CourseCard
                  key={`${c.video_id}-${c.target_lang}`}
                  videoId={c.video_id}
                  videoUrl={c.video_url}
                  title={c.title}
                  targetLang={c.target_lang}
                  size="large"
                  onClick={() => openCourse(c)}
                />
              ))}
            </div> */}
          </section>
        )}

        <section>
          <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
            <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              {t("home.libraryTitle")}
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("home.searchPlaceholder")}
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex gap-1.5 mb-6 overflow-x-auto scrollbar-thin -mx-6 px-6">
            <PlatformTab
              label={t("home.allTab")}
              count={platformCounts.all || 0}
              active={platformFilter === "all"}
              onClick={() => setPlatformFilter("all")}
            />
            {PLATFORM_TABS.map((p) => (
              <PlatformTab
                key={p}
                label={platformMeta(p).label}
                count={platformCounts[p] || 0}
                active={platformFilter === p}
                onClick={() => setPlatformFilter(p)}
              />
            ))}
          </div>

          {loadingCourses ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
            </div>
          ) : coursesError ? (
            <div className="py-20 text-center border border-dashed border-destructive/40 rounded-2xl">
              <p className="text-base font-medium text-foreground/80">
                {t("home.libraryErrorTitle")}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {coursesError}
              </p>
              <Button
                onClick={loadCourses}
                variant="outline"
                className="mt-6"
              >
                {t("home.libraryRetry")}
              </Button>
            </div>
          ) : filteredCourses.length === 0 ? (
            <EmptyState
              title={
                courses.length === 0
                  ? t<string>("home.empty")
                  : t<string>("home.emptyFiltered")
              }
              subtitle={
                courses.length === 0 ? t<string>("home.emptySubtitle") : ""
              }
              showCta={courses.length === 0}
              ctaLabel={t<string>("home.addLecture")}
              onCta={() => setShowAdd(true)}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCourses.map((c) => (
                <CourseCard
                  key={`${c.video_id}-${c.target_lang}`}
                  videoId={c.video_id}
                  videoUrl={c.video_url}
                  title={c.title}
                  targetLang={c.target_lang}
                  onClick={() => openCourse(c)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function PlatformTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap transition-colors border ${
        active
          ? "bg-foreground text-background border-foreground"
          : "bg-background text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`ml-2 text-xs ${
          active ? "text-background/70" : "text-muted-foreground/60"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyState({
  title,
  subtitle,
  showCta,
  ctaLabel,
  onCta,
}: {
  title: string;
  subtitle: string;
  showCta: boolean;
  ctaLabel: string;
  onCta: () => void;
}) {
  return (
    <div className="py-20 text-center border border-dashed border-border rounded-2xl">
      <p className="text-base font-medium text-foreground/80">{title}</p>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
      )}
      {showCta && (
        <Button onClick={onCta} className="mt-6 gap-2">
          <Plus className="w-4 h-4" />
          {ctaLabel}
        </Button>
      )}
    </div>
  );
}
