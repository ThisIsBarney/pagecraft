"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shouldSavePage, setShouldSavePage] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId.trim()) {
      setError("Please enter a Notion Page ID");
      return;
    }

    setError("");
    setLoading(true);

    const cleanId = pageId.trim().replace(/-/g, "");

    // Validate format (32 hex characters)
    if (!/^[a-f0-9]{32}$/i.test(cleanId)) {
      setError("Invalid Page ID format. Notion Page IDs should be 32 hexadecimal characters (with or without hyphens). Example: 1a2b3c4d5e6f7g8h9i0j1234567890ab");
      setLoading(false);
      return;
    }

    // Validate the page exists and is accessible
    try {
      const response = await fetch(`/api/validate-page?pageId=${cleanId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to validate page. Please try again.");
        setLoading(false);
        return;
      }

      // Page is valid, show success message
      console.log(`Valid ${data.type}: ${data.title}`);
    } catch (validationError) {
      setError("Unable to validate page. Please check your connection and try again.");
      setLoading(false);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setLoading(false);
      setShouldSavePage(true);
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, proceed to generate and save
    await generateAndSavePage(cleanId);
  };

  const generateAndSavePage = async (cleanId: string) => {
    try {
      const slug = author
        ? `${cleanId}-${author.toLowerCase().replace(/\s+/g, "-")}`
        : cleanId;

      // If user wants to save the page, call API
      if (shouldSavePage && user) {
        await savePageToUser(cleanId, slug);
      }

      router.push(`/p/${slug}?template=${selectedTemplate}`);
    } catch (_error) {
      setError("Failed to save page. Please try again.");
      setLoading(false);
    }
  };

  const savePageToUser = async (pageId: string, slug: string) => {
    const response = await fetch("/api/user-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notionPageId: pageId,
        title: `Page ${new Date().toLocaleDateString()}`,
        slug,
        template: selectedTemplate,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save page");
    }
  };

  const handleAuthSuccess = async (_user: { id: string; email: string; name: string }) => {
    // If user was trying to save a page, proceed with generation
    if (shouldSavePage && pageId) {
      const cleanId = pageId.trim().replace(/-/g, "");
      
      // Re-validate before proceeding (in case of network issues)
      if (cleanId.length === 32) {
        setLoading(true);
        
        // Quick validation before proceeding
        try {
          const response = await fetch(`/api/validate-page?pageId=${cleanId}`);
          const data = await response.json();

          if (!response.ok || !data.success) {
            setError(data.error || "Page validation failed after sign in. Please try again.");
            setLoading(false);
            return;
          }

          await generateAndSavePage(cleanId);
        } catch (_error) {
          setError("Unable to validate page after sign in. Please try again.");
          setLoading(false);
        }
      }
    }
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
              <div className="font-medium mb-1">⚠️ Unable to create site</div>
              {error}
              <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600">
                <div className="font-medium">Tips:</div>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Find the Page ID in your Notion page URL: <code className="bg-red-100 px-1 rounded">.../notion.so/workspace/<span className="font-bold">page-id-here</span></code></li>
                  <li>Make sure the page is shared with the PageCraft integration</li>
                  <li>The page must be accessible (not private to you only)</li>
                </ul>
              </div>
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

            {/* Auth Status */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-gray-900">
                    {isAuthenticated ? `Signed in as ${user?.email}` : "Not signed in"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isAuthenticated 
                      ? "Your page will be saved to your account"
                      : "Sign in to save this page and access it later"
                    }
                  </div>
                </div>
                {!isAuthenticated && (
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Sign in
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isAuthenticated ? "Validating and generating..." : "Validating..."}
                </>
              ) : (
                <>
                  {isAuthenticated ? "Generate & Save →" : "Generate Site →"}
                  {!isAuthenticated && (
                    <span className="text-xs bg-blue-800 text-white px-2 py-1 rounded-full">
                      Free
                    </span>
                  )}
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setShouldSavePage(false);
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
