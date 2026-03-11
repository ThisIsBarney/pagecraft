import { NextResponse } from "next/server";
import { stripe, STRIPE_CONFIG } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    if (!stripe) {
      return NextResponse.json(
        { error: "Payment not configured" },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { domain, pageId, template } = body;

    // 构建产品描述
    let description = "PageCraft Pro Subscription";
    if (domain) {
      description += ` - Domain: ${domain}`;
    }

    // 创建 Stripe Checkout 会话
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PageCraft Pro",
              description,
            },
            unit_amount: 600, // $6.00
            recurring: {
              interval: "month",
            },
          },
          quantity: 1,
        },
      ],
      success_url: STRIPE_CONFIG.successUrl,
      cancel_url: STRIPE_CONFIG.cancelUrl,
      metadata: {
        domain: domain || "",
        pageId: pageId || "",
        template: template || "minimal",
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
