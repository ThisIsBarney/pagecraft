import { test, expect } from "@playwright/test";

test.describe("Payment API Branches", () => {
  test("checkout API returns redirect URL when configured or a clear setup error", async ({ request }) => {
    const response = await request.post("/api/checkout", {
      data: {
        domain: `api-${Date.now()}.com`,
        pageId: "1234567890abcdef1234567890abcdef",
        template: "creator",
      },
    });

    expect([200, 503]).toContain(response.status());

    const payload = await response.json();
    if (response.status() === 200) {
      expect(typeof payload.url).toBe("string");
      expect(payload.url.length).toBeGreaterThan(0);
    } else {
      expect(payload).toMatchObject({
        error: "Payment not configured",
      });
    }
  });

  test("verify-payment rejects missing session ID", async ({ request }) => {
    const response = await request.post("/api/verify-payment", {
      data: {},
    });

    expect(response.status()).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: "Session ID required",
    });
  });

  test("verify-payment rejects empty JSON body", async ({ request }) => {
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

  test("verify-payment returns setup/runtime errors for unknown sessions", async ({ request }) => {
    const response = await request.post("/api/verify-payment", {
      data: {
        sessionId: `sess_missing_${Date.now()}`,
      },
    });

    expect([500, 503]).toContain(response.status());

    const payload = await response.json();
    if (response.status() === 503) {
      expect(payload).toMatchObject({
        error: "Stripe not configured",
      });
      return;
    }

    expect(payload).toMatchObject({
      error: "Failed to verify payment",
    });
  });
});
