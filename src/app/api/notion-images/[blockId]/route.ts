import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";
import { extractNotionImageUrl, normalizeNotionObjectId } from "@/lib/notion-image";

interface RouteContext {
  params: {
    blockId: string;
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const blockId = normalizeNotionObjectId(context.params.blockId);

  if (!blockId) {
    return NextResponse.json(
      { error: "Invalid Notion block ID." },
      { status: 400 }
    );
  }

  if (!process.env.NOTION_TOKEN) {
    return NextResponse.json(
      { error: "Server configuration error." },
      { status: 500 }
    );
  }

  try {
    const notion = new Client({ auth: process.env.NOTION_TOKEN });
    const block = await notion.blocks.retrieve({
      block_id: blockId,
    });
    const imageUrl = extractNotionImageUrl(block);

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image block not found." },
        { status: 404 }
      );
    }

    return NextResponse.redirect(imageUrl, {
      status: 307,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Failed to resolve Notion image block:", error);
    return NextResponse.json(
      { error: "Unable to load image." },
      { status: 502 }
    );
  }
}
