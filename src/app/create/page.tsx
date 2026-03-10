"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [pageId, setPageId] = useState("");
  const [author, setAuthor] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId) return;

    setLoading(true);
    // 生成 slug: pageId-authorName
    const slug = author 
      ? `${pageId}-${author.toLowerCase().replace(/\s+/g, "-")}`
      : pageId;
    
    // 跳转到预览页面
    router.push(`/p/${slug}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <a href="/" className="text-xl font-bold">🦾 PageCraft</a>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <h1 className="text-2xl font-bold mb-2">Create your site</h1>
          <p className="text-gray-600 mb-8">
            Enter your Notion page ID to generate a beautiful website.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notion Page ID
              </label>
              <input
                type="text"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Find this in your Notion page URL: notion.so/YourPage-
                <span className="font-mono bg-gray-100 px-1">ID_HERE</span>
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Generating..." : "Generate Site →"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              <strong>Note:</strong> Your Notion page must be shared publicly 
              or connected to our integration for this to work.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
