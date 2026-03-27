"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Missing verification token.");
      return;
    }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload?.error || "Verification failed.");
        }
        setStatus("success");
        setMessage("Email verified successfully. You can sign in now.");
      })
      .catch((error) => {
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Verification failed.");
      });
  }, [token]);

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel-strong w-full max-w-md rounded-[1.75rem] p-8 text-center">
        {status === "loading" && (
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900" />
        )}
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-stone-950">
          {status === "success" ? "Email verified" : status === "error" ? "Verification failed" : "Verifying email"}
        </h1>
        <p className="mt-3 text-sm soft-text">{message}</p>
        <a
          href="/dashboard"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
        >
          Go to dashboard
        </a>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  );
}
