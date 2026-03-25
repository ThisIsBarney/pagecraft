import type { Metadata } from "next";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { DesignerTemplate } from "@/components/templates/DesignerTemplate";
import { DeveloperTemplate } from "@/components/templates/DeveloperTemplate";
import { DatabaseTemplate } from "@/components/templates/DatabaseTemplate";
import { PageContent } from "@/lib/notion";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Template Gallery",
  description:
    "Preview PageCraft templates for pages and databases before publishing your Notion content.",
  path: "/examples",
});

const samplePageContent: PageContent = {
  title: "Marshall WU - Full Stack Developer",
  type: "page",
  blocks: [
    {
      id: "1",
      type: "heading_1",
      heading_1: {
        rich_text: [{ type: "text", text: { content: "Hello, I'm Marshall" } }],
      },
    },
    {
      id: "2",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "I build products that solve real problems. Currently focused on AI tools and web applications." } },
        ],
      },
    },
    {
      id: "3",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "Projects" } }],
      },
    },
    {
      id: "4",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "PageCraft" }, annotations: { bold: true } },
          { type: "text", text: { content: " - Turn Notion into websites" } },
        ],
      },
    },
    {
      id: "5",
      type: "bulleted_list_item",
      bulleted_list_item: {
        rich_text: [
          { type: "text", text: { content: "AI Assistant" }, annotations: { bold: true } },
          { type: "text", text: { content: " - Personal AI helper" } },
        ],
      },
    },
    {
      id: "6",
      type: "heading_2",
      heading_2: {
        rich_text: [{ type: "text", text: { content: "Contact" } }],
      },
    },
    {
      id: "7",
      type: "paragraph",
      paragraph: {
        rich_text: [
          { type: "text", text: { content: "Email: hello@marshall.wu" } },
        ],
      },
    },
    {
      id: "8",
      type: "toggle",
      toggle: {
        rich_text: [{ type: "text", text: { content: "Phase 2: Advanced blocks" } }],
      },
      children: [
        {
          id: "8-1",
          type: "paragraph",
          paragraph: {
            rich_text: [{ type: "text", text: { content: "More details from toggle" } }],
          },
        },
      ],
    },
    {
      id: "9",
      type: "table",
      children: [
        {
          id: "9-1",
          type: "table_row",
          table_row: {
            cells: [
              [{ type: "text", text: { content: "Cell A1" } }],
              [{ type: "text", text: { content: "Cell B1" } }],
            ],
          },
        },
      ],
    },
    {
      id: "10",
      type: "synced_block",
      synced_block: {
        synced_from: {
          block_id: "demo-sync-origin",
        },
      },
      children: [],
    },
    {
      id: "11",
      type: "bookmark",
      bookmark: {
        url: "https://example.com/pagecraft-bookmark",
      },
    },
    {
      id: "12",
      type: "video",
      video: {
        external: {
          url: "https://example.com/video/pagecraft-demo",
        },
      },
    },
    {
      id: "13",
      type: "file",
      file: {
        external: {
          url: "https://example.com/files/pagecraft-spec.zip",
        },
      },
    },
    {
      id: "14",
      type: "pdf",
      pdf: {
        external: {
          url: "https://example.com/files/pagecraft-guide.pdf",
        },
      },
    },
    {
      id: "15",
      type: "column",
    },
  ],
};

const sampleDatabaseContent: PageContent = {
  title: "My Projects",
  type: "database",
  databaseInfo: {
    id: "sample-db",
    title: "My Projects",
    description: "A collection of my side projects",
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Template Gallery</h1>
            <a href="/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Create Your Site →
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Minimal Template */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Minimal</h2>
              <p className="text-gray-600">Clean, simple, professional. Perfect for blogs and resumes.</p>
            </div>
            <a href="/p/demo-minimal?template=minimal" className="text-blue-600 hover:underline">Preview →</a>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <MinimalTemplate content={samplePageContent} author="Marshall WU" />
          </div>
        </section>

        {/* Designer Template */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Designer</h2>
              <p className="text-gray-600">Bold, creative, dark mode. For portfolios and creative work.</p>
            </div>
            <a href="/p/demo-designer?template=designer" className="text-blue-600 hover:underline">Preview →</a>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <DesignerTemplate content={samplePageContent} author="Marshall WU" />
          </div>
        </section>

        {/* Developer Template */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Developer</h2>
              <p className="text-gray-600">VS Code style. Perfect for dev blogs and documentation.</p>
            </div>
            <a href="/p/demo-developer?template=developer" className="text-blue-600 hover:underline">Preview →</a>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <DeveloperTemplate content={samplePageContent} author="Marshall WU" />
          </div>
        </section>

        {/* Database Template */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Database</h2>
              <p className="text-gray-600">Card layout for Notion databases. Great for portfolios and collections.</p>
            </div>
            <span className="text-gray-400">Auto-selected for databases</span>
          </div>
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
            <DatabaseTemplate content={sampleDatabaseContent} author="Marshall WU" />
          </div>
        </section>
      </main>
    </div>
  );
}
