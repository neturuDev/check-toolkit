import { hasOwn, setOwn } from "./common";

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

const getByIteratee = <T>(iteratee: ((item: T) => unknown) | keyof T) =>
  typeof iteratee === "function"
    ? iteratee
    : (item: T): unknown => item[iteratee];

type SumValue = number | null | undefined;

type SummableKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends number ? K : never;
}[keyof T];

type ExtremumValue = SortableValue | null | undefined;

/** Keys whose values are sortable, or nullish and therefore skipped by minBy/maxBy. */
type ExtremumKeys<T> = {
  [K in keyof T]: NonNullable<T[K]> extends SortableValue ? K : never;
}[keyof T];

const isSortableValue = (value: unknown): value is SortableValue =>
  typeof value === "string" || (typeof value === "number" && !Number.isNaN(value));

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
    if (!hasOwn(result, key)) {
      setOwn(result, key, []);
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
    const count = hasOwn(result, key) ? result[key] : 0;
    setOwn(result, key, count + 1);
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

const extremumBy = <T>(
  array: readonly T[],
  iteratee: ((item: T) => unknown) | keyof T,
  sign: -1 | 1,
): T | undefined => {
  const getValue = getByIteratee(iteratee);
  let best: T | undefined;
  let bestValue: SortableValue | undefined;

  for (const item of array) {
    const value = getValue(item);
    if (!isSortableValue(value)) continue;
    if (bestValue === undefined) {
      best = item;
      bestValue = value;
      continue;
    }

    const order = compareKeys(value, bestValue);
    const isBetter = sign < 0 ? order < 0 : order > 0;
    if (isBetter) {
      best = item;
      bestValue = value;
    }
  }

  return best;
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
 * Creates an array of unique values from `array` that are included in every other array.
 * Order follows the first array. Uses SameValueZero (like `===`, but `NaN` equals `NaN`).
 * With no other arrays, returns the unique values of `array`.
 *
 * @example
 * intersection([2, 1, 2], [1, 2], [2, 3]) // => [2]
 */
export const intersection = <T>(
  array: readonly T[],
  ...others: readonly (readonly T[])[]
): T[] => {
  if (!Array.isArray(array)) return [];
  if (others.length === 0) return uniq(array);
  if (others.some((other) => !Array.isArray(other) || other.length === 0)) return [];

  const sets = others.map((other) => new Set(other));
  const seen = new Set<T>();
  const result: T[] = [];

  for (const item of array) {
    if (seen.has(item)) continue;
    seen.add(item);
    if (sets.every((set) => set.has(item))) {
      result.push(item);
    }
  }

  return result;
};

/**
 * Like `intersection`, but compares elements by the result of `iteratee`.
 * Keeps the first matching element from `array`.
 *
 * @example
 * intersectionBy([{ id: 1 }, { id: 2 }], [{ id: 2 }], "id")
 * // => [{ id: 2 }]
 */
export function intersectionBy<T>(
  array: readonly T[],
  values: readonly T[],
  iteratee: (value: T) => unknown,
): T[];
export function intersectionBy<T, P extends keyof T>(
  array: readonly T[],
  values: readonly T[],
  iteratee: P,
): T[];
export function intersectionBy<T>(
  array: readonly T[],
  values: readonly T[],
  iteratee: ((value: T) => unknown) | keyof T,
): T[] {
  if (!Array.isArray(array) || !Array.isArray(values) || values.length === 0) {
    return [];
  }

  const getValue = getByIteratee(iteratee);
  const included = new Set(values.map((item) => getValue(item)));
  const seen = new Set<unknown>();
  const result: T[] = [];

  for (const item of array) {
    const key = getValue(item);
    if (seen.has(key)) continue;
    seen.add(key);
    if (included.has(key)) {
      result.push(item);
    }
  }

  return result;
}

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
    setOwn(result, key, item);
    return result;
  }, {});
}

/**
 * Splits `array` into chunks of `size`.
 * `size` is truncated toward zero. A non-finite size, or a truncated size below 1, returns `[]`.
 * The input array is not mutated. Chunks are shallow copies.
 *
 * @example
 * chunk([1, 2, 3, 4, 5], 2) // => [[1, 2], [3, 4], [5]]
 */
