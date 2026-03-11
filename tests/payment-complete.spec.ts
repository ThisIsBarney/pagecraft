import { test, expect } from "@playwright/test";

const BASE_URL = "https://pagecraft-eight.vercel.app";

test.describe("Complete Payment Flow", () => {
  test("full checkout and payment", async ({ page }) => {
    // 1. 打开支付页面
    await page.goto(`${BASE_URL}/domains`);
    await expect(page.locator("text=Upgrade to Pro")).toBeVisible();
    
    // 2. 填写表单
    const testDomain = `test-${Date.now()}.com`;
    await page.fill("input[placeholder*='example.com']", testDomain);
    await page.fill("input[placeholder*='1a2b3c4d']", "262bffda61bf80c8b116f6f1ec278d68");
    
    // 3. 点击订阅按钮
    await page.click("button:has-text('Subscribe')");
    
    // 4. 等待跳转到 Stripe
    await page.waitForURL(/stripe\.com/, { timeout: 10000 });
    
    console.log("✅ Redirected to Stripe checkout");
    
    // 5. 截图 Stripe 页面
    await page.screenshot({ path: "test-results/stripe-checkout.png" });
    
    // 6. 填写 Stripe 测试卡信息
    // 测试卡号: 4242 4242 4242 4242
    await page.fill("input[name='cardNumber']", "4242424242424242");
    await page.fill("input[name='cardExpiry']", "12/25");
    await page.fill("input[name='cardCvc']", "123");
    await page.fill("input[name='billingName']", "Test User");
    
    // 7. 选择国家
    await page.selectOption("select[name='billingCountry']", "US");
    
    // 8. 截图填写后的表单
    await page.screenshot({ path: "test-results/stripe-form-filled.png" });
    
    // 9. 点击支付（Stripe 的支付按钮）
    await page.click("button:has-text('Subscribe')");
    
    // 10. 等待支付完成，跳回成功页面
    await page.waitForURL(/payment\/success/, { timeout: 30000 });
    
    // 11. 验证成功页面
    await expect(page.locator("text=Welcome to Pro")).toBeVisible();
    
    // 12. 截图成功页面
    await page.screenshot({ path: "test-results/payment-complete.png" });
    
    console.log("✅ Payment completed successfully!");
    console.log("   Domain:", testDomain);
    
    // 等待几秒让 Stripe 处理
    await page.waitForTimeout(3000);
  });

  test("verify payment in dashboard", async ({ page }) => {
    // 这个测试需要登录 Stripe Dashboard 验证
    // 暂时跳过，需要手动验证
    test.skip(true, "Manual verification required in Stripe Dashboard");
  });
});
