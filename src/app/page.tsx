"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useT } from "@/lib/i18n";

const PLATFORMS = ["Echo360", "Coursera", "Udemy", "YouTube"];

interface Step {
  num: string;
  title: string;
  desc: string;
}

export default function LandingPage() {
  const { t } = useT();
  const steps = t<Step[]>("landing.steps");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="max-w-5xl mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-muted-foreground mb-8">
          {t("landing.eyebrow")}
        </p>
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-[1.08] max-w-3xl">
          {t("landing.title")}
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
          {t("landing.subtitle")}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/register">
            <Button size="lg" className="h-11 px-6">
              {t("landing.ctaPrimary")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/link-extension">
            <Button size="lg" variant="outline" className="h-11 px-6">
              {t("landing.ctaSecondary")}
            </Button>
          </Link>
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
        <div className="flex flex-wrap gap-x-10 gap-y-4">
          {PLATFORMS.map((p) => (
            <span
              key={p}
              className="text-xl md:text-2xl font-medium text-foreground/70 tracking-tight"
            >
              {p}
            </span>
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
          <Link href="/register">
            <Button size="lg" className="h-11 px-6">
              {t("landing.ctaPrimary")}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("landing.footerLeft")}</span>
          <span>{t("landing.footerRight")}</span>
        </div>
      </footer>
    </div>
  );
}
