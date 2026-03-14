import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return NextResponse.json(
      { success: false, error: "Page ID is required" },
      { status: 400 }
    );
  }

  // Clean the page ID (remove hyphens)
  const cleanPageId = pageId.replace(/-/g, "");

  // Validate format (should be 32 hex characters)
  if (!/^[a-f0-9]{32}$/i.test(cleanPageId)) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Invalid Page ID format. Notion Page IDs should be 32 hexadecimal characters (with or without hyphens)." 
      },
      { status: 400 }
    );
  }

  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { 
        success: false, 
        error: "Server configuration error. Please contact support." 
      },
      { status: 500 }
    );
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });

    // Try to retrieve the page
    try {
      const page = await notion.pages.retrieve({ page_id: cleanPageId });
      const pageData = page as unknown as {
        properties?: { title?: { title?: Array<{ plain_text?: string }> } };
        url?: string;
      };
      return NextResponse.json({
        success: true,
        type: "page",
        title: pageData.properties?.title?.title?.[0]?.plain_text || "Untitled",
        url: pageData.url,
      });
    } catch {
      // Not a page, try as database
      try {
        const database = await notion.databases.retrieve({ database_id: cleanPageId });
        const databaseData = database as unknown as {
          title?: Array<{ plain_text?: string }>;
          url?: string;
        };
        return NextResponse.json({
          success: true,
          type: "database",
          title: databaseData.title?.[0]?.plain_text || "Untitled Database",
          url: databaseData.url,
        });
      } catch {
        // Neither page nor database found
        return NextResponse.json({
          success: false,
          error: "Page or database not found. Please check:\n1. The ID is correct\n2. The page/database is shared with the PageCraft integration\n3. You have access to this content in Notion"
        }, { status: 404 });
      }
    }
  } catch (error) {
    console.error("Notion validation error:", error);
    return NextResponse.json({
      success: false,
      error: "Unable to validate page. Please try again later."
    }, { status: 500 });
  }
}