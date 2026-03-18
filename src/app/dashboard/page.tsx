import type { Metadata } from "next";
import DashboardPageClient from "@/components/pages/DashboardPageClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Dashboard",
  description:
    "Manage your published Notion sites, domains, and subscription from the PageCraft dashboard.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardPage() {
  return <DashboardPageClient />;
}
