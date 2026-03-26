import { test, expect } from "@playwright/test";

const TEST_PAGE_ID = process.env.TEST_NOTION_PAGE_ID || "test-page-id";

test.describe("PageCraft E2E Tests", () => {
  test("homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    
    // 检查标题
    await expect(page.locator("h1")).toContainText("Turn your Notion into a");
    
    // 检查 CTA 按钮
    await expect(page.locator("text=Create Your Site")).toBeVisible();
  });

  test("create page has form", async ({ page }) => {
    await page.goto("/create");
    
    // 检查表单元素
    await expect(page.getByLabel("Notion page ID or URL")).toBeVisible();
    await expect(page.getByRole("button", { name: /Generate Site/i })).toBeVisible();
  });

  test("examples page renders", async ({ page }) => {
    await page.goto("/examples");
    
    // 检查内容渲染
    await expect(page.getByRole("heading", { name: "Template Gallery" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Creator" })).toBeVisible();
  });

  test("invalid page ID shows error", async ({ page }) => {
    await page.goto("/p/invalid-id");
    
    // 检查错误页面
    await expect(page.locator("text=Page Not Found")).toBeVisible();
    await expect(page.locator("text=Back to Home")).toBeVisible();
  });

  test("valid notion page renders (if TEST_NOTION_PAGE_ID set)", async ({ page }) => {
    if (TEST_PAGE_ID === "test-page-id") {
      test.skip();
    }

    await page.goto(`/p/${TEST_PAGE_ID}`);
    
    // 等待加载（最多10秒）
    await page.waitForLoadState("networkidle");
    
    // 检查页面标题存在
    const title = await page.locator("h1").first().textContent();
    expect(title).toBeTruthy();
    expect(title).not.toBe("Page Not Found");
    
    // 截图保存
    await page.screenshot({ path: `test-results/${TEST_PAGE_ID}.png`, fullPage: true });
  });
});
