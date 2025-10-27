import { OBJECT_TYPES } from "./constants";

export const getTag = (v: unknown): string => {
  return Object.prototype.toString.call(v);
};

export const ownKeys = (o: object): (string | symbol)[] => {
  return [...Object.keys(o), ...Object.getOwnPropertySymbols(o)];
};

export const hasOwn = (o: object, k: string | symbol): boolean => {
  return Object.prototype.hasOwnProperty.call(o, k);
};

export const isPrimitive = (
  v: unknown
): v is null | undefined | string | number | boolean | symbol | bigint => {
  return v === null || (typeof v !== "object" && typeof v !== "function");
};

export const baseIsMatch = (
  obj: any,
  src: any,
  seen: WeakMap<object, Set<object>>
): boolean => {
  // Fast path: strictly equal or Object.is (for NaN)
  if (obj === src || Object.is(obj, src)) return true;

  // If source is primitive or nullish, must be strictly equal
  if (src === null || typeof src !== "object") return false;

  // If obj isn't object-like but src is, fail
  if (obj === null || typeof obj !== "object") return false;

  // Cycle guard: if we've seen this src->obj pair, consider it matched
  let mapped = seen.get(src);
  if (mapped && mapped.has(obj)) return true;
  if (!mapped) {
    mapped = new Set<object>();
    seen.set(src, mapped);
  }
  mapped.add(obj);

  const tag = getTag(src);
  if (tag !== getTag(obj)) return false;

  switch (tag) {
    case OBJECT_TYPES.date:
      return +obj === +src;

    case OBJECT_TYPES.regExp:
      return obj.source === src.source && obj.flags === src.flags;

    case OBJECT_TYPES.array:
      if (obj.length !== src.length) return false;
      for (let i = 0; i < src.length; i++) {
        if (!baseIsMatch(obj[i], src[i], seen)) return false;
      }
      return true;

    case OBJECT_TYPES.map:
      if (!(obj instanceof Map)) return false;
      for (const [k, v] of src as Map<any, any>) {
        if (!obj.has(k)) return false;
        if (!baseIsMatch(obj.get(k), v, seen)) return false;
      }
      return true;

    case OBJECT_TYPES.set:
      if (!(obj instanceof Set)) return false;
      for (const v of src as Set<any>) {
        if (isPrimitive(v)) {
          if (!obj.has(v)) return false;
        } else {
          let found = false;
          for (const cand of obj) {
            if (baseIsMatch(cand, v, seen)) {
              found = true;
              break;
            }
          }
          if (!found) return false;
        }
      }
      return true;

    default:
      const srcKeys = ownKeys(src);
      for (const key of srcKeys) {
        if (!hasOwn(obj, key)) return false;
        if (!baseIsMatch(obj[key], src[key], seen)) return false;
      }
      return true;
  }
};
