"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, X, Eye, EyeOff, ShieldCheck, ClipboardCheck, Database, UserCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { login } from "@/lib/auth";

export default function LoginPage() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<"resident" | "official" | "bpat">("resident");
  const [legalDoc, setLegalDoc] = useState<"terms" | "privacy" | null>(null);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

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
      const success = login(email, password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
          variant: "success",
        });
        // Do not set isLoading(false) here, let the navigation handle it
        router.push("/dashboard");
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
      title: "Hello, Resident! 👋",
      body: "Report incidents, track status updates, and stay informed with IRIS. Your community updates are just a click away.",
      loginCopy: "Use your community email to report incidents and track case updates.",
    },
    official: {
      title: "Welcome, Official! 👋",
      body: "Verify cases, schedule assignments, and monitor reports efficiently. IRIS keeps your dashboard and community operations organized.",
      loginCopy: "Use your work email to access dashboards, cases, and collaboration.",
    },
    bpat: {
      title: "Hello, BPAT Officer! 👋",
      body: "Log mediation updates, manage field cases, and respond to AI-flagged reports. IRIS helps you act quickly and keep every case moving.",
      loginCopy: "Use your work email to access dashboards, cases, and collaboration.",
    },
  } as const;

  const legalContent = {
    terms: {
      title: "Terms of Service",
      intro:
        "These Terms govern your access to IRIS (Incident Reporting and Intelligence System) for incident filing, case tracking, and barangay operations.",
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
    <div className="min-h-screen lg:h-screen overflow-hidden bg-[var(--iris-bg)] text-[var(--iris-text)] grid lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--iris-primary)] via-[var(--iris-primary-strong)] to-[#0C1F4A] p-10 xl:p-14">
        <div className="auth-hero-radial absolute inset-0 opacity-30" />
        <div className="auth-hero-linear absolute inset-0" />
        <div className="relative z-10 max-w-xl space-y-5 text-white">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <span className="text-3xl">✶</span>
          </div>
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
              Welcome back
            </p>
            <h1 className="text-3xl xl:text-4xl leading-tight font-semibold">{roleCopy[role].title}</h1>
            <p className="text-base xl:text-lg text-white/80 leading-relaxed">{roleCopy[role].body}</p>
          </div>
          <p className="text-sm text-white/70">© 2026 IRIS – Barangay East Tapinac. All rights reserved.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-3 sm:px-6 lg:px-10">
        <div className="w-full max-w-xl lg:max-w-lg space-y-3">
          <div className="text-sm">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Link>
          </div>

          <div className="space-y-4 rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/92 p-5 shadow-[0_10px_60px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6 lg:p-6">

            <div className="space-y-1.5 flex flex-col items-center text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
                <LogIn className="h-5 w-5" />
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold text-[var(--iris-text)]">Login with IRIS</h2>
              <p className="text-sm text-[var(--iris-text-subtle)]">{roleCopy[role].loginCopy}</p>
            </div>

            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <p className="text-sm font-medium text-[var(--iris-text)]">Select your role</p>
                <Select value={role} onValueChange={(val: any) => setRole(val)}>
                  <SelectTrigger className="w-full bg-[var(--iris-surface)] border-[var(--iris-border)]">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="bg-[var(--iris-surface)] border-[var(--iris-border)]">
                    <SelectItem value="resident">Resident</SelectItem>
                    <SelectItem value="official">Barangay Official</SelectItem>
                    <SelectItem value="bpat">BPAT Officer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="peer w-full rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 py-3 text-sm text-[var(--iris-text)] placeholder-transparent focus:border-[var(--iris-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] disabled:opacity-70"
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
                className="peer w-full rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-10 py-3 pr-11 text-sm text-[var(--iris-text)] placeholder-transparent focus:border-[var(--iris-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] disabled:opacity-70"
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
                <Link href="#" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">Forgot your password?</Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--iris-primary)] hover:bg-[var(--iris-primary-strong)] text-white font-semibold py-2.5 transition-all duration-200 shadow-[0_10px_30px_rgba(30,79,163,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
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

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] py-2.5 text-sm font-semibold text-[var(--iris-text)] shadow-sm hover:border-[#D1D5DB] transition-colors"
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

          <p className="text-center text-xs text-[#6B7280]">
            By signing in, you agree to the
            <button type="button" onClick={() => openLegalDoc("terms")} className="mx-1 font-semibold text-[#1E4FA3] hover:text-[#173E82]">
              Terms of Service
            </button>
            and acknowledge the
            <button type="button" onClick={() => openLegalDoc("privacy")} className="ml-1 font-semibold text-[#1E4FA3] hover:text-[#173E82]">
              Privacy Policy
            </button>
            .
          </p>

            <p className="text-center text-sm text-[#6B7280]">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="font-semibold text-[#1E4FA3] hover:text-[#173E82]">
                Create a new account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {legalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl transform rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 transition-all animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[var(--iris-border)] px-6 py-4">
              <h3 className="text-lg font-semibold text-[var(--iris-text)] flex items-center gap-2">
                 <ShieldCheck className="h-5 w-5 text-[var(--iris-primary)]" />
                 {legalContent[legalDoc].title}
              </h3>
              <button
                type="button"
                onClick={() => setLegalDoc(null)}
                aria-label="Close dialog"
                className="rounded-full p-2 text-[var(--iris-text-subtle)] hover:bg-[var(--iris-muted)] hover:text-[var(--iris-text)] transition-colors"
                style={{ borderRadius: '50%' }}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-6 py-6 text-sm text-[var(--iris-text)] custom-scrollbar">
              <div className="mb-6 rounded-lg bg-[var(--iris-primary-light)]/50 p-4 text-[var(--iris-primary-strong)]">
                  <p className="font-medium">{legalContent[legalDoc].intro}</p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {legalContent[legalDoc].body.map((item, index) => {
                  const [heading, ...rest] = item.split(": ");
                  const detail = rest.join(": ");
                  const icons = [ShieldCheck, ClipboardCheck, Database, UserCheck] as const;
                  const Icon = icons[index % icons.length];

                  return (
                    <div key={item} className="group rounded-xl border border-[var(--iris-border)] bg-white p-4 hover:border-[var(--iris-primary)]/30 hover:shadow-sm transition-all">
                      <div className="mb-2 inline-flex items-center gap-2 text-[var(--iris-primary)]">
                        <div className="rounded-lg bg-[var(--iris-primary-light)] p-1.5 group-hover:bg-[var(--iris-primary)] group-hover:text-white transition-colors">
                            <Icon className="h-4 w-4" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-wide text-[var(--iris-text)] group-hover:text-[var(--iris-primary)] transition-colors">{heading}</p>
                      </div>
                      <p className="text-xs leading-relaxed text-[var(--iris-text-subtle)]">{detail}</p>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[var(--iris-border)] bg-gray-50/50 px-6 py-4 rounded-b-2xl">
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
                 className="rounded-lg bg-[var(--iris-primary)] px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[var(--iris-primary-strong)] disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                 Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
