import { OBJECT_TYPES } from "./constants";
import { baseIsEqual, baseIsMatch } from "./common";

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
