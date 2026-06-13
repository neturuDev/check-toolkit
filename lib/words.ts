/**
 * Splits a string into words for case conversion helpers.
 */
export const CASE_SPLIT_PATTERN =
  /\p{Lu}?\p{Ll}+|[0-9]+|\p{Lu}+(?!\p{Ll})|\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{L}+/gu;

export const words = (str: string): string[] => {
  return Array.from(str.match(CASE_SPLIT_PATTERN) ?? []);
};
