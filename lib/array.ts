type Iteratee<T> = ((item: T) => PropertyKey) | keyof T;

type GroupKey<T, P extends keyof T> = Extract<T[P], PropertyKey> extends never
  ? string
  : Extract<T[P], PropertyKey>;

type SortableValue = string | number;

/** Keys whose values can be compared by `sortBy` (symbol excluded — not meaningfully sortable). */
type SortableKeys<T> = {
  [K in keyof T]: T[K] extends SortableValue ? K : never;
}[keyof T];

type SortIteratee<T> = ((item: T) => SortableValue) | SortableKeys<T>;

const getIterateeKey = <T>(iteratee: Iteratee<T>) =>
  typeof iteratee === "function"
    ? iteratee
    : (item: T) => item[iteratee] as unknown as PropertyKey;

const getSortKey = <T>(iteratee: SortIteratee<T>): ((item: T) => SortableValue) =>
  typeof iteratee === "function"
    ? iteratee
    : (item: T) => item[iteratee as keyof T] as SortableValue;

/**
 * Removes falsy values from an array.
 *
 * @example
 * compact([0, 1, false, 2, '', 3]) // => [1, 2, 3]
 */
export const compact = <T>(
  array: readonly (T | null | undefined | false | "" | 0)[],
): T[] => {
  return array.filter((item): item is T => Boolean(item));
};

/**
 * Creates an array with unique values.
 *
 * @example
 * uniq([1, 2, 1, 3]) // => [1, 2, 3]
 */
export const uniq = <T>(array: readonly T[]): T[] => {
  return uniqBy(array, (item) => item);
};

/**
 * Creates an array with unique values using an iteratee.
 *
 * @example
 * uniqBy([2.1, 1.2, 2.3], Math.floor) // => [2.1, 1.2]
 */
export const uniqBy = <T, U>(
  array: readonly T[],
  iteratee: (item: T) => U,
): T[] => {
  const seen = new Set<U>();
  const result: T[] = [];

  for (const item of array) {
    const key = iteratee(item);
    if (!seen.has(key)) {
      seen.add(key);
      result.push(item);
    }
  }

  return result;
};

/**
 * Groups array elements by the result of the iteratee.
 *
 * @example
 * groupBy([{ type: 'a' }, { type: 'b' }, { type: 'a' }], 'type')
 * // => { a: [{ type: 'a' }, { type: 'a' }], b: [{ type: 'b' }] }
 */
export function groupBy<T, K extends PropertyKey>(
  array: readonly T[],
  iteratee: (item: T) => K,
): Record<K, T[]>;
export function groupBy<T, P extends keyof T>(
  array: readonly T[],
  iteratee: P,
): Record<GroupKey<T, P>, T[]>;
export function groupBy<T>(
  array: readonly T[],
  iteratee: Iteratee<T>,
): Record<PropertyKey, T[]> {
  const getKey = getIterateeKey(iteratee);
  const result: Record<PropertyKey, T[]> = {};

  for (const item of array) {
    const key = getKey(item);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(item);
  }

  return result;
}

/**
 * Counts elements grouped by the result of the iteratee.
 *
 * @example
 * countBy(['a', 'b', 'a', 'c', 'b', 'a'], (item) => item)
 * // => { a: 3, b: 2, c: 1 }
 */
export function countBy<T, K extends PropertyKey>(
  array: readonly T[],
  iteratee: (item: T) => K,
): Record<K, number>;
export function countBy<T, P extends keyof T>(
  array: readonly T[],
  iteratee: P,
): Record<GroupKey<T, P>, number>;
export function countBy<T>(
  array: readonly T[],
  iteratee: Iteratee<T>,
): Record<PropertyKey, number> {
  const getKey = getIterateeKey(iteratee);
  const result: Record<PropertyKey, number> = {};

  for (const item of array) {
    const key = getKey(item);
    result[key] = (result[key] ?? 0) + 1;
  }

  return result;
}

