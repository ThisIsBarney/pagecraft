import { test, expect } from "@playwright/test";

test.describe("Payment E2E Branches", () => {
  test("domains page blocks invalid domain input before checkout", async ({ page }) => {
    await page.goto("/domains");

    await page.fill("#custom-domain", "bad domain");
    await page.getByRole("button", { name: /Upgrade to Pro/i }).click();

    await expect(
      page.getByText("Enter a valid custom domain, for example `example.com`.")
    ).toBeVisible();
  });

  test("domains page normalizes payload and redirects when checkout succeeds", async ({ page }) => {
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          url: "/payment/cancel",
        }),
      });
    });

    await page.goto("/domains");
    await page.fill("#custom-domain", "HTTPS://WWW.Example.com/path");
    await page.fill(
      "#notion-page-id",
      "https://www.notion.so/workspace/1234567890abcdef1234567890abcdef?v=abc"
    );
    await page.selectOption("#default-template", "creator");

    const checkoutRequestPromise = page.waitForRequest("**/api/checkout");
    await page.getByRole("button", { name: /Upgrade to Pro/i }).click();
    const checkoutRequest = await checkoutRequestPromise;

    expect(checkoutRequest.method()).toBe("POST");
    expect(checkoutRequest.postDataJSON()).toMatchObject({
      domain: "www.example.com",
      pageId: "1234567890abcdef1234567890abcdef",
      template: "creator",
    });

    await page.waitForURL("**/payment/cancel");
  });

  test("domains page shows checkout API error", async ({ page }) => {
    await page.route("**/api/checkout", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Checkout service unavailable" }),
      });
    });

    await page.goto("/domains");
    await page.fill("#custom-domain", "example.com");
    await page.getByRole("button", { name: /Upgrade to Pro/i }).click();

    await expect(page.getByText("Checkout service unavailable")).toBeVisible();
  });

  test("payment success page keeps processing state when session is missing", async ({ page }) => {
    await page.goto("/payment/success");
    await expect(page.getByText("Processing...")).toBeVisible();
    await expect(page.getByText("Welcome to Pro!")).not.toBeVisible();
  });

  test("payment success page shows post-payment guidance on successful verification", async ({ page }) => {
    await page.route("**/api/verify-payment", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          domain: "creator-example.com",
          pageId: "1234567890abcdef1234567890abcdef",
          template: "creator",
        }),
      });
    });

    await page.goto("/payment/success?session_id=test_success_session");

    await expect(page.getByRole("heading", { name: "Welcome to Pro!" })).toBeVisible();
    await expect(page.getByText("creator-example.com")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go to Dashboard" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Visit Your Site →" })).toHaveAttribute(
      "href",
      "https://creator-example.com"
    );
  });

  test("payment success page shows error branch when verification fails", async ({ page }) => {
    await page.route("**/api/verify-payment", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Failed to verify payment" }),
      });
    });

    await page.goto("/payment/success?session_id=test_error_session");

    await expect(page.getByRole("heading", { name: "Something went wrong" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Try Again" })).toHaveAttribute("href", "/domains");
  });

  test("payment cancel page renders recovery actions", async ({ page }) => {
    await page.goto("/payment/cancel");

    await expect(page.getByRole("heading", { name: "Payment Cancelled" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Try Again" })).toHaveAttribute("href", "/domains");
    await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});
