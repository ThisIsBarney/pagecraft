import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { PageContent } from "@/lib/notion";

// 示例数据，用于演示
const sampleContent: PageContent = {
  title: "Marshall WU - Full Stack Developer",
  blocks: [
    {
      id: "1",
      type: "heading_1",
      heading_1: {
        rich_text: [{ type: "text", text: { content: "Marshall WU" } }],
      },
    },
    {
      id: "2",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "Full Stack Developer & Indie Maker" } }],
      },
    },
    {
      id: "3",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Hi! I'm Marshall, a passionate developer building useful tools for the web." } },
        ],
      },
    },
    {
      id: "4",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "What I Do" } }],
      },
    },
    {
      id: "5",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "Web Development" }, annotations: { bold: true } },
          { type: "text", text: { content: " - React, Next.js, Node.js" } },
        ],
      },
    },
    {
      id: "6",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "Product Design" }, annotations: { bold: true } },
          { type: "text", text: { content: " - From idea to MVP" } },
        ],
      },
    },
    {
      id: "7",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "Open Source" }, annotations: { bold: true } },
          { type: "text", text: { content: " - Contributing to the community" } },
        ],
      },
    },
    {
      id: "8",
      type: "heading_3",
      heading_3: {
        rich_text: [{ type: "text", text: { content: "Projects" } }],
      },
    },
    {
      id: "9",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "PageCraft" }, annotations: { bold: true } },
          { type: "text", text: { content: " - Turn Notion pages into beautiful websites" } },
        ],
      },
    },
    {
      id: "10",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "Built with Next.js and Notion API" } },
        ],
      },
    },
    {
      id: "11",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "Helping creators build their online presence" } },
        ],
      },
    },
    {
      id: "12",
      type: "divider",
      divider: {},
    },
    {
      id: "13",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Built with ❤️ and lots of coffee" }, annotations: { italic: true } },
        ],
      },
    },
  ],
};

export default function ExamplePage() {
  return <MinimalTemplate content={sampleContent} author="Marshall WU" />;
}
