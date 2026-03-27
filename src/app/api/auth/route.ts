import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { sessions } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  createEmailVerificationToken,
  isVerificationExpired,
} from "@/lib/email-verification";
import { sendVerificationEmail } from "@/lib/email";

type AuthMode = "login" | "register" | "resend_verification";

function normalizeMode(value: unknown): AuthMode {
  if (value === "register" || value === "resend_verification") {
    return value;
  }
  return "login";
}

function getBaseUrl(request: Request) {
  const configured = process.env.NEXT_PUBLIC_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  return new URL(request.url).origin;
}

function buildVerificationUrl(request: Request, token: string) {
  const baseUrl = getBaseUrl(request);
  return `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;
}

async function issueEmailVerification(userId: string, request: Request) {
  const user = await usersDb.get(userId);
  if (!user) {
    return null;
  }

  const { token, tokenHash, expiresAt } = createEmailVerificationToken();
  user.emailVerified = false;
  user.emailVerificationTokenHash = tokenHash;
  user.emailVerificationExpiresAt = expiresAt;
  user.updatedAt = new Date().toISOString();
  await usersDb.set(user.id, user);

  const verificationUrl = buildVerificationUrl(request, token);
  const emailResult = await sendVerificationEmail({
    to: user.email,
    name: user.name,
    verificationUrl,
  });

  return {
    emailResult,
    verificationUrl,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, password, mode } = body as {
      email?: string;
      name?: string;
      password?: string;
      mode?: AuthMode;
    };
    const authMode = normalizeMode(mode);
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    let user = await usersDb.getByEmail(normalizedEmail);

    if (authMode === "resend_verification") {
      if (!user) {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }

      if (user.emailVerified !== false) {
        return NextResponse.json(
          { error: "Email is already verified. Please sign in." },
          { status: 400 }
        );
      }

      const verification = await issueEmailVerification(user.id, request);
      if (!verification) {
        return NextResponse.json({ error: "Account not found." }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Verification email sent.",
        devVerificationUrl: verification.emailResult.sent ? undefined : verification.verificationUrl,
      });
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (authMode === "register") {
      const { hash, salt } = hashPassword(password);

      if (user && user.passwordHash && user.passwordSalt && user.emailVerified !== false) {
        return NextResponse.json(
          { error: "Account already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      if (!user) {
        const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        user = {
          id,
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          passwordHash: hash,
          passwordSalt: salt,
          emailVerified: false,
          subscriptionStatus: "free",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        user.passwordHash = hash;
        user.passwordSalt = salt;
        user.emailVerified = false;
        user.name = name || user.name || normalizedEmail.split("@")[0];
        user.updatedAt = new Date().toISOString();
      }

      await usersDb.set(user.id, user);
      const verification = await issueEmailVerification(user.id, request);

      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Registration successful. Please verify your email before signing in.",
        devVerificationUrl:
          verification && !verification.emailResult.sent
            ? verification.verificationUrl
            : undefined,
      });
    }

    if (!user || !user.passwordHash || !user.passwordSalt) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const emailIsVerified = user.emailVerified !== false;
    if (!emailIsVerified) {
      const expired = isVerificationExpired(user.emailVerificationExpiresAt);
      if (expired) {
        await issueEmailVerification(user.id, request);
      }

      return NextResponse.json(
        {
          error: "Please verify your email before signing in.",
          errorCode: "email_not_verified",
          canResend: true,
        },
        { status: 403 }
      );
    }

    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    sessions[sessionId] = user.id;

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
      },
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Auth failed", details: String(error) }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const sessionId = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  if (!sessionId || !sessions[sessionId]) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = sessions[sessionId];
  const user = await usersDb.get(userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      subscriptionStatus: user.subscriptionStatus,
    },
  });
}

export async function DELETE(request: Request) {
  const sessionId = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];

  if (sessionId) {
    delete sessions[sessionId];
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete("session");

  return response;
}

export async function PATCH(request: Request) {
  try {
    const sessionId = request.headers.get("cookie")?.match(/session=([^;]+)/)?.[1];
    if (!sessionId || !sessions[sessionId]) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = sessions[sessionId];
    const user = await usersDb.get(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!user.passwordHash || !user.passwordSalt) {
      return NextResponse.json(
        { error: "Password is not set for this account. Use account creation flow first." },
        { status: 400 }
      );
    }

    if (
      typeof currentPassword !== "string" ||
      !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)
    ) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.updatedAt = new Date().toISOString();
    await usersDb.set(user.id, user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}
