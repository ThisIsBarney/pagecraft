import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userPagesDb } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { notionPageId, title, slug, template } = body;

    if (!notionPageId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if page already exists for this user
    const existingPages = await userPagesDb.getByUserId(user.id);
    const existingPage = existingPages.find((p) => p.notionPageId === notionPageId);

    if (existingPage) {
      // Update existing page
      const updatedPage = {
        ...existingPage,
        title,
        slug: slug || existingPage.slug,
        template: template || existingPage.template,
        updatedAt: new Date().toISOString(),
      };
      await userPagesDb.set(existingPage.id, updatedPage);
      
      return NextResponse.json({
        success: true,
        page: updatedPage,
        message: "Page updated successfully",
      });
    }

    // Create new page
    const pageId = `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newPage = {
      id: pageId,
      userId: user.id,
      notionPageId,
      title,
      slug: slug || notionPageId,
      template: template || "minimal",
      settings: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
    };

    await userPagesDb.set(pageId, newPage);

    return NextResponse.json({
      success: true,
      page: newPage,
      message: "Page saved successfully",
    });
  } catch (error) {
    console.error("Error saving user page:", error);
    return NextResponse.json(
      { error: "Failed to save page", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's pages
    const pages = await userPagesDb.getByUserId(user.id);

    return NextResponse.json({
      success: true,
      pages,
    });
  } catch (error) {
    console.error("Error fetching user pages:", error);
    return NextResponse.json(
      { error: "Failed to fetch pages", details: String(error) },
      { status: 500 }
    );
  }
}