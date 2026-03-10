"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [pageId, setPageId] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId.trim()) {
      setError("Please enter a Notion Page ID");
      return;
    }

    setError("");
    setLoading(true);

    // 清理 pageId（移除空格和连字符）
    const cleanId = pageId.trim().replace(/-/g, "");

    // 验证长度
    if (cleanId.length !== 32) {
      setError("Invalid Page ID. Notion Page IDs are 32 characters long.");
      setLoading(false);
      return;
    }

    // 生成 slug
    const slug = author
      ? `${cleanId}-${author.toLowerCase().replace(/\s+/g, "-")}`
      : cleanId;

    // 跳转到预览页面
    router.push(`/p/${slug}`);
  };

  // 从 URL 提取 ID 的辅助函数
  const extractFromUrl = (url: string) => {
    const match = url.match(/([a-f0-9]{32})/i);
    if (match) {
      setPageId(match[1]);
      setError("");
    } else {
      setError("Could not find a valid Page ID in this URL");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-xl font-bold flex items-center gap-2">
            <span>🦾</span> PageCraft
          </a>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-2">Create your site</h1>
          <p className="text-gray-600 mb-8">
            Enter your Notion page ID to generate a beautiful website.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notion Page ID
              </label>
              <input
                type="text"
                value={pageId}
                onChange={(e) => {
                  setPageId(e.target.value);
                  setError("");
                }}
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j1234567890ab"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <div className="mt-2 flex gap-2 text-sm">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.readText().then(extractFromUrl);
                  }}
                  className="text-blue-600 hover:underline"
                >
                  Paste from clipboard
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Find this in your Notion page URL. It&apos;s the 32-character string
                after the page title.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name (optional)
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Marshall WU"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Site →"
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <h3 className="font-medium text-gray-900 mb-2">Before you start:</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Your Notion page must be shared with the PageCraft integration</li>
              <li>Open your page → Share → Add connections → PageCraft</li>
              <li>Only regular pages are supported (not databases yet)</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
