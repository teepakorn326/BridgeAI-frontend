"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";

export default function AuthCallbackPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useAuth();

  useEffect(() => {
    const error = params.get("error");
    const next = params.get("next") || "/";

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    refresh().then((user) => {
      if (user) router.replace(next);
      else router.replace("/login?error=session_not_found");
    });
  }, [params, router, refresh]);

  return (
    <AuthShell title="Signing you in" subtitle="Just a moment...">
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
      </div>
    </AuthShell>
  );
}
