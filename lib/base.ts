import { OBJECT_TYPES } from "./constants";
import { baseIsEqual, baseIsMatch, getTag } from "./common";

const ERROR_TAGS = new Set<string>([
  OBJECT_TYPES.error,
  OBJECT_TYPES.aggregateError,
  OBJECT_TYPES.domException,
]);

const hasMethod = (value: object, key: PropertyKey): boolean =>
  typeof (value as Record<PropertyKey, unknown>)[key] === "function";

const MAX_PROTO_DEPTH = 32;

/** True when some prototype's constructor still has the built-in name (`Date`, `Map`, …). */
const prototypeChainHasName = (value: object, name: string): boolean => {
  let proto = Object.getPrototypeOf(value) as object | null;

  for (
    let depth = 0;
    proto !== null && proto !== Object.prototype && depth < MAX_PROTO_DEPTH;
    depth += 1
  ) {
    const constructor = (proto as { constructor?: { name?: unknown } }).constructor;
    if (typeof constructor === "function" && constructor.name === name) return true;
    proto = Object.getPrototypeOf(proto) as object | null;
  }

  return false;
};

/**
 * Cross-realm brand check. Same-realm values should use `instanceof` first so a
 * subclass still matches after it changes `Symbol.toStringTag`.
 */
const matchesBrand = (
  value: object,
  tag: string,
  method: PropertyKey,
  name: string,
): boolean =>
  getTag(value) === tag &&
  hasMethod(value, method) &&
  prototypeChainHasName(value, name);

/**
 * Checks if `value` is a symbol.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a symbol
 *
 * @example
 * isSymbol(Symbol('x')) // true
 * isSymbol('x') // false
 */
export const isSymbol = (value: any): value is symbol => {
  return Boolean(value) && value.constructor === Symbol;
};

/**
 * Checks if `value` is an array (`Array.isArray`).
 *
 * @param value - Value to check
 * @returns `true` if `value` is an array
 *
 * @example
 * isArray([1, 2]) // true
 * isArray({ length: 2 }) // false
 */
export const isArray = Array.isArray;

/**
 * Checks if `value` is array-like (has a valid numeric `length`).
 * Not a TypeScript type predicate.
 *
 * @param value - Value to check
 * @returns `true` if `value` is array-like
 *
 * @example
 * isArrayLike('abc') // true
 * isArrayLike({ length: 2 }) // true
 */
export const isArrayLike = (value: unknown): boolean =>
  value != null &&
  typeof value !== "function" &&
  typeof (value as any).length === "number" &&
  (value as any).length >= 0 &&
  (value as any).length <= Number.MAX_SAFE_INTEGER &&
  Math.floor((value as any).length) === (value as any).length;

/**
 * Checks if `value` is `NaN` (`Number.isNaN`).
 *
 * @param value - Value to check
 * @returns `true` if `value` is `NaN`
 *
 * @example
 * isNan(Number.NaN) // true
 * isNan('foo') // false
 */
export const isNan = Number.isNaN;

/**
 * Checks if `value` has `constructor === Object`.
 * Prefer {@link isPlainObject} for JSON-like payloads.
 *
 * @param value - Value to check
 * @returns `true` if `value` is an Object-constructed value
 *
 * @example
 * isObject({}) // true
 * isObject([]) // false
 */
export const isObject = (value: any): value is object => {
  return Boolean(value) && value.constructor === Object;
};

/**
 * Checks if `value` is `null`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is `null`
 *
 * @example
 * isNull(null) // true
 * isNull(undefined) // false
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * Checks if `value` is a function.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a function
 *
 * @example
 * isFunction(() => {}) // true
 * isFunction({}) // false
 */
export const isFunction = (
  value: unknown,
): value is (...args: any[]) => any => {
  return typeof value === "function";
};

/**
 * Checks if `value` is a number where `Number(value) === value`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a number
 *
 * @example
 * isNumber(1) // true
 * isNumber(Number.NaN) // false
 */
export const isNumber = (value: any): value is number => {
  try {
    return Number(value) === value;
  } catch {
    return false;
  }
};

