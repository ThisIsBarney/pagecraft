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
    await expect(page.getByRole("button", { name: /Creator/i })).toBeVisible();
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

  test("create page previews expected publish URL as inputs change", async ({ page }) => {
    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("https://www.notion.so/workspace/Test-Page-12345678-90ab-cdef-1234-567890abcdef");

    const publishPreviewCard = page.getByText("Publish URL preview", { exact: true }).locator("..");

    await expect(page.getByText("Publish URL preview", { exact: true })).toBeVisible();
    await expect(
      publishPreviewCard.locator("div.mt-1.font-mono.break-all")
    ).toHaveText("/p/1234567890abcdef1234567890abcdef?template=minimal");

    await page.getByLabel("Your Name (optional)").fill("Marshall Wu");
    await expect(
      publishPreviewCard.locator("div.mt-1.font-mono.break-all")
    ).toHaveText("/p/1234567890abcdef1234567890abcdef-marshall-wu?template=minimal");
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

  test("create page allows retry validation after an initial validation failure", async ({ page }) => {
    let validationAttempts = 0;

    await page.route("**/api/validate-page**", async (route) => {
      validationAttempts += 1;

      if (validationAttempts === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            success: false,
            error: "Unable to validate page. Please try again later.",
            errorCode: "notion_unavailable",
          }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Retryable Page",
          url: "https://www.notion.so/retryable-page",
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByText("Unable to create site")).toBeVisible();
    await expect(page.getByRole("button", { name: "Retry validation" })).toBeVisible();

    await page.getByRole("button", { name: "Retry validation" }).click();

    await expect.poll(() => validationAttempts).toBe(2);
    await expect(page.getByText("Ready to publish")).toBeVisible();
    await expect(page.getByText("Page: Retryable Page")).toBeVisible();
  });

  test("create page shows server misconfiguration guidance for structured error code", async ({ page }) => {
    await page.route("**/api/validate-page**", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({
          success: false,
          error: "Server configuration error. Please contact support.",
          errorCode: "server_misconfigured",
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(
      page.getByText("The server is missing required Notion integration configuration.")
    ).toBeVisible();
  });

  test("create page shows compatibility warning when unsupported blocks are detected", async ({ page }) => {
    await page.route("**/api/validate-page**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Compatibility Demo",
          hasUnsupportedBlocks: true,
          unsupportedBlockTypes: ["column", "embed"],
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    await expect(page.getByText("Compatibility note")).toBeVisible();
    await expect(
      page.getByText("This page includes block types that currently use fallback rendering:")
    ).toBeVisible();
    await expect(page.getByText("column, embed")).toBeVisible();
  });

  test("create page previews page structure when validation returns linked pages", async ({ page }) => {
    await page.route("**/api/validate-page**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Site Home",
          pageStructure: [
            { id: "1234567890abcdef1234567890abcdef", title: "Site Home" },
            { id: "1234567890abcdef1234567890abcdee", title: "Nested Case Study" },
            { id: "1234567890abcdef1234567890abcdea", title: "Linked page" },
          ],
        }),
      });
    });

    await page.goto("/create");
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate Site/i }).click();

    const structureCard = page.getByText("Page structure preview", { exact: true }).locator("..");

    await expect(page.getByText("Page structure preview", { exact: true })).toBeVisible();
    await expect(structureCard.getByText("Site Home", { exact: true })).toBeVisible();
    await expect(structureCard.getByText("Nested Case Study", { exact: true })).toBeVisible();
    await expect(structureCard.getByText("Linked page", { exact: true })).toBeVisible();
  });

  test("create page saves validated notion title for authenticated users", async ({ page }) => {
    let savedTitle = "";

    await page.route("**/api/validate-page**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          type: "page",
          title: "Roadmap Hub",
        }),
      });
    });

    await page.route("**/api/auth", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            user: {
              id: "user_1",
              email: "demo@example.com",
              name: "Demo",
              subscriptionStatus: "active",
            },
          }),
        });
        return;
      }

      await route.fallback();
    });

    await page.route("**/api/user-pages", async (route) => {
      if (route.request().method() === "POST") {
        const payload = route.request().postDataJSON() as { title?: string };
        savedTitle = payload.title || "";
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pages: [] }),
      });
    });

    await page.goto("/create");
    await expect(page.getByRole("button", { name: /Generate & Save/i })).toBeVisible();
    await page
      .getByLabel("Notion page ID or URL")
      .fill("1234567890abcdef1234567890abcdef");
    await page.getByRole("button", { name: /Generate & Save/i }).click();

    await expect.poll(() => savedTitle).toBe("Roadmap Hub");
  });

  test("examples page loads", async ({ page }) => {
    const response = await page.goto("/examples");
    expect(response?.status()).toBe(200);
    
    await expect(page.locator("text=Template Gallery")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Creator" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Card View" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Table View" })).toBeVisible();
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

  test("dashboard shows saved page preview and edit actions for authenticated users", async ({ page }) => {
    let savePayloadTemplate = "";
    let savePayloadSlug = "";
    let savePayloadSettings: { navOrder?: number; hideFromNavigation?: boolean; isHome?: boolean } = {};

    await page.addInitScript(() => {
      (window as Window & { __copiedText?: string }).__copiedText = "";
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as Window & { __copiedText?: string }).__copiedText = text;
          },
        },
      });
    });

    await page.route("**/api/auth", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "user_1",
            email: "demo@example.com",
            name: "Demo",
            subscriptionStatus: "active",
          },
        }),
      });
    });

    await page.route("**/api/user-domains**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          domains: [],
        }),
      });
    });

    await page.route("**/api/user-pages", async (route) => {
      if (route.request().method() === "POST") {
        const payload = route.request().postDataJSON() as {
          template?: string;
          slug?: string;
          settings?: { navOrder?: number; hideFromNavigation?: boolean; isHome?: boolean };
        };
        savePayloadTemplate = payload.template || "";
        savePayloadSlug = payload.slug || "";
        savePayloadSettings = payload.settings || {};
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          pages: [
            {
              id: "page_1",
              notionPageId: "1234567890abcdef1234567890abcdef",
              title: "Product Brief",
              slug: "1234567890abcdef1234567890abcdef-product-brief",
              template: "designer",
              settings: {
                navOrder: 0,
                hideFromNavigation: false,
                isHome: false,
              },
            },
          ],
        }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "My Pages" })).toBeVisible();
    await expect(page.getByText("Product Brief")).toBeVisible();

    const copyButton = page.getByRole("button", { name: "Copy URL" });
    await copyButton.click();
    await expect.poll(async () => {
      const copiedText = await page.evaluate(() => (window as Window & { __copiedText?: string }).__copiedText || "");
      return copiedText.endsWith("/p/1234567890abcdef1234567890abcdef-product-brief?template=designer");
    }).toBe(true);

    await page
      .getByLabel("Slug for Product Brief")
      .fill("1234567890abcdef1234567890abcdef-case-study");
    await page.getByLabel("Navigation order for Product Brief").fill("3");
    await page.getByLabel("Hide Product Brief from navigation").check();
    await page.getByLabel("Set Product Brief as home page").check();

    await page.getByLabel("Template for Product Brief").selectOption("developer");
    const previewLink = page.getByRole("link", { name: "Preview" });
    await expect(previewLink).toHaveAttribute(
      "href",
      "/p/1234567890abcdef1234567890abcdef-case-study?template=developer"
    );

    await page.getByRole("button", { name: "Save changes" }).click();
    await expect.poll(() => savePayloadTemplate).toBe("developer");
    await expect.poll(() => savePayloadSlug).toBe("1234567890abcdef1234567890abcdef-case-study");
    await expect.poll(() => savePayloadSettings.navOrder).toBe(3);
    await expect.poll(() => savePayloadSettings.hideFromNavigation).toBe(true);
    await expect.poll(() => savePayloadSettings.isHome).toBe(true);

    const editLink = page.getByRole("link", { name: "Edit in Notion" });
    await expect(editLink).toHaveAttribute(
      "href",
      "https://www.notion.so/1234567890abcdef1234567890abcdef"
    );
  });

  test("dashboard retries loading saved pages after initial failure", async ({ page }) => {
    let pagesRequestCount = 0;

    await page.route("**/api/auth", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "user_1",
            email: "demo@example.com",
            name: "Demo",
            subscriptionStatus: "active",
          },
        }),
      });
    });

    await page.route("**/api/user-domains**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          domains: [],
        }),
      });
    });

    await page.route("**/api/user-pages", async (route) => {
      if (route.request().method() !== "GET") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ success: true }),
        });
        return;
      }

      pagesRequestCount += 1;
      if (pagesRequestCount <= 2) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Failed to fetch pages" }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          pages: [
            {
              id: "page_retry_1",
              notionPageId: "1234567890abcdef1234567890abcdef",
              title: "Recovered Page",
              slug: "1234567890abcdef1234567890abcdef-recovered-page",
              template: "creator",
            },
          ],
        }),
      });
    });

    await page.goto("/dashboard");
    await expect(page.getByText("Unable to load saved pages right now.")).toBeVisible();

    await page.getByRole("button", { name: "Retry loading pages" }).click();

    await expect.poll(() => pagesRequestCount).toBeGreaterThanOrEqual(3);
    await expect(page.getByText("Recovered Page")).toBeVisible();
    await expect(page.getByText("Template: creator")).toBeVisible();
  });

  test("domains page loads", async ({ page }) => {
    const response = await page.goto("/domains");
    expect(response?.status()).toBe(200);
    
    await expect(page.getByRole("heading", { name: "Upgrade to Pro" })).toBeVisible();
    await page.getByLabel(/Default Template/i).selectOption("creator");
    await expect(page.getByLabel(/Default Template/i)).toHaveValue("creator");
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
  test("validate-page reports structured error code for invalid identifiers", async ({ request }) => {
    const response = await request.get("/api/validate-page?pageId=invalid-id");
    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      errorCode: "invalid_identifier",
    });
  });

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

  test("domains API registration can be retrieved by domain", async ({ request }) => {
    const domain = `pc${Date.now()}.com`;
    const email = "owner@example.com";

    const registerResponse = await request.post("/api/domains", {
      data: {
        domain,
        pageId: "1234567890abcdef1234567890abcdef",
        template: "creator",
        userEmail: email,
      },
    });

    expect(registerResponse.status()).toBe(200);
    await expect(registerResponse.json()).resolves.toMatchObject({
      success: true,
      domain,
    });

    const fetchResponse = await request.get(`/api/domains?domain=${encodeURIComponent(domain)}`);
    expect(fetchResponse.status()).toBe(200);

    await expect(fetchResponse.json()).resolves.toMatchObject({
      template: "creator",
      pageId: "1234567890abcdef1234567890abcdef",
      userEmail: email,
    });
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
