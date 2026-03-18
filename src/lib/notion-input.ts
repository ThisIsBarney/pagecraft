const NOTION_ID_PATTERN = /([a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i;

export function extractNotionPageId(input: string): string | null {
  const trimmedInput = input.trim();
  if (!trimmedInput) {
    return null;
  }

  const normalizedInput = trimmedInput.replace(/-/g, "");
  if (/^[a-f0-9]{32}$/i.test(normalizedInput)) {
    return normalizedInput;
  }

  const match = trimmedInput.match(NOTION_ID_PATTERN);
  if (!match) {
    return null;
  }

  return match[1].replace(/-/g, "");
}

export function isNotionPageId(input: string): boolean {
  return extractNotionPageId(input) !== null;
}
