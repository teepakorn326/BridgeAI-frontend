"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

const PLATFORMS = [
  { name: "Echo360", icon: "/echo360.png" },
  { name: "Coursera", icon: "/Coursera.png" },
  { name: "Udemy", icon: "/Udemy.png" },
  { name: "YouTube", icon: "/YouTube.png" },
];

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://bridgeai.app";

interface Step {
  num: string;
  title: string;
  desc: string;
}

export default function LandingPage() {
  const { t } = useT();
  const { user } = useAuth();
  const steps = t<Step[]>("landing.steps");
  const ctaHref = user ? "/home" : "/register";
  const ctaLabel = user ? t("landing.ctaLoggedIn") : t("landing.ctaPrimary");

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
        step: (Array.isArray(steps) ? steps : []).map((s, i) => ({
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
              <Link href="/link-extension">
                <Button size="lg" variant="ghost" className="h-11 px-6 hover:bg-blue-50 text-foreground">
                  {t("landing.ctaSecondary")}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-foreground/60 leading-relaxed">
              After downloading: unzip, open <code className="font-mono text-foreground/90 bg-gray-100 px-2 py-1 rounded">chrome://extensions</code>, enable Developer mode (top-right), then click <span className="text-foreground/90 font-medium">Load unpacked</span> and select the unzipped folder.
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

      <section className="w-full bg-gradient-to-b from-white via-blue-50/30 to-white px-6 py-2">
        <div className="max-w-6xl mx-auto rounded-xl overflow-hidden border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-shadow">
          <video 
            width="100%" 
            height="auto" 
            controls 
            className="w-full h-auto bg-black"
          >
            <source src="/extension.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary mb-12">
          {t("landing.howItWorksTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.isArray(steps) &&
            steps.map((s) => (
              <div key={s.num} className="group p-6 rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/30 transition-all">
                <div className="font-mono text-sm font-bold text-blue-600 mb-3 group-hover:text-blue-700">
                  STEP {s.num}
                </div>
                <h3 className="text-lg font-bold mb-2 tracking-tight text-foreground">
                  {s.title}
                </h3>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
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
