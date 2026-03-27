import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { hashPasswordResetToken, isPasswordResetExpired } from "@/lib/password-reset";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const token = String(body?.token || "");
    const newPassword = String(body?.newPassword || "");

    if (!token) {
      return NextResponse.json({ error: "Reset token required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "New password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const tokenHash = hashPasswordResetToken(token);
    const users = Object.values(await usersDb.getAll());
    const user = users.find((candidate) => candidate.passwordResetTokenHash === tokenHash);

    if (!user) {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (isPasswordResetExpired(user.passwordResetExpiresAt)) {
      return NextResponse.json(
        { error: "Reset token expired. Please request a new reset link." },
        { status: 400 }
      );
    }

    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    user.updatedAt = new Date().toISOString();
    await usersDb.set(user.id, user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
