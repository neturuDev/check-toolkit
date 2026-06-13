/**
 * Clamps `value` between `min` and `max`.
 *
 * @example
 * clamp(15, 0, 10) // => 10
 */
export const clamp = (value: number, min: number, max: number): number => {
  const lower = Math.min(min, max);
  const upper = Math.max(min, max);
  return Math.min(Math.max(value, lower), upper);
};
