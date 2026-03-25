import type { Block } from "@/lib/notion";

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  isCurrent: boolean;
}

function normalizePageId(pageId: string) {
  return pageId.replace(/-/g, "");
}

function toPagePath(pageId: string) {
  return `/p/${normalizePageId(pageId)}`;
}

export function buildNavigationItems(blocks: Block[] | undefined, currentPageId: string): NavigationItem[] {
  const normalizedCurrentPageId = normalizePageId(currentPageId);
  const items: NavigationItem[] = [
    {
      id: normalizedCurrentPageId,
      title: "Home",
      href: toPagePath(normalizedCurrentPageId),
      isCurrent: true,
    },
  ];

  if (!blocks || blocks.length === 0) {
    return items;
  }

  const seen = new Set<string>([normalizedCurrentPageId]);

  for (const block of blocks) {
    if (block.type === "child_page") {
      const childId = normalizePageId(block.id || "");
      if (!childId || seen.has(childId)) {
        continue;
      }

      seen.add(childId);
      items.push({
        id: childId,
        title: block.child_page?.title || "Sub page",
        href: toPagePath(childId),
        isCurrent: false,
      });
      continue;
    }

    if (block.type === "link_to_page") {
      const linkedPageId = normalizePageId(block.link_to_page?.page_id || "");
      if (!linkedPageId || seen.has(linkedPageId)) {
        continue;
      }

      seen.add(linkedPageId);
      items.push({
        id: linkedPageId,
        title: "Linked page",
        href: toPagePath(linkedPageId),
        isCurrent: false,
      });
    }
  }

  return items;
}
