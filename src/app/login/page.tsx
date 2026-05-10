"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { getRoleLandingPath, saveAuthUser, type AuthUser, type UserRole } from "@/lib/auth";

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleFromQuery = searchParams.get("role");
  const queryRole: UserRole | null =
    roleFromQuery === "resident" || roleFromQuery === "official" || roleFromQuery === "bpat"
      ? roleFromQuery
      : null;
  const role: UserRole = queryRole ?? "resident";

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields.",
        variant: "warning",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result: { success: boolean; message: string; data: AuthUser | null } = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message);
      }

      saveAuthUser(result.data);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        variant: "success",
      });
      router.push(getRoleLandingPath(result.data.role));
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const roleCopy = {
    resident: {
      title: "Welcome, Resident! 👋",
      body: "Report incidents, track case updates, and stay informed in your community.",
      highlights: [
        {
          heading: "Fast Reporting",
          detail: "Submit incidents in minutes",
        },
        {
          heading: "Verified Updates",
          detail: "Track real-time case status",
        },
        {
          heading: "Secure Access",
          detail: "Role-based system protection",
        },
      ],
    },
    official: {
      title: "Welcome, Admin! 👋",
      body: "Manage cases, assign tasks, and monitor barangay operations efficiently with IRIS.",
      highlights: [
        {
          heading: "Case Verification",
          detail: "Review and validate reported incidents",
        },
        {
          heading: "Task Assignment",
          detail: "Schedule and assign officers",
        },
        {
          heading: "Real-Time Monitoring",
          detail: "Track case progress and reports",
        },
      ],
    },
    bpat: {
      title: "Welcome, Officer! 👋",
      body: "Log mediation updates, manage field cases, and respond to assigned incidents in real time.",
      highlights: [
        {
          heading: "Field Case Updates",
          detail: "Record on-site progress and outcomes",
        },
        {
          heading: "Mediation Logs",
          detail: "Document disputes and resolutions",
        },
        {
          heading: "Real-Time Alerts",
          detail: "Respond to new and priority cases quickly",
        },
      ],
    },
  } as const;

  return (
    <div className="min-h-screen lg:h-screen overflow-hidden bg-[var(--iris-bg)] text-[var(--iris-text)] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <section className="relative hidden lg:flex items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_45%),linear-gradient(135deg,#1E4FA3,#173E82,#0B1A3A)] p-10 xl:p-14">
        <div className="auth-hero-radial absolute inset-0 opacity-40" />
        <div className="auth-hero-linear absolute inset-0 opacity-80" />
        <div className="absolute -left-24 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[var(--secondary)]/20 blur-3xl" />
        <div className="relative z-10 flex h-full w-full max-w-xl flex-col justify-between text-white">
          <div className="space-y-7">
           <div className="flex items-center justify-between gap-3">
            {/* Barangay Logo */}
            <div className="flex items-center gap-3">
              <img
                src="/EastTapinac.png"
                alt="Barangay East Tapinac"
                className="h-14 w-14"
              />

              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">
                  IRIS Access
                </p>
                <p className="text-sm font-semibold text-white">
                  Barangay East Tapinac
                </p>
              </div>
            </div>

          </div>
            <div className="space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Secure sign in
              </p>
              <h1 className="text-3xl xl:text-4xl leading-tight font-semibold">{roleCopy[role].title}</h1>
              <p className="text-base xl:text-lg text-white/80 leading-relaxed">{roleCopy[role].body}</p>
            </div>
            <div className="grid gap-3">
              {roleCopy[role].highlights.map((item) => (
                <div key={item.heading} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/70">{item.heading}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-white/70">
            <span>© 2026 IRIS</span>
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 sm:py-5 lg:min-h-0 lg:h-screen lg:px-10 lg:py-0">
        <div className="w-full max-w-md space-y-3">
          <div className="text-sm">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              <ArrowLeft className="h-4 w-4" />
              Go Back to Homepage
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur">
            <div className="space-y-2 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <LogIn className="h-5 w-5" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--iris-text)]">Sign in</h2>
              <p className="text-sm text-[var(--iris-text-subtle)]">Access your account to report or monitor incidents.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <label htmlFor="email" className="sr-only">Email</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={isLoading}
                />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="h-12 w-full rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 pr-11 text-sm text-[var(--iris-text)] placeholder:text-[var(--iris-text-subtle)] shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--iris-text-subtle)] hover:text-[var(--iris-primary)]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-sm text-[var(--iris-text)]">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-[var(--iris-text)]">Remember Me</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-[var(--iris-primary)] py-2.5 text-white font-semibold shadow-[0_12px_30px_rgba(30,79,163,0.3)] transition-all duration-200 hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" aria-hidden />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

          </form>

            <p className="text-center text-sm text-[var(--iris-text-subtle)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
                Sign up.
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
