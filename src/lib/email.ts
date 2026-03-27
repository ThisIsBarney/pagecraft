interface SendVerificationEmailOptions {
  to: string;
  name?: string;
  verificationUrl: string;
}

interface SendVerificationEmailResult {
  sent: boolean;
  reason?: string;
}

function buildVerificationEmailHtml(name: string | undefined, verificationUrl: string) {
  const greeting = name?.trim() ? `Hi ${name.trim()},` : "Hi,";

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #111827; line-height: 1.6;">
      <h2 style="margin: 0 0 12px;">Verify your PageCraft account</h2>
      <p style="margin: 0 0 12px;">${greeting}</p>
      <p style="margin: 0 0 16px;">Please verify your email to activate your account and sign in.</p>
      <p style="margin: 0 0 20px;">
        <a
          href="${verificationUrl}"
          style="display: inline-block; background: #111827; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 999px; font-weight: 600;"
        >
          Verify Email
        </a>
      </p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #4b5563;">If the button does not work, copy and open this URL:</p>
      <p style="margin: 0; font-size: 13px; word-break: break-all; color: #2563eb;">${verificationUrl}</p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #6b7280;">This link expires in 24 hours.</p>
    </div>
  `;
}

export async function sendVerificationEmail({
  to,
  name,
  verificationUrl,
}: SendVerificationEmailOptions): Promise<SendVerificationEmailResult> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "PageCraft <no-reply@pagecraft.dev>";

  if (!resendApiKey) {
    console.warn("RESEND_API_KEY is not configured. Verification email is not sent.");
    return { sent: false, reason: "email_provider_not_configured" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: "Verify your PageCraft account",
        html: buildVerificationEmailHtml(name, verificationUrl),
      }),
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      console.error("Failed to send verification email:", response.status, body);
      return { sent: false, reason: "email_provider_error" };
    }

    return { sent: true };
  } catch (error) {
    console.error("Failed to send verification email:", error);
    return { sent: false, reason: "email_provider_error" };
  }
}
