const test = require("node:test");
const assert = require("node:assert/strict");

test("normalizeNotionObjectId accepts hyphenated and plain ids", async () => {
  const { normalizeNotionObjectId } = await import("../src/lib/notion-image.ts");

  assert.equal(
    normalizeNotionObjectId("1234567890abcdef1234567890abcdef"),
    "12345678-90ab-cdef-1234-567890abcdef"
  );
  assert.equal(
    normalizeNotionObjectId("12345678-90ab-cdef-1234-567890abcdef"),
    "12345678-90ab-cdef-1234-567890abcdef"
  );
});

test("normalizeNotionObjectId rejects invalid ids", async () => {
  const { normalizeNotionObjectId } = await import("../src/lib/notion-image.ts");
  assert.equal(normalizeNotionObjectId("not-a-block-id"), null);
});

test("buildNotionImageProxyUrl creates a stable local route", async () => {
  const { buildNotionImageProxyUrl } = await import("../src/lib/notion-image.ts");

  assert.equal(
    buildNotionImageProxyUrl("1234567890abcdef1234567890abcdef"),
    "/api/notion-images/12345678-90ab-cdef-1234-567890abcdef"
  );
});

test("getNotionImageUrl proxies Notion-hosted file images", async () => {
  const { getNotionImageUrl } = await import("../src/lib/notion-image.ts");

  assert.equal(
    getNotionImageUrl({
      id: "1234567890abcdef1234567890abcdef",
      type: "image",
      image: {
        type: "file",
        file: { url: "https://secure.notion-static.com/original-signed-url" },
      },
    }),
    "/api/notion-images/12345678-90ab-cdef-1234-567890abcdef"
  );
});

test("getNotionImageUrl leaves external images untouched", async () => {
  const { getNotionImageUrl } = await import("../src/lib/notion-image.ts");

  assert.equal(
    getNotionImageUrl({
      id: "1234567890abcdef1234567890abcdef",
      type: "image",
      image: {
        type: "external",
        external: { url: "https://images.example.com/photo.png" },
      },
    }),
    "https://images.example.com/photo.png"
  );
});

test("extractNotionImageUrl reads image URLs from Notion block payloads", async () => {
  const { extractNotionImageUrl } = await import("../src/lib/notion-image.ts");

  assert.equal(
    extractNotionImageUrl({
      type: "image",
      image: {
        type: "file",
        file: { url: "https://secure.notion-static.com/fresh-signed-url" },
      },
    }),
    "https://secure.notion-static.com/fresh-signed-url"
  );
});
