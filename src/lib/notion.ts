import { Client } from "@notionhq/client";

const getNotionClient = () => {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN is not set");
  }
  return new Client({ auth: token });
};

export interface PageInfo {
  id: string;
  title: string;
  url: string;
  lastEdited: string;
}

export interface RichText {
  type: "text" | "mention" | "equation";
  text?: { content: string; link?: { url: string } | null };
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    underline?: boolean;
    code?: boolean;
    color?: string;
  };
}

export interface Block {
  id: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface PageContent {
  title: string;
  blocks: Block[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTitle(page: any): string {
  return page.properties?.title?.title?.[0]?.plain_text || "Untitled";
}

// 递归获取所有块（包括嵌套）
async function getAllBlocks(blockId: string): Promise<Block[]> {
  const notion = getNotionClient();
  const blocks: Block[] = [];
  let cursor: string | undefined;

  do {
    const response = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });

    for (const block of response.results as Block[]) {
      blocks.push(block);

      // 递归获取嵌套块
      if ("has_children" in block && block.has_children) {
        const children = await getAllBlocks(block.id);
        block.children = children;
      }
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

// 获取页面内容（包含嵌套块）
export async function getPageContent(pageId: string): Promise<PageContent> {
  const notion = getNotionClient();

  // 清理 pageId
  const cleanPageId = pageId.replace(/-/g, "");

  // 获取页面信息
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const page = await notion.pages.retrieve({ page_id: cleanPageId }) as any;
  const title = extractTitle(page);

  // 递归获取所有块
  const blocks = await getAllBlocks(cleanPageId);

  return { title, blocks };
}

// 获取公开页面内容
export async function getPublicPageContent(pageId: string): Promise<PageContent> {
  return getPageContent(pageId);
}

// 获取用户页面列表
export async function getPages(): Promise<PageInfo[]> {
  const notion = getNotionClient();

  const response = await notion.search({
    filter: { value: "page", property: "object" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return response.results.map((page: any) => ({
    id: page.id,
    title: extractTitle(page),
    url: page.url,
    lastEdited: page.last_edited_time,
  }));
}
