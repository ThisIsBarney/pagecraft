import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 域名配置（生产环境从数据库或 API 获取）
const domainConfig: Record<string, { pageId: string; template: string }> = {
  // 示例：用户配置的域名
  // "example.com": { pageId: "xxx", template: "minimal" },
};

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // 检查是否是自定义域名（不是主域名）
  const isMainDomain = host.includes("pagecraft") || host.includes("vercel.app") || host.includes("localhost");

  if (!isMainDomain && domainConfig[host]) {
    // 自定义域名，重写到对应页面
    const config = domainConfig[host];
    url.pathname = `/p/${config.pageId}`;
    url.searchParams.set("template", config.template);
    
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 匹配所有路径，除了 API 和静态资源
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
