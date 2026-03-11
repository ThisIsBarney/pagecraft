import { test, expect } from "@playwright/test";

const BASE_URL = "https://pagecraft-eight.vercel.app";
const TEST_DB_ID = "262bffda61bf80c8b116f6f1ec278d68";

test.describe("Database Page Test", () => {
  test("database page loads", async ({ page }) => {
    // 监听 console 日志
    const logs: string[] = [];
    page.on("console", (msg) => {
      logs.push(msg.text());
    });

    await page.goto(`${BASE_URL}/p/${TEST_DB_ID}`);
    await page.waitForLoadState("networkidle");
    
    // 截图查看
    await page.screenshot({ path: "test-results/database-page.png", fullPage: true });
    
    // 获取页面标题
    const title = await page.title();
    console.log("Page title:", title);
    
    // 获取页面主要内容
    const bodyText = await page.locator("body").textContent();
    console.log("Body text preview:", bodyText?.substring(0, 500));
    
    // 检查是否是错误页面
    const errorNotFound = await page.locator("text=Page Not Found").count();
    const errorNotFound2 = await page.locator("text=Page not found").count();
    
    if (errorNotFound > 0 || errorNotFound2 > 0) {
      // 获取错误信息
      const errorText = await page.locator("p").first().textContent();
      console.log("Error found:", errorText);
      
      // 检查具体错误类型
      const configError = await page.locator("text=Configuration Error").count();
      const notFoundError = await page.locator("text=Notion page or database could not be found").count();
      
      if (configError > 0) {
        console.log("❌ Server configuration error - NOTION_TOKEN not set correctly");
      } else if (notFoundError > 0) {
        console.log("❌ Database not accessible - may not be shared with PageCraft integration");
        console.log("   Please check: https://www.notion.so/" + TEST_DB_ID);
        console.log("   And add PageCraft to connections");
      }
      
      // 打印所有 console 日志
      console.log("\nConsole logs:");
      logs.forEach(log => console.log("  ", log));
      
      test.fail(true, `Error: ${errorText}`);
    } else {
      // 成功加载
      const h1 = await page.locator("h1").first().textContent();
      console.log("✅ Page loaded successfully!");
      console.log("   Title:", h1);
      
      const cardCount = await page.locator("a[href*='notion.so']").count();
      console.log("   Cards found:", cardCount);
      
      expect(h1).toBeTruthy();
      expect(cardCount).toBeGreaterThan(0);
    }
  });
});
