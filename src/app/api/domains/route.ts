import { NextResponse } from "next/server";

// 简单的内存存储（MVP 阶段）
// 生产环境应该使用数据库
const domainStore: Record<string, {
  pageId: string;
  template: string;
  verified: boolean;
}> = {};

// 获取域名配置
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json({ error: "Domain required" }, { status: 400 });
  }

  const config = domainStore[domain];
  if (!config) {
    return NextResponse.json({ error: "Domain not found" }, { status: 404 });
  }

  return NextResponse.json(config);
}

// 注册域名
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain, pageId, template = "minimal" } = body;

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

    // 检查是否已被注册
    if (domainStore[domain]) {
      return NextResponse.json(
        { error: "Domain already registered" },
        { status: 409 }
      );
    }

    // 保存配置
    domainStore[domain] = {
      pageId,
      template,
      verified: false,
    };

    return NextResponse.json({
      success: true,
      domain,
      message: "Domain registered. Please configure DNS CNAME to pagecraft-eight.vercel.app",
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

// 验证域名（检查 DNS）
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain || !domainStore[domain]) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // MVP 阶段直接标记为已验证
    // 生产环境应该实际检查 DNS CNAME
    domainStore[domain].verified = true;

    return NextResponse.json({
      success: true,
      domain,
      verified: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
