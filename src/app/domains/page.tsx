import type { Metadata } from "next";
import DomainsPageClient from "@/components/pages/DomainsPageClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Upgrade to Pro",
  description:
    "Upgrade PageCraft to unlock custom domains, premium templates, analytics, and branding removal.",
  path: "/domains",
});

export default function DomainsPage() {
  return <DomainsPageClient />;
}
