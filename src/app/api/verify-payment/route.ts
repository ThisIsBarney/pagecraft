import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

// 内存存储域名配置
const domainStore: Record<string, {
  pageId: string;
  template: string;
  verified: boolean;
  subscriptionId?: string;
}> = {};

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

    // 保存域名配置
    domainStore[domain] = {
      pageId,
      template: template || "minimal",
      verified: true,
      subscriptionId: session.subscription || undefined,
    };

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
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}


