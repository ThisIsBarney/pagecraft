import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";

// 简单的 session 存储（生产环境用 Redis）
const sessions: Record<string, string> = {};

// 注册/登录
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 查找或创建用户
    let user = await usersDb.getByEmail(email);
    
    if (!user) {
      // 创建新用户
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      user = {
        id,
        email,
        name: name || email.split('@')[0],
        subscriptionStatus: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await usersDb.set(id, user);
    }

    // 创建 session
    const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessions[sessionId] = user.id;

    // 设置 cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        subscriptionStatus: user.subscriptionStatus,
      },
    });

    response.cookies.set('session', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Auth failed", details: String(error) }, { status: 500 });
  }
}

// 获取当前用户
export async function GET(request: Request) {
  const sessionId = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];
  
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

// 登出
export async function DELETE(request: Request) {
  const sessionId = request.headers.get('cookie')?.match(/session=([^;]+)/)?.[1];
  
  if (sessionId) {
    delete sessions[sessionId];
  }

  const response = NextResponse.json({ success: true });
  response.cookies.delete('session');
  
  return response;
}
