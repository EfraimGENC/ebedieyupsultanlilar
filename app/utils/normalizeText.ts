/**
 * Normalizes Turkish text for search and comparison purposes.
 * Handles Turkish-specific character normalization including:
 * - Dotted/dotless I (İ/i vs I/ı)
 * - Accented characters (â, î, û, etc.)
 * - Case conversion
 *
 * @param text - The text to normalize
 * @returns Normalized lowercase text suitable for searching
 */
export function normalizeText(text: string | undefined | null): string {
  if (!text) return "";

  // First, handle Turkish locale-specific lowercase conversion
  let normalized = text.toLocaleLowerCase("tr-TR");

  // Then, remove all diacritics/accents (â → a, î → i, û → u, etc.)
  normalized = normalized.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Additional replacements for common Turkish characters that might not be handled
  const replacements: Record<string, string> = {
    ı: "i",
    İ: "i",
    î: "i",
    Î: "i",
    â: "a",
    Â: "a",
    û: "u",
    Û: "u",
    ô: "o",
    Ô: "o",
    ê: "e",
    Ê: "e",
  };

  // Apply replacements
  Object.entries(replacements).forEach(([from, to]) => {
    normalized = normalized.replace(new RegExp(from, "g"), to);
  });

  return normalized;
}

/**
 * Checks if a text contains a search query using Turkish-aware normalization.
 *
 * @param text - The text to search in
 * @param query - The search query
 * @returns True if the normalized text contains the normalized query
 */
export function turkishIncludes(
  text: string | undefined | null,
  query: string | undefined | null
): boolean {
  if (!text || !query) return false;
  return normalizeText(text).includes(normalizeText(query));
}

/**
 * Checks if any item in an array contains a search query using Turkish-aware normalization.
 *
 * @param items - Array of strings to search in
 * @param query - The search query
 * @returns True if any normalized item contains the normalized query
 */
export function turkishIncludesInArray(
  items: string[] | undefined | null,
  query: string | undefined | null
): boolean {
  if (!items || !query) return false;
  const normalizedQuery = normalizeText(query);
  return items.some((item) => normalizeText(item).includes(normalizedQuery));
}

/**
 * Extracts searchable text from Nuxt Content body object (parsed markdown AST).
 * Recursively traverses the body tree and extracts text content.
 *
 * @param body - The Nuxt Content body object
 * @returns Concatenated text content from the body
 */
export function extractBodyText(body: any): string {
  if (!body) return "";

  // If body is already a string, return it
  if (typeof body === "string") return body;

  let text = "";

  // Handle body.children array (Nuxt Content AST structure)
  if (body.children && Array.isArray(body.children)) {
    for (const child of body.children) {
      text += extractBodyText(child) + " ";
    }
  }

  // Handle direct text value
  if (body.value && typeof body.value === "string") {
    text += body.value + " ";
  }

  // Handle text type nodes
  if (body.type === "text" && body.value) {
    text += body.value + " ";
  }

  return text;
}

/**
 * Checks if Nuxt Content body contains a search query using Turkish-aware normalization.
 * Handles both parsed markdown AST and string content.
 *
 * @param body - The Nuxt Content body object or string
 * @param query - The search query
 * @returns True if the normalized body text contains the normalized query
 */
export function turkishIncludesInBody(
  body: any,
  query: string | undefined | null
): boolean {
  if (!body || !query) return false;
  const bodyText = extractBodyText(body);
  return turkishIncludes(bodyText, query);
}
