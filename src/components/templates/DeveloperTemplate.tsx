import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface DeveloperTemplateProps {
  content: PageContent;
  author?: string;
}

export function DeveloperTemplate({ content, author }: DeveloperTemplateProps) {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4] font-mono">
      {/* Header */}
      <header className="bg-[#252526] border-b border-[#3e3e42]">
        <div className="max-w-4xl mx-auto px-6 py-3 flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27ca40]" />
          </div>
          <span className="ml-4 text-sm text-[#858585]">
            {content.title} — {author || "developer"}
          </span>
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="max-w-4xl mx-auto flex">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 border-r border-[#3e3e42] min-h-[calc(100vh-49px)] p-4">
          <div className="text-xs text-[#858585] uppercase tracking-wider mb-3">Explorer</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-[#d4d4d4] hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">
              <span className="text-[#519aba]">📄</span>
              <span>README.md</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#d4d4d4] hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">
              <span className="text-[#f1e05a]">⚡</span>
              <span>projects.json</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#d4d4d4] hover:bg-[#2a2d2e] px-2 py-1 rounded cursor-pointer">
              <span className="text-[#e34c26]">🔧</span>
              <span>config.yml</span>
            </div>
          </div>

          <div className="mt-8 text-xs text-[#858585] uppercase tracking-wider mb-3">Outline</div>
          <div className="space-y-1 text-sm text-[#858585]">
            <div className="hover:text-[#d4d4d4] cursor-pointer"># Introduction</div>
            <div className="hover:text-[#d4d4d4] cursor-pointer pl-3">## Projects</div>
            <div className="hover:text-[#d4d4d4] cursor-pointer pl-3">## Skills</div>
            <div className="hover:text-[#d4d4d4] cursor-pointer"># Contact</div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-8">
            <div className="flex items-center gap-2 text-xs text-[#858585] mb-4">
              <span>src</span>
              <span>/</span>
              <span>content</span>
              <span>/</span>
              <span className="text-[#d4d4d4]">page.md</span>
            </div>
          </div>

          <article className="prose prose-invert prose-code:before:content-none prose-code:after:content-none max-w-none">
            {content.blocks && <BlocksRenderer blocks={content.blocks} />}
          </article>

          {/* Terminal-style footer */}
          <div className="mt-16 p-4 bg-[#252526] rounded-lg border border-[#3e3e42]">
            <div className="flex items-center gap-2 text-xs text-[#858585] mb-2">
              <span className="text-[#27ca40]">➜</span>
              <span>~</span>
              <span className="text-[#d4d4d4]">git status</span>
            </div>
            <div className="text-sm text-[#d4d4d4]">
              <span className="text-[#27ca40]">✓</span> Built with PageCraft
              <br />
              <span className="text-[#858585]">→ Deployed to production</span>
            </div>
          </div>
        </main>
      </div>

      {/* Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#007acc] text-white text-xs py-1 px-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span>🌿 main</span>
            <span>0 errors, 0 warnings</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Ln 1, Col 1</span>
            <span>UTF-8</span>
            <span>Markdown</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>

      {/* Spacer for fixed footer */}
      <div className="h-6" />
    </div>
  );
}
