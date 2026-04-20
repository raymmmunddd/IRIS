"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Mail, Lock, X, Eye, EyeOff, ShieldCheck, ClipboardCheck, Database, UserCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { getRoleLandingPath, login, type UserRole } from "@/lib/auth";

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const roleFromQuery = searchParams.get("role");
  const queryRole: UserRole | null =
    roleFromQuery === "resident" || roleFromQuery === "official" || roleFromQuery === "bpat"
      ? roleFromQuery
      : null;
  const role: UserRole = selectedRole ?? queryRole ?? "resident";

  const openLegalDoc = (doc: "terms" | "privacy") => {
    setLegalAccepted(false);
    setLegalDoc(doc);
  };

  const handleSubmit = (event: React.FormEvent) => {
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
    
    // Simulate login delay
    setTimeout(() => {
      const success = login(email, password, role);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "success",
        });
        // Do not set isLoading(false) here, let the navigation handle it
        router.push(getRoleLandingPath(role));
      } else {
        setIsLoading(false);
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    }, 800);
  };

  const roleCopy = {
    resident: {
      title: "Welcome, Resident! 👋",
      body: "Report incidents, track case updates, and stay informed in your community.",
      loginCopy: "Access your IRIS account to report and monitor incidents.",
      actionTitle: "Login",
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
      loginCopy: "Use your work email to access the case management tools.",
      actionTitle: "Login",
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
      loginCopy: "Use your work email to access field operations and case updates.",
      actionTitle: "Login",
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

  const legalContent = {
    terms: {
      title: "Terms of Service",
      intro:
        "These Terms govern your access to IRIS (Incident Report and Information System) for incident filing, case tracking, and barangay operations.",
      body: [
        "1. Account Responsibility: You are responsible for maintaining the confidentiality of your account and all actions performed under your login.",
        "2. Acceptable Use: You agree to submit truthful incident data, avoid impersonation, and not upload harmful, illegal, or misleading content.",
        "3. Case Integrity: Case records, updates, and evidence must only be handled by authorized users and for legitimate community safety workflows.",
        "4. Service Availability: IRIS may receive updates, maintenance, or temporary interruptions to improve reliability and security.",
      ],
    },
    privacy: {
      title: "Privacy Policy",
      intro:
        "IRIS collects only the information required to verify users, process reports, and support responsible public safety operations.",
      body: [
        "1. Data We Process: Profile details, incident submissions, case notes, and audit activity needed for coordination and accountability.",
        "2. Purpose of Use: Information is used for case handling, analytics, notifications, and service improvements within authorized government workflows.",
        "3. Protection Measures: Access controls, role permissions, and logging are applied to reduce unauthorized use and protect sensitive records.",
        "4. Your Rights: You may request corrections to inaccurate profile information through your barangay administrator or system operator.",
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
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-base font-semibold">
                I
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">IRIS Access</p>
                <p className="text-sm font-semibold text-white">Barangay East Tapinac</p>
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
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--iris-text)]">{roleCopy[role].actionTitle}</h2>
              <p className="text-sm text-[var(--iris-text-subtle)]">{roleCopy[role].loginCopy}</p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--iris-text)]">Select your role</p>
                <div className="grid grid-cols-3 rounded-xl border border-[var(--iris-border)] bg-[var(--iris-primary-light)]/25 p-1">
                  {[
                    { value: "resident", label: "Resident" },
                    { value: "official", label: "Admin" },
                    { value: "bpat", label: "Officer" },
                  ].map((roleItem) => (
                    <button
                      key={roleItem.value}
                      type="button"
                      onClick={() => setSelectedRole(roleItem.value as UserRole)}
                      className={cn(
                        "h-9 rounded-lg border text-sm font-medium transition",
                        role === roleItem.value
                          ? "border-[var(--iris-primary)]/45 bg-[var(--iris-primary-light)]/60 text-[var(--iris-primary-strong)]"
                          : "border-transparent bg-transparent text-[var(--iris-text-subtle)] hover:border-[var(--iris-primary)]/25 hover:bg-[var(--iris-primary-light)]/35 hover:text-[var(--iris-primary)]"
                      )}
                    >
                      {roleItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className="peer w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 py-2.5 text-sm text-[var(--iris-text)] placeholder-transparent shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] disabled:opacity-70"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  disabled={isLoading}
                />
                <label
                  htmlFor="email"
                  className={cn(
                    "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-[var(--iris-text-subtle)] transition-opacity duration-150",
                    "peer-focus:opacity-0",
                    email && "opacity-0"
                  )}
                >
                  Email address
                </label>
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className="peer w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 py-2.5 pr-11 text-sm text-[var(--iris-text)] placeholder-transparent shadow-sm transition focus:border-[var(--iris-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] disabled:opacity-70"
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
              <label
                htmlFor="password"
                className={cn(
                  "pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-sm text-[var(--iris-text-subtle)] transition-opacity duration-150",
                  "peer-focus:opacity-0",
                  password && "opacity-0"
                )}
              >
                Password
              </label>
            </div>

            <div className="flex items-center justify-between pt-0.5 text-sm text-[var(--iris-text)]">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-[var(--iris-text)]">Remember me</span>
                </label>
                <Link href="/forgot-password" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">Forgot your password?</Link>
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
                "Login"
              )}
            </button>

            <div className="flex items-center gap-3 text-xs text-[var(--iris-text-subtle)]">
              <span className="h-px flex-1 bg-[var(--iris-border)]" />
              Or continue with
              <span className="h-px flex-1 bg-[var(--iris-border)]" />
            </div>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] py-2.5 text-sm font-semibold text-[var(--iris-text)] shadow-sm transition-colors hover:border-[#D1D5DB]"
            >
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.6 12.2273C21.6 11.5182 21.5364 10.8364 21.4182 10.1818H12V14.05H17.4182C17.1864 15.3 16.4909 16.3364 15.4455 17.0273V19.5909H18.5455C20.5091 17.7818 21.6 15.2727 21.6 12.2273Z" fill="#4285F4" />
                <path d="M12 22C14.7 22 16.9636 21.1045 18.5455 19.5909L15.4455 17.0273C14.5818 17.6091 13.4182 17.95 12 17.95C9.38182 17.95 7.16364 16.1273 6.37273 13.7727H3.18182V16.4091C4.75455 19.6727 8.10909 22 12 22Z" fill="#34A853" />
                <path d="M6.37273 13.7727C6.16364 13.1909 6.04545 12.5682 6.04545 11.9091C6.04545 11.25 6.16364 10.6273 6.37273 10.0455V7.40909H3.18182C2.42727 8.82727 2 10.3636 2 11.9091C2 13.4545 2.42727 14.9909 3.18182 16.4091L6.37273 13.7727Z" fill="#FBBC05" />
                <path d="M12 5.86818C13.5455 5.86818 14.9364 6.4 16.0364 7.44545L18.6182 4.86364C16.9636 3.31818 14.7 2.4 12 2.4C8.10909 2.4 4.75455 4.72727 3.18182 7.99091L6.37273 10.6273C7.16364 8.27273 9.38182 6.45 12 6.45V5.86818Z" fill="#EA4335" />
              </svg>
              Login with Google
            </button>
          </form>

          <p className="text-center text-xs text-[var(--iris-text-subtle)]">
            By signing in, you agree to the
            <button type="button" onClick={() => openLegalDoc("terms")} className="mx-1 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              Terms of Service
            </button>
            and acknowledge the
            <button type="button" onClick={() => openLegalDoc("privacy")} className="ml-1 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              Privacy Policy
            </button>
            .
          </p>

            <p className="text-center text-sm text-[var(--iris-text-subtle)]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
                Create one.
              </Link>
            </p>
          </div>
        </div>
      </section>

      {legalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl">
            <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)] shadow-2xl ring-1 ring-black/5 transition-all animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b border-[var(--iris-border)] bg-[var(--iris-primary-light)]/40 px-6 py-4">
                <h3 className="text-lg font-semibold text-[var(--iris-text)] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[var(--iris-primary)]" />
                  {legalContent[legalDoc].title}
                </h3>
                <button
                  type="button"
                  onClick={() => setLegalDoc(null)}
                  aria-label="Close dialog"
                  className="rounded-full p-2 text-[var(--iris-text-subtle)] hover:bg-white/70 hover:text-[var(--iris-text)] transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto px-6 py-6 text-sm text-[var(--iris-text)] custom-scrollbar">
                <div className="mb-6 rounded-2xl border border-[var(--iris-border)] bg-white/70 p-4 text-[var(--iris-primary-strong)]">
                  <p className="font-medium">{legalContent[legalDoc].intro}</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {legalContent[legalDoc].body.map((item, index) => {
                    const [heading, ...rest] = item.split(": ");
                    const detail = rest.join(": ");
                    const icons = [ShieldCheck, ClipboardCheck, Database, UserCheck] as const;
                    const Icon = icons[index % icons.length];

                    return (
                      <div key={item} className="group rounded-2xl border border-[var(--iris-border)] bg-white p-4 transition-all hover:border-[var(--iris-primary)]/30 hover:shadow-sm">
                        <div className="mb-2 inline-flex items-center gap-2 text-[var(--iris-primary)]">
                          <div className="rounded-lg bg-[var(--iris-primary-light)] p-1.5 transition-colors group-hover:bg-[var(--iris-primary)] group-hover:text-white">
                            <Icon className="h-4 w-4" />
                          </div>
                          <p className="text-xs font-bold uppercase tracking-wide text-[var(--iris-text)] transition-colors group-hover:text-[var(--iris-primary)]">{heading}</p>
                        </div>
                        <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">{detail}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-[var(--iris-border)] bg-[var(--iris-primary-light)]/20 px-6 py-4">
                <label className="inline-flex items-center gap-2 text-sm text-[var(--iris-text-subtle)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={legalAccepted}
                    onChange={(e) => setLegalAccepted(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)] accent-[var(--iris-primary)]"
                  />
                  <span className="font-medium">I have read and agree</span>
                </label>
                <button
                  type="button"
                  onClick={() => setLegalDoc(null)}
                  disabled={!legalAccepted}
                  className="rounded-lg bg-[var(--iris-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[var(--iris-primary-strong)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
