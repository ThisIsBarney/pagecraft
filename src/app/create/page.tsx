import type { Metadata } from "next";
import CreatePageClient from "@/components/pages/CreatePageClient";
import { buildPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildPageMetadata({
  title: "Create a Site",
  description:
    "Connect a Notion page, choose a template, and publish a PageCraft site in minutes.",
  path: "/create",
});

export default function CreatePage() {
  return <CreatePageClient />;
}
