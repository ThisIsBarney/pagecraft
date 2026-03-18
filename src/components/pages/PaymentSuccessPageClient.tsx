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
      // 验证支付并注册域名
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md w-full mx-6 text-center">
        {status === "loading" && (
          <>
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Processing...</h1>
            <p className="text-gray-600">Setting up your custom domain</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold mb-2">Welcome to Pro!</h1>
            <p className="text-gray-600 mb-6">
              Your payment was successful.
            </p>

            {domain && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="text-sm text-blue-600 mb-1">Your domain</div>
                <div className="font-bold text-blue-900">{domain}</div>
              </div>
            )}

            {domain ? (
              <>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-green-900 mb-2">Next Steps:</h3>
                  <ol className="text-sm text-green-800 space-y-2 list-decimal list-inside">
                    <li>Add CNAME record in your DNS:</li>
                    <li className="pl-5 font-mono text-xs bg-green-100 p-2 rounded mt-1">
                      Type: CNAME<br />
                      Name: @<br />
                      Value: pagecraft-eight.vercel.app
                    </li>
                    <li>Wait 5-10 minutes for DNS propagation</li>
                    <li>Visit your domain!</li>
                  </ol>
                </div>

                <div className="space-y-3">
                  <a
                    href="/dashboard"
                    className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Go to Dashboard
                  </a>
                  <a
                    href={`https://${domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full py-3 text-gray-700 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Visit Your Site →
                  </a>
                </div>
              </>
            ) : (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800">
                    You can now create unlimited sites and add custom domains from your dashboard.
                  </p>
                </div>
                <a
                  href="/dashboard"
                  className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard →
                </a>
              </>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
            <p className="text-gray-600 mb-6">
              Please contact support if your domain is not working.
            </p>
            <a
              href="/domains"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Try Again
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentSuccessPageClient() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
