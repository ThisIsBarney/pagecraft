import { PageContent } from "@/lib/notion";
import { BlocksRenderer } from "@/components/BlockRenderer";

interface MinimalTemplateProps {
  content: PageContent;
  author?: string;
}

export function MinimalTemplate({ content, author }: MinimalTemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-4 sm:py-6">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm text-gray-500">
              {author || "Portfolio"}
            </span>
            <a 
              href="/" 
              className="text-[11px] sm:text-xs text-gray-400 hover:text-gray-600"
            >
              Made with PageCraft
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight">
            {content.title}
          </h1>
          {content.blocks && <BlocksRenderer blocks={content.blocks} />}
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 sm:py-8 mt-12 sm:mt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-xs sm:text-sm text-gray-400">
          © {new Date().getFullYear()} {author || "PageCraft User"}
        </div>
      </footer>
    </div>
  );
}
