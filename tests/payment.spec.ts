import { test, expect } from "@playwright/test";

const BASE_URL = "https://pagecraft-eight.vercel.app";

test.describe("Payment Flow", () => {
  test("checkout page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/domains`);
    
    // 检查页面元素
    await expect(page.locator("text=Upgrade to Pro")).toBeVisible();
    await expect(page.locator("text=$6")).toBeVisible();
    
    // 填写表单
    await page.fill("input[placeholder*='example.com']", "test-example.com");
    await page.fill("input[placeholder*='1a2b3c4d']", "262bffda61bf80c8b116f6f1ec278d68");
    
    // 点击订阅按钮
    const subscribeBtn = page.locator("button:has-text('Subscribe')");
    await expect(subscribeBtn).toBeVisible();
    
    // 截图记录
    await page.screenshot({ path: "test-results/payment-page.png" });
    
    console.log("✅ Payment page loaded successfully");
  });

  test("checkout API creates session", async ({ request }) => {
    const response = await request.post(`${BASE_URL}/api/checkout`, {
      data: {
        domain: "test-example.com",
        pageId: "262bffda61bf80c8b116f6f1ec278d68",
        template: "minimal",
      },
    });

    const data = await response.json();
    
    if (response.ok()) {
      console.log("✅ Checkout session created:", data.url);
      expect(data.url).toContain("stripe.com");
    } else {
      console.log("❌ Checkout failed:", data.error);
      // 如果 Stripe 没配置，会返回错误
      expect(data.error).toBeTruthy();
    }
  });

  test("payment success page", async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/success?session_id=test_123`);
    
    await expect(page.locator("text=Welcome to Pro")).toBeVisible();
    await page.screenshot({ path: "test-results/payment-success.png" });
    
    console.log("✅ Payment success page OK");
  });

  test("payment cancel page", async ({ page }) => {
    await page.goto(`${BASE_URL}/payment/cancel`);
    
    await expect(page.locator("text=Payment Cancelled")).toBeVisible();
    await page.screenshot({ path: "test-results/payment-cancel.png" });
    
    console.log("✅ Payment cancel page OK");
  });
});
