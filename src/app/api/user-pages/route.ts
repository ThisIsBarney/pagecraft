import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { userPagesDb } from "@/lib/db";

type PageStructureSettings = {
  navOrder?: number;
  hideFromNavigation?: boolean;
  isHome?: boolean;
};

function normalizeSettings(input: unknown): PageStructureSettings {
  if (!input || typeof input !== "object") {
    return {};
  }

  const raw = input as Record<string, unknown>;
  const settings: PageStructureSettings = {};

  if (typeof raw.navOrder === "number" && Number.isFinite(raw.navOrder)) {
    settings.navOrder = Math.max(0, Math.floor(raw.navOrder));
  }

  if (typeof raw.hideFromNavigation === "boolean") {
    settings.hideFromNavigation = raw.hideFromNavigation;
  }

  if (typeof raw.isHome === "boolean") {
    settings.isHome = raw.isHome;
  }

  return settings;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { notionPageId, title, slug, template, settings } = body;
    const normalizedSettings = normalizeSettings(settings);

    if (!notionPageId || !title) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if page already exists for this user
    const existingPages = await userPagesDb.getByUserId(user.id);
    const existingPage = existingPages.find((p) => p.notionPageId === notionPageId);

    if (existingPage) {
      const mergedSettings = {
        ...(existingPage.settings || {}),
        ...normalizedSettings,
      };

      if (normalizedSettings.isHome) {
        for (const page of existingPages) {
          if (page.id === existingPage.id) {
            continue;
          }

          await userPagesDb.set(page.id, {
            ...page,
            settings: {
              ...(page.settings || {}),
              isHome: false,
            },
            updatedAt: new Date().toISOString(),
          });
        }
      }

      // Update existing page
      const updatedPage = {
        ...existingPage,
        title,
        slug: slug || existingPage.slug,
        template: template || existingPage.template,
        settings: mergedSettings,
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
    const baseSettings = {
      navOrder: existingPages.length,
      hideFromNavigation: false,
      isHome: false,
    };
    const nextSettings = {
      ...baseSettings,
      ...normalizedSettings,
    };

    if (nextSettings.isHome) {
      for (const page of existingPages) {
        await userPagesDb.set(page.id, {
          ...page,
          settings: {
            ...(page.settings || {}),
            isHome: false,
          },
          updatedAt: new Date().toISOString(),
        });
      }
    }

    const newPage = {
      id: pageId,
      userId: user.id,
      notionPageId,
      title,
      slug: slug || notionPageId,
      template: template || "minimal",
      settings: nextSettings,
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