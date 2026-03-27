import { NextResponse } from "next/server";
import { usersDb } from "@/lib/db";
import { sessions } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";

type AuthMode = "login" | "register";

function normalizeMode(value: unknown): AuthMode {
  return value === "register" ? "register" : "login";
}

// 注册/登录
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

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    let user = await usersDb.getByEmail(normalizedEmail);

    if (authMode === "register") {
      const { hash, salt } = hashPassword(password);

      if (user?.passwordHash && user?.passwordSalt) {
        return NextResponse.json(
          { error: "Account already exists. Please sign in instead." },
          { status: 409 }
        );
      }

      if (!user) {
        // 创建新用户
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        user = {
          id,
          email: normalizedEmail,
          name: name || normalizedEmail.split("@")[0],
          passwordHash: hash,
          passwordSalt: salt,
          subscriptionStatus: "free",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } else {
        // 兼容旧账户：首次设置密码并补齐资料
        user.passwordHash = hash;
        user.passwordSalt = salt;
        user.name = name || user.name || normalizedEmail.split("@")[0];
        user.updatedAt = new Date().toISOString();
      }
      await usersDb.set(user.id, user);
    } else {
      if (!user || !user.passwordHash || !user.passwordSalt) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }

      if (!verifyPassword(password, user.passwordSalt, user.passwordHash)) {
        return NextResponse.json(
          { error: "Invalid email or password." },
          { status: 401 }
        );
      }
    }

    if (!user) {
      const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      user = {
        id,
        email: normalizedEmail,
        name: name || normalizedEmail.split("@")[0],
        subscriptionStatus: "free",
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

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
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

// 登出
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

    if (typeof currentPassword !== "string" || !verifyPassword(currentPassword, user.passwordSalt, user.passwordHash)) {
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
