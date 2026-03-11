import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime 兼容的存储（使用 Vercel Edge Config 或内存）
// 生产环境应该使用 Redis 或 Edge Config
const domainCache: Record<string, { pageId: string; template: string }> = {};

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();

  // 检查是否是自定义域名（不是主域名）
  const isMainDomain = 
    host.includes("pagecraft") || 
    host.includes("vercel.app") || 
    host.includes("localhost") ||
    host.includes("127.0.0.1");

  if (!isMainDomain) {
    // 从缓存获取域名配置
    const config = domainCache[host];
    
    if (config) {
      // 自定义域名，重写到对应页面
      url.pathname = `/p/${config.pageId}`;
      url.searchParams.set("template", config.template);
      
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
