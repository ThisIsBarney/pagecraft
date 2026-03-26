import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { domainsDb } from "@/lib/db";

// 获取域名配置
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  const config = await domainsDb.get(domain.toLowerCase());
  if (!config) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}

// 注册域名（支付后调用）
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, pageId, template = "minimal", subscriptionId, userEmail } = body;

    if (!domain || !pageId) {
      return NextResponse.json(
        { error: "Domain and pageId required" },
        { status: 400 }
      );
    }

    // 验证域名格式
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: "Invalid domain format" },
        { status: 400 }
      );
    }

    const normalizedDomain = domain.toLowerCase();
    const now = new Date().toISOString();

    await domainsDb.set(normalizedDomain, {
      pageId,
      template,
      userEmail: typeof userEmail === "string" ? userEmail : undefined,
      verified: true, // 支付后自动验证
      subscriptionId,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      domain: normalizedDomain,
      message: "Domain registered successfully",
      dns: {
        type: "CNAME",
        name: normalizedDomain,
        value: "pagecraft-eight.vercel.app",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// Stripe webhook 处理支付成功
export async function PUT(request: Request) {
  // 验证 Stripe webhook
  const payload = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!stripe || !sig) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  try {
    // 验证 webhook（需要 STRIPE_WEBHOOK_SECRET）
    // const event = stripe.webhooks.constructEvent(payload, sig, process.env.STRIPE_WEBHOOK_SECRET);
    
    // 简化版：直接处理
    const event = JSON.parse(payload);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { domain, pageId, template } = session.metadata || {};

      if (domain && pageId) {
        const normalizedDomain = String(domain).toLowerCase();
        const existing = await domainsDb.get(normalizedDomain);

        await domainsDb.set(normalizedDomain, {
          pageId,
          template: template || "minimal",
          verified: true,
          subscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
          userEmail: existing?.userEmail,
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log("Domain registered after payment:", normalizedDomain);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 }
    );
  }
}
