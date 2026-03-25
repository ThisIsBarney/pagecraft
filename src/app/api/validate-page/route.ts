import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { extractNotionPageId } from "@/lib/notion-input";

const SUPPORTED_BLOCK_TYPES = new Set([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list_item",
  "numbered_list_item",
  "to_do",
  "quote",
  "callout",
  "code",
  "toggle",
  "table",
  "table_row",
  "synced_block",
  "bookmark",
  "video",
  "file",
  "pdf",
  "image",
  "divider",
  "link_to_page",
  "child_page",
]);

async function collectUnsupportedBlockTypes(notion: Client, rootBlockId: string) {
  const unsupportedTypes = new Set<string>();

  const walkBlocks = async (blockId: string) => {
    let cursor: string | undefined;

    do {
      const response = await notion.blocks.children.list({
        block_id: blockId,
        start_cursor: cursor,
      });

      for (const rawBlock of response.results) {
        const block = rawBlock as { id: string; type: string; has_children?: boolean };

        if (!SUPPORTED_BLOCK_TYPES.has(block.type)) {
          unsupportedTypes.add(block.type);
        }

        if (block.has_children) {
          await walkBlocks(block.id);
        }
      }

      cursor = response.next_cursor ?? undefined;
    } while (cursor);
  };

  await walkBlocks(rootBlockId);
  return Array.from(unsupportedTypes).sort();
}

interface ValidationFailure {
  success: false;
  error: string;
  errorCode:
    | "missing_input"
    | "invalid_identifier"
    | "server_misconfigured"
    | "notion_content_not_found"
    | "notion_unavailable";
}

function failure(
  error: ValidationFailure["error"],
  errorCode: ValidationFailure["errorCode"],
  status: number
) {
  return NextResponse.json(
    {
      success: false,
      error,
      errorCode,
    } satisfies ValidationFailure,
    { status }
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const pageId = searchParams.get("pageId");

  if (!pageId) {
    return failure("A Notion page ID or URL is required", "missing_input", 400);
  }

  const cleanPageId = extractNotionPageId(pageId);

  if (!cleanPageId) {
    return failure(
      "Invalid Notion page identifier. Paste a 32-character page ID or a full Notion page URL.",
      "invalid_identifier",
      400
    );
  }

  if (!process.env.NOTION_TOKEN) {
    return failure(
      "Server configuration error. Please contact support.",
      "server_misconfigured",
      500
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

      let unsupportedBlockTypes: string[] = [];
      try {
        unsupportedBlockTypes = await collectUnsupportedBlockTypes(notion, cleanPageId);
      } catch (blockScanError) {
        console.error("Failed to scan page blocks for compatibility hints:", blockScanError);
      }

      return NextResponse.json({
        success: true,
        type: "page",
        title: pageData.properties?.title?.title?.[0]?.plain_text || "Untitled",
        url: pageData.url,
        hasUnsupportedBlocks: unsupportedBlockTypes.length > 0,
        unsupportedBlockTypes,
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
          hasUnsupportedBlocks: false,
          unsupportedBlockTypes: [],
        });
      } catch {
        // Neither page nor database found
        return failure(
          "Page or database not found. Please check:\n1. The ID is correct\n2. The page/database is shared with the PageCraft integration\n3. You have access to this content in Notion",
          "notion_content_not_found",
          404
        );
      }
    }
  } catch (error) {
    console.error("Notion validation error:", error);
    return failure(
      "Unable to validate page. Please try again later.",
      "notion_unavailable",
      500
    );
  }
}
