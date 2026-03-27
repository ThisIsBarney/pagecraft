import { test, expect } from "@playwright/test";

test.describe("Auth + Domain Access Branches", () => {
  test("dashboard shows sign-in form for unauthenticated users", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page.getByRole("heading", { name: "Sign in to PageCraft" })).toBeVisible();
    await expect(page.getByText("Manage pages, domains, and publishing settings.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("dashboard shows authenticated free-user state", async ({ page }) => {
    const email = "payment-e2e@example.com";

    await page.route("**/api/auth**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          user: {
            id: "user_free_dashboard",
            email,
            name: "Payment E2E User",
            subscriptionStatus: "free",
          },
        }),
      });
    });

    await page.route("**/api/user-domains**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ domains: [] }),
      });
    });

    await page.route("**/api/user-pages**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ pages: [] }),
      });
    });

    await page.goto("/dashboard");

    await expect(page.getByText(email)).toBeVisible();
    await expect(page.getByText("Free").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Upgrade for domains" })).toHaveAttribute(
      "href",
      "/domains"
    );
  });

  test("manage-domains redirects unauthenticated users to dashboard", async ({ page }) => {
    await page.goto("/manage-domains");
    await page.waitForURL("**/dashboard");

    await expect(page.getByRole("heading", { name: "Sign in to PageCraft" })).toBeVisible();
  });

  test("dashboard uses manage-domains entry for pro users", async ({ page }) => {
    await page.addInitScript(() => {
      const originalFetch = window.fetch.bind(window);
      window.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes("/api/auth")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                user: {
                  id: "user_pro",
                  email: "pro-user@example.com",
                  name: "Pro User",
                  subscriptionStatus: "active",
                },
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }

        if (url.includes("/api/user-domains")) {
          return Promise.resolve(
            new Response(
              JSON.stringify({
                domains: [],
              }),
              {
                status: 200,
                headers: { "Content-Type": "application/json" },
              }
            )
          );
        }

        if (url.includes("/api/user-pages")) {
          return Promise.resolve(
            new Response(JSON.stringify({ pages: [] }), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            })
          );
        }

        return originalFetch(input, init);
      };
    });

    await page.goto("/dashboard");

    await expect(page.getByText("Pro").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage domains" })).toHaveAttribute(
      "href",
      "/manage-domains"
    );
  });
});
