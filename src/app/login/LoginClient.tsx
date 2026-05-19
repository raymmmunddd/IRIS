"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  getRoleLandingPath,
  saveAuthUser,
  type AuthUser,
  type UserRole,
} from "@/lib/auth";

export default function LoginClient({
  roleFromQuery,
}: {
  roleFromQuery?: string;
}) {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const queryRole: UserRole | null =
    roleFromQuery === "resident" ||
    roleFromQuery === "official" ||
    roleFromQuery === "bpat"
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

      const result: {
        success: boolean;
        message: string;
        data: AuthUser | null;
      } = await response.json();

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
        description:
          error instanceof Error
            ? error.message
            : "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    }
  };

  const roleCopy = {
    resident: {
      title: "Welcome to IRIS!",
      body: "Report incidents, track case updates, and stay informed in your community.",
      highlights: [
        { heading: "Fast Reporting", detail: "Submit incidents in minutes" },
        { heading: "Verified Updates", detail: "Track real-time case status" },
        { heading: "Secure Access", detail: "Role-based system protection" },
      ],
    },
    official: {
      title: "Welcome to IRIS!",
      body: "Report incidents, track case updates, and stay informed in your community.",
      highlights: [
        { heading: "Case Verification", detail: "Review and validate reported incidents" },
        { heading: "Task Assignment", detail: "Schedule and assign officers" },
        { heading: "Real-Time Monitoring", detail: "Track case progress and reports" },
      ],
    },
    bpat: {
      title: "Welcome to IRIS!",
      body: "Report incidents, track case updates, and stay informed in your community.",
      highlights: [
        { heading: "Field Case Updates", detail: "Record on-site progress and outcomes" },
        { heading: "Mediation Logs", detail: "Document disputes and resolutions" },
        { heading: "Real-Time Alerts", detail: "Respond to new and priority cases quickly" },
      ],
    },
  } as const;

  return (
    <div className="min-h-screen lg:h-screen overflow-hidden bg-[var(--iris-bg)] text-[var(--iris-text)] lg:grid lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] auth-page-enter">

      {/* ================= LEFT HERO ================= */}
      <section className="auth-hero-enter relative hidden lg:flex items-center justify-center overflow-hidden bg-[radial-gradient(120%_120%_at_0%_0%,rgba(255,255,255,0.2)_0%,rgba(255,255,255,0)_45%),linear-gradient(135deg,#1E4FA3,#173E82,#0B1A3A)] p-10 xl:p-14">

        <div className="auth-hero-radial absolute inset-0 opacity-40" />
        <div className="auth-hero-linear absolute inset-0 opacity-80" />

        <div className="absolute -left-24 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-[var(--secondary)]/20 blur-3xl" />

        <div className="relative z-10 flex h-full w-full max-w-2xl flex-col justify-between text-white">

          <div className="space-y-7">

            {/* HEADER */}
            <div className="flex items-center justify-between gap-3">
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

            {/* TITLE */}
            <div className="space-y-4">
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/90">
                Secure sign in
              </p>

              <h1 className="text-3xl xl:text-4xl leading-tight font-semibold">
                {roleCopy[role].title}
              </h1>

              <p className="text-base xl:text-lg text-white/80 leading-relaxed">
                {roleCopy[role].body}
              </p>
            </div>

            {/* HIGHLIGHTS */}
            <div className="grid gap-3">
              {roleCopy[role].highlights.map((item) => (
                <div
                  key={item.heading}
                  className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-xs uppercase tracking-[0.14em] text-white/70">
                    {item.heading}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>

          </div>

          <div className="text-xs text-white/70">© 2026 IRIS</div>

        </div>
      </section>

      {/* ================= RIGHT LOGIN ================= */}
      <section className="auth-panel-enter flex min-h-screen items-center justify-center px-4 py-4 sm:px-6 lg:h-screen">

        <div className="w-full max-w-md space-y-3">

          <div className="text-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-semibold text-[var(--iris-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back to Homepage
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-5">

            {/* HEADER */}
            <div className="space-y-2 text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <LogIn className="h-5 w-5" />
              </div>

              <h2 className="text-2xl lg:text-3xl font-bold">
                Sign in
              </h2>

              <p className="text-sm text-[var(--iris-text-subtle)]">
                Access your account to report or monitor incidents.
              </p>
            </div>

            {/* FORM */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* EMAIL */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl border px-10"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl border px-10 pr-11"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* REMEMBER */}
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember Me
              </label>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[var(--iris-primary)] py-2.5 text-white font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </button>

            </form>

            <p className="text-center text-sm text-[var(--iris-text-subtle)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--iris-primary)]">
                Sign up
              </Link>
            </p>

          </div>
        </div>

      </section>
    </div>
  );
}