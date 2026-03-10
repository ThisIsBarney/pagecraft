import React from "react";
import { PageContent } from "@/lib/notion";

interface MinimalTemplateProps {
  content: PageContent;
  author?: string;
}

export function MinimalTemplate({ content, author }: MinimalTemplateProps) {
  // 简单的 markdown 转 HTML（MVP 版本，后续可以用更完善的库）
  const htmlContent = content.markdown
    .replace(/^# (.*$)/gim, '<h1 class="text-4xl font-bold mb-6">$1</h1>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-4">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-medium mt-6 mb-3">$1</h3>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener">$1</a>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^(?!<[h|l|p|u|o|d]).*$/gim, '<p class="mb-4 leading-relaxed">$&</p>')
    .replace(/\n/g, '');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 py-6">
        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {author || "Portfolio"}
            </span>
            <span className="text-xs text-gray-400">
              Made with PageCraft
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <article 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-16">
        <div className="max-w-3xl mx-auto px-6 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {author || "PageCraft User"}
        </div>
      </footer>
    </div>
  );
}
