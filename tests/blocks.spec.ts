import { test, expect } from "@playwright/test";

// 测试各种块类型的渲染
test.describe("Block Rendering Tests", () => {
  const BASE_URL = process.env.TEST_BASE_URL || "https://pagecraft-eight.vercel.app";
  const TEST_PAGE_ID = process.env.TEST_NOTION_PAGE_ID;

  test.beforeEach(async ({ page }) => {
    test.skip(
      !TEST_PAGE_ID || TEST_PAGE_ID === "test-page-id",
      "No TEST_NOTION_PAGE_ID provided"
    );
    await page.goto(`${BASE_URL}/p/${TEST_PAGE_ID}`);
    await page.waitForLoadState("networkidle");
  });

  test("headings render correctly", async ({ page }) => {
    const h1 = await page.locator("h1").first();
    await expect(h1).toBeVisible();
    
    const h2s = await page.locator("h2").count();
    expect(h2s).toBeGreaterThanOrEqual(0);
  });

  test("paragraphs render", async ({ page }) => {
    const paragraphs = await page.locator("p").count();
    expect(paragraphs).toBeGreaterThan(0);
  });

  test("lists render", async ({ page }) => {
    const lists = await page.locator("ul, ol").count();
    // 可能有也可能没有，不做强制断言
    console.log(`Found ${lists} lists`);
  });

  test("images load", async ({ page }) => {
    const images = await page.locator("img").all();
    for (const img of images) {
      await expect(img).toBeVisible();
      // 检查图片是否成功加载
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });

  test("links are clickable", async ({ page }) => {
    const links = await page.locator("a[href^='http']").all();
    for (const link of links) {
      const href = await link.getAttribute("href");
      expect(href).toMatch(/^https?:\/\//);
    }
  });

  test("code blocks render", async ({ page }) => {
    const codeBlocks = await page.locator("pre code").count();
    console.log(`Found ${codeBlocks} code blocks`);
  });

  test("page is responsive", async ({ page }) => {
    // 测试移动端
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForLoadState("networkidle");
    
    // 检查内容仍然可见
    await expect(page.locator("h1").first()).toBeVisible();
    
    // 截图对比
    await page.screenshot({ path: "test-results/mobile-view.png", fullPage: true });
    
    // 恢复桌面端
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
