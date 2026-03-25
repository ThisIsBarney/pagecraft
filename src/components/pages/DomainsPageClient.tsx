"use client";

import { useState } from "react";
import { extractNotionPageId } from "@/lib/notion-input";

interface CheckoutResponse {
  url?: string;
  error?: string;
}

function getCheckoutUrl(value: unknown): string | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const response = value as CheckoutResponse;
  return typeof response.url === "string" ? response.url : null;
}

function getCheckoutError(value: unknown): string {
  if (!value || typeof value !== "object") {
    return "Failed to create checkout";
  }

  const response = value as CheckoutResponse;
  return typeof response.error === "string" ? response.error : "Failed to create checkout";
}

function normalizeDomainInput(value: string): string {
  const trimmedValue = value.trim().toLowerCase();
  if (!trimmedValue) {
    return "";
  }

  const valueWithProtocol = /^[a-z]+:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    const parsedUrl = new URL(valueWithProtocol);
    return parsedUrl.hostname.replace(/\.$/, "");
  } catch {
    return trimmedValue
      .replace(/^[a-z]+:\/\//i, "")
      .replace(/\/.*$/, "")
      .replace(/\.$/, "");
  }
}

function isValidDomain(value: string): boolean {
  if (!value) {
    return true;
  }

  return /^(?=.{1,253}$)(?!-)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(value);
}

export default function DomainsPageClient() {
  const domainFieldId = "custom-domain";
  const pageIdFieldId = "notion-page-id";
  const templateFieldId = "default-template";
  const [domain, setDomain] = useState("");
  const [pageId, setPageId] = useState("");
  const [template, setTemplate] = useState("minimal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);
  const normalizedDomain = normalizeDomainInput(domain);
  const normalizedPageId = extractNotionPageId(pageId);
  const hasDomain = domain.trim() !== "";
  const hasPageId = pageId.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);

    if (hasDomain && !isValidDomain(normalizedDomain)) {
      setResult({
        success: false,
        error: "Enter a valid custom domain, for example `example.com`.",
      });
      return;
    }

    if (hasPageId && !normalizedPageId) {
      setResult({
        success: false,
        error: "Enter a valid Notion page ID or paste a full Notion share URL.",
      });
      return;
    }

    setLoading(true);

    try {
      // 创建结账会话
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: normalizedDomain || undefined,
          pageId: normalizedPageId || undefined,
          template,
        }),
      });

      const data: unknown = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          error: getCheckoutError(data),
        });
        return;
      }

      // 跳转到 Stripe 结账
      const checkoutUrl = getCheckoutUrl(data);
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      setResult({
        success: false,
        error: "Checkout session created without a redirect URL",
      });
    } catch {
      setResult({
        success: false,
        error: "Network error",
      });
    } finally {
      setLoading(false);
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
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-2">Upgrade to Pro</h1>
            <p className="text-gray-600">
              Unlock all features and optionally connect a custom domain.
            </p>
          </div>

          {/* Pricing Card */}
          <div className="bg-gradient-to-r from-blue-500 to-violet-500 rounded-xl p-6 text-white mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Pro Plan</h3>
                <p className="text-blue-100 text-sm">Everything you need</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">$6</div>
                <div className="text-blue-100 text-sm">/month</div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><span>✓</span> Custom domain (optional)</li>
              <li className="flex items-center gap-2"><span>✓</span> All premium templates</li>
              <li className="flex items-center gap-2"><span>✓</span> Remove PageCraft branding</li>
              <li className="flex items-center gap-2"><span>✓</span> Analytics</li>
              <li className="flex items-center gap-2"><span>✓</span> Priority support</li>
            </ul>
          </div>

          {result && (
            <div className={`mb-6 p-4 rounded-lg ${result.success ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
              {result.success ? result.message : result.error}
            </div>
          )}

          {(hasDomain || normalizedPageId) && (
            <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50/80 p-4 text-sm text-slate-700">
              <div className="font-medium text-slate-900">Checkout summary</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Domain
                  </div>
                  <div className={hasDomain && !isValidDomain(normalizedDomain) ? "text-red-600" : ""}>
                    {normalizedDomain || "Not provided"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Notion page
                  </div>
                  <div className={hasPageId && !normalizedPageId ? "text-red-600" : "font-mono text-xs"}>
                    {normalizedPageId || (hasPageId ? "Invalid page reference" : "Not provided")}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Template
                  </div>
                  <div className="capitalize">{template}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Domain - Optional */}
            <div>
              <label htmlFor={domainFieldId} className="block text-sm font-medium text-gray-700 mb-2">
                Your Domain <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id={domainFieldId}
                type="text"
                value={domain}
                onChange={(e) => {
                  setDomain(e.target.value);
                  setResult(null);
                }}
                placeholder="e.g., example.com (leave empty to skip)"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                You can add a custom domain later from your dashboard
              </p>
              {hasDomain && (
                <p className={`mt-2 text-xs ${isValidDomain(normalizedDomain) ? "text-emerald-600" : "text-red-600"}`}>
                  {isValidDomain(normalizedDomain)
                    ? `We'll use: ${normalizedDomain}`
                    : "Enter a domain like example.com without spaces or invalid characters"}
                </p>
              )}
            </div>

            {/* Page ID - Optional */}
            <div>
              <label htmlFor={pageIdFieldId} className="block text-sm font-medium text-gray-700 mb-2">
                Notion Page ID <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                id={pageIdFieldId}
                type="text"
                value={pageId}
                onChange={(e) => {
                  setPageId(e.target.value);
                  setResult(null);
                }}
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j1234567890ab"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
              {hasPageId && (
                <p className={`mt-2 text-xs ${normalizedPageId ? "text-emerald-600" : "text-red-600"}`}>
                  {normalizedPageId
                    ? `Detected page ID: ${normalizedPageId}`
                    : "Paste a 32-character page ID or a full Notion share URL"}
                </p>
              )}
            </div>

            {/* Template */}
            <div>
              <label htmlFor={templateFieldId} className="block text-sm font-medium text-gray-700 mb-2">
                Default Template
              </label>
              <select
                id={templateFieldId}
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="minimal">Minimal</option>
                <option value="designer">Designer</option>
                <option value="developer">Developer</option>
                <option value="creator">Creator</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Upgrade to Pro - $6/month"}
            </button>
          </form>

          {domain && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-medium text-gray-900 mb-3">After payment:</h3>
              <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                <li>Add CNAME record in your DNS:</li>
                <li className="pl-5 font-mono text-xs bg-gray-100 p-2 rounded">
                  Name: @<br />
                  Value: pagecraft-eight.vercel.app
                </li>
                <li>Your site will be live in 5-10 minutes!</li>
              </ol>
            </div>
          )}

          <p className="mt-6 text-xs text-gray-500 text-center">
            Powered by Stripe. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
}
