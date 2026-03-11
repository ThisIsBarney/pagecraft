import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ANALYTICS_DIR = path.join(process.cwd(), ".data");
const ANALYTICS_FILE = path.join(ANALYTICS_DIR, "analytics.json");

interface PageView {
  timestamp: string;
  pageId: string;
  domain?: string;
  referrer?: string;
  userAgent?: string;
  country?: string;
}

interface AnalyticsData {
  views: PageView[];
}

async function readAnalytics(): Promise<AnalyticsData> {
  try {
    const data = await fs.readFile(ANALYTICS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { views: [] };
  }
}

async function writeAnalytics(data: AnalyticsData): Promise<void> {
  await fs.mkdir(ANALYTICS_DIR, { recursive: true });
  await fs.writeFile(ANALYTICS_FILE, JSON.stringify(data, null, 2));
}

// 记录页面访问
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pageId, domain, referrer, userAgent, country } = body;

    if (!pageId) {
      return NextResponse.json({ error: "pageId required" }, { status: 400 });
    }

    const analytics = await readAnalytics();
    
    analytics.views.push({
      timestamp: new Date().toISOString(),
      pageId,
      domain,
      referrer,
      userAgent,
      country,
    });

    // 只保留最近 10000 条记录
    if (analytics.views.length > 10000) {
      analytics.views = analytics.views.slice(-10000);
    }

    await writeAnalytics(analytics);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to record" }, { status: 500 });
  }
}

// 获取统计数据
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageId = searchParams.get("pageId");
    const period = searchParams.get("period") || "7d"; // 7d, 30d, all

    const analytics = await readAnalytics();
    
    let views = analytics.views;

    // 过滤特定页面
    if (pageId) {
      views = views.filter(v => v.pageId === pageId);
    }

    // 过滤时间范围
    const now = new Date();
    if (period === "7d") {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      views = views.filter(v => new Date(v.timestamp) > sevenDaysAgo);
    } else if (period === "30d") {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      views = views.filter(v => new Date(v.timestamp) > thirtyDaysAgo);
    }

    // 计算统计
    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map(v => v.userAgent)).size;
    
    // 按天分组
    const dailyViews: Record<string, number> = {};
    views.forEach(v => {
      const date = v.timestamp.split("T")[0];
      dailyViews[date] = (dailyViews[date] || 0) + 1;
    });

    // 来源统计
    const referrers: Record<string, number> = {};
    views.forEach(v => {
      const ref = v.referrer || "Direct";
      referrers[ref] = (referrers[ref] || 0) + 1;
    });

    return NextResponse.json({
      totalViews,
      uniqueVisitors,
      dailyViews,
      topReferrers: Object.entries(referrers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Failed to get stats" }, { status: 500 });
  }
}
