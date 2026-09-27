import { createHmac, timingSafeEqual } from "node:crypto"
import type { NextRequest, NextResponse } from "next/server"

export const ADMIN_SESSION_COOKIE = "iris_admin_session"
const SESSION_DURATION_SECONDS = 8 * 60 * 60

function sessionSecret() {
  const secret = process.env.IRIS_SESSION_SECRET?.trim() || process.env.DATABASE_URL?.trim()
  if (!secret) throw new Error("A server-side session signing secret is not configured.")
  return secret
}

function signature(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url")
}

export function setAdminSessionCookie(response: NextResponse, userId: string) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt })).toString("base64url")
  response.cookies.set(ADMIN_SESSION_COOKIE, `${payload}.${signature(payload)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  })
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export function getAdminSessionUserId(request: NextRequest) {
  try {
    const segments = request.cookies.get(ADMIN_SESSION_COOKIE)?.value.split(".") ?? []
    if (segments.length !== 2) return null
    const [payload, providedSignature] = segments
    if (!payload || !providedSignature) return null

    const expected = Buffer.from(signature(payload))
    const actual = Buffer.from(providedSignature)
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null

    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown
      expiresAt?: unknown
    }
    if (typeof session.userId !== "string" || typeof session.expiresAt !== "number" || session.expiresAt <= Date.now() / 1000) {
      return null
    }
    return session.userId
  } catch {
    return null
  }
}
