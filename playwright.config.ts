import { defineConfig, devices } from "@playwright/test";

const shouldUseLocalWebServer = !process.env.SKIP_WEBSERVER;
const defaultBaseUrl = shouldUseLocalWebServer
  ? "http://127.0.0.1:3000"
  : "https://pagecraft-eight.vercel.app";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.TEST_BASE_URL || defaultBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // 自动测试关键页面
  webServer: shouldUseLocalWebServer
    ? {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
