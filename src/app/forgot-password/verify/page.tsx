"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, CheckCircle2, KeyRound, RotateCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function VerifyResetPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--iris-bg)] px-4 py-10" aria-label="Loading password reset verification"><div className="mx-auto h-96 max-w-md animate-pulse rounded-2xl bg-[var(--iris-surface)]" /></div>}>
      <VerifyResetForm />
    </Suspense>
  )
}

function VerifyResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const email = searchParams.get("email") ?? ""

  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password")
    }
  }, [email, router])

  const handleResend = async () => {
    setIsResending(true)
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Unable to resend the code.")
      toast({
        title: "Reset request received",
        description: result.data?.devCode
          ? `Development code: ${result.data.devCode}`
          : "If an account exists, a new code will be sent when the resend limit allows it.",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Unable to resend code",
        description: error instanceof Error ? error.message : "Try again later.",
        variant: "destructive",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault()

    if (code.length < 6) {
      toast({
        title: "Invalid code",
        description: "Please enter the 6-digit verification code.",
        variant: "warning",
      })
      return
    }

    if (
      newPassword.length < 8
      || !/[A-Z]/.test(newPassword)
      || !/[a-z]/.test(newPassword)
      || !/\d/.test(newPassword)
      || !/[^A-Za-z0-9]/.test(newPassword)
    ) {
      toast({
        title: "Weak password",
        description: "Use at least 8 characters with uppercase and lowercase letters, a number, and a symbol.",
        variant: "warning",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation must match.",
        variant: "destructive",
      })
      return
    }

    setIsVerifying(true)
    try {
      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password: newPassword }),
      })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(result.message || "Invalid or expired verification code.")
      toast({
        title: "Password reset complete",
        description: "You can now sign in using your new password.",
        variant: "success",
      })
      router.push("/login")
    } catch (error) {
      toast({
        title: "Password reset failed",
        description: error instanceof Error ? error.message : "Invalid or expired verification code.",
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
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
            <h1 className="text-2xl font-bold text-[var(--iris-text)]">Verify and Reset</h1>
            <p className="mt-1 text-sm text-[var(--iris-text-subtle)]">
              Enter the code sent to {email || "your email"}.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="code" className="text-sm font-medium text-[var(--iris-text)]">
                Verification Code
              </label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
                placeholder="Enter 6-digit code"
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-2.5 text-sm text-[var(--iris-text)] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium text-[var(--iris-text)]">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-2.5 text-sm text-[var(--iris-text)] focus:outline-none"
              />
              <p className="text-xs text-[var(--iris-text-subtle)]">At least 8 characters with uppercase and lowercase letters, a number, and a symbol.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--iris-text)]">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-2.5 text-sm text-[var(--iris-text)] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--iris-border)] py-2.5 text-sm font-semibold text-[var(--iris-text)] hover:bg-muted disabled:opacity-70"
              >
                {isResending ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--iris-text)]/30 border-t-[var(--iris-text)]" />
                    Resending...
                  </>
                ) : (
                  <>
                    <RotateCw className="h-4 w-4" />
                    Resend Code
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={isVerifying}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--iris-primary)] py-2.5 text-sm font-semibold text-white hover:bg-[var(--iris-primary-strong)] disabled:opacity-70"
              >
                {isVerifying ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
