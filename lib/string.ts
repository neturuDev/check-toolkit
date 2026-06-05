/**
 * Converts the characters "&", "<", ">", '"', and "'" in `string` to their HTML entities.
 */
export const escape = (str: string): string => {
  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  return str.replace(/[&<>"']/g, (ch) => htmlEscapes[ch]);
};

/**
 * The inverse of `escape`; converts HTML entities back to characters.
 */
export const unescape = (str: string): string => {
  const htmlUnescapes: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return str.replace(
    /&(amp|lt|gt|quot|#39);/g,
    (entity) => htmlUnescapes[entity],
  );
};

/**
 * Escapes RegExp special characters in `string`.
 * Useful for creating a RegExp from user input.
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
};
