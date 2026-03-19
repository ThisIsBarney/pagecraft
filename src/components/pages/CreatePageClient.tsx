"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { extractNotionPageId } from "@/lib/notion-input";

const templates = [
  { id: "minimal", name: "Minimal", description: "Clean and simple", color: "bg-white" },
  { id: "designer", name: "Designer", description: "Bold and creative", color: "bg-gradient-to-br from-violet-500 to-fuchsia-500" },
  { id: "developer", name: "Developer", description: "Code editor style", color: "bg-[#1e1e1e]" },
];

type SubmissionStage = "idle" | "validating" | "awaiting-auth" | "saving";

interface ValidationResult {
  type: "page" | "database";
  title: string;
  pageId: string;
}

function getErrorTips(error: string) {
  const normalizedError = error.toLowerCase();

  if (normalizedError.includes("invalid notion page identifier")) {
    return [
      "Paste a full Notion share URL or the 32-character page ID.",
      "If you copied a URL, make sure it includes the page identifier segment.",
      "Remove extra spaces before submitting again.",
    ];
  }

  if (
    normalizedError.includes("not found") ||
    normalizedError.includes("shared with the pagecraft integration")
  ) {
    return [
      "Open the page in Notion and verify the URL points to the page you want.",
      "Share the page or database with the PageCraft integration before retrying.",
      "Make sure the content is accessible to the integration, not just your personal account.",
    ];
  }

  if (normalizedError.includes("connection") || normalizedError.includes("later")) {
    return [
      "Check your internet connection and retry.",
      "If the issue persists, wait a moment and try again.",
      "If Notion is reachable but validation still fails, the workspace token may need attention.",
    ];
  }

  return [
    "Double-check the Notion page URL or page ID.",
    "Confirm the content has been shared with the PageCraft integration.",
    "Retry in a moment if Notion access was recently updated.",
  ];
}

function getStageLabel(stage: SubmissionStage, isAuthenticated: boolean) {
  switch (stage) {
    case "validating":
      return "Checking access to your Notion content";
    case "awaiting-auth":
      return "Page verified. Sign in to save it to your account";
    case "saving":
      return isAuthenticated ? "Saving your page settings and generating the site" : "Generating site";
    default:
      return "";
  }
}

