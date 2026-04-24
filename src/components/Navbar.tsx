"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { LanguageToggle, useT } from "@/lib/i18n";

export function Navbar() {
  const { user, loading, logout } = useAuth();
  const { t } = useT();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Bridge AI"
            width={36}
            height={36}
            className="w-9 h-9 object-contain"
            priority
          />
          <div>
            <h1 className="text-base font-bold tracking-tight leading-tight">
              Bridge{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-blue-600">
                AI
              </span>
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] -mt-0.5">
              {t("nav.tagline")}
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-4">
          <LanguageToggle />
          <div className="h-5 w-px bg-border/60" />
          {loading ? null : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-sm text-muted-foreground mr-2">
                {user.first_name || user.email.split("@")[0]}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => logout()}
                className="h-9"
              >
                {t("nav.signOut")}
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="h-9">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="h-9 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white"
                >
                  {t("nav.getStarted")}
                </Button>
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
