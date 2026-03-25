import { expect, test } from "@playwright/test";

test.describe("BlockRenderer regression", () => {
  test("renders advanced block types on examples page", async ({ page }) => {
    await page.goto("/examples");

    await expect(page.getByText("Nested bullet insight").first()).toBeVisible();
    await expect(page.getByText("Nested numbered detail").first()).toBeVisible();
    await expect(page.locator("blockquote").filter({ hasText: "Great products feel obvious in hindsight." }).first()).toBeVisible();
    await expect(page.getByText("Great products feel obvious in hindsight.").first()).toBeVisible();
    await expect(page.getByText("Shipping weekly keeps momentum high.").first()).toBeVisible();
    await expect(page.locator("pre code").filter({ hasText: "await ship(\"pagecraft\");" }).first()).toBeVisible();

    const toggleSummary = page.locator("summary", { hasText: "Phase 2: Advanced blocks" }).first();
    await expect(toggleSummary).toBeVisible();
    await toggleSummary.click();
    await expect(page.getByText("More details from toggle").first()).toBeVisible();
    await expect(page.getByText("Cell A1").first()).toBeVisible();
    await expect(page.getByText("Cell B1").first()).toBeVisible();
    await expect(page.getByText("Synced block").first()).toBeVisible();
    await expect(page.getByText("references another block").first()).toBeVisible();
    await expect(page.getByText("Bookmark").first()).toBeVisible();
    await expect(page.getByText("https://example.com/pagecraft-bookmark").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Open video" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Download file" }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Open PDF" }).first()).toBeVisible();

    const linkedPage = page.getByRole("link", { name: /Linked page/ }).first();
    await expect(linkedPage).toBeVisible();
    await expect(linkedPage).toHaveAttribute("href", "/p/1234567890abcdef1234567890abcdef");

    const childPage = page.getByRole("link", { name: /Nested Case Study/ }).first();
    await expect(childPage).toBeVisible();
    await expect(childPage).toHaveAttribute("href", "/p/1234567890abcdef1234567890abcdee");
  });

  test("shows unsupported fallback for unknown block types", async ({ page }) => {
    await page.goto("/examples");

    await expect(page.getByText("Unsupported block:").first()).toBeVisible();
    await expect(page.getByText("column").first()).toBeVisible();
  });
});
