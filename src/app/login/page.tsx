"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [role, setRole] = useState<"resident" | "official" | "bpat">("resident");

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("Attempted login (placeholder).");
    setTimeout(() => setIsLoading(false), 600);
  };

  const roleCopy = {
    resident: {
      title: "Hello, Resident! 👋",
      body: "Report incidents, track status updates, and stay informed with IRIS. Your community updates are just a click away.",
    },
    official: {
      title: "Welcome, Official! 👋",
      body: "Verify cases, schedule assignments, and monitor reports efficiently. IRIS keeps your dashboard and community operations organized.",
    },
    bpat: {
      title: "Hello, BPAT Officer! 👋",
      body: "Log mediation updates, manage field cases, and respond to AI-flagged reports. IRIS helps you act quickly and keep every case moving.",
    },
  } as const;

  return (
    <div className="min-h-screen bg-[var(--iris-bg)] text-[var(--iris-text)] grid lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden lg:flex items-center justify-center overflow-hidden bg-gradient-to-br from-[var(--iris-primary)] via-[var(--iris-primary-strong)] to-[#0C1F4A] p-12">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 28%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.14), transparent 32%)" }} />
        <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(120deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 35%, rgba(255,255,255,0) 50%), linear-gradient(210deg, rgba(255,255,255,0.05) 10%, rgba(255,255,255,0.02) 48%, rgba(255,255,255,0) 72%)" }} />
        <div className="relative z-10 max-w-xl space-y-6 text-white">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur">
            <span className="text-3xl">✶</span>
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl leading-tight font-semibold">{roleCopy[role].title}</h1>
            <p className="text-lg text-white/80 leading-relaxed">{roleCopy[role].body}</p>
          </div>
          <p className="text-sm text-white/70">© 2026 IRIS – Barangay East Tapinac. All rights reserved.</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full max-w-lg space-y-8 bg-[var(--iris-surface)]/80 backdrop-blur rounded-2xl border border-[var(--iris-border)] shadow-[0_10px_60px_rgba(15,23,42,0.08)] p-8">
          <div className="flex justify-between items-center text-sm">
            <Link href="/" className="inline-flex items-center gap-2 font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">
              <span aria-hidden>←</span>
              Back to homepage
            </Link>
            <span className="text-[var(--iris-text-subtle)]">Need help?</span>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--iris-text-subtle)]">Welcome back</p>
            <h2 className="text-3xl font-bold text-[var(--iris-text)]">Log in to IRIS</h2>
            <p className="text-sm text-[var(--iris-text-subtle)]">
              Use your work email to access dashboards, cases, and collaboration.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className="text-sm font-medium text-[var(--iris-text)]">Select your role</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { key: "resident", label: "Resident" },
                  { key: "official", label: "Barangay Official" },
                  { key: "bpat", label: "BPAT Officer" },
                ].map((option) => (
                  <label
                    key={option.key}
                    className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                      role === option.key
                        ? "border-[var(--iris-primary)] bg-[var(--iris-primary-light)] text-[var(--iris-text)]"
                        : "border-[var(--iris-border)] bg-[var(--iris-surface)] text-[var(--iris-text)] hover:border-[#D1D5DB]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.key}
                      className="sr-only"
                      checked={role === option.key}
                      onChange={() => setRole(option.key as typeof role)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--iris-text)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="w-full rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 py-3 text-sm text-[var(--iris-text)] placeholder-[var(--iris-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] focus:border-[var(--iris-primary)] disabled:opacity-70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@agency.gov"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--iris-text)]">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className="w-full rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] px-4 py-3 text-sm text-[var(--iris-text)] placeholder-[var(--iris-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--iris-primary)] focus:border-[var(--iris-primary)] disabled:opacity-70"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
              <div className="flex items-center justify-between pt-1 text-sm text-[var(--iris-text)]">
                <label className="inline-flex items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#D1D5DB] text-[var(--iris-primary)] focus:ring-[var(--iris-primary)]"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="text-[var(--iris-text)]">Remember me</span>
                </label>
                <Link href="#" className="font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]">Forgot your password?</Link>
              </div>
            </div>

            {message ? (
              <div className="rounded-lg border border-[var(--iris-border)] bg-[var(--iris-primary-light)] px-4 py-3 text-sm text-[var(--iris-text)]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[var(--iris-primary)] hover:bg-[var(--iris-primary-strong)] text-white font-semibold py-3 transition-all duration-200 shadow-[0_10px_30px_rgba(30,79,163,0.35)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Login Now"}
            </button>

            <button
              type="button"
              className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-[var(--iris-border)] bg-[var(--iris-surface)] py-3 text-sm font-semibold text-[var(--iris-text)] shadow-sm hover:border-[#D1D5DB] transition-colors"
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

          <p className="text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#1E4FA3] hover:text-[#173E82]">
              Create a new account
            </Link>
          </p>
        </div>
      </section>
    </div>
  );
}
