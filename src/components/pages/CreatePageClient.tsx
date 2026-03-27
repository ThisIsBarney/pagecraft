"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/hooks/useAuth";
import { extractNotionPageId } from "@/lib/notion-input";

const templates = [
  { id: "minimal", name: "Minimal", description: "Quiet and editorial", color: "bg-[linear-gradient(180deg,#ffffff_0%,#f4f1ea_100%)]" },
  { id: "designer", name: "Designer", description: "Bold and expressive", color: "bg-[radial-gradient(circle_at_top_left,#f5d0fe_0%,#fb7185_35%,#111827_100%)]" },
  { id: "developer", name: "Developer", description: "Structured and technical", color: "bg-[linear-gradient(135deg,#111827_0%,#0f172a_55%,#1f2937_100%)]" },
  { id: "creator", name: "Creator", description: "Warm editorial showcase", color: "bg-[linear-gradient(135deg,#f6e7cb_0%,#f7d7d0_45%,#fffaf5_100%)]" },
];

type SubmissionStage = "idle" | "validating" | "awaiting-auth" | "saving";
type ValidationErrorCode =
  | "missing_input"
  | "invalid_identifier"
  | "server_misconfigured"
  | "notion_content_not_found"
  | "notion_unavailable";

interface ValidationResult {
  type: "page" | "database";
  title: string;
  pageId: string;
  unsupportedBlockTypes?: string[];
  pageStructure?: Array<{ id: string; title: string }>;
}

interface ValidationSuccessResponse {
  success: true;
  type: "page" | "database";
  title: string;
  url?: string;
  hasUnsupportedBlocks?: boolean;
  unsupportedBlockTypes?: string[];
  pageStructure?: Array<{ id: string; title: string }>;
}

interface ValidationErrorResponse {
  success: false;
  error: string;
  errorCode?: ValidationErrorCode;
}

type ValidationApiResponse = ValidationSuccessResponse | ValidationErrorResponse;

const CREATE_DRAFT_STORAGE_KEY = "pagecraft:create-draft:v1";

function isValidationErrorResponse(data: ValidationApiResponse): data is ValidationErrorResponse {
  return data.success === false;
}

function buildExpectedSlug(pageId: string, author: string): string {
  if (!author.trim()) {
    return pageId;
  }

  const normalizedAuthor = author
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalizedAuthor ? `${pageId}-${normalizedAuthor}` : pageId;
}

function buildExpectedPublishUrl(pageId: string, author: string, templateId: string): string {
  const slug = buildExpectedSlug(pageId, author);
  return `/p/${slug}?template=${templateId}`;
}

