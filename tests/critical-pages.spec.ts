import { test, expect, type Page } from "@playwright/test";

async function expectMetadata(
  page: Page,
  title: string,
  description: string
) {
  await expect(page).toHaveTitle(title);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    description
  );
}

test.describe("Critical Pages", () => {
  test("homepage loads", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=PageCraft").first()).toBeVisible();
    await expect(page.locator("text=Create Your Site")).toBeVisible();
    await expectMetadata(
      page,
      "Turn Notion Into Beautiful Websites | PageCraft",
      "Publish a polished site from Notion in minutes with templates, custom domains, analytics, and zero-code setup."
    );
  });

  test("create page loads", async ({ page }) => {
    const response = await page.goto("/create");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Create your site")).toBeVisible();
    await expect(page.locator("button:has-text('Generate')")).toBeVisible();
    await expectMetadata(
      page,
      "Create a Site | PageCraft",
      "Connect a Notion page, choose a template, and publish a PageCraft site in minutes."
    );
  });

  test("create page accepts a full Notion URL", async ({ page }) => {
    const expectedPageId = "1234567890abcdef1234567890abcdef";
    const notionUrl = `https://www.notion.so/Marshall-WU-${expectedPageId}?pvs=4`;

    await page.route("**/api/validate-page**", async (route) => {
      const requestUrl = new URL(route.request().url());
      expect(requestUrl.searchParams.get("pageId")).toBe(expectedPageId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Test Page",
          url: notionUrl,
        }),
      });
    });

    await page.goto("/create");
    await page.getByLabel("Notion page ID or URL").fill(notionUrl);
    await expect(page.getByText(`Detected page ID: ${expectedPageId}`)).toBeVisible();
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("create page accepts a hyphenated Notion URL", async ({ page }) => {
    const hyphenatedPageId = "12345678-90ab-cdef-1234-567890abcdef";
    const normalizedPageId = "1234567890abcdef1234567890abcdef";
    const notionUrl = `https://www.notion.so/workspace/Test-Page-${hyphenatedPageId}?pvs=4`;

    await page.route("**/api/validate-page**", async (route) => {
      const requestUrl = new URL(route.request().url());
      expect(requestUrl.searchParams.get("pageId")).toBe(normalizedPageId);

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Test Page",
          url: notionUrl,
        }),
      });
    });

    await page.goto("/create");
    await page.getByLabel("Notion page ID or URL").fill(notionUrl);
    await expect(page.getByText(`Detected page ID: ${normalizedPageId}`)).toBeVisible();
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
  });

  test("create page shows validation progress while checking Notion access", async ({ page }) => {
    await page.route("**/api/validate-page**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Progress Test Page",
          url: "https://www.notion.so/progress-test",
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(
      page.getByText("Checking access to your Notion content")
    ).toBeVisible();
    await expect(
      page.getByText("PageCraft is validating your Notion content and preparing the site configuration.")
    ).toBeVisible();
  });

  test("create page previews the normalized Notion page ID before submit", async ({ page }) => {
    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("https://www.notion.so/workspace/Test-Page-12345678-90ab-cdef-1234-567890abcdef");

    await expect(
      page.getByText("Detected page ID: 1234567890abcdef1234567890abcdef")
    ).toBeVisible();
    await expect(page.getByText("Ready to validate")).toBeVisible();
    await expect(page.getByText("PageCraft will check this Notion content before generating your site.")).toBeVisible();
    await expect(page.getByText("Page ID", { exact: true })).toBeVisible();
  });

  test("create page shows inline guidance for invalid Notion references before submit", async ({ page }) => {
    await page.goto("/create");
    await page.getByLabel("Notion page ID or URL").fill("notion page");

    await expect(
      page.getByText("Paste a 32-character page ID or a full Notion share URL")
    ).toBeVisible();
  });

  test("create page surfaces actionable Notion sharing guidance on validation errors", async ({ page }) => {
    await page.route("**/api/validate-page**", async (route) => {
      await route.fulfill({
        status: 404,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error:
            "Page or database not found. Please check:\n1. The ID is correct\n2. The page/database is shared with the PageCraft integration\n3. You have access to this content in Notion",
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByText("Unable to create site")).toBeVisible();
    await expect(
      page.getByText("Share the page or database with the PageCraft integration before retrying.")
    ).toBeVisible();
    await expect(
      page.getByText("Make sure the content is accessible to the integration, not just your personal account.")
    ).toBeVisible();
  });

  test("examples page loads", async ({ page }) => {
    const response = await page.goto("/examples");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Template Gallery")).toBeVisible();
    await expectMetadata(
      page,
      "Template Gallery | PageCraft",
      "Preview PageCraft templates for pages and databases before publishing your Notion content."
    );
  });

  test("dashboard loads", async ({ page }) => {
    const response = await page.goto("/dashboard");
    expect(response?.status()).toBe(200);
    
    // Dashboard should show either the unauthenticated sign-in state or the authenticated dashboard.
    await expect(
      page
        .getByRole("heading", { name: "Welcome to PageCraft" })
        .or(page.getByRole("heading", { name: "Quick Actions" }))
    ).toBeVisible();
  });

  test("domains page loads", async ({ page }) => {
    const response = await page.goto("/domains");
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole("heading", { name: "Upgrade to Pro" })).toBeVisible();
    await expectMetadata(
      page,
      "Upgrade to Pro | PageCraft",
      "Upgrade PageCraft to unlock custom domains, premium templates, analytics, and branding removal."
    );
  });

  test("domains page normalizes custom domain and Notion URL before checkout", async ({ page }) => {
    await page.route("**/api/checkout", async (route) => {
      const payload = route.request().postDataJSON() as {
        domain?: string;
        pageId?: string;
        template?: string;
      };

      expect(payload.domain).toBe("portfolio.example.com");
      expect(payload.pageId).toBe("1234567890abcdef1234567890abcdef");
      expect(payload.template).toBe("minimal");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "/payment/cancel",
        }),
      });
    });

    await page.goto("/domains");
    await page
      .getByLabel(/Your Domain/i)
      .fill("https://portfolio.example.com/projects?ref=pagecraft");
    await page
      .getByLabel(/Notion Page ID/i)
      .fill("https://www.notion.so/workspace/Test-Page-12345678-90ab-cdef-1234-567890abcdef");

    await expect(page.getByText("We'll use: portfolio.example.com")).toBeVisible();
    await expect(
      page.getByText("Detected page ID: 1234567890abcdef1234567890abcdef")
    ).toBeVisible();
    await page.getByRole("button", { name: /Upgrade to Pro/i }).click();

    await page.waitForURL("**/payment/cancel");
  });

  test("domains page blocks invalid custom domains before checkout", async ({ page }) => {
    let checkoutCalled = false;

    await page.route("**/api/checkout", async (route) => {
      checkoutCalled = true;
      await route.abort();
    });

    await page.goto("/domains");
    await page.getByLabel(/Your Domain/i).fill("invalid domain");
    await page.getByRole("button", { name: /Upgrade to Pro/i }).click();

    await expect(
      page.getByText("Enter a valid custom domain, for example `example.com`.")
    ).toBeVisible();
    expect(checkoutCalled).toBe(false);
  });

  test("payment success page loads", async ({ page }) => {
    const response = await page.goto("/payment/success?session_id=test");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Welcome to Pro").or(page.locator("text=Processing"))).toBeVisible();
  });

  test("payment cancel page loads", async ({ page }) => {
    const response = await page.goto("/payment/cancel");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Payment Cancelled")).toBeVisible();
  });
});

test.describe("API Endpoints", () => {
  test("debug API responds", async ({ request }) => {
    const response = await request.get("/api/debug");
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty("notionTokenSet");
  });

  test("debug API flags invalid page IDs without calling Notion", async ({ request }) => {
    const response = await request.get("/api/debug?pageId=test");
    expect(response.status()).toBe(200);

    await expect(response.json()).resolves.toMatchObject({
      tests: {
        page: {
          success: false,
          error: "Invalid Notion page identifier",
        },
        database: {
          success: false,
          error: "Invalid Notion page identifier",
        },
      },
    });
  });

  test("domains API responds", async ({ request }) => {
    const response = await request.get("/api/domains?domain=test.com");
    // 应该返回 404（域名不存在）或 200
    expect([200, 404]).toContain(response.status());
  });

  test("verify payment rejects missing session ID", async ({ request }) => {
    const response = await request.post("/api/verify-payment", {
      data: {},
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Session ID required",
    });
  });

  test("verify payment rejects empty JSON bodies", async ({ request }) => {
    const response = await request.fetch("/api/verify-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "A JSON body with sessionId is required",
    });
  });
});
