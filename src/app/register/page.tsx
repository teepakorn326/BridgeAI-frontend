"use client";

import React, { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AuthShell, OAuthButtons } from "@/components/AuthShell";
import { useAuth } from "@/lib/auth";
import { API_BASE } from "@/lib/api";

const PASSWORD_RULES = [
  { id: "len", label: "At least 10 characters", test: (p: string) => p.length >= 10 },
  { id: "upper", label: "One uppercase letter (A-Z)", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lower", label: "One lowercase letter (a-z)", test: (p: string) => /[a-z]/.test(p) },
  { id: "num", label: "One number (0-9)", test: (p: string) => /[0-9]/.test(p) },
  {
    id: "sym",
    label: "One symbol (!@#$…)",
    test: (p: string) => /[^A-Za-z0-9]/.test(p),
  },
];

const FALLBACK_COUNTRIES = [
  "Australia",
  "New Zealand",
  "Thailand",
  "China",
  "Singapore",
  "Malaysia",
  "Japan",
  "South Korea",
  "India",
  "United States",
  "United Kingdom",
];

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/";
  const { register } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [university, setUniversity] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [country, setCountry] = useState("Australia");
  const [countries, setCountries] = useState<string[]>(FALLBACK_COUNTRIES);
  const [universities, setUniversities] = useState<string[]>([]);

  useEffect(() => {
    const ctrl = new AbortController();
    const loadCountries = async () => {
      try {
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name",
          { signal: ctrl.signal }
        );
        const data: { name: { common: string } }[] = await res.json();
        const names = data
          .map((c) => c.name.common)
          .sort((a, b) => a.localeCompare(b));
        if (names.length) setCountries(names);
      } catch {}
    };
    loadCountries();
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    if (!country) return;
    const ctrl = new AbortController();
    const loadUniversities = async () => {
      setUniversities([]);
      try {
        const res = await fetch(
          `http://universities.hipolabs.com/search?country=${encodeURIComponent(country)}`,
          { signal: ctrl.signal }
        );
        const data: { name: string }[] = await res.json();
        const names = Array.from(new Set(data.map((u) => u.name))).sort();
        console.log('names', names)
        setUniversities(names);
      } catch {}
    };
    loadUniversities();
    return () => ctrl.abort();
  }, [country]);
  const [dob, setDob] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const failed = PASSWORD_RULES.find((r) => !r.test(password));
    if (failed) {
      setError(`Password requirement: ${failed.label}`);
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!/^[A-Za-z\s'-]+$/.test(firstName) || !/^[A-Za-z\s'-]+$/.test(lastName)) {
      setError("Name and last name must be in English letters only");
      return;
    }
    setLoading(true);
    try {
      await register({
        email,
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        university: university.trim(),
        mobile: mobile.trim(),
        country,
        dob,
      });
      router.push(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const oauth = (provider: "google" | "wechat") => {
    window.location.href = `${API_BASE}/auth/${provider}?next=${encodeURIComponent(next)}`;
  };

  const fieldLabel =
    "block text-xs font-medium text-muted-foreground uppercase tracking-wider";

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building multilingual learning content"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
            className="text-sky-600 font-medium hover:underline"
          >
            Sign in
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="first-name" className={fieldLabel}>
                First name (EN)
              </label>
              <Input
                id="first-name"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                disabled={loading}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="last-name" className={fieldLabel}>
                Last name (EN)
              </label>
              <Input
                id="last-name"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                disabled={loading}
                className="bg-secondary/50 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="university" className={fieldLabel}>
              University
            </label>
            <Input
              id="university"
              type="text"
              required
              list="university-options"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              placeholder={
                universities.length
                  ? `Search ${country} universities...`
                  : "Type your university"
              }
              disabled={loading}
              className="bg-secondary/50 border-border"
            />
            <datalist id="university-options">
              {universities.slice(0, 500).map((u) => (
                <option key={u} value={u} />
              ))}
            </datalist>
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className={fieldLabel}>
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label htmlFor="mobile" className={fieldLabel}>
                Mobile no.
              </label>
              <Input
                id="mobile"
                type="tel"
                required
                inputMode="tel"
                pattern="[0-9+\-\s()]{6,}"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+66 81 234 5678"
                disabled={loading}
                className="bg-secondary/50 border-border"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dob" className={fieldLabel}>
                Date of birth
              </label>
              <Input
                id="dob"
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                disabled={loading}
                className="bg-secondary/50 border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="country" className={fieldLabel}>
              Country
            </label>
            <Select value={country} onValueChange={setCountry} disabled={loading}>
              <SelectTrigger id="country" className="bg-secondary/50 border-border">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {countries.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className={fieldLabel}>
              Password
            </label>
            <Input
              id="password"
              type="password"
              required
              minLength={10}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 10 characters"
              disabled={loading}
              className="bg-secondary/50 border-border"
            />
            {password.length > 0 && (
              <ul className="space-y-1 pt-1">
                {PASSWORD_RULES.map((r) => {
                  const ok = r.test(password);
                  return (
                    <li
                      key={r.id}
                      className={`flex items-center gap-2 text-xs ${
                        ok ? "text-emerald-600" : "text-muted-foreground"
                      }`}
                    >
                      {ok ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <X className="w-3.5 h-3.5" />
                      )}
                      <span>{r.label}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-password" className={fieldLabel}>
              Confirm password
            </label>
            <Input
              id="confirm-password"
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              disabled={loading}
              aria-invalid={
                confirmPassword.length > 0 && confirmPassword !== password
              }
              className="bg-secondary/50 border-border aria-[invalid=true]:border-destructive"
            />
            {confirmPassword.length > 0 && confirmPassword !== password && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white h-11"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
