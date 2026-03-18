import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { domainsDb, usersDb } from "@/lib/db";

export async function POST(request: Request) {
  let sessionId: string | undefined;

  try {
    const body = (await request.json()) as { sessionId?: unknown };
    sessionId = typeof body.sessionId === "string" ? body.sessionId : undefined;
  } catch {
    return NextResponse.json(
      { error: "A JSON body with sessionId is required" },
      { status: 400 }
    );
  }

  try {
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    if (!stripe) {
      return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
    }

    // 获取 Stripe 会话详情
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }

    // 从 metadata 获取域名信息
    const { domain, pageId, template } = session.metadata || {};

    // 从 session 获取用户邮箱
    const customerEmail = session.customer_details?.email;

    // 如果有域名和 pageId，保存域名配置
    if (domain && pageId && domain !== "" && pageId !== "") {
      await domainsDb.set(domain, {
        pageId,
        template: template || "minimal",
        userEmail: customerEmail || undefined,
        verified: true,
        subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      console.log("Domain registered:", domain, "->", pageId);
    }

    // 更新用户为 Pro（通过 Stripe customer ID 或邮箱）
    if (customerEmail) {
      const user = await usersDb.getByEmail(customerEmail);
      if (user) {
        user.subscriptionStatus = 'active';
        user.stripeCustomerId = typeof session.customer === 'string' ? session.customer : user.stripeCustomerId;
        user.updatedAt = new Date().toISOString();
        await usersDb.set(user.id, user);
        console.log("User upgraded to Pro:", customerEmail);
      } else {
        // 如果用户不存在，创建新用户
        const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await usersDb.set(id, {
          id,
          email: customerEmail,
          name: customerEmail.split('@')[0],
          stripeCustomerId: typeof session.customer === 'string' ? session.customer : undefined,
          subscriptionStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("New Pro user created:", customerEmail);
      }
    }

    return NextResponse.json({
      success: true,
      domain: domain || undefined,
      pageId: pageId || undefined,
      template: template || "minimal",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: String(error) },
      { status: 500 }
    );
  }
}
