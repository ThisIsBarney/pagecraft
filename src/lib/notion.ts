import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

// 注意：这是一个服务端模块，只在服务器端运行
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

export interface PageContent {
  title: string;
  markdown: string;
  blocks: any[];
}

// 获取用户的所有页面
export async function getPages(): Promise<PageInfo[]> {
  const notion = getNotionClient();
  
  const response = await notion.search({
    filter: {
      value: "page",
      property: "object",
    },
  });

  return response.results.map((page: any) => ({
    id: page.id,
    title: page.properties?.title?.title?.[0]?.plain_text || "Untitled",
    url: page.url,
    lastEdited: page.last_edited_time,
  }));
}

// 获取单个页面的内容
export async function getPageContent(pageId: string): Promise<PageContent> {
  const notion = getNotionClient();
  const n2m = new NotionToMarkdown({ notionClient: notion });

  // 清理 pageId（移除连字符）
  const cleanPageId = pageId.replace(/-/g, "");

  // 获取页面信息
  const page = await notion.pages.retrieve({ page_id: cleanPageId });
  const title = (page as any).properties?.title?.title?.[0]?.plain_text || "Untitled";

  // 获取页面块
  const blocks = await notion.blocks.children.list({
    block_id: cleanPageId,
  });

  // 转换为 Markdown
  const mdBlocks = await n2m.blocksToMarkdown(blocks.results);
  const markdown = n2m.toMarkdownString(mdBlocks);

  return {
    title,
    markdown: markdown.parent || "",
    blocks: blocks.results,
  };
}

// 根据公开页面 ID 获取内容
export async function getPublicPageContent(pageId: string): Promise<PageContent> {
  return getPageContent(pageId);
}
