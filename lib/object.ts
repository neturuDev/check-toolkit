import { hasOwn, ownKeys } from "./common";

const getOwnPropertyKeys = <T extends object>(obj: T): (keyof T)[] =>
  ownKeys(obj) as (keyof T)[];

/**
 * Creates a new object with only the specified keys.
 *
 * @example
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // => { a: 1, c: 3 }
 */
export const pick = <T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Pick<T, K> => {
  const result = {} as Pick<T, K>;

  for (const key of keys) {
    if (hasOwn(obj, key)) {
      result[key] = obj[key];
    }
  }

  return result;
};

/**
 * Creates a new object without the specified keys.
 *
 * @example
 * omit({ a: 1, b: 2 }, ['b']) // => { a: 1 }
 */
export const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: readonly K[],
): Omit<T, K> => {
  const exclude = new Set<PropertyKey>(keys);
  const result = {} as Omit<T, K>;

  for (const key of getOwnPropertyKeys(obj)) {
    if (!exclude.has(key)) {
      (result as T)[key] = obj[key];
    }
  }

  return result;
};

/**
 * Creates a new object with entries that satisfy the predicate.
 *
 * @example
 * pickBy({ a: 1, b: null, c: 3 }, (v) => v != null) // => { a: 1, c: 3 }
 */
export const pickBy = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  const result = {} as Partial<T>;

  for (const key of getOwnPropertyKeys(obj)) {
    const value = obj[key];
    if (predicate(value, key)) {
      result[key] = value;
    }
  }

  return result;
};

/**
 * Creates a new object without entries that satisfy the predicate.
 *
 * @example
 * omitBy({ a: 1, b: null }, (v) => v == null) // => { a: 1 }
 */
export const omitBy = <T extends object>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean,
): Partial<T> => {
  return pickBy(obj, (value, key) => !predicate(value, key));
};
