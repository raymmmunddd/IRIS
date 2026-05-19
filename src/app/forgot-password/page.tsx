"use client"
export const dynamic = 'force-dynamic'

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSendCode = (event: React.FormEvent) => {
    event.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Enter a valid email address to continue.",
        variant: "warning",
      })
      return
    }

    setIsSending(true)

    setTimeout(() => {
      setIsSending(false)
      toast({
        title: "Verification sent",
        description: "We sent a verification code to your email.",
        variant: "success",
      })
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`)
    }, 1200)
  }

  return (
    <div className="min-h-screen bg-[var(--iris-bg)] px-4 py-10">
      <div className="mx-auto max-w-md space-y-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--iris-primary)] hover:text-[var(--iris-primary-strong)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>

        <div className="rounded-2xl border border-[var(--iris-border)] bg-[var(--iris-surface)]/95 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
          <div className="mb-5 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--iris-primary-light)] text-[var(--iris-primary)]">
              <Mail className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--iris-text)]">Forgot Password</h1>
            <p className="mt-1 text-sm text-[var(--iris-text-subtle)]">
              Enter your account email and we will send you a verification code.
            </p>
          </div>

          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[var(--iris-text)]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[var(--iris-border)] bg-[var(--iris-surface)] px-3 py-2.5 text-sm text-[var(--iris-text)] focus:outline-none"
                placeholder="you@example.com"
                disabled={isSending}
              />
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--iris-primary)] py-2.5 font-semibold text-white transition hover:bg-[var(--iris-primary-strong)] disabled:opacity-70"
            >
              {isSending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                  Sending code...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Verification Code
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
