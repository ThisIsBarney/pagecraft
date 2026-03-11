"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function DomainsPage() {
  const [domain, setDomain] = useState("");
  const [pageId, setPageId] = useState("");
  const [template, setTemplate] = useState("minimal");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success?: boolean;
    message?: string;
    error?: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // 创建结账会话
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, pageId, template }),
      });

      const data = await response.json();

      if (!response.ok) {
        setResult({
          success: false,
          error: data.error || "Failed to create checkout",
        });
        return;
      }

      // 跳转到 Stripe 结账
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      // 或者使用 Stripe.js 重定向
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
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
              Get a custom domain and unlock all features.
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
              <li className="flex items-center gap-2"><span>✓</span> Custom domain</li>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Domain
              </label>
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g., example.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Enter your root domain or subdomain
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notion Page ID
              </label>
              <input
                type="text"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="e.g., 1a2b3c4d5e6f7g8h9i0j1234567890ab"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template
              </label>
              <select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="minimal">Minimal</option>
                <option value="designer">Designer</option>
                <option value="developer">Developer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Subscribe & Connect Domain - $6/month"}
            </button>
          </form>

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

          <p className="mt-6 text-xs text-gray-500 text-center">
            Powered by Stripe. Cancel anytime.
          </p>
        </div>
      </main>
    </div>
  );
}
