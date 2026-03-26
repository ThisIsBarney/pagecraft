import { NextResponse } from "next/server";
import { domainsDb } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    // 获取所有域名
    const allDomains = await domainsDb.getAll();
    
    // 过滤出用户的域名
    const userDomains = Object.entries(allDomains)
      .filter(([, config]) => config.userEmail === email)
      .map(([domain, config]) => ({
        domain,
        pageId: config.pageId,
        template: config.template,
        url: `https://${domain}`,
        verified: Boolean(config.verified),
      }));

    return NextResponse.json({
      domains: userDomains,
    });
  } catch (error) {
    console.error("Get user domains error:", error);
    return NextResponse.json(
      { error: "Failed to get domains" },
      { status: 500 }
    );
  }
}
