"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("Attempted login (placeholder).");
    setTimeout(() => setIsLoading(false), 600);
  };

  const inputClass =
    "w-full rounded-lg border border-[#E3E8EF] bg-white px-4 py-2.5 text-sm text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#1E4FA3] focus:border-[#1E4FA3]";

  return (
    <div className="min-h-screen bg-[#F6F8FB] text-[#1F2937] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 space-y-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6B7280]">Welcome back</p>
          <h1 className="text-3xl font-bold">Sign in to IRIS</h1>
          <p className="text-sm text-[#6B7280]">Use your work email and password to continue.</p>
        </div>

        <div className="rounded-xl border border-[#E3E8EF] bg-white shadow-sm p-6 space-y-6">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#1F2937]">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-medium text-[#1F2937]">
                <label htmlFor="password">Password</label>
                <Link href="#" className="text-[#1E4FA3] hover:text-[#173E82]">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            {message ? (
              <div className="rounded-lg border border-[#E3E8EF] bg-[#E8F0FF] px-4 py-3 text-sm text-[#1F2937]">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-[#1E4FA3] hover:bg-[#173E82] text-white font-semibold py-3 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-sm text-[#6B7280]">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold text-[#1E4FA3] hover:text-[#173E82]">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
