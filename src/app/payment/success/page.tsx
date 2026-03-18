import type { Metadata } from "next";
import PaymentSuccessPageClient from "@/components/pages/PaymentSuccessPageClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Payment Success",
  description:
    "Confirm your PageCraft Pro upgrade and finish setting up your custom domain.",
  path: "/payment/success",
  noIndex: true,
});

export default function PaymentSuccessPage() {
  return <PaymentSuccessPageClient />;
}
