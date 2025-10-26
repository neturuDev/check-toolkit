/**
 * @license MIT
 * Copyright (c) 2025 Volodymyr Cherevchuk
 */

import { OBJECT_TYPES } from "./constants";
import { baseIsMatch } from "./common";

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
 * Check if `value` is isArrayLike.
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
 * Check if `value` is Null.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is function, false otherwise
 * @api public
 */
export const isFunction = (value: any): value is Function => {
  return Boolean(value) && value.constructor && value.call && value.apply;
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
 * Check if `value` is Null.
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
 * Check if `value` is undefined.
 *
 * @param {*} value value to check
 * @return {Boolean} true if 'value' is not undefined, false otherwise
 * @api public
 */
export const isNotUndefined = (value: unknown): value is undefined => {
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
export const isNotNil = (value: unknown): boolean => {
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
export const isEqual = (value: any, other: any) => {
  if (value === other) {
    return true;
  }

  const type = Object.prototype.toString.call(value);

  if (type !== Object.prototype.toString.call(other)) {
    return false;
  }

  if (type === OBJECT_TYPES.function) {
    return value.prototype === other.prototype;
  }

  if (type === OBJECT_TYPES.date) {
    return value.getTime() === other.getTime();
  }

  if (type === OBJECT_TYPES.object) {
    for (let key in value) {
      if (!isEqual(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (let key in other) {
      if (!isEqual(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }

  if (type === OBJECT_TYPES.array) {
    let key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!isEqual(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  return false;
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
  source: S
): boolean => {
  return baseIsMatch(object, source, new WeakMap());
};

// Add methods that return unwrapped values in chain sequences.
// Add methods that return wrapped values in chain sequences.
