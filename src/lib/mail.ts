type SendVerificationEmailInput = {
  to: string
  code: string
}

export async function sendVerificationEmail({ to, code }: SendVerificationEmailInput) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.MAIL_FROM ?? "IRIS <onboarding@resend.dev>"

  if (!apiKey) {
    console.log(`[IRIS mail dev] Verification code for ${to}: ${code}`)
    return { sent: false, provider: "console" as const }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "Your IRIS verification code",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827">
          <h2>Your IRIS verification code</h2>
          <p>Use this 6-digit code to finish creating your IRIS account:</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:6px">${code}</p>
          <p>This code expires in 10 minutes.</p>
        </div>
      `,
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(`Failed to send verification email: ${message}`)
  }

  return { sent: true, provider: "resend" as const }
}