/**
 * Checks if `value` is an integer (`Number.isInteger`).
 * Numeric strings, `NaN`, infinities, and bigints are not integers.
 * Values outside `Number.MAX_SAFE_INTEGER` can still match.
 *
 * @param value - Value to check
 * @returns `true` if `value` is an integer
 *
 * @example
 * isInteger(1) // true
 * isInteger(1.5) // false
 * isInteger("1") // false
 */
export const isInteger = (value: unknown): value is number => {
  return Number.isInteger(value);
};

/**
 * Checks if `value` is a string (primitive or `String` object).
 *
 * @param value - Value to check
 * @returns `true` if `value` is a string
 *
 * @example
 * isString('hi') // true
 * isString(1) // false
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string" || value instanceof String;
};

/**
 * Checks if `value` is the boolean `true` or `false` (not truthiness).
 *
 * @param value - Value to check
 * @returns `true` if `value` is a boolean
 *
 * @example
 * isBoolean(false) // true
 * isBoolean(0) // false
 */
export const isBoolean = (value: unknown): value is boolean => {
  return value === true || value === false;
};

/**
 * Checks if `value` is a plain object (`Record`-like), not Array, Date, Map, class instances, etc.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a plain object
 *
 * @example
 * if (isPlainObject(input)) {
 *   // input is Record<string, unknown>
 * }
 * isPlainObject([]) // false
 */
export const isPlainObject = (
  value: unknown,
): value is Record<string, unknown> => {
  if (value === null || typeof value !== "object") {
    return false;
  }

  const proto = Object.getPrototypeOf(value) as object | null;
  const hasObjectPrototype =
    proto === null ||
    proto === Object.prototype ||
    Object.getPrototypeOf(proto) === null;

  if (!hasObjectPrototype) {
    return false;
  }

  return Object.prototype.toString.call(value) === OBJECT_TYPES.object;
};

/**
 * Checks if `value` is a `Date`, including an Invalid Date, a subclass, and a Date from another realm.
 * Same-realm values use `instanceof`. Another realm matches when the tag is Date, `getTime` is a function, and a prototype constructor is named `"Date"`.
 * That name match is the whole cross-realm test: a different class whose constructor is also named `"Date"` is accepted. A class with any other name is not.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a Date
 *
 * @example
 * isDate(new Date()) // true
 * isDate(new Date(Number.NaN)) // true
 * isDate("2020-01-01") // false
 */
export const isDate = (value: unknown): value is Date => {
  if (value instanceof Date) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    matchesBrand(value, OBJECT_TYPES.date, "getTime", "Date")
  );
};

/**
 * Checks if `value` is a `RegExp`, including one from another realm.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a RegExp
 *
 * @example
 * isRegExp(/a/i) // true
 * isRegExp("a") // false
 */
export const isRegExp = (value: unknown): value is RegExp => {
  if (value instanceof RegExp) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    matchesBrand(value, OBJECT_TYPES.regExp, "test", "RegExp")
  );
};

/**
 * Checks if `value` is a `Map`, including a subclass and a Map from another realm.
 * `WeakMap` is not a Map.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a Map
 *
 * @example
 * isMap(new Map()) // true
 * isMap(new WeakMap()) // false
 */
export const isMap = (value: unknown): value is Map<unknown, unknown> => {
  if (value instanceof Map) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    matchesBrand(value, OBJECT_TYPES.map, "get", "Map")
  );
};

/**
 * Checks if `value` is a `Set`, including a subclass and a Set from another realm.
 * `WeakSet` is not a Set.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a Set
 *
 * @example
 * isSet(new Set()) // true
 * isSet(new WeakSet()) // false
 */
export const isSet = (value: unknown): value is Set<unknown> => {
  if (value instanceof Set) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    matchesBrand(value, OBJECT_TYPES.set, "has", "Set")
  );
};

/**
 * Checks if `value` is an `Error` (including subclasses and `DOMException`).
 * Same-realm errors use `instanceof`. Another realm also needs an error tag, string `name` and `message`, and a prototype constructor named `"Error"`.
 * A class named `"Error"` that satisfies those checks is accepted. A plain `{ name, message }` object is not.
 *
 * @param value - Value to check
 * @returns `true` if `value` is an Error
 *
 * @example
 * isError(new TypeError("x")) // true
 * isError({ message: "x", name: "Error" }) // false
 */
