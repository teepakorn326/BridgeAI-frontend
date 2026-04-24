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
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-8">
              {t("landing.eyebrow")}
            </p>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08]">
              {t("landing.title")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              {t("landing.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href={ctaHref}>
                <Button size="lg" className="h-11 px-6">
                  {ctaLabel}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <a href="/bridgeai-extension.zip" download>
                <Button size="lg" variant="outline" className="h-11 px-6">
                  <Download className="w-4 h-4 mr-1" />
                  Download extension for Chrome
                </Button>
              </a>
              <Link href="/link-extension">
                <Button size="lg" variant="ghost" className="h-11 px-6">
                  {t("landing.ctaSecondary")}
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground max-w-xl leading-relaxed">
              After downloading: unzip, open <code className="font-mono text-foreground/80">chrome://extensions</code>, enable Developer mode (top-right), then click <span className="text-foreground/80">Load unpacked</span> and select the unzipped folder.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg border border-border/50 hidden md:block">
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
        <p className="text-2xl md:text-3xl font-medium leading-snug max-w-3xl text-foreground/85">
          {t("landing.problem")}
        </p>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-12">
          {t("landing.howItWorksTitle")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8">
          {Array.isArray(steps) &&
            steps.map((s) => (
              <div key={s.num}>
                <div className="font-mono text-xs text-muted-foreground mb-3">
                  {s.num}
                </div>
                <h3 className="text-lg font-semibold mb-2 tracking-tight">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground mb-8">
          {t("landing.platformsTitle")}
        </h2>
        <div className="flex flex-wrap gap-x-10 gap-y-8">
          {PLATFORMS.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-3"
            >
              <span className="text-xl md:text-2xl font-medium text-foreground/70 tracking-tight">
                {p.name}
              </span>
              <img 
                src={p.icon} 
                alt={`${p.name} logo`} 
                className="h-8 md:h-10 w-auto object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      <hr className="max-w-5xl mx-auto border-border/60" />

      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug max-w-3xl">
          {t("landing.closingTitle")}
        </h2>
        <p className="mt-5 text-muted-foreground max-w-2xl leading-relaxed">
          {t("landing.closingBody")}
        </p>
        <div className="mt-10">
          <Link href={ctaHref}>
            <Button size="lg" className="h-11 px-6">
              {ctaLabel}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
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
