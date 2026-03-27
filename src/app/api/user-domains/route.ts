import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { domainsDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userDomains = (await domainsDb.getByUserEmail(user.email)).map(({ domain, config }) => ({
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
