import { NextRequest } from "next/server";
import { usersDb } from "@/lib/db";

// 简单的 session 存储（生产环境用 Redis）
// 与 src/app/api/auth/route.ts 共享
export const sessions: Record<string, string> = {};

/**
 * 检查用户是否已登录
 */
export async function getCurrentUser(request: NextRequest) {
  const sessionId = request.cookies.get('session')?.value;
  
  if (!sessionId) {
    return null;
  }

  const userId = sessions[sessionId];
  if (!userId) {
    return null;
  }

  const user = await usersDb.get(userId);
  return user;
}

/**
 * 检查用户是否是 Pro 订阅者
 */
export async function isProUser(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return user?.subscriptionStatus === 'active';
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(request: NextRequest): Promise<boolean> {
  const user = await getCurrentUser(request);
  return !!user;
}

/**
 * 获取用户信息（包含订阅状态）
 */
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
