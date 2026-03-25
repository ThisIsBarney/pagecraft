import type { Block } from "@/lib/notion";

export interface NavigationItem {
  id: string;
  title: string;
  href: string;
  isCurrent: boolean;
}

export interface SavedPageNavigationSettings {
  navOrder?: number;
  hideFromNavigation?: boolean;
  isHome?: boolean;
}

export interface SavedPageNavigationEntry {
  id: string;
  notionPageId: string;
  title: string;
  slug: string;
  template?: string;
  settings?: SavedPageNavigationSettings;
}

function normalizePageId(pageId: string) {
  return pageId.replace(/-/g, "");
}

function toPagePath(pageId: string) {
  return `/p/${normalizePageId(pageId)}`;
}

export function buildSavedPageNavigationItems(
  pages: SavedPageNavigationEntry[],
  current: { slug: string; pageId: string }
): NavigationItem[] {
  const visiblePages = pages.filter((page) => !page.settings?.hideFromNavigation);
  if (visiblePages.length === 0) {
    return [];
  }

  const orderedPages = [...visiblePages].sort((left, right) => {
    const leftOrder =
      typeof left.settings?.navOrder === "number" ? left.settings.navOrder : Number.MAX_SAFE_INTEGER;
    const rightOrder =
      typeof right.settings?.navOrder === "number" ? right.settings.navOrder : Number.MAX_SAFE_INTEGER;

    if (leftOrder === rightOrder) {
      return (left.title || "").localeCompare(right.title || "");
    }

    return leftOrder - rightOrder;
  });

  const homePage = orderedPages.find((page) => page.settings?.isHome) ?? orderedPages[0];
  const navigationPages = [homePage, ...orderedPages.filter((page) => page.id !== homePage.id)];
  const normalizedCurrentPageId = normalizePageId(current.pageId);

  return navigationPages.map((page) => {
    const normalizedPageId = normalizePageId(page.notionPageId);
    const pageSlug = page.slug || normalizedPageId;

    return {
      id: page.id,
      title: page.id === homePage.id ? "Home" : page.title || "Untitled",
      href: `/p/${pageSlug}?template=${page.template || "minimal"}`,
      isCurrent: page.slug === current.slug || normalizedPageId === normalizedCurrentPageId,
    };
  });
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
