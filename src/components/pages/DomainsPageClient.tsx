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
    <div className="page-shell min-h-screen">
      <header className="border-b border-black/8 bg-white/60 backdrop-blur">
        <div className="mx-auto w-full max-w-4xl px-6 py-5 lg:px-8">
          <a href="/" className="flex items-center gap-3 text-stone-950">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-950 text-xs font-semibold uppercase tracking-[0.18em] text-white">
              PC
            </span>
            <span>
              <span className="block text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">PageCraft</span>
              <span className="block text-sm soft-text">Upgrade</span>
            </span>
          </a>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 py-10 lg:px-8">
        <div className="glass-panel-strong rounded-[2rem] p-8">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <section>
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-stone-950">Upgrade to Pro</h1>
              <p className="mt-3 text-sm leading-7 soft-text">
                Unlock full publishing control, connect custom domains, and remove limits.
              </p>

              <div className="mt-6 rounded-2xl border border-black/8 bg-stone-950 px-6 py-5 text-white">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">Pro plan</h2>
                    <p className="mt-1 text-sm text-stone-300">Everything you need to run PageCraft at scale</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold tracking-[-0.03em]">$6</div>
                    <div className="text-xs uppercase tracking-[0.12em] text-stone-400">per month</div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2 text-sm text-stone-200">
                  <li>Custom domain support</li>
                  <li>All premium templates</li>
                  <li>Remove PageCraft branding</li>
                  <li>Analytics and priority support</li>
                </ul>
              </div>

              {domain && (
                <div className="mt-6 rounded-2xl border border-black/8 bg-white/75 p-5">
                  <h3 className="text-sm font-medium text-stone-900">After payment</h3>
                  <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm soft-text">
                    <li>Add DNS record `CNAME`</li>
                    <li>Host: `@`</li>
                    <li>Value: `pagecraft-eight.vercel.app`</li>
                  </ol>
                </div>
              )}
            </section>

            <section>
              {result && (
                <div
                  className={`mb-5 rounded-xl border p-4 text-sm ${
                    result.success
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-red-200 bg-red-50 text-red-700"
                  }`}
                >
                  {result.success ? result.message : result.error}
                </div>
              )}

              {(hasDomain || normalizedPageId) && (
                <div className="mb-5 rounded-xl border border-black/8 bg-white/70 p-4 text-sm text-stone-700">
                  <div className="font-medium text-stone-900">Checkout summary</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Domain</div>
                      <div className={hasDomain && !isValidDomain(normalizedDomain) ? "text-red-600" : ""}>
                        {normalizedDomain || "Not provided"}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Notion page</div>
                      <div className={hasPageId && !normalizedPageId ? "text-red-600" : "font-mono text-xs"}>
                        {normalizedPageId || (hasPageId ? "Invalid page reference" : "Not provided")}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Template</div>
                      <div className="capitalize">{template}</div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor={domainFieldId} className="mb-2 block text-sm font-medium text-stone-700">
                    Your domain <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <input
                    id={domainFieldId}
                    type="text"
                    value={domain}
                    onChange={(e) => {
                      setDomain(e.target.value);
                      setResult(null);
                    }}
                    placeholder="example.com"
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
                  />
                  <p className="mt-2 text-xs soft-text">You can also connect a domain later from dashboard.</p>
                  {hasDomain && (
                    <p className={`mt-2 text-xs ${isValidDomain(normalizedDomain) ? "text-emerald-700" : "text-red-600"}`}>
                      {isValidDomain(normalizedDomain)
                        ? `Detected: ${normalizedDomain}`
                        : "Enter a valid domain like example.com"}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={pageIdFieldId} className="mb-2 block text-sm font-medium text-stone-700">
                    Notion page <span className="font-normal text-stone-400">(optional)</span>
                  </label>
                  <input
                    id={pageIdFieldId}
                    type="text"
                    value={pageId}
                    onChange={(e) => {
                      setPageId(e.target.value);
                      setResult(null);
                    }}
                    placeholder="32-character page ID or full Notion URL"
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 font-mono text-sm text-stone-900 outline-none transition focus:border-stone-900"
                  />
                  {hasPageId && (
                    <p className={`mt-2 text-xs ${normalizedPageId ? "text-emerald-700" : "text-red-600"}`}>
                      {normalizedPageId
                        ? `Detected page ID: ${normalizedPageId}`
                        : "Paste a full Notion URL or page ID"}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor={templateFieldId} className="mb-2 block text-sm font-medium text-stone-700">
                    Default template
                  </label>
                  <select
                    id={templateFieldId}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/90 px-4 py-3 text-stone-900 outline-none transition focus:border-stone-900"
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
                  className="w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Upgrade to Pro"}
                </button>
              </form>

              <p className="mt-5 text-center text-xs soft-text">Powered by Stripe. Cancel anytime.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
