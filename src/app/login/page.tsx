"use client";

import React, { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AuthShell, OAuthButtons } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider: "google" | "wechat") => {
    window.location.href = `${API_BASE}/auth/${provider}?next=${encodeURIComponent(next)}`;
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your Bridge AI account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-sky-600 font-medium hover:underline"
          >
            Create one
          </Link>
        </>
      }
    >
      <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-2xl shadow-sky-500/5 space-y-5">
        <OAuthButtons
          onGoogle={() => oauth("google")}
          onWechat={() => oauth("wechat")}
          disabled={loading}
        />

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            or
          </span>
          <Separator className="flex-1" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={loading}
              className="bg-secondary/50 border-border"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-xs font-medium text-muted-foreground uppercase tracking-wider"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              className="bg-secondary/50 border-border"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white h-11"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
