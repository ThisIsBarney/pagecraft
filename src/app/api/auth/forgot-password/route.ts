import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { createPasswordResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}

function buildResetUrl(request: Request, token: string) {
  const baseUrl = getBaseUrl(request);
  return `${baseUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body?.email || "")
      .trim()
      .toLowerCase();

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await usersDb.getByEmail(email);

    // Always return success message to avoid account enumeration.
    if (!user || !user.passwordHash || !user.passwordSalt || user.emailVerified === false) {
      return NextResponse.json({
        success: true,
        message: "If this email exists, a reset link has been sent.",
      });
    }

    const { token, tokenHash, expiresAt } = createPasswordResetToken();
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    user.updatedAt = new Date().toISOString();
    await usersDb.set(user.id, user);

    const resetUrl = buildResetUrl(request, token);
    const emailResult = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
    });

    return NextResponse.json({
      success: true,
      message: "If this email exists, a reset link has been sent.",
      devResetUrl: emailResult.sent ? undefined : resetUrl,
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
