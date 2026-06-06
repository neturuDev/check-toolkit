import { OBJECT_TYPES } from "./constants";
import { baseIsEqual, baseIsMatch } from "./common";

/**
 * isSymbol
 * Check if `value` is symbol.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is symbol, false otherwise
 * @api public
 */
export const isSymbol = (value: any): value is symbol => {
  return Boolean(value) && value.constructor === Symbol;
};

/**
 * isArray
 * Check if `value` is Array.
 *
 * @param {*} value to check
 * @return {Boolean} true if 'value' is array, false otherwise
 * @api public
 */
export const isArray = Array.isArray;

/**
 * isArrayLike
 * Check if `value` is array-like.
 *
 * @param {*} value to check
 * @return {Boolean} true if `value` is array-like, else false.
 * @api public
 */
export const isArrayLike = (value: unknown): boolean =>
  value != null &&
  typeof value !== "function" &&
  typeof (value as any).length === "number" &&
  (value as any).length >= 0 &&
  (value as any).length <= Number.MAX_SAFE_INTEGER &&
  Math.floor((value as any).length) === (value as any).length;

/**
 * isNan
 * Check if `value` is NaN.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is NaN, false otherwise
 * @api public
 */
export const isNan = Number.isNaN;

/**
 * isObject
 * Check if `value` is Object.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is Object, false otherwise
 * @api public
 */
export const isObject = (value: any): value is object => {
  return Boolean(value) && value.constructor === Object;
};

/**
 * isNull
 * Check if `value` is Null.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is Null, false otherwise
 * @api public
 */
export const isNull = (value: unknown): value is null => {
  return value === null;
};

/**
 * isFunction
 * Check if `value` is a function.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is function, false otherwise
 * @api public
 */
export const isFunction = (
  value: unknown,
): value is (...args: any[]) => any => {
  return typeof value === "function";
};

/**
 * isNumber
 * Check if `value` is Number.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is number, false otherwise
 * @api public
 */
export const isNumber = (value: any): value is number => {
  try {
    return Number(value) === value;
  } catch {
    return false;
  }
};

/**
 * isString
 * Check if `value` is a string.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is string, false otherwise
 * @api public
 */
export const isString = (value: unknown): value is string => {
  return typeof value === "string" || value instanceof String;
};

/**
 * isUndefined
 * Check if `value` is undefined.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is undefined, false otherwise
 * @api public
 */
export const isUndefined = (value: unknown): value is undefined => {
  return value === undefined;
};

/**
 * isNotUndefined
 * Check if `value` is not undefined.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is not undefined, false otherwise
 * @api public
 */
export const isNotUndefined = <T>(value: T): value is Exclude<T, undefined> => {
  return !isUndefined(value);
};

/**
 * isNil
 * Check if `value` is null or undefined.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is null or undefined, false otherwise
 * @api public
 */
export const isNil = (value: unknown): value is null | undefined => {
  return isNull(value) || isUndefined(value);
};

/**
 * isNotNil
 * Check if `value` is not null or undefined.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is not null or undefined, false otherwise
 * @api public
 */
export const isNotNil = <T>(value: T): value is NonNullable<T> => {
  return !isNil(value);
};

/**
 * isNotNaN
 * Check if `value` is not NaN.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is not NaN, false otherwise
 * @api public
 */
export const isNotNaN = (value: unknown): boolean => {
  return !isNan(value);
};

/**
 * isEmpty
 * Check if `value` is empty.
 *
 * @param {*} value value to check
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
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
 * isEqual
 * Check if `value` is equal to `other`.
 *
 * @param {*} value value to check
 * @param {*} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */
export const isEqual = (value: any, other: any): boolean => {
  return baseIsEqual(value, other, new WeakMap());
};

/**
 * isMatch
 * Check if `object` is equal to `source`.
 *
 * @param {*} object value to check
 * @param {*} source value to compare with
 * @return {Boolean} true if `object` matches `source` via partial deep comparison
 */
export const isMatch = <T extends object, S extends Partial<T>>(
  object: T,
  source: S,
): boolean => {
  return baseIsMatch(object, source, new WeakMap());
};
