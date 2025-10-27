/**
 * Shallow clone (like lodash.clone)
 */
export const clone = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.slice() as unknown as T;
  }
  if (value && typeof value === "object") {
    return { ...(value as Record<PropertyKey, unknown>) } as T;
  }
  return value;
};

/**
 * Deep clone helper
 */
const baseClone = <T>(
  value: T,
  isDeep: boolean,
  customizer?: (val: any) => any,
  stack = new WeakMap()
): T => {
  if (customizer) {
    const result = customizer(value);
    if (result !== undefined) return result;
  }

  // Handle primitives
  if (value === null || typeof value !== "object") {
    return value;
  }

  // Prevent circular reference issues
  if (stack.has(value as any)) {
    return stack.get(value as any);
  }

  let result: any;

  if (Array.isArray(value)) {
    result = [];
    stack.set(value as any, result);
    for (const item of value) {
      result.push(isDeep ? baseClone(item, true, customizer, stack) : item);
    }
    return result;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as any;
  }

  if (value instanceof RegExp) {
    return new RegExp(value) as any;
  }

  if (value instanceof Map) {
    result = new Map();
    stack.set(value as any, result);
    value.forEach((v, k) => {
      result.set(k, isDeep ? baseClone(v, true, customizer, stack) : v);
    });
    return result;
  }

  if (value instanceof Set) {
    result = new Set();
    stack.set(value as any, result);
    value.forEach((v) => {
      result.add(isDeep ? baseClone(v, true, customizer, stack) : v);
    });
    return result;
  }

  // Plain object
  result = {};
  stack.set(value as any, result);
  for (const [k, v] of Object.entries(value as any)) {
    (result as any)[k] = isDeep ? baseClone(v, true, customizer, stack) : v;
  }

  return result;
};

/**
 * Deep clone (like lodash.cloneDeep)
 */
export const cloneDeep = <T>(value: T): T => {
  return baseClone(value, true);
};

/**
 * Shallow clone with customizer (like lodash.cloneWith)
 */
export const cloneWith = <T>(value: T, customizer: (val: any) => any): T => {
  return baseClone(value, false, customizer);
};

/**
 * Deep clone with customizer (like lodash.cloneDeepWith)
 */
export const cloneDeepWith = <T>(
  value: T,
  customizer: (val: any) => any
): T => {
  return baseClone(value, true, customizer);
};
