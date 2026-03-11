"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const templates = [
  { id: "minimal", name: "Minimal", description: "Clean and simple", color: "bg-white" },
  { id: "designer", name: "Designer", description: "Bold and creative", color: "bg-gradient-to-br from-violet-500 to-fuchsia-500" },
  { id: "developer", name: "Developer", description: "Code editor style", color: "bg-[#1e1e1e]" },
];

export default function CreatePage() {
  const [pageId, setPageId] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
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

    const cleanId = pageId.trim().replace(/-/g, "");

    if (cleanId.length !== 32) {
      setError("Invalid Page ID. Notion Page IDs are 32 characters long.");
      setLoading(false);
      return;
    }

    const slug = author
      ? `${cleanId}-${author.toLowerCase().replace(/\s+/g, "-")}`
      : cleanId;

    router.push(`/p/${slug}?template=${selectedTemplate}`);
  };

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
            Choose a template and enter your Notion page ID.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose a template
            </label>
            <div className="grid grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-full h-16 rounded-lg mb-3 ${template.color} ${template.id === "developer" ? "border border-gray-600" : ""}`} />
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-500">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

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
        </div>
      </main>
    </div>
  );
}
