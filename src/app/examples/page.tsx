import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { DatabaseTemplate } from "@/components/templates/DatabaseTemplate";
import { PageContent } from "@/lib/notion";

// 示例页面数据
const samplePageContent: PageContent = {
  title: "Marshall WU - Full Stack Developer",
  type: "page",
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
      type: "divider",
      divider: {},
    },
    {
      id: "9",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Built with ❤️ and lots of coffee" }, annotations: { italic: true } },
        ],
      },
    },
  ],
};

// 示例数据库数据
const sampleDatabaseContent: PageContent = {
  title: "My Projects",
  type: "database",
  databaseInfo: {
    id: "sample-db",
    title: "My Projects",
    description: "A collection of my side projects and experiments",
  },
  databaseEntries: [
    {
      id: "1",
      title: "PageCraft",
      properties: {
        Status: "In Progress",
        Type: "Web App",
        Tech: "Next.js, Notion API",
      },
      url: "#",
      icon: "🦾",
    },
    {
      id: "2",
      title: "AI Chatbot",
      properties: {
        Status: "Completed",
        Type: "AI Tool",
        Tech: "OpenAI, Python",
      },
      url: "#",
      icon: "🤖",
    },
    {
      id: "3",
      title: "Portfolio Site",
      properties: {
        Status: "Live",
        Type: "Website",
        Tech: "React, Tailwind",
      },
      url: "#",
      icon: "🎨",
    },
  ],
};

export default function ExamplePage() {
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <h2 className="font-semibold text-blue-900 mb-2">Examples</h2>
        <p className="text-blue-700 text-sm">
          Below are two example templates. The first shows a regular page layout, 
          the second shows a database rendered as cards.
        </p>
      </div>

      <section>
        <h3 className="text-lg font-medium text-gray-900 mb-4 px-6">Page Template</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <MinimalTemplate content={samplePageContent} author="Marshall WU" />
        </div>
      </section>

      <section className="mt-12">
        <h3 className="text-lg font-medium text-gray-900 mb-4 px-6">Database Template</h3>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <DatabaseTemplate content={sampleDatabaseContent} author="Marshall WU" />
        </div>
      </section>
    </div>
  );
}