export const isError = (value: unknown): value is Error => {
  if (value instanceof Error) return true;
  if (typeof value !== "object" || value === null) return false;
  if (!ERROR_TAGS.has(getTag(value))) return false;
  if (!prototypeChainHasName(value, "Error")) return false;

  const error = value as { name?: unknown; message?: unknown };
  return typeof error.name === "string" && typeof error.message === "string";
};

/**
 * Checks if `value` is a native `Promise`, including a subclass and one from another realm.
 * Plain thenables are not promises. `timeout` still accepts `PromiseLike`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is a Promise
 *
 * @example
 * isPromise(Promise.resolve(1)) // true
 * isPromise({ then() {} }) // false
 */
export const isPromise = (value: unknown): value is Promise<unknown> => {
  if (value instanceof Promise) return true;
  return (
    typeof value === "object" &&
    value !== null &&
    matchesBrand(value, OBJECT_TYPES.promise, "then", "Promise")
  );
};

/**
 * Checks if `value` is `undefined`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is `undefined`
 *
 * @example
 * isUndefined(undefined) // true
 * isUndefined(null) // false
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * Checks if `value` is not `undefined` (`null` still passes).
 * Prefer {@link isNotNil} when both `null` and `undefined` should be excluded.
 *
 * @param value - Value to check
 * @returns `true` if `value` is not `undefined`
 *
 * @example
 * [1, undefined].filter(isNotUndefined) // [1]
 */
export const isNotUndefined = <T>(value: T): value is Exclude<T, undefined> => {
  return !isUndefined(value);
};

/**
 * Checks if `value` is `null` or `undefined`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is `null` or `undefined`
 *
 * @example
 * isNil(null) // true
 * isNil(undefined) // true
 * isNil(0) // false
 */
export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

/**
 * Checks if `value` is neither `null` nor `undefined`.
 * Prefer with `Array#filter` for TypeScript narrowing to `NonNullable<T>`.
 *
 * @param value - Value to check
 * @returns `true` if `value` is not `null` or `undefined`
 *
 * @example
 * const values: Array<string | null> = ['a', null];
 * const cleaned: string[] = values.filter(isNotNil);
 *
 * if (isNotNil(value)) {
 *   // value is NonNullable
 * }
 */
export const isNotNil = <T>(value: T): value is NonNullable<T> => {
  return !isNil(value);
};

/**
 * Checks if `value` is not `NaN`. Not a TypeScript type predicate.
 *
 * @param value - Value to check
 * @returns `true` if `value` is not `NaN`
 *
 * @example
 * isNotNaN(1) // true
 * isNotNaN(Number.NaN) // false
 */
export const isNotNaN = (value: unknown): boolean => {
  return !isNan(value);
};

/**
 * Checks if `value` is empty (empty string/array/object/map/set, or falsy for other types).
 * Not a TypeScript type predicate.
 *
 * @param value - Value to check
 * @returns `true` if `value` is empty
 *
 * @example
 * isEmpty({}) // true
 * isEmpty([1]) // false
 */
export const isEmpty = (value: any): boolean => {
  const type = Object.prototype.toString.call(value);

  switch (type) {
    case OBJECT_TYPES.array:
    case OBJECT_TYPES.string:
    case OBJECT_TYPES.arguments:
      return value.length === 0;
    case OBJECT_TYPES.object:
      for (let key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          return false;
        }
      }
      return true;
    case OBJECT_TYPES.map:
    case OBJECT_TYPES.set:
      return value.size === 0;
  }

  return !value;
};

/**
 * Performs a deep equality comparison of two values.
 *
 * @param value - Value to compare
 * @param other - Other value to compare
 * @returns `true` if the values are deeply equal
 *
 * @example
 * isEqual({ a: 1 }, { a: 1 }) // true
 * isEqual([1, 2], [1, 2]) // true
 */
export const isEqual = (value: any, other: any): boolean => {
  return baseIsEqual(value, other, new WeakMap());
};

/**
 * Checks if `object` partially deep-matches `source`.
 *
 * @param object - Object to inspect
 * @param source - Partial source to match against
 * @returns `true` if `object` matches `source`
 *
 * @example
 * isMatch({ a: 1, b: 2 }, { a: 1 }) // true
 */
export const isMatch = <T extends object, S extends Partial<T>>(
  object: T,
  source: S,
): boolean => {
  return baseIsMatch(object, source, new WeakMap());
};
