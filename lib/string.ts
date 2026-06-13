import { words } from "./words";

/**
 * Converts the first character of `string` to upper case. * Lodash-style: only the first character changes; this is not title case.
 * Uses `toUpperCase`, so locale-sensitive characters may not behave as expected
 * (for example, `capitalize("ßeta")` becomes `"SSeta"`).
 *
 * @example
 * capitalize('hello') // => 'Hello'
 * capitalize('hello world') // => 'Hello world'
 */
export const capitalize = (str: string): string => {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Converts a string to camel case.
 * Uses `toUpperCase`/`toLowerCase`; locale-sensitive characters may behave unexpectedly.
 *
 * @example
 * camelCase('foo bar') // => 'fooBar'
 * camelCase('HTTPRequest') // => 'httpRequest'
 */
export const camelCase = (str: string): string => {
  const parts = words(str);

  if (parts.length === 0) {
    return "";
  }

  const [first, ...rest] = parts;

  return `${first.toLowerCase()}${rest
    .map((word) => capitalize(word.toLowerCase()))
    .join("")}`;
};

/**
 * Converts a string to kebab case.
 *
 * @example
 * kebabCase('fooBar') // => 'foo-bar'
 * kebabCase('HTTPRequest') // => 'http-request'
 */
export const kebabCase = (str: string): string => {
  return words(str)
    .map((word) => word.toLowerCase())
    .join("-");
};

/**
 * Converts a string to snake case.
 *
 * @example
 * snakeCase('fooBar') // => 'foo_bar'
 * snakeCase('HTTPRequest') // => 'http_request'
 */
export const snakeCase = (str: string): string => {
  return words(str)
    .map((word) => word.toLowerCase())
    .join("_");
};

/**
 * Converts each word to start case (title-style words separated by spaces).
 * Not the same as `capitalize`, which only changes the first character of the string.
 * Uses `toUpperCase`/`toLowerCase`; locale-sensitive characters may behave unexpectedly.
 *
 * @example
 * startCase('hello world') // => 'Hello World'
 * startCase('hello-world') // => 'Hello World'
 */
export const startCase = (str: string): string => {
  return words(str)
    .map((word) => capitalize(word.toLowerCase()))
    .join(" ");
};

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
