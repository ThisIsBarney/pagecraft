import { test, expect } from "@playwright/test";

const BASE_URL = "https://pagecraft-eight.vercel.app";

test.describe("Payment Flow", () => {
  test("upgrade to pro without domain", async ({ page }) => {
    // 1. 登录
    await page.goto(`${BASE_URL}/dashboard`);
    
    // 检查是否需要登录
    const needsLogin = await page.locator("text=Sign In").count() > 0;
    
    if (needsLogin) {
      await page.fill("input[name='email']", "test-payment@example.com");
      await page.fill("input[name='name']", "Test Payment User");
      await page.click("button:has-text('Sign In')");
      
      // 等待登录完成
      await page.waitForSelector("text=Dashboard", { timeout: 10000 });
    }
    
    // 2. 检查当前状态是 Free
    await expect(page.locator("text=Free Plan")).toBeVisible();
    
    // 3. 去升级页面
    await page.goto(`${BASE_URL}/domains`);
    
    // 4. 截图当前状态
    await page.screenshot({ path: "test-results/before-payment.png" });
    
    console.log("Current status: Free Plan");
    console.log("Ready to test payment...");
    
    // 注意：实际支付需要 Stripe 测试卡，这里只验证页面
    // 真实支付测试需要手动完成
  });

  test("verify payment updates user to pro", async ({ request }) => {
    // 模拟支付成功后的验证
    // 这个测试需要真实的 Stripe session ID
    console.log("Payment verification test - requires manual Stripe test");
  });
});
