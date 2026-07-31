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
      title: "Welcome to IRIS!",
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
      title: "Welcome to IRIS!",
      body: "Report incidents, track case updates, and stay informed in your community.",
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
      title: "Welcome to IRIS!",
      body: "Report incidents, track case updates, and stay informed in your community.",
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
  <>
  {/* MAIN LAYOUT */}
  <div className="
    min-h-screen
    bg-[var(--iris-bg)]
    text-[var(--iris-text)]
    lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]
    auth-page-enter overflow-hidden">

    {/* LEFT HERO */}
    <section
      className="relative hidden lg:flex overflow-hidden"
      style={{
        background: `
          radial-gradient(circle at top left, rgba(217,165,20,0.18), transparent 35%),
          radial-gradient(circle at bottom right, rgba(255,255,255,0.06), transparent 45%),
          linear-gradient(
            150deg,
            #091225 0%,
            #101B35 35%,
            #14264A 70%,
            #091225 100%
          )
        `,
      }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:42px_42px]" />

      <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-[var(--primary)]/10 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-yellow-300/5 blur-3xl" />

      <div className="relative z-10 flex h-full w-full flex-col justify-between p-14 text-white">

        {/* Header */}
        <div className="space-y-10">

          <div className="flex items-center gap-4">
            <img
              src="/NewKalalake.png"
              alt="Barangay"
              className="h-16 w-16"
            />

            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-yellow-300">
                IRIS PORTAL
              </p>

              <h2 className="mt-1 text-lg font-semibold">
                Barangay New Kalalake
              </h2>
            </div>
          </div>

          <div className="space-y-5 max-w-xl">

            <span className="inline-flex rounded-full bg-[var(--primary)]/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-yellow-300 border border-yellow-400/20">
              Secure Login
            </span>

            <h1 className="text-5xl font-semibold leading-tight">
              Welcome to IRIS!
            </h1>

            <p className="text-lg leading-8 text-white/70">
              Access your secure workspace and manage incident reports,
              investigations, and barangay operations with confidence.
            </p>

          </div>

          {/* Timeline */}
          <div className="space-y-6 pt-4">

            {[
              "Role-based authentication",
              "Protected resident records",
              "Secure case management"
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--foreground)] font-bold">
                  ✓
                </div>

                <div>
                  <p className="text-sm font-medium">{item}</p>
                </div>
              </div>
            ))}

          </div>

        </div>

        <div className="flex justify-between text-xs text-white/50">
          <span>© 2026 IRIS</span>
        </div>

      </div>
    </section>

      {/* RIGHT SIDE */}
      <section className="flex min-h-screen items-center justify-center px-4 py-5 sm:px-6 lg:px-8">
        <div
          className="
            w-full max-w-md
            overflow-hidden
            rounded-3xl
            border border-[var(--iris-border)]
            bg-[var(--iris-surface)]/96
            shadow-[0_24px_70px_rgba(15,23,42,0.14)]
            backdrop-blur-xl
          "
        >
          
            {/* GO BACK INSIDE MODAL */}
            <div className="px-5 py-5 sm:px-6">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--iris-border)]">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Go back to Homepage
                </Link>
              </div>

            {/* HEADER */}
            <div className="space-y-2 text-center">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <LogIn className="h-5 w-5" />
              </div>

              <h2 className="text-2xl font-bold text-[var(--iris-text)]">
                Sign in
              </h2>

              <p className="text-sm leading-relaxed text-[var(--iris-text-subtle)]">
                Access your account to report or monitor incidents.
              </p>
            </div>

            {/* FORM */}
            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="
                    h-12 w-full rounded-2xl
                    border border-[var(--iris-border)]
                    bg-[var(--iris-surface)]
                    px-10 text-sm
                    text-[var(--iris-text)]
                    placeholder:text-[var(--iris-text-subtle)]
                    shadow-sm transition
                    focus:border-[var(--iris-primary)]
                    focus:outline-none
                    focus:ring-1
                    focus:ring-[var(--iris-primary)]
                  "
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={isLoading}
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  className="
                    h-12 w-full rounded-2xl
                    border border-[var(--iris-border)]
                    bg-[var(--iris-surface)]
                    px-10 pr-11 text-sm
                    text-[var(--iris-text)]
                    placeholder:text-[var(--iris-text-subtle)]
                    shadow-sm transition
                    focus:border-[var(--iris-primary)]
                    focus:outline-none
                    focus:ring-1
                    focus:ring-[var(--iris-primary)]
                  "
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--iris-text-subtle)] transition hover:text-[var(--iris-primary)]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* OPTIONS */}
              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#D1D5DB] accent-[var(--iris-primary)]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-[var(--iris-text)]">
                    Remember Me
                  </span>
                </label>

                <Link
                  href="/forgot-password"
                  className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                >
                  Forgot Password?
                </Link>
              </div>

              {/* BUTTON */}
              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full rounded-xl
                  bg-[var(--iris-primary)]
                  py-2.5 font-semibold text-white
                  shadow-[0_12px_30px_rgba(30,79,163,0.28)]
                  transition-all duration-200
                  hover:-translate-y-[1px]
                  hover:bg-[var(--iris-primary-strong)]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {isLoading ? (
                  <span className="inline-flex items-center justify-center gap-2">
                    <span className="h-4 w-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>

              {/* LEGAL */}
              <p className="text-center text-xs leading-relaxed text-[var(--iris-text-subtle)]">
                By signing in, you agree to our{" "}
                <Link
                  href="/privacy-policy"
                  className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                >
                  Privacy Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms"
                  className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
                >
                  Terms of Service
                </Link>
                .
              </p>
            </form>

            {/* FOOTER */}
            <p className="mt-5 text-center text-sm text-[var(--iris-text-subtle)]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
              >
                Sign up.
              </Link>
            </p>
          </div>
        </div>
      </section>
      </div>
    </>
  );
}
