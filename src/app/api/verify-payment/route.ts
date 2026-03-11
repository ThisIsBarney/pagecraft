import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { domainsDb, usersDb } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sessionId } = body;

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

    if (!domain || !pageId) {
      return NextResponse.json({ error: "Missing domain info" }, { status: 400 });
    }

    // 从 session 获取用户邮箱
    const customerEmail = session.customer_details?.email;

    // 保存域名配置
    await domainsDb.set(domain, {
      pageId,
      template: template || "minimal",
      userEmail: customerEmail || undefined,
      verified: true,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // 更新用户为 Pro
    if (customerEmail) {
      const user = await usersDb.getByEmail(customerEmail);
      if (user) {
        user.subscriptionStatus = 'active';
        user.updatedAt = new Date().toISOString();
        await usersDb.set(user.id, user);
        console.log("User upgraded to Pro:", customerEmail);
      }
    }

    console.log("Domain registered:", domain, "->", pageId);

    return NextResponse.json({
      success: true,
      domain,
      pageId,
      template,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment", details: String(error) },
      { status: 500 }
    );
  }
}
