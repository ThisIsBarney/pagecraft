import { test, expect } from "@playwright/test";

const BASE_URL = process.env.TEST_BASE_URL || "https://pagecraft-eight.vercel.app";

test.describe("Critical Pages", () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=PageCraft").first()).toBeVisible();
    await expect(page.locator("text=Create Your Site")).toBeVisible();
  });

  test("create page loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/create`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Create your site")).toBeVisible();
    await expect(page.locator("button:has-text('Generate')")).toBeVisible();
  });

  test("examples page loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/examples`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Template Gallery")).toBeVisible();
  });

  test("dashboard loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`);
    expect(response?.status()).toBe(200);
    
    // Dashboard 应该显示登录表单或用户界面
    const hasLogin = await page.locator("text=Sign In").count() > 0;
    const hasDashboard = await page.locator("text=Dashboard").count() > 0;
    expect(hasLogin || hasDashboard).toBe(true);
  });

  test("domains page loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/domains`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Upgrade to Pro").or(page.locator("text=Custom Domain"))).toBeVisible();
  });

  test("payment success page loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/payment/success?session_id=test`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Welcome to Pro").or(page.locator("text=Processing"))).toBeVisible();
  });

  test("payment cancel page loads", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/payment/cancel`);
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Payment Cancelled")).toBeVisible();
  });
});

test.describe("API Endpoints", () => {
  test("debug API responds", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/debug?pageId=test`);
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("notionTokenSet");
  });

  test("domains API responds", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/domains?domain=test.com`);
    // 应该返回 404（域名不存在）或 200
    expect([200, 404]).toContain(response.status());
  });
});
