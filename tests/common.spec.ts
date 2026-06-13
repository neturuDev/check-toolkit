import { describe, it, expect } from "vitest";
import {
  getTag,
  ownKeys,
  hasOwn,
  isPrimitive,
  baseIsMatch,
} from "../lib/common";

const match = (obj: any, src: any) => baseIsMatch(obj, src, new WeakMap());

describe("common utilities", () => {
  describe("getTag", () => {
    it("returns tags for primitives and objects", () => {
      expect(getTag(null)).toBe("[object Null]");
      expect(getTag(undefined)).toBe("[object Undefined]");
      expect(getTag(123)).toBe("[object Number]");
      expect(getTag("x")).toBe("[object String]");
      expect(getTag([])).toBe("[object Array]");
      expect(getTag(new Date())).toBe("[object Date]");
      expect(getTag(/x/g)).toBe("[object RegExp]");
      expect(getTag(Symbol("s"))).toBe("[object Symbol]");
    });
  });

  describe("ownKeys", () => {
    it("includes enumerable string keys and symbol keys, excludes non-enumerable strings", () => {
      const s = Symbol("sym");
      const o: any = { a: 1 };
      Object.defineProperty(o, "b", { value: 2, enumerable: false });
      o[s] = 3;
      expect(ownKeys(o)).toEqual(["a", s]);
    });
  });

  describe("hasOwn", () => {
    it("detects own properties and ignores inherited ones (works with symbols)", () => {
      const proto: any = { inherited: 1 };
      const s = Symbol("s");
      const o: any = Object.create(proto);
      o.own = 2;
      o[s] = 3;
      expect(hasOwn(o, "inherited")).toBe(false);
      expect(hasOwn(o, "own")).toBe(true);
      expect(hasOwn(o, s)).toBe(true);
    });

    it("works with numeric keys", () => {
      const o: { 123: string } = { 123: "x" };
      expect(hasOwn(o, 123)).toBe(true);
      expect(hasOwn(o, "123")).toBe(true);
    });
  });

  describe("isPrimitive", () => {
    it("returns true for JS primitive types and false for objects/functions", () => {
      expect(isPrimitive(null)).toBe(true);
      expect(isPrimitive(undefined)).toBe(true);
      expect(isPrimitive("str")).toBe(true);
      expect(isPrimitive(0)).toBe(true);
      expect(isPrimitive(NaN)).toBe(true);
      expect(isPrimitive(true)).toBe(true);
      expect(isPrimitive(Symbol())).toBe(true);
      expect(isPrimitive(1n)).toBe(true);
      expect(isPrimitive({})).toBe(false);
      expect(isPrimitive([])).toBe(false);
      expect(isPrimitive(() => {})).toBe(false);
    });
  });

  describe("baseIsMatch", () => {
    it("matches identical primitives and handles NaN", () => {
      expect(match(1, 1)).toBe(true);
      expect(match(NaN, NaN)).toBe(true); // Object.is case
      expect(match(1, 2)).toBe(false);
    });

    it("matches Dates by time value and rejects different tags", () => {
      const d1 = new Date(0);
      const d2 = new Date(0);
      const o: any = {};
      expect(match(d1, d2)).toBe(true);
      expect(match(o, d1)).toBe(false);
    });

    it("matches RegExp by source and flags", () => {
      expect(match(/a/gi, /a/gi)).toBe(true);
      expect(match(/a/g, /a/i)).toBe(false);
    });

    it("deep matches arrays element-wise", () => {
      expect(match([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(match([1, 2], [1, 2, 3])).toBe(false);
    });

    it("matches Maps with same keys/values (primitive keys) and respects value differences", () => {
      const src = new Map<any, any>([["k", 1]]);
      const obj = new Map<any, any>([["k", 1]]);
      expect(match(obj, src)).toBe(true);

      const obj2 = new Map<any, any>([["k", 2]]);
      expect(match(obj2, src)).toBe(false);
    });

    it("requires same object reference for object keys in Maps", () => {
      const keyA = { x: 1 };
      const keyB = { x: 1 }; // different reference
      const src = new Map<any, any>([[keyA, "v"]]);
      const obj = new Map<any, any>([[keyB, "v"]]);
      // src has object keyA; obj does not have the same reference key, so should fail
      expect(match(obj, src)).toBe(false);

      // if same reference is used, it should match
      const sharedKey = { y: 2 };
      const src2 = new Map<any, any>([[sharedKey, "vv"]]);
      const obj2 = new Map<any, any>([[sharedKey, "vv"]]);
      expect(match(obj2, src2)).toBe(true);
    });

    it("matches Sets with primitives and deep-matches objects inside", () => {
      const src = new Set<any>([1, 2]);
      const obj = new Set<any>([2, 1]);
      expect(match(obj, src)).toBe(true);

      const srcObj = new Set<any>([{ a: 1 }]);
      const objObj = new Set<any>([{ a: 1 }]); // different reference but deep equal
      expect(match(objObj, srcObj)).toBe(true);

      const objObjFail = new Set<any>([{ a: 2 }]);
      expect(match(objObjFail, srcObj)).toBe(false);
    });

    it("deep matches plain objects and handles nested structures", () => {
      const src = { a: { b: 2 }, c: [1, { d: 3 }] };
      const obj = { a: { b: 2 }, c: [1, { d: 3 }] };
      expect(match(obj, src)).toBe(true);

      const objFail = { a: { b: 9 }, c: [1, { d: 3 }] };
      expect(match(objFail, src)).toBe(false);
    });

    it("handles cyclical structures without infinite recursion", () => {
      const src: any = { name: "s" };
      src.self = src;
      const obj: any = { name: "s" };
      obj.self = obj;
      expect(match(obj, src)).toBe(true);

      // differing cycle content
      const src2: any = { name: "s2" };
      src2.self = src2;
      const obj2: any = { name: "other" };
      obj2.self = obj2;
      expect(match(obj2, src2)).toBe(false);
    });
  });
});
