"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [domain, setDomain] = useState<string>("");

  useEffect(() => {
    if (sessionId) {
      fetch("/api/verify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setStatus("success");
            setDomain(data.domain || "");
          } else {
            setStatus("error");
          }
        })
        .catch(() => setStatus("error"));
    }
  }, [sessionId]);

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel-strong w-full max-w-lg rounded-[1.75rem] p-8 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            <h1 className="text-xl font-semibold text-stone-950">Processing payment</h1>
            <p className="mt-2 text-sm soft-text">Setting up your subscription and domain settings.</p>
          </>
        )}

        {status === "success" && (
          <>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">Pro is now active</h1>
            <p className="mt-2 text-sm soft-text">Payment completed successfully.</p>

            {domain && (
              <div className="mt-6 rounded-xl border border-black/8 bg-white/80 p-4">
                <div className="text-xs uppercase tracking-[0.12em] text-stone-500">Your domain</div>
                <div className="mt-1 text-lg font-medium text-stone-900">{domain}</div>
              </div>
            )}

            {domain ? (
              <>
                <div className="mt-6 rounded-xl border border-black/8 bg-stone-50 p-4 text-left">
                  <h3 className="text-sm font-medium text-stone-900">Next steps</h3>
                  <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-700">
                    <li>Add DNS record type `CNAME`</li>
                    <li>Host: `@`</li>
                    <li>Value: `pagecraft-eight.vercel.app`</li>
                    <li>Wait 5-10 minutes for DNS propagation</li>
                  </ol>
                </div>

                <div className="mt-6 space-y-3">
                  <a
                    href="/dashboard"
                    className="block w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                  >
                    Go to dashboard
                  </a>
                  <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full rounded-full border border-black/12 bg-white py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                  >
                    Open your site
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="mt-6 rounded-xl border border-black/8 bg-white/80 p-4 text-sm text-stone-700">
                  You can now create unlimited sites and connect domains from your dashboard.
                </div>
                <a
                  href="/dashboard"
                  className="mt-6 block w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
                >
                  Go to dashboard
                </a>
              </>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">Unable to verify payment</h1>
            <p className="mt-2 text-sm soft-text">If your domain is not active, please contact support.</p>
            <a
              href="/domains"
              className="mt-6 block w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
            >
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPageClient() {
  return (
    <Suspense
      fallback={
        <div className="page-shell flex min-h-screen items-center justify-center px-6">
          <div className="glass-panel rounded-[1.5rem] px-8 py-7 text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
            <p className="text-sm soft-text">Loading...</p>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