function getErrorTips(error: string, errorCode?: ValidationErrorCode | null) {
  if (errorCode === "invalid_identifier") {
    return [
      "Paste a full Notion share URL or the 32-character page ID.",
      "If you copied a URL, make sure it includes the page identifier segment.",
      "Remove extra spaces before submitting again.",
    ];
  }

  if (errorCode === "notion_content_not_found") {
    return [
      "Open the page in Notion and verify the URL points to the page you want.",
      "Share the page or database with the PageCraft integration before retrying.",
      "Make sure the content is accessible to the integration, not just your personal account.",
    ];
  }

  if (errorCode === "notion_unavailable") {
    return [
      "Check your internet connection and retry.",
      "If the issue persists, wait a moment and try again.",
      "If Notion is reachable but validation still fails, the workspace token may need attention.",
    ];
  }

  if (errorCode === "server_misconfigured") {
    return [
      "The server is missing required Notion integration configuration.",
      "Retry later if deployment is in progress.",
      "If this persists, contact support with the timestamp of your attempt.",
    ];
  }

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
  const [errorCode, setErrorCode] = useState<ValidationErrorCode | null>(null);
  const [submissionStage, setSubmissionStage] = useState<SubmissionStage>("idle");
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [shouldSavePage, setShouldSavePage] = useState(false);
  const [publishNotice, setPublishNotice] = useState("");
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const hasLoadedDraft = useRef(false);
  const hasPageIdInput = pageId.trim() !== "";
  const normalizedPageId = extractNotionPageId(pageId);
  const hasValidPageReference = hasPageIdInput && normalizedPageId !== null;

  useEffect(() => {
    if (hasLoadedDraft.current) {
      return;
    }

    hasLoadedDraft.current = true;
    const rawDraft = window.localStorage.getItem(CREATE_DRAFT_STORAGE_KEY);

    if (!rawDraft) {
      return;
    }

    try {
      const parsed = JSON.parse(rawDraft) as {
        pageId?: string;
        author?: string;
        selectedTemplate?: string;
      };

      if (typeof parsed.pageId === "string") {
        setPageId(parsed.pageId);
      }
      if (typeof parsed.author === "string") {
        setAuthor(parsed.author);
      }
      if (typeof parsed.selectedTemplate === "string") {
        setSelectedTemplate(parsed.selectedTemplate);
      }
    } catch {
      window.localStorage.removeItem(CREATE_DRAFT_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedDraft.current) {
      return;
    }

    window.localStorage.setItem(
      CREATE_DRAFT_STORAGE_KEY,
      JSON.stringify({
        pageId,
        author,
        selectedTemplate,
      })
    );
  }, [pageId, author, selectedTemplate]);

  const validatePageAccess = async (
    cleanId: string,
    options: {
      fallbackErrorMessage: string;
      networkErrorMessage: string;
    }
  ): Promise<ValidationSuccessResponse | null> => {
    setSubmissionStage("validating");
    setLoading(true);

    try {
      const response = await fetch(`/api/validate-page?pageId=${cleanId}`);
      const data: ValidationApiResponse = await response.json();

      if (!response.ok) {
        if (isValidationErrorResponse(data)) {
          setError(data.error || options.fallbackErrorMessage);
          setErrorCode(data.errorCode || null);
        } else {
          setError(options.fallbackErrorMessage);
          setErrorCode(null);
        }
        setSubmissionStage("idle");
        setLoading(false);
        return null;
      }

      if (isValidationErrorResponse(data)) {
        setError(data.error || options.fallbackErrorMessage);
        setErrorCode(data.errorCode || null);
        setSubmissionStage("idle");
        setLoading(false);
        return null;
      }

      setValidationResult({
        type: data.type,
        title: data.title,
        pageId: cleanId,
        unsupportedBlockTypes: data.unsupportedBlockTypes || [],
        pageStructure: data.pageStructure || [],
      });

      return data;
    } catch {
      setError(options.networkErrorMessage);
      setErrorCode("notion_unavailable");
      setSubmissionStage("idle");
      setLoading(false);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {
      return;
    }
    if (!pageId.trim()) {
      setError("Please enter a Notion page ID or full Notion page URL");
      setErrorCode("missing_input");
      return;
    }

    setPublishNotice("");
    setError("");
    setErrorCode(null);
    setValidationResult(null);

    const cleanId = extractNotionPageId(pageId);
    if (!cleanId) {
      setError(
        "Invalid Notion page identifier. Paste a 32-character page ID or a full Notion page URL."
      );
      setErrorCode("invalid_identifier");
      setSubmissionStage("idle");
      setLoading(false);
      return;
    }

    const validationData = await validatePageAccess(cleanId, {
      fallbackErrorMessage: "Failed to validate page. Please try again.",
      networkErrorMessage: "Unable to validate page. Please check your connection and try again.",
    });
    if (!validationData) {
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
    await generateAndSavePage(cleanId, {
      saveToAccount: true,
      pageTitle: validationData.title,
    });
  };

  const generateAndSavePage = async (
    cleanId: string,
    options: { saveToAccount?: boolean; pageTitle?: string } = {}
  ) => {
    try {
      setSubmissionStage("saving");
      setLoading(true);
      const slug = author
        ? `${cleanId}-${author.toLowerCase().replace(/\s+/g, "-")}`
        : cleanId;
      const resolvedPageTitle = options.pageTitle?.trim() || validationResult?.title?.trim() || "Untitled";

      let finalSlug = slug;

      if (options.saveToAccount) {
        const savedSlug = await savePageToUser(cleanId, slug, resolvedPageTitle);
        if (savedSlug) {
          finalSlug = savedSlug;
        }
      }

      window.localStorage.removeItem(CREATE_DRAFT_STORAGE_KEY);
      router.push(`/p/${finalSlug}?template=${selectedTemplate}`);
    } catch (error) {
      console.error("Failed to save page:", error);
      setError(error instanceof Error ? error.message : "Failed to save page. Please try again.");
      setErrorCode(null);
      setSubmissionStage("idle");
      setLoading(false);
    }
  };

  const savePageToUser = async (pageId: string, slug: string, pageTitle: string) => {
    const response = await fetch("/api/user-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        notionPageId: pageId,
        title: pageTitle,
        slug,
        template: selectedTemplate,
      }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "error" in payload
          ? String((payload as { error?: string }).error || "Failed to save page")
          : "Failed to save page";
      throw new Error(message);
    }

    const savedSlug =
      payload && typeof payload === "object" && "page" in payload
        ? (payload as { page?: { slug?: string } }).page?.slug
        : null;

    if (savedSlug && savedSlug !== slug) {
      setPublishNotice(`Slug adjusted to avoid conflict: ${savedSlug}`);
    }

    return savedSlug;
  };

  const handleAuthSuccess = async (user: { id: string; email: string; name: string }) => {
    console.log("Auth success for user:", user.email);
    // If user was trying to save a page, proceed with generation
    if (shouldSavePage && pageId) {
      const cleanId = extractNotionPageId(pageId);

      // Re-validate before proceeding (in case of network issues)
      if (cleanId) {
        const validationData = await validatePageAccess(cleanId, {
          fallbackErrorMessage: "Page validation failed after sign in. Please try again.",
          networkErrorMessage: "Unable to validate page after sign in. Please try again.",
        });
        if (!validationData) {
          return;
        }

        await generateAndSavePage(cleanId, {
          saveToAccount: true,
          pageTitle: validationData.title,
        });
      }
    }
  };

  const handleRetryValidation = async () => {
    if (loading) {
      return;
    }

    const cleanId = extractNotionPageId(pageId) || validationResult?.pageId;
    if (!cleanId) {
      setError("Please enter a valid Notion page ID or URL before retrying.");
      setErrorCode("invalid_identifier");
      return;
    }

    setError("");
    setErrorCode(null);
    const validationData = await validatePageAccess(cleanId, {
      fallbackErrorMessage: "Failed to validate page. Please try again.",
      networkErrorMessage: "Unable to validate page. Please check your connection and try again.",
    });
    if (!validationData) {
      return;
    }

    setSubmissionStage("idle");
    setLoading(false);
  };

  const extractFromUrl = (url: string) => {
    const extractedId = extractNotionPageId(url);
    if (extractedId) {
      setPageId(extractedId);
      setError("");
      setErrorCode(null);
    } else {
      setError("Could not find a valid Notion page ID in the pasted content");
      setErrorCode("invalid_identifier");
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      extractFromUrl(clipboardText);
    } catch {
      setError("Clipboard access was blocked. Paste the Notion URL or page ID manually.");
      setErrorCode(null);
    }
  };

  const stageLabel = getStageLabel(submissionStage, isAuthenticated);
  const errorTips = error ? getErrorTips(error, errorCode) : [];
  const previewPageId = normalizedPageId || validationResult?.pageId || "";
  const expectedPublishUrl = previewPageId
    ? buildExpectedPublishUrl(previewPageId, author, selectedTemplate)
    : null;

  return (
    <div className="page-shell">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute left-[8%] top-16 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(217,119,87,0.16),transparent_65%)] blur-3xl" />
        <div className="absolute right-[10%] top-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(120,154,190,0.16),transparent_68%)] blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <a href="/" className="flex items-center gap-3 text-stone-950">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(24,21,18,0.18)]">
            PC
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
              PageCraft
            </span>
            <span className="block text-sm soft-text">Publishing flow</span>
          </span>
        </a>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <div className="eyebrow">Create a site</div>
          <h1 className="mt-5 text-balance text-5xl font-semibold tracking-[-0.07em] text-stone-950 sm:text-6xl">
            Publish from Notion with a calmer setup flow.
          </h1>
          <p className="mt-4 text-base leading-8 soft-text sm:text-lg">
            Paste the page, choose a direction, review the URL, and publish without fighting
            a noisy dashboard.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="glass-panel rounded-[2rem] p-7 sm:p-8">
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[1.5rem] border border-black/6 bg-[linear-gradient(180deg,#fffcf7_0%,#f4ece2_100%)] p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-stone-500">Step 1</div>
                <div className="mt-3 text-base font-medium text-stone-950">Paste the source</div>
                <div className="mt-2 text-sm leading-6 soft-text">
                  Use a page ID or share URL. Validation happens before anything is saved.
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-black/6 bg-white/90 p-5">
                <div className="text-xs uppercase tracking-[0.16em] text-stone-500">Step 2</div>
                <div className="mt-3 text-base font-medium text-stone-950">Pick the mood</div>
                <div className="mt-2 text-sm leading-6 soft-text">
                  Switch visual tone without changing your content structure.
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-stone-950 p-5 text-white">
                <div className="text-xs uppercase tracking-[0.16em] text-stone-400">Step 3</div>
                <div className="mt-3 text-base font-medium">Generate the site</div>
                <div className="mt-2 text-sm leading-6 text-stone-300">
                  Save it to your account now and connect a domain later.
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 rounded-[1.5rem] border border-red-200 bg-red-50/90 p-5 text-sm text-red-800 whitespace-pre-line">
                <div className="mb-1 font-medium">Unable to create site</div>
                {error}
                <div className="mt-3 border-t border-red-200 pt-3 text-xs text-red-700">
                  <div className="font-medium">Tips</div>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {errorTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRetryValidation}
                      className="rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                    >
                      Retry validation
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setErrorCode(null);
                        setSubmissionStage("idle");
                      }}
                      className="text-xs font-medium text-red-700 underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {(loading || submissionStage === "awaiting-auth" || validationResult) && (
              <div className="mb-6 rounded-[1.5rem] border border-black/6 bg-white/90 p-5 text-sm text-stone-900">
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-1 h-2.5 w-2.5 rounded-full ${
                      loading ? "animate-pulse bg-stone-950" : "bg-emerald-500"
                    }`}
                  />
                  <div className="flex-1">
                    <div className="font-medium">
                      {loading ? stageLabel : validationResult ? "Ready to publish" : stageLabel}
                    </div>
                    <div className="mt-1 soft-text">
                      {loading
                        ? "PageCraft is validating your Notion content and preparing the site configuration."
                        : validationResult
                          ? `${validationResult.type === "database" ? "Database" : "Page"}: ${validationResult.title}`
                          : "Continue to the next step to publish your site."}
                    </div>
                    {validationResult && (
                      <div className="mt-3 grid gap-2 rounded-[1rem] bg-stone-50 p-3 text-xs text-slate-700 sm:grid-cols-3">
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
                          <div className="break-all font-mono">{validationResult.pageId}</div>
                        </div>
                      </div>
                    )}
                    {validationResult?.unsupportedBlockTypes &&
                      validationResult.unsupportedBlockTypes.length > 0 && (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                          <div className="font-medium">Compatibility note</div>
                          <div className="mt-1">
                            This page includes block types that currently use fallback rendering:{" "}
                            <span className="font-mono">
                              {validationResult.unsupportedBlockTypes.join(", ")}
                            </span>
                          </div>
                        </div>
                      )}
                    {validationResult?.pageStructure && validationResult.pageStructure.length > 0 && (
                      <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                        <div className="font-medium text-slate-900">Page structure preview</div>
                        <ul className="mt-2 space-y-1">
                          {validationResult.pageStructure.slice(0, 6).map((item) => (
                            <li key={item.id} className="flex items-start gap-2">
                              <span className="mt-[3px] inline-block h-1.5 w-1.5 rounded-full bg-slate-400" />
                              <span className="flex-1">{item.title}</span>
                            </li>
                          ))}
                        </ul>
                        {validationResult.pageStructure.length > 6 && (
                          <div className="mt-2 text-slate-500">
                            +{validationResult.pageStructure.length - 6} more pages
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="mb-3 block text-sm font-medium text-stone-700">Choose a template</label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`rounded-[1.35rem] border p-4 text-left transition-all ${
                      selectedTemplate === template.id
                        ? "border-stone-950 bg-stone-50 shadow-[0_18px_40px_rgba(24,21,18,0.08)]"
                        : "border-black/8 bg-white/80 hover:border-stone-400"
                    }`}
                  >
                    <div
                      className={`mb-3 h-16 w-full rounded-xl ${template.color} ${
                        template.id === "developer" ? "border border-stone-700" : "border border-black/5"
                      }`}
                    />
                    <div className="text-sm font-medium">{template.name}</div>
                    <div className="text-xs soft-text">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor={pageIdFieldId} className="mb-2 block text-sm font-medium text-stone-700">
                  Notion page ID or URL
                </label>
                <input
                  id={pageIdFieldId}
                  type="text"
                  value={pageId}
                  onChange={(e) => {
                    setPageId(e.target.value);
                    setError("");
                    setErrorCode(null);
                    setPublishNotice("");
                    setSubmissionStage("idle");
                    setValidationResult(null);
                  }}
                  placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j1234567890ab or https://www.notion.so/..."
                  className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 font-mono text-sm text-stone-900 outline-none transition focus:border-stone-950 focus:ring-0"
                />
                {publishNotice && (
                  <div className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
                    {publishNotice}
                  </div>
                )}
                <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePasteFromClipboard}
                      className="font-medium text-stone-700 underline-offset-4 hover:underline"
                    >
                      Paste from clipboard
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPageId("");
                        setAuthor("");
                        setPublishNotice("");
                        setValidationResult(null);
                        setSubmissionStage("idle");
                        window.localStorage.removeItem(CREATE_DRAFT_STORAGE_KEY);
                      }}
                      className="text-xs text-stone-500 underline-offset-4 hover:underline"
                    >
                      Clear draft
                    </button>
                  </div>
                  <span
                    className={`text-xs ${
                      hasValidPageReference
                        ? "text-emerald-700"
                        : hasPageIdInput
                          ? "text-red-700"
                          : "text-stone-500"
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
                  <div className="mt-3 rounded-[1.25rem] border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-950">
                    <div className="font-medium">Ready to validate</div>
                    <div className="mt-1">
                      PageCraft will check this Notion content before generating your site.
                    </div>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      <div>
                        <div className="font-medium">Page ID</div>
                        <div className="break-all font-mono">{normalizedPageId}</div>
                      </div>
                      <div>
                        <div className="font-medium">Template</div>
                        <div>
                          {templates.find((template) => template.id === selectedTemplate)?.name}
                        </div>
                      </div>
                    </div>
                    {expectedPublishUrl && (
                      <div className="mt-3 border-t border-emerald-100 pt-2">
                        <div className="font-medium">Expected URL</div>
                        <div className="font-mono text-[11px] break-all sm:text-xs">{expectedPublishUrl}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor={authorFieldId} className="mb-2 block text-sm font-medium text-stone-700">
                  Your name (optional)
                </label>
                <input
                  id={authorFieldId}
                  type="text"
                  value={author}
                  onChange={(e) => {
                    setAuthor(e.target.value);
                    setPublishNotice("");
                  }}
                  placeholder="e.g., Marshall WU"
                  className="w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-950 focus:ring-0"
                />
              </div>

              {expectedPublishUrl && (
                <div className="rounded-[1.25rem] border border-black/8 bg-stone-50/90 p-4 text-xs text-stone-700 sm:text-sm">
                  <div className="font-medium text-gray-900">Publish URL preview</div>
                  <div className="mt-1 break-all font-mono">{expectedPublishUrl}</div>
                </div>
              )}

              <div className="rounded-[1.25rem] border border-black/8 bg-white/80 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-stone-950">
                      {isAuthenticated ? `Signed in as ${user?.email}` : "Not signed in"}
                    </div>
                    <div className="mt-1 text-xs soft-text">
                      {isAuthenticated
                        ? "Your page will be saved to your account"
                        : "Sign in to save this page and access it later"}
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <button
                      type="button"
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm font-medium text-stone-700 transition hover:text-stone-950"
                    >
                      Sign in
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 py-3.5 text-sm font-medium text-white shadow-[0_20px_50px_rgba(24,21,18,0.22)] transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    {isAuthenticated ? "Validating and generating..." : "Validating..."}
                  </>
                ) : (
                  <>
                    {isAuthenticated ? "Generate & Save" : "Generate Site"}
                    {!isAuthenticated && (
                      <span className="rounded-full bg-white/15 px-2 py-1 text-xs text-white">Free</span>
                    )}
                  </>
                )}
              </button>
            </form>
          </section>

          <aside className="overflow-hidden rounded-[2rem] bg-stone-950 p-8 text-white shadow-[0_32px_90px_rgba(24,21,18,0.18)]">
            <div className="text-xs uppercase tracking-[0.18em] text-stone-400">Preview</div>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.05em]">
              A cleaner publishing ritual.
            </h2>
            <p className="mt-4 text-sm leading-7 text-stone-300">
              This flow is intentionally quiet. You make a few confident choices, validate
              the source, and move forward without extra clutter.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-[1.5rem] bg-white/6 p-5">
                <div className="text-sm font-medium">Before publish</div>
                <div className="mt-2 text-sm leading-6 text-stone-300">
                  Input parsing, access validation, unsupported block warnings, and URL preview.
                </div>
              </div>
              <div className="rounded-[1.5rem] bg-white/6 p-5">
                <div className="text-sm font-medium">After publish</div>
                <div className="mt-2 text-sm leading-6 text-stone-300">
                  Continue editing from Notion, update the template later, and attach a custom
                  domain when you are ready.
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,rgba(255,255,255,0.03)_100%)] p-5">
              <div className="text-xs uppercase tracking-[0.16em] text-stone-400">Live outline</div>
              <div className="mt-4 space-y-3">
                <div className="rounded-[1rem] bg-white/8 px-4 py-3">
                  <div className="text-sm font-medium">Source</div>
                  <div className="mt-1 text-xs text-stone-400">Notion page or database</div>
                </div>
                <div className="rounded-[1rem] bg-white/8 px-4 py-3">
                  <div className="text-sm font-medium">Presentation</div>
                  <div className="mt-1 text-xs text-stone-400">
                    {templates.find((template) => template.id === selectedTemplate)?.name} template
                  </div>
                </div>
                <div className="rounded-[1rem] bg-white/8 px-4 py-3">
                  <div className="text-sm font-medium">Publish path</div>
                  <div className="mt-1 break-all text-xs text-stone-400">
                    {expectedPublishUrl || "/p/your-site?template=minimal"}
                  </div>
                </div>
              </div>
            </div>
          </aside>
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
