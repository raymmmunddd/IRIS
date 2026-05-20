"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, KeyRound, Lock, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const emailFromQuery = searchParams.get("email") ?? ""

  const [email, setEmail] = useState(emailFromQuery)
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [devCode, setDevCode] = useState<string | null>(null)

  useEffect(() => {
    if (!emailFromQuery) return
    setDevCode(sessionStorage.getItem(`iris_password_reset_dev_code:${emailFromQuery.trim().toLowerCase()}`))
  }, [emailFromQuery])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Enter the email address linked to your IRIS account.",
        variant: "warning",
      })
      return
    }

    if (code.trim().length !== 6) {
      toast({
        title: "Verification code required",
        description: "Enter the 6-digit code sent to your email.",
        variant: "warning",
      })
      return
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      toast({
        title: "Password is too weak",
        description: "Use uppercase, lowercase, number, and special character.",
        variant: "warning",
      })
      return
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Confirm your new password before continuing.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      })
      const result: { success: boolean; message: string } = await response.json()

      if (!result.success) throw new Error(result.message)

      sessionStorage.removeItem(`iris_password_reset_dev_code:${email.trim().toLowerCase()}`)
      toast({
        title: "Password reset",
        description: "You can now sign in with your new password.",
        variant: "success",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error instanceof Error ? error.message : "Unable to reset password.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--iris-bg)] px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/forgot-password"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
              <KeyRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--iris-text)]">Verify Reset Code</h1>
            <p className="mt-1 text-sm text-[var(--iris-text-subtle)]">
              Enter your verification code and choose a new password.
            </p>
            {devCode && (
              <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800">
                Dev code: {devCode}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--iris-text)]">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--iris-text)] focus:outline-none"
                  placeholder="you@example.com"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-[var(--iris-text)]">
                Verification code
              </label>
              <input
                id="code"
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-2.5 text-center text-sm font-semibold tracking-[0.3em] text-[var(--iris-text)] focus:outline-none"
                placeholder="000000"
                disabled={isSubmitting}
                inputMode="numeric"
                maxLength={6}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[var(--iris-text)]">
                New password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--iris-text)] focus:outline-none"
                  placeholder="Strong new password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium text-[var(--iris-text)]">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--iris-text-subtle)]" />
                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] py-2.5 pl-9 pr-3 text-sm text-[var(--iris-text)] focus:outline-none"
                  placeholder="Re-enter new password"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--iris-primary)] py-2.5 font-semibold text-white transition hover:bg-[var(--iris-primary-strong)] disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Reset Password
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
