import { expect, test } from "@playwright/test";
import { buildNavigationItems, buildSavedPageNavigationItems } from "../src/lib/navigation";
import { toNotionEditUrl, type Block } from "../src/lib/notion";

test.describe("Navigation builder", () => {
  test("includes current page as highlighted home item", () => {
    const items = buildNavigationItems([], "12345678-90ab-cdef-1234-567890abcdef");

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Home",
      href: "/p/1234567890abcdef1234567890abcdef",
      isCurrent: true,
    });
  });

  test("extracts child and linked pages with normalized hrefs", () => {
    const blocks: Block[] = [
      {
        id: "12345678-90ab-cdef-1234-567890abcdee",
        type: "child_page",
        child_page: {
          title: "Child Doc",
        },
      },
      {
        id: "link-1",
        type: "link_to_page",
        link_to_page: {
          page_id: "12345678-90ab-cdef-1234-567890abcdea",
        },
      },
    ];

    const items = buildNavigationItems(blocks, "1234567890abcdef1234567890abcdef");

    expect(items.map((item) => item.href)).toEqual([
      "/p/1234567890abcdef1234567890abcdef",
      "/p/1234567890abcdef1234567890abcdee",
      "/p/1234567890abcdef1234567890abcdea",
    ]);
    expect(items[1]?.title).toBe("Child Doc");
    expect(items[2]?.title).toBe("Linked page");
  });

  test("deduplicates repeated page references", () => {
    const blocks: Block[] = [
      {
        id: "12345678-90ab-cdef-1234-567890abcdee",
        type: "child_page",
        child_page: {
          title: "Child Doc",
        },
      },
      {
        id: "link-dup",
        type: "link_to_page",
        link_to_page: {
          page_id: "12345678-90ab-cdef-1234-567890abcdee",
        },
      },
    ];

    const items = buildNavigationItems(blocks, "1234567890abcdef1234567890abcdef");

    expect(items).toHaveLength(2);
    expect(items[1]?.href).toBe("/p/1234567890abcdef1234567890abcdee");
  });

  test("builds navigation from saved page settings with home and ordering", () => {
    const items = buildSavedPageNavigationItems(
      [
        {
          id: "page_home",
          notionPageId: "1234567890abcdef1234567890abcdef",
          title: "Overview",
          slug: "overview",
          template: "minimal",
          settings: {
            navOrder: 2,
            isHome: true,
          },
        },
        {
          id: "page_docs",
          notionPageId: "1234567890abcdef1234567890abcdee",
          title: "Docs",
          slug: "docs",
          template: "developer",
          settings: {
            navOrder: 1,
          },
        },
      ],
      {
        slug: "docs",
        pageId: "1234567890abcdef1234567890abcdee",
      }
    );

    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      title: "Home",
      href: "/p/overview?template=minimal",
      isCurrent: false,
    });
    expect(items[1]).toMatchObject({
      title: "Docs",
      href: "/p/docs?template=developer",
      isCurrent: true,
    });
  });

  test("omits saved pages hidden from navigation", () => {
    const items = buildSavedPageNavigationItems(
      [
        {
          id: "page_home",
          notionPageId: "1234567890abcdef1234567890abcdef",
          title: "Overview",
          slug: "overview",
          settings: { isHome: true },
        },
        {
          id: "page_hidden",
          notionPageId: "1234567890abcdef1234567890abcddd",
          title: "Hidden",
          slug: "hidden",
          settings: { hideFromNavigation: true },
        },
      ],
      {
        slug: "overview",
        pageId: "1234567890abcdef1234567890abcdef",
      }
    );

    expect(items.map((item) => item.href)).toEqual(["/p/overview?template=minimal"]);
  });

  test("accepts notion url for edit shortcut", () => {
    expect(toNotionEditUrl("https://www.notion.so/workspace/Test-Page-1234567890abcdef")).toBe(
      "https://www.notion.so/workspace/Test-Page-1234567890abcdef"
    );
  });

  test("rejects non notion url for edit shortcut", () => {
    expect(toNotionEditUrl("https://example.com/page")).toBeNull();
    expect(toNotionEditUrl("not-a-url")).toBeNull();
    expect(toNotionEditUrl(undefined)).toBeNull();
  });
});
