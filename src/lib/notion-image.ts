import type { Block } from "./notion";

function normalizeNotionObjectId(value: string): string | null {
  const normalized = value.trim().replace(/-/g, "").toLowerCase();

  if (!/^[0-9a-f]{32}$/.test(normalized)) {
    return null;
  }

  return normalized.replace(
    /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
    "$1-$2-$3-$4-$5"
  );
}

export function buildNotionImageProxyUrl(blockId: string): string | null {
  const normalizedBlockId = normalizeNotionObjectId(blockId);

  if (!normalizedBlockId) {
    return null;
  }

  return `/api/notion-images/${normalizedBlockId}`;
}

export function getNotionImageUrl(block: Block): string | null {
  if (block.type !== "image") {
    return null;
  }

  if (block.image?.type === "external") {
    return block.image.external?.url || null;
  }

  const proxyUrl = buildNotionImageProxyUrl(block.id);
  if (proxyUrl) {
    return proxyUrl;
  }

  return block.image?.file?.url || null;
}

export function extractNotionImageUrl(block: unknown): string | null {
  if (!block || typeof block !== "object" || !("type" in block) || block.type !== "image") {
    return null;
  }

  const imageBlock = block as {
    image?: {
      type?: "external" | "file";
      external?: { url?: string | null };
      file?: { url?: string | null };
    };
  };

  if (imageBlock.image?.type === "external") {
    return imageBlock.image.external?.url || null;
  }

  return imageBlock.image?.file?.url || null;
}

export { normalizeNotionObjectId };
