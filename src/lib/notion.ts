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

export interface DatabaseEntry {
  id: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
  url: string;
  cover?: string | null;
  icon?: string | null;
}

export interface DatabaseInfo {
  id: string;
  title: string;
  description?: string;
}

export interface PageContent {
  title: string;
  blocks?: Block[];
  type: "page" | "database";
  databaseInfo?: DatabaseInfo;
  databaseEntries?: DatabaseEntry[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractTitle(page: any): string {
  return page.properties?.title?.title?.[0]?.plain_text || "Untitled";
}

// 从数据库条目提取标题
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEntryTitle(entry: any): string {
  const properties = entry.properties || {};
  
  for (const [, value] of Object.entries(properties)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prop = value as any;
    if (prop.type === "title" && prop.title?.length > 0) {
      return prop.title[0].plain_text || "Untitled";
    }
  }
  
  return "Untitled";
}

// 提取属性值
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractPropertyValue(prop: any): string {
  if (!prop) return "";
  
  switch (prop.type) {
    case "title":
      return prop.title?.[0]?.plain_text || "";
    case "rich_text":
      return prop.rich_text?.[0]?.plain_text || "";
    case "select":
      return prop.select?.name || "";
    case "multi_select":
      return prop.multi_select?.map((s: { name: string }) => s.name).join(", ") || "";
    case "date":
      return prop.date?.start || "";
    case "url":
      return prop.url || "";
    case "email":
      return prop.email || "";
    case "phone_number":
      return prop.phone_number || "";
    case "number":
      return prop.number?.toString() || "";
    case "checkbox":
      return prop.checkbox ? "✓" : "";
    case "formula":
      return prop.formula?.string || prop.formula?.number?.toString() || "";
    default:
      return "";
  }
}

// 递归获取所有块
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

      if ("has_children" in block && block.has_children) {
        const children = await getAllBlocks(block.id);
        block.children = children;
      }
    }

    cursor = response.next_cursor ?? undefined;
  } while (cursor);

  return blocks;
}

// 使用原生 fetch 查询数据库
async function queryDatabaseWithFetch(databaseId: string, token: string, cursor?: string) {
  const body: Record<string, unknown> = {};
  if (cursor) body.start_cursor = cursor;

  const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${response.status} ${error}`);
  }

  return response.json();
}

// 获取数据库条目
async function getDatabaseEntries(databaseId: string): Promise<DatabaseEntry[]> {
  const token = process.env.NOTION_TOKEN;
  if (!token) {
    throw new Error("NOTION_TOKEN not set");
  }

  const entries: DatabaseEntry[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await queryDatabaseWithFetch(databaseId, token, cursor);

    for (const entry of data.results || []) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const entryAny = entry as any;
      
      const properties: Record<string, string> = {};
      for (const [key, value] of Object.entries(entryAny.properties || {})) {
        properties[key] = extractPropertyValue(value);
      }

      entries.push({
        id: entry.id,
        title: extractEntryTitle(entry),
        properties,
        url: entryAny.url,
        cover: entryAny.cover?.external?.url || entryAny.cover?.file?.url || null,
        icon: entryAny.icon?.emoji || entryAny.icon?.external?.url || null,
      });
    }

    cursor = data.next_cursor;
    hasMore = data.has_more;
  }

  return entries;
}

// 获取数据库信息
async function getDatabaseInfo(databaseId: string): Promise<DatabaseInfo> {
  const notion = getNotionClient();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = await notion.databases.retrieve({ database_id: databaseId }) as any;
  
  return {
    id: databaseId,
    title: db.title?.[0]?.plain_text || "Untitled Database",
    description: db.description?.[0]?.plain_text || "",
  };
}

// 获取页面内容（包含详细错误信息）
export async function getPageContent(pageId: string): Promise<PageContent> {
  const notion = getNotionClient();
  const cleanPageId = pageId.replace(/-/g, "");

  // 先尝试作为页面获取
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = await notion.pages.retrieve({ page_id: cleanPageId }) as any;
    const title = extractTitle(page);
    const blocks = await getAllBlocks(cleanPageId);

    return { 
      title, 
      blocks,
      type: "page",
    };
  } catch (pageError) {
    // 不是页面，尝试作为数据库
    try {
      const dbInfo = await getDatabaseInfo(cleanPageId);
      const entries = await getDatabaseEntries(cleanPageId);

      return {
        title: dbInfo.title,
        blocks: [],
        type: "database",
        databaseInfo: dbInfo,
        databaseEntries: entries,
      };
    } catch (dbError) {
      // 返回详细错误
      const pageErrMsg = (pageError as Error).message;
      const dbErrMsg = (dbError as Error).message;
      
      throw new Error(
        `Could not find page or database. ` +
        `Page error: ${pageErrMsg}. ` +
        `Database error: ${dbErrMsg}`
      );
    }
  }
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
