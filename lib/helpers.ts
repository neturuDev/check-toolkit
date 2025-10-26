/**
 * @license MIT
 * Copyright (c) 2025 Volodymyr Cherevchuk
 */

/**
 * Creates an array of unique values from `array` not included in the other given arrays.
 * Uses SameValueZero (like `===` but treats NaN as equal to NaN).
 */
export const difference = <T>(array: T[], ...values: T[][]): T[] => {
  if (!Array.isArray(array)) return [];
  const exclude = new Set<T>([].concat(...(values as any)));
  return array.filter((item) => !exclude.has(item));
};

/**
 * Like difference, but accepts an iteratee which is invoked for each element
 * to generate the criterion by which uniqueness is computed.
 */
export const differenceBy = <T>(
  array: T[],
  values: T[],
  iteratee: (value: T) => unknown
): T[] => {
  if (!Array.isArray(array)) return [];

  const exclude = new Set(values.map(iteratee));
  return array.filter((item) => !exclude.has(iteratee(item)));
};

/**
 * Like difference, but accepts a comparator which is invoked to compare elements of arrays.
 */
export const differenceWith = <T>(
  array: T[],
  values: T[],
  comparator: (a: T, b: T) => boolean
): T[] => {
  if (!Array.isArray(array)) return [];

  return array.filter(
    (item) => !values.some((other) => comparator(item, other))
  );
};

type Iteratee<T> = ((item: T) => PropertyKey) | keyof T;

/**
 * Creates an object composed of keys generated from the results of running
 * each element of `array` through `iteratee`.
 * The corresponding value of each key is the last element that generated it.
 */
export const keyBy = <T>(
  array: T[],
  iteratee: Iteratee<T>
): Record<PropertyKey, T> => {
  const getKey =
    typeof iteratee === "function"
      ? iteratee
      : (item: T) => item[iteratee] as unknown as PropertyKey;

  return array.reduce<Record<PropertyKey, T>>((result, item) => {
    const key = getKey(item);
    result[key] = item;
    return result;
  }, {});
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
    (entity) => htmlUnescapes[entity]
  );
};

/**
 * Escapes RegExp special characters in `string`.
 * Useful for creating a RegExp from user input.
 */
export const escapeRegExp = (str: string): string => {
  return str.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
};