/**
 * Splits an array into two groups based on a predicate.
 * Returns `[pass, fail]` where `pass` contains matching items.
 *
 * @example
 * partition([1, 2, 3, 4], (n) => n % 2 === 0) // => [[2, 4], [1, 3]]
 */
export const partition = <T>(
  array: readonly T[],
  predicate: (item: T) => boolean,
): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  for (const item of array) {
    if (predicate(item)) {
      pass.push(item);
    } else {
      fail.push(item);
    }
  }

  return [pass, fail];
};

const compareKeys = (left: SortableValue, right: SortableValue): number => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  if (typeof left === "string" && typeof right === "string") {
    return left.localeCompare(right);
  }

  return String(left).localeCompare(String(right), undefined, { numeric: true });
};

/**
 * Creates a sorted copy of an array by the result of the iteratee.
 *
 * @example
 * sortBy([{ age: 30 }, { age: 20 }], 'age')
 * // => [{ age: 20 }, { age: 30 }]
 */
export function sortBy<T, K extends SortableValue>(
  array: readonly T[],
  iteratee: (item: T) => K,
): T[];
export function sortBy<T, P extends SortableKeys<T>>(
  array: readonly T[],
  iteratee: P,
): T[];
export function sortBy<T>(array: readonly T[], iteratee: SortIteratee<T>): T[] {
  const getValue = getSortKey(iteratee);

  return [...array].sort((a, b) => compareKeys(getValue(a), getValue(b)));
}

/**
 * Creates an array of unique values from `array` not included in the other given arrays.
 * Uses SameValueZero (like `===` but treats NaN as equal to NaN).
 *
 * @example
 * difference([1, 2, 3], [2, 4], [3, 5]) // => [1]
 */
export const difference = <T>(array: T[], ...values: T[][]): T[] => {
  if (!Array.isArray(array)) return [];
  const exclude = new Set<T>([].concat(...(values as any)));
  return array.filter((item) => !exclude.has(item));
};

/**
 * Like `difference`, but compares elements by the result of `iteratee`.
 *
 * @example
 * differenceBy([2.1, 1.2], [2.3, 3.4], Math.floor) // => [1.2]
 */
export const differenceBy = <T>(
  array: T[],
  values: T[],
  iteratee: (value: T) => unknown,
): T[] => {
  if (!Array.isArray(array)) return [];

  const exclude = new Set(values.map(iteratee));
  return array.filter((item) => !exclude.has(iteratee(item)));
};

/**
 * Like `difference`, but uses `comparator` to compare elements.
 *
 * @example
 * differenceWith(
 *   [{ x: 1 }, { x: 2 }],
 *   [{ x: 2 }],
 *   (a, b) => a.x === b.x,
 * ) // => [{ x: 1 }]
 */
export const differenceWith = <T>(
  array: T[],
  values: T[],
  comparator: (a: T, b: T) => boolean,
): T[] => {
  if (!Array.isArray(array)) return [];

  return array.filter(
    (item) => !values.some((other) => comparator(item, other)),
  );
};

/**
 * Creates an object keyed by the result of `iteratee`.
 * The value for each key is the last element that produced it.
 *
 * @example
 * keyBy([{ id: 'a' }, { id: 'b' }, { id: 'a' }], 'id')
 * // => { a: { id: 'a' }, b: { id: 'b' } }
 */
export function keyBy<T, K extends PropertyKey>(
  array: readonly T[],
  iteratee: (item: T) => K,
): Record<K, T>;
export function keyBy<T, P extends keyof T>(
  array: readonly T[],
  iteratee: P,
): Record<GroupKey<T, P>, T>;
export function keyBy<T>(
  array: readonly T[],
  iteratee: Iteratee<T>,
): Record<PropertyKey, T> {
  const getKey = getIterateeKey(iteratee);

  return array.reduce<Record<PropertyKey, T>>((result, item) => {
    const key = getKey(item);
    result[key] = item;
    return result;
  }, {});
}