export const chunk = <T>(array: readonly T[], size: number): T[][] => {
  if (!Number.isFinite(size)) return [];

  const length = Math.trunc(size);
  if (length < 1) return [];

  const result: T[][] = [];
  for (let index = 0; index < array.length; index += length) {
    result.push(array.slice(index, index + length));
  }

  return result;
};

type Flattened<T> = T extends readonly (infer U)[] ? U : T;

/**
 * Flattens `array` a single level. Nested arrays stay nested.
 * Only real arrays are flattened, not strings or array-like objects.
 *
 * @example
 * flatten([1, [2, [3]], 4]) // => [1, 2, [3], 4]
 */
export const flatten = <T>(array: readonly T[]): Flattened<T>[] => {
  const result: Flattened<T>[] = [];

  for (const item of array) {
    if (Array.isArray(item)) {
      for (const nested of item) {
        result.push(nested as Flattened<T>);
      }
    } else {
      result.push(item as Flattened<T>);
    }
  }

  return result;
};

const sumValues = <T>(
  array: readonly T[],
  getValue: (item: T) => unknown,
): number => {
  let total = 0;

  for (const item of array) {
    const value = getValue(item);
    if (value == null) continue;
    if (typeof value !== "number" || Number.isNaN(value)) return Number.NaN;
    total += value;
  }

  return total;
};

/**
 * Sums the numbers in `array`.
 * `null` and `undefined` are skipped. Any other non-number, including `NaN`, makes the result `NaN`.
 * An empty array sums to `0`.
 *
 * @example
 * sum([1, 2, 3]) // => 6
 */
export const sum = (array: readonly number[]): number =>
  sumValues(array, (value) => value);

/**
 * Sums the numbers produced by `iteratee`.
 * `null` and `undefined` are skipped. Any other non-number, including `NaN`, makes the result `NaN`.
 * An empty array sums to `0`.
 *
 * @example
 * sumBy([{ price: 1 }, { price: null }, { price: 2 }], "price") // => 3
 */
export function sumBy<T>(
  array: readonly T[],
  iteratee: (item: T) => SumValue,
): number;
export function sumBy<T, P extends SummableKeys<T>>(
  array: readonly T[],
  iteratee: P,
): number;
export function sumBy<T>(
  array: readonly T[],
  iteratee: ((item: T) => SumValue) | SummableKeys<T>,
): number {
  return sumValues(array, getByIteratee(iteratee));
}

/**
 * Returns the first element with the smallest comparable iteratee result.
 * `null`, `undefined`, and `NaN` are ignored. Returns `undefined` when nothing is comparable.
 * Comparison matches `sortBy`.
 *
 * @example
 * minBy([{ age: 30 }, { age: 20 }], "age") // => { age: 20 }
 */
export function minBy<T>(
  array: readonly T[],
  iteratee: (item: T) => ExtremumValue,
): T | undefined;
export function minBy<T, P extends ExtremumKeys<T>>(
  array: readonly T[],
  iteratee: P,
): T | undefined;
export function minBy<T>(
  array: readonly T[],
  iteratee: ((item: T) => unknown) | keyof T,
): T | undefined {
  return extremumBy(array, iteratee, -1);
}

/**
 * Returns the first element with the largest comparable iteratee result.
 * `null`, `undefined`, and `NaN` are ignored. Returns `undefined` when nothing is comparable.
 * Comparison matches `sortBy`.
 *
 * @example
 * maxBy([{ age: 30 }, { age: 20 }], "age") // => { age: 30 }
 */
export function maxBy<T>(
  array: readonly T[],
  iteratee: (item: T) => ExtremumValue,
): T | undefined;
export function maxBy<T, P extends ExtremumKeys<T>>(
  array: readonly T[],
  iteratee: P,
): T | undefined;
export function maxBy<T>(
  array: readonly T[],
  iteratee: ((item: T) => unknown) | keyof T,
): T | undefined {
  return extremumBy(array, iteratee, 1);
}
