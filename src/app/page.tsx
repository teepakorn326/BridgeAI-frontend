"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Download,
  X,
  PlayCircle,
  Puzzle,
  FileText,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Languages,
  Sparkles,
  Layers,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const PLATFORMS = [
  { name: "Echo360", icon: "/echo360.png" },
  { name: "Coursera", icon: "/Coursera.png" },
  { name: "Udemy", icon: "/Udemy.png" },
  { name: "YouTube", icon: "/YouTube.png" },
];

const DASHBOARD_ICONS = [FileText, HelpCircle, BookOpen, MessageCircle];
const DIFF_ICONS = [Languages, Sparkles, Layers, Lock];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://bridgeai.app";

interface Step {
  num: string;
  title: string;
  desc: string;
}

interface Track {
  badge: string;
  title: string;
  subtitle: string;
  steps: Step[];
}

interface DashboardFeature {
  title: string;
  desc: string;
}

interface Differentiator {
  title: string;
  desc: string;
}

export default function LandingPage() {
  const { t } = useT();
  const { user } = useAuth();
  const youtubeTrack = t<Track>("landing.youtubeTrack");
  const extensionTrack = t<Track>("landing.extensionTrack");
  const dashboardFeatures = t<DashboardFeature[]>("landing.dashboardFeatures");
  const differentiators = t<Differentiator[]>("landing.differentiators");
  const ctaHref = user ? "/home" : "/register";
  const ctaLabel = user ? t("landing.ctaLoggedIn") : t("landing.ctaPrimary");
  const [showVideoModal, setShowVideoModal] = useState(false);

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "BridgeAI",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "BridgeAI",
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: ["en", "zh", "th"],
      },
      {
        "@type": "SoftwareApplication",
        name: "BridgeAI",
        applicationCategory: "EducationalApplication",
        operatingSystem: "Web, Chrome Extension",
        description:
          "Bilingual subtitles plus AI summaries, quizzes, and vocabulary for Echo360, Coursera, Udemy, and YouTube lectures.",
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        featureList: [
          "Synced bilingual subtitles",
          "AI lecture summaries",
          "Auto-generated quizzes",
          "Vocabulary extraction",
          "Echo360, Coursera, Udemy, YouTube support",
        ],
      },
      {
        "@type": "HowTo",
        name: t<string>("landing.howItWorksTitle"),
        step: [
          ...(Array.isArray(youtubeTrack?.steps) ? youtubeTrack.steps : []),
          ...(Array.isArray(extensionTrack?.steps) ? extensionTrack.steps : []),
        ].map((s, i) => ({
          "@type": "HowToStep",
          position: i + 1,
          name: s.title,
          text: s.desc,
        })),
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script 
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <section className="max-w-6xl mx-auto px-6 pt-6 pb-2 md:pt-10 md:pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-start">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-primary/70 mb-8">
              {t("landing.eyebrow")}
            </p>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.08] text-foreground">
              {t("landing.title")}
            </h1>
            <p className="mt-6 text-lg text-foreground/70 max-w-2xl leading-relaxed">
              {t("landing.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={ctaHref}>
                <Button size="lg" className="h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-shadow">
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="/bridgeai-extension.zip" download>
                <Button size="lg" variant="outline" className="h-11 px-6 border-2 hover:bg-blue-50">
                  <Download className="w-4 h-4 mr-1" />
                  Download extension for Chrome
                </Button>
              </a>
              <Button
                size="lg"
                variant="outline"
                className="h-11 px-6 border-2 hover:bg-blue-50"
                onClick={() => setShowVideoModal(true)}
              >
                How to install extension?
              </Button>
            </div>
            <p className="mt-5 text-xs font-medium tracking-wide text-foreground/55">
              {t("landing.trustLine")}
            </p>
          </div>
          <div className="rounded-xl overflow-hidden shadow-xl border border-border/80 hidden md:block hover:shadow-2xl transition-shadow">
            <img 
              src="/tutorial-guide.png" 
              alt="BridgeAI learning interface" 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-50 via-blue-50 to-blue-50 dark:from-blue-950/40 dark:via-blue-950/40 dark:to-blue-950/40 border-l-4 border-blue-600 px-8 py-10 rounded-r-lg shadow-md hover:shadow-lg transition-shadow">
          <p className="text-2xl md:text-3xl font-bold leading-snug max-w-3xl text-blue-900 dark:text-blue-50">
            {t("landing.problem")}
          </p>
        </div>
      </section>

      {/* Differentiators — why our subtitles aren't like the others */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-y border-border/60">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
            {t("landing.differentiatorsTitle")}
          </h2>
          <p className="text-lg text-foreground/70 max-w-3xl leading-relaxed mb-12">
            {t("landing.differentiatorsSubtitle")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.isArray(differentiators) &&
              differentiators.map((d, i) => {
                const Icon = DIFF_ICONS[i] || Sparkles;
                return (
                  <div
                    key={d.title}
                    className="group relative bg-white rounded-xl border-2 border-gray-200 p-7 hover:border-blue-400 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold tracking-tight text-foreground mb-2 leading-snug">
                          {d.title}
                        </h3>
                        <p className="text-sm text-foreground/70 leading-relaxed">
                          {d.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          {t("landing.howItWorksTitle")}
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed mb-12">
          {t("landing.howItWorksIntro")}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* YouTube track */}
          <div className="rounded-xl border-2 border-red-200 bg-gradient-to-br from-red-50/60 to-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-red-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-red-700">
                {youtubeTrack?.badge}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {youtubeTrack?.title}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              {youtubeTrack?.subtitle}
            </p>
            <ol className="space-y-4">
              {Array.isArray(youtubeTrack?.steps) &&
                youtubeTrack.steps.map((s) => (
                  <li key={s.num} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-red-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                      {s.num}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {s.title}
                      </h4>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
          </div>

          {/* Extension track */}
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Puzzle className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700">
                {extensionTrack?.badge}
              </span>
            </div>
            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
              {extensionTrack?.title}
            </h3>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6">
              {extensionTrack?.subtitle}
            </p>
            <ol className="space-y-4">
              {Array.isArray(extensionTrack?.steps) &&
                extensionTrack.steps.map((s) => (
                  <li key={s.num} className="flex gap-4">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-600 text-white font-mono text-sm font-bold flex items-center justify-center">
                      {s.num}
                    </div>
                    <div className="flex-1 pt-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {s.title}
                      </h4>
                      <p className="text-sm text-foreground/70 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </li>
                ))}
            </ol>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/bridgeai-extension.zip" download>
                <Button size="sm" className="h-9 bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-1" />
                  Download extension
                </Button>
              </a>
              <Button
                size="sm"
                variant="outline"
                className="h-9 border-2 hover:bg-blue-50"
                onClick={() => setShowVideoModal(true)}
              >
                Watch install video
              </Button>
            </div>
          </div>
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      {/* Dashboard features — what users get at the end */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-4">
          {t("landing.dashboardTitle")}
        </h2>
        <p className="text-lg text-foreground/70 max-w-2xl leading-relaxed mb-12">
          {t("landing.dashboardSubtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.isArray(dashboardFeatures) &&
            dashboardFeatures.map((f, i) => {
              const Icon = DASHBOARD_ICONS[i] || FileText;
              return (
                <div
                  key={f.title}
                  className="p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all"
                >
                  <div className="w-11 h-11 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 tracking-tight text-foreground">
                    {f.title}
                  </h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              );
            })}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-10">
          {t("landing.platformsTitle")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex flex-col items-center gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all hover:shadow-md"
            >
              <img 
                src={p.icon} 
                alt={`${p.name} logo`} 
                className="h-10 md:h-12 w-auto object-contain"
                loading="lazy"
              />
              <span className="text-sm md:text-base font-semibold text-foreground text-center">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-blue-50 to-white border-2 border-blue-200 rounded-lg p-8 shadow-md hover:shadow-lg transition-shadow">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight leading-snug max-w-3xl text-foreground">
            {t("landing.closingTitle")}
          </h2>
          <p className="mt-5 text-foreground/70 max-w-2xl leading-relaxed">
            {t("landing.closingBody")}
          </p>
          <div className="mt-8">
            <Link href={ctaHref}>
              <Button size="lg" className="h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-shadow">
                {ctaLabel}
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Installation Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-foreground">How to Install Extension</h2>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-black flex items-center justify-center">
              <video 
                width="100%" 
                height="auto" 
                controls 
                autoPlay
                className="max-h-full w-full object-contain"
              >
                <source src="/extension.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("landing.footerLeft")}</span>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <span>{t("landing.footerRight")}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
