import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Cancelled",
  description:
    "Your PageCraft upgrade was cancelled before checkout completed. Return when you are ready.",
  path: "/payment/cancel",
  noIndex: true,
});

export default function PaymentCancelPage() {
  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel-strong w-full max-w-md rounded-[1.75rem] p-8 text-center">
        <h1 className="text-3xl font-semibold tracking-[-0.04em] text-stone-950">Payment cancelled</h1>
        <p className="mt-3 text-sm leading-7 soft-text">
          Checkout was not completed. You can restart whenever you are ready.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="/domains"
            className="block w-full rounded-full bg-stone-950 py-3 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Try again
          </a>
          <a
            href="/"
            className="block w-full rounded-full border border-black/12 bg-white py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
          >
            Back to home
          </a>
        </div>

        <p className="mt-6 text-sm soft-text">Need help: support@pagecraft.io</p>
      </div>
    </div>
  );
}
