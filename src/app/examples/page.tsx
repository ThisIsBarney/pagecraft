import type { Metadata } from "next";
import { MinimalTemplate } from "@/components/templates/MinimalTemplate";
import { DesignerTemplate } from "@/components/templates/DesignerTemplate";
import { DeveloperTemplate } from "@/components/templates/DeveloperTemplate";
import { CreatorTemplate } from "@/components/templates/CreatorTemplate";
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
      children: [
        {
          id: "4-1",
          type: "bulleted_list_item",
          bulleted_list_item: {
            rich_text: [{ type: "text", text: { content: "Nested bullet insight" } }],
          },
        },
      ],
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
      id: "5-1",
      type: "numbered_list_item",
      numbered_list_item: {
        rich_text: [{ type: "text", text: { content: "Roadmap item" } }],
      },
      children: [
        {
          id: "5-1-1",
          type: "numbered_list_item",
          numbered_list_item: {
            rich_text: [{ type: "text", text: { content: "Nested numbered detail" } }],
          },
        },
      ],
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
      id: "7-1",
      type: "quote",
      quote: {
        rich_text: [{ type: "text", text: { content: "Great products feel obvious in hindsight." } }],
      },
    },
    {
      id: "7-2",
      type: "callout",
      callout: {
        icon: null,
        rich_text: [{ type: "text", text: { content: "Shipping weekly keeps momentum high." } }],
      },
    },
    {
      id: "7-3",
      type: "code",
      code: {
        rich_text: [
          { type: "text", text: { content: "const launch = async () => {" } },
          { type: "text", text: { content: "\n  await ship(\"pagecraft\");" } },
          { type: "text", text: { content: "\n};" } },
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
    {
      id: "16",
      type: "link_to_page",
      link_to_page: {
        page_id: "12345678-90ab-cdef-1234-567890abcdef",
      },
    },
    {
      id: "12345678-90ab-cdef-1234-567890abcdee",
      type: "child_page",
      child_page: {
        title: "Nested Case Study",
      },
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
      icon: "PC",
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
      icon: "AI",
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
      icon: "UX",
    },
  ],
};

export default function ExamplePage() {
  const templateSections = [
    {
      id: "minimal",
      title: "Minimal",
      description: "Clean and editorial. Great for writing-focused pages.",
      previewHref: "/p/demo-minimal?template=minimal",
      content: <MinimalTemplate content={samplePageContent} author="Marshall WU" />,
    },
    {
      id: "designer",
      title: "Designer",
      description: "Bold visual direction for portfolio and creative work.",
      previewHref: "/p/demo-designer?template=designer",
      content: <DesignerTemplate content={samplePageContent} author="Marshall WU" />,
    },
    {
      id: "developer",
      title: "Developer",
      description: "Structured style tailored for technical writing.",
      previewHref: "/p/demo-developer?template=developer",
      content: <DeveloperTemplate content={samplePageContent} author="Marshall WU" />,
    },
    {
      id: "creator",
      title: "Creator",
      description: "Warm editorial tone for updates, essays, and newsletters.",
      previewHref: "/p/demo-creator?template=creator",
      content: <CreatorTemplate content={samplePageContent} author="Marshall WU" />,
    },
    {
      id: "database",
      title: "Database",
      description: "Auto-selected for Notion databases and collections.",
      previewHref: "",
      content: <DatabaseTemplate content={sampleDatabaseContent} author="Marshall WU" />,
    },
  ];

  return (
    <div className="page-shell min-h-screen">
      <header className="sticky top-0 z-30 border-b border-black/8 bg-white/60 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
          <a href="/" className="flex items-center gap-3 text-stone-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              PC
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">PageCraft</span>
              <span className="block text-sm soft-text">Template gallery</span>
            </span>
          </a>
          <a
            href="/create"
            className="rounded-full bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Create site
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 lg:px-8">
        <div className="mb-8 max-w-3xl">
          <div className="eyebrow">Template previews</div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] text-stone-950 sm:text-5xl">
            Pick the visual direction before publishing.
          </h1>
          <p className="mt-3 text-sm leading-7 soft-text sm:text-base">
            Each template uses the same Notion content model, so you can switch tone without restructuring your page.
          </p>
        </div>

        <div className="space-y-12">
          {templateSections.map((section) => (
            <section key={section.id} className="glass-panel-strong overflow-hidden rounded-[1.75rem]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/8 px-6 py-5">
                <div>
                  <h2 className="text-2xl font-semibold tracking-[-0.04em] text-stone-950">{section.title}</h2>
                  <p className="mt-1 text-sm soft-text">{section.description}</p>
                </div>
                {section.previewHref ? (
                  <a
                    href={section.previewHref}
                    className="rounded-full border border-black/12 bg-white px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Open preview
                  </a>
                ) : (
                  <span className="rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.12em] text-stone-500">
                    Auto selected
                  </span>
                )}
              </div>
              <div className="border-t border-black/4">{section.content}</div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
