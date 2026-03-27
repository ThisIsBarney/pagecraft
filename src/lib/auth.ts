import { NextRequest } from "next/server";
import { sessionsDb, usersDb } from "@/lib/db";

function isSessionExpired(expiresAt: string) {
  return Date.parse(expiresAt) <= Date.now();
}

export async function getCurrentUser(request: NextRequest) {
  const sessionId = request.cookies.get("session")?.value;
  if (!sessionId) {
    return null;
  }

  const session = await sessionsDb.get(sessionId);
  if (!session) {
    return null;
  }

  if (isSessionExpired(session.expiresAt)) {
    await sessionsDb.delete(sessionId);
    return null;
  }

  const user = await usersDb.get(session.userId);
  return user;
}

export async function isProUser(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.subscriptionStatus === "active";
}

export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return Boolean(user);
}

export async function getUserInfo(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    subscriptionStatus: user.subscriptionStatus,
  };
}
