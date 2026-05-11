"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import DocumentReader from "@/components/DocumentReader";
import { DocumentResponse } from "@/types";
import { API_BASE } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function DocumentPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const lang = search.get("lang");
  const documentID = params.id;

  const [data, setData] = useState<DocumentResponse | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!documentID || !lang) {
      setNotFound(true);
      return;
    }
    fetch(
      `${API_BASE}/api/document?id=${encodeURIComponent(documentID)}&lang=${encodeURIComponent(lang)}`,
      { credentials: "include" }
    )
      .then(async (r) => {
        if (r.status === 404) {
          setNotFound(true);
          return null;
        }
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || "Failed to load document");
        }
        return r.json();
      })
      .then((d: DocumentResponse | null) => {
        if (d) setData(d);
      })
      .catch((err) => setError(err.message));
  }, [documentID, lang]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <button onClick={() => router.push("/home")} className="text-sm text-sky-500 hover:underline">
            ← Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-16">
        <div className="max-w-xl mx-auto">
          <Card className="bg-card/60 backdrop-blur-sm border border-border shadow-xl">
            <CardContent className="p-8 space-y-4 text-center">
              <div className="text-4xl">📄</div>
              <h1 className="text-2xl font-bold tracking-tight">Document not found</h1>
              <p className="text-sm text-muted-foreground">
                We couldn&apos;t find this document. Re-upload from the dashboard.
              </p>
              <div className="flex gap-2 justify-center pt-2">
                <Button variant="outline" onClick={() => router.push("/home")}>
                  Back to dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          Loading document...
        </div>
      </div>
    );
  }

  return <DocumentReader data={data} onBack={() => router.push("/home")} />;
}
