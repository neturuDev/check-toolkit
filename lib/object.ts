import { hasOwn, ownKeys, setOwn } from "./common";

const getOwnPropertyKeys = <T extends object>(obj: T): (keyof T)[] =>
  ownKeys(obj) as (keyof T)[];

type FromPairs<T extends readonly (readonly [PropertyKey, unknown])[]> = {
  [E in T[number] as E[0]]: Extract<T[number], readonly [E[0], unknown]>[1];
};

/**
 * Builds an object from key-value pairs. Later pairs overwrite earlier ones with the same key.
 * Fresh pair lists keep literal key and value types. A repeated key's type is the union of every value for that key, while the runtime value is the last one.
 *
 * @example
 * fromPairs([["a", 1], ["b", 2]]) // => { a: 1, b: 2 }
 */
export const fromPairs = <
  const T extends readonly (readonly [PropertyKey, unknown])[],
>(
  pairs: T,
): FromPairs<T> => {
  const result = {} as FromPairs<T>;

  for (const [key, value] of pairs) {
    setOwn(result, key, value);
  }

  return result;
};

/**
 * Maps own enumerable string keys and own enumerable symbols.
 * Inherited properties and non-enumerable keys are omitted. The input object is not mutated.
 * The return type lists every `keyof T`, including inherited methods. Those keys are absent at runtime unless they are own enumerable properties.
 *
 * @example
 * mapValues({ a: 1, b: 2 }, (value) => value * 2) // => { a: 2, b: 4 }
 */
export const mapValues = <T extends object, U>(
  object: T,
  iteratee: (value: T[keyof T], key: keyof T) => U,
): { [K in keyof T]: U } => {
  const result = {} as { [K in keyof T]: U };

  for (const key of getOwnPropertyKeys(object)) {
    setOwn(result, key, iteratee(object[key], key));
  }

  return result;
};

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
      setOwn(result, key, obj[key]);
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
      setOwn(result, key, obj[key]);
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
      setOwn(result, key, value);
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