export default function CreatePageClient() {
  const pageIdFieldId = "notion-page-id";
  const authorFieldId = "author-name";
  const [pageId, setPageId] = useState("");
  const [author, setAuthor] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("minimal");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>("idle");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shouldSavePage, setShouldSavePage] = useState(false);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const hasPageIdInput = pageId.trim() !== "";
  const normalizedPageId = extractNotionPageId(pageId);
  const hasValidPageReference = hasPageIdInput && normalizedPageId !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pageId.trim()) {
      setError("Please enter a Notion page ID or full Notion page URL");
      return;
    }

    setError("");
    setValidationResult(null);
    setSubmissionStage("validating");
    setLoading(true);

    const cleanId = extractNotionPageId(pageId);
    if (!cleanId) {
      setError(
        "Invalid Notion page identifier. Paste a 32-character page ID or a full Notion page URL."
      );
      setSubmissionStage("idle");
      setLoading(false);
      return;
    }

    // Validate the page exists and is accessible
    try {
      const response = await fetch(`/api/validate-page?pageId=${cleanId}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to validate page. Please try again.");
        setSubmissionStage("idle");
        setLoading(false);
        return;
      }

      setValidationResult({
        type: data.type,
        title: data.title,
        pageId: cleanId,
      });
    } catch {
      setError("Unable to validate page. Please check your connection and try again.");
      setSubmissionStage("idle");
      setLoading(false);
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      setSubmissionStage("awaiting-auth");
      setLoading(false);
      setShouldSavePage(true);
      setShowAuthModal(true);
      return;
    }

    // User is authenticated, proceed to generate and save
    await generateAndSavePage(cleanId, { saveToAccount: true });
  };

  const generateAndSavePage = async (
    cleanId: string,
    options: { saveToAccount?: boolean } = {}
  ) => {
    try {
      setSubmissionStage("saving");
      setLoading(true);
      const slug = author
        ? `${cleanId}-${author.toLowerCase().replace(/\s+/g, "-")}`
        : cleanId;

      if (options.saveToAccount) {
        await savePageToUser(cleanId, slug);
      }

      router.push(`/p/${slug}?template=${selectedTemplate}`);
    } catch (error) {
      console.error("Failed to save page:", error);
      setError("Failed to save page. Please try again.");
      setSubmissionStage("idle");
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

  const handleAuthSuccess = async (user: { id: string; email: string; name: string }) => {
    console.log("Auth success for user:", user.email);
    // If user was trying to save a page, proceed with generation
    if (shouldSavePage && pageId) {
      const cleanId = extractNotionPageId(pageId);

      // Re-validate before proceeding (in case of network issues)
      if (cleanId) {
        setSubmissionStage("validating");
        setLoading(true);

        // Quick validation before proceeding
        try {
          const response = await fetch(`/api/validate-page?pageId=${cleanId}`);
          const data = await response.json();

          if (!response.ok || !data.success) {
            setError(data.error || "Page validation failed after sign in. Please try again.");
            setSubmissionStage("idle");
            setLoading(false);
            return;
          }

          setValidationResult({
            type: data.type,
            title: data.title,
            pageId: cleanId,
          });
          await generateAndSavePage(cleanId, { saveToAccount: true });
        } catch (error) {
          console.error("Unable to validate page after sign in:", error);
          setError("Unable to validate page after sign in. Please try again.");
          setSubmissionStage("idle");
          setLoading(false);
        }
      }
    }
  };

  const extractFromUrl = (url: string) => {
    const extractedId = extractNotionPageId(url);
    if (extractedId) {
      setPageId(extractedId);
      setError("");
    } else {
      setError("Could not find a valid Notion page ID in the pasted content");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      extractFromUrl(clipboardText);
    } catch {
      setError("Clipboard access was blocked. Paste the Notion URL or page ID manually.");
    }
  };

  const stageLabel = getStageLabel(submissionStage, isAuthenticated);
  const errorTips = error ? getErrorTips(error) : [];

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
            Choose a template and enter your Notion page ID or paste the full page URL.
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm whitespace-pre-line">
              <div className="font-medium mb-1">⚠️ Unable to create site</div>
              {error}
              <div className="mt-3 pt-3 border-t border-red-200 text-xs text-red-600">
                <div className="font-medium">Tips:</div>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  {errorTips.map((tip) => (
                    <li key={tip}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {(loading || submissionStage === "awaiting-auth" || validationResult) && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-blue-950">
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 h-2.5 w-2.5 rounded-full ${
                    loading ? "animate-pulse bg-blue-500" : "bg-emerald-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="font-medium">
                    {loading ? stageLabel : validationResult ? "Ready to publish" : stageLabel}
                  </div>
                  <div className="mt-1 text-blue-800">
                    {loading
                      ? "PageCraft is validating your Notion content and preparing the site configuration."
                      : validationResult
                        ? `${validationResult.type === "database" ? "Database" : "Page"}: ${validationResult.title}`
                        : "Continue to the next step to publish your site."}
                  </div>
                  {validationResult && (
                    <div className="mt-3 grid gap-2 rounded-lg bg-white/80 p-3 text-xs text-slate-700 sm:grid-cols-3">
                      <div>
                        <div className="font-medium text-slate-900">Content</div>
                        <div>{validationResult.type}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Template</div>
                        <div>{templates.find((template) => template.id === selectedTemplate)?.name}</div>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Page ID</div>
                        <div className="font-mono">{validationResult.pageId}</div>
                      </div>
                    </div>
                  )}
                </div>
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
              <label
                htmlFor={pageIdFieldId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Notion page ID or URL
              </label>
              <input
                id={pageIdFieldId}
                type="text"
                value={pageId}
                onChange={(e) => {
                  setPageId(e.target.value);
                  setError("");
                  setSubmissionStage("idle");
                  setValidationResult(null);
                }}
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j1234567890ab or https://www.notion.so/..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                <button
                  type="button"
                  onClick={handlePasteFromClipboard}
                  className="text-blue-600 hover:underline"
                >
                  Paste from clipboard
                </button>
                <span
                  className={`text-xs ${
                    hasValidPageReference
                      ? "text-emerald-600"
                      : hasPageIdInput
                        ? "text-red-600"
                        : "text-gray-500"
                  }`}
                >
                  {hasValidPageReference
                    ? `Detected page ID: ${normalizedPageId}`
                    : hasPageIdInput
                      ? "Paste a 32-character page ID or a full Notion share URL"
                      : "We accept either a raw page ID or a Notion share URL"}
                </span>
              </div>
              {hasValidPageReference && (
                <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/80 p-3 text-xs text-emerald-900">
                  <div className="font-medium">Ready to validate</div>
                  <div className="mt-1">
                    PageCraft will check this Notion content before generating your site.
                  </div>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="font-medium">Page ID</div>
                      <div className="font-mono">{normalizedPageId}</div>
                    </div>
                    <div>
                      <div className="font-medium">Template</div>
                      <div>
                        {templates.find((template) => template.id === selectedTemplate)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor={authorFieldId}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name (optional)
              </label>
              <input
                id={authorFieldId}
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
          setSubmissionStage("idle");
        }}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}
