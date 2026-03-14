import { test } from "@playwright/test";

const BASE_URL = "https://pagecraft-eight.vercel.app";
const TEST_DB_ID = "262bffda61bf80c8b116f6f1ec278d68";

test.describe("Debug Database Access", () => {
  test("test different ID formats", async ({ page }) => {
    const formats = [
      TEST_DB_ID,                                    // 原始格式
      TEST_DB_ID.replace(/-/g, ""),                  // 无连字符
      TEST_DB_ID.toLowerCase(),                      // 全小写
    ];

    for (const id of formats) {
      console.log(`\n--- Testing ID format: ${id.substring(0, 10)}... ---`);
      
      await page.goto(`${BASE_URL}/p/${id}`);
      await page.waitForLoadState("networkidle");
      
      const bodyText = await page.locator("body").textContent();
      const isError = bodyText?.includes("Page Not Found") || bodyText?.includes("not found");
      
      if (isError) {
        console.log("❌ Failed with this format");
      } else {
        console.log("✅ Success!");
        const h1 = await page.locator("h1").first().textContent();
        console.log("   Title:", h1);
      }
    }
  });

  test("check if regular page works", async ({ page }) => {
    // 用一个已知的简单页面 ID 测试（示例页面）
    console.log("\n--- Testing examples page (should work) ---");
    await page.goto(`${BASE_URL}/examples`);
    await page.waitForLoadState("networkidle");
    
    const bodyText = await page.locator("body").textContent();
    console.log("Examples page loaded:", !bodyText?.includes("Not Found"));
  });
});
