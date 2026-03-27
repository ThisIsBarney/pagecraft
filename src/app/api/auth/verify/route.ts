import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { hashVerificationToken, isVerificationExpired } from "@/lib/email-verification";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.json({ success: false, error: "Verification token is required." }, { status: 400 });
  }

  const tokenHash = hashVerificationToken(token);
  const users = Object.values(await usersDb.getAll());

  const user = users.find((candidate) => candidate.emailVerificationTokenHash === tokenHash);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "This verification link is invalid." },
      { status: 400 }
    );
  }

  if (isVerificationExpired(user.emailVerificationExpiresAt)) {
    return NextResponse.json(
      { success: false, error: "This verification link has expired. Please request a new one." },
      { status: 400 }
    );
  }

  user.emailVerified = true;
  user.emailVerificationTokenHash = undefined;
  user.emailVerificationExpiresAt = undefined;
  user.updatedAt = new Date().toISOString();
  await usersDb.set(user.id, user);

  return NextResponse.json({ success: true });
}
