// @ts-nocheck
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Puzzle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

function sendToExtension(message, timeoutMs = 3000) {
  return new Promise((resolve, reject) => {
    const requestId = Math.random().toString(36).slice(2);
    const timer = window.setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(
        new Error(
          "Extension did not respond. Is BridgeAI installed, enabled, and reloaded after manifest changes?"
        )
      );
    }, timeoutMs);

    const handler = (event) => {
      if (event.source !== window) return;
      const data = event.data;
      if (!data || data.source !== "bridgeai-extension") return;
      if (data.requestId !== requestId) return;
      window.clearTimeout(timer);
      window.removeEventListener("message", handler);
      resolve({ ok: !!data.ok, error: data.error });
    };
    window.addEventListener("message", handler);
    window.postMessage({ source: "bridgeai-web", requestId, ...message }, "*");
  });
}

export default function LinkExtensionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [linking, setLinking] = useState(false);
  const [linked, setLinked] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.replace("/login?next=/link-extension");
  }, [loading, user, router]);

  const linkExtension = async () => {
    setLinking(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/extension-token`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to get extension token");
      const { token, user: tokenUser } = await res.json();

      const result = await sendToExtension({
        type: "auth",
        token,
        user: tokenUser,
      });
      if (!result.ok) {
        throw new Error(result.error || "Extension did not accept credentials");
      }
      setLinked(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLinking(false);
    }
  };

  if (loading || !user) {
    return (
      <AuthShell title="Loading" subtitle="Checking your session">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Link your extension"
      subtitle="Connect the Bridge AI Chrome extension to your account"
    >
      <div className="bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-2xl shadow-sky-500/5 space-y-5">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-500/5 border border-sky-500/10">
          <div className="w-10 h-10 rounded-lg bg-sky-500/20 flex items-center justify-center">
            <Puzzle className="w-5 h-5 text-sky-500" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Signed in as {user.email}</p>
            <p className="text-xs text-muted-foreground">
              One-click link — your extension will use this account for new captures.
            </p>
          </div>
        </div>

        {!linked && (
          <Button
            onClick={linkExtension}
            disabled={linking}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white h-11"
            size="lg"
          >
            {linking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Linking...
              </>
            ) : (
              "Link extension"
            )}
          </Button>
        )}

        {linked && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm">
            <Check className="w-4 h-4" />
            Extension linked. You can close this tab.
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>
    </AuthShell>
  );
}
