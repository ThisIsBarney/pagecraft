import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

interface TestResult {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface DebugResults {
  timestamp: string;
  notionTokenSet: boolean;
  tests: {
    search?: TestResult;
    page?: TestResult;
    database?: TestResult;
  };
  error?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  const results: DebugResults = {
    timestamp: new Date().toISOString(),
    notionTokenSet: !!process.env.NOTION_TOKEN,
    tests: {},
  };

  // Initialize tests object
  results.tests = {};

  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json({
      ...results,
      error: "NOTION_TOKEN not set",
    }, { status: 500 });
  }

  const notion = new Client({ auth: process.env.NOTION_TOKEN });

  // 测试 1: 搜索 API
  try {
    const search = await notion.search({ page_size: 1 });
    results.tests.search = {
      success: true,
      resultsCount: search.results.length,
    };
  } catch (error) {
    results.tests.search = {
      success: false,
      error: (error as Error).message,
    };
  }

  // 测试 2: 如果提供了 pageId，尝试获取
  if (pageId) {
    const cleanId = pageId.replace(/-/g, "");
    
    // 尝试作为页面
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await notion.pages.retrieve({ page_id: cleanId }) as any;
      results.tests.page = {
        success: true,
        title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
        url: page.url,
      };
    } catch (error) {
      results.tests.page = {
        success: false,
        error: (error as Error).message,
      };
    }

    // 尝试作为数据库
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = await notion.databases.retrieve({ database_id: cleanId }) as any;
      results.tests.database = {
        success: true,
        title: db.title?.[0]?.plain_text || "Untitled Database",
        url: db.url,
      };
    } catch (error) {
      results.tests.database = {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  return NextResponse.json(results);
}
