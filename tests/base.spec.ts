import { describe, it, expect } from "vitest";
import {
  isSymbol,
  isArray,
  isArrayLike,
  isNan,
  isObject,
  isNull,
  isFunction,
  isNumber,
  isString,
  isUndefined,
  isNotUndefined,
  isNil,
  isNotNil,
  isNotNaN,
  isEmpty,
  isEqual,
  isMatch,
} from "../lib/base";

describe("base utilities", () => {
  it("isSymbol detects symbols", () => {
    expect(isSymbol(Symbol())).toBe(true);
    expect(isSymbol(Object(Symbol()))).toBe(true);
    expect(isSymbol("not-symbol")).toBe(false);
    expect(isSymbol(null)).toBe(false);
  });

  it("isArray and isArrayLike behavior", () => {
    expect(isArray([1, 2, 3])).toBe(true);
    expect(isArray("abc" as any)).toBe(false);

    expect(isArrayLike([1, 2, 3])).toBe(true);
    expect(isArrayLike("abc")).toBe(true);
    expect(isArrayLike({ length: 2 })).toBe(true);
    expect(isArrayLike({ length: 2.5 })).toBe(false);
    expect(isArrayLike(() => {})).toBe(false);
    expect(isArrayLike(null)).toBe(false);
  });

  it("isNan and isNotNaN", () => {
    expect(isNan(NaN)).toBe(true);
    expect(isNan("NaN")).toBe(false);
    expect(isNotNaN(1)).toBe(true);
    expect(isNotNaN(NaN)).toBe(false);
  });

  it("isObject and edge cases", () => {
    expect(isObject({})).toBe(true);
    expect(isObject(new Date())).toBe(false);
    // Object.create(null) has no constructor -> should be false
    expect(isObject(Object.create(null))).toBe(false);
    expect(isObject([])).toBe(false);
  });

  it("isNull, isUndefined, isNotUndefined, isNil, isNotNil", () => {
    expect(isNull(null)).toBe(true);
    expect(isNull(undefined)).toBe(false);

    expect(isUndefined(undefined)).toBe(true);
    expect(isUndefined(null)).toBe(false);

    expect(isNotUndefined(0)).toBe(true);
    expect(isNotUndefined(undefined)).toBe(false);

    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);

    expect(isNotNil(0)).toBe(true);
    expect(isNotNil(null)).toBe(false);
  });

  it("isFunction detects functions", () => {
    expect(isFunction(function () {})).toBe(true);
    expect(isFunction(() => {})).toBe(true);
    expect(isFunction({})).toBe(false);
    expect(isFunction(null)).toBe(false);
  });

  it("isNumber and isString", () => {
    expect(isNumber(1)).toBe(true);
    expect(isNumber(0)).toBe(true);
    expect(isNumber(NaN)).toBe(false);
    expect(isNumber("1")).toBe(false);
    expect(isNumber(new Number(1))).toBe(false);

    expect(isString("abc")).toBe(true);
    expect(isString(new String("abc"))).toBe(true);
    expect(isString(123)).toBe(false);
  });

  it("isEmpty behavior for arrays, strings, objects and primitives", () => {
    expect(isEmpty([])).toBe(true);
    expect(isEmpty([1])).toBe(false);

    expect(isEmpty("")).toBe(true);
    expect(isEmpty("x")).toBe(false);

    expect(isEmpty({})).toBe(true);
    expect(isEmpty({ a: 1 })).toBe(false);

    // other falsy values are treated as empty
    expect(isEmpty(0)).toBe(true);
    expect(isEmpty(false)).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);

    expect(isEmpty(new Map())).toBe(true);
    expect(isEmpty(new Map([["a", 1]]))).toBe(false);
    expect(isEmpty(new Set())).toBe(true);
    expect(isEmpty(new Set([1]))).toBe(false);
  });

  it("isEqual supports primitives, dates, arrays, objects and functions (prototype check)", () => {
    expect(isEqual(1, 1)).toBe(true);
    expect(isEqual(1, "1")).toBe(false);

    const d1 = new Date(1000);
    const d2 = new Date(1000);
    const d3 = new Date(2000);
    expect(isEqual(d1, d2)).toBe(true);
    expect(isEqual(d1, d3)).toBe(false);

    expect(isEqual([1, [2, 3]], [1, [2, 3]])).toBe(true);
    expect(isEqual([1, 2], [1, 2, 3])).toBe(false);

    expect(isEqual({ a: 1, b: { c: 2 } }, { b: { c: 2 }, a: 1 })).toBe(true);
    expect(isEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);

    function A() {}
    function B() {}
    // same reference -> true
    expect(isEqual(A, A)).toBe(true);
    // different functions -> prototypes differ -> false
    expect(isEqual(A, B)).toBe(false);
  });

  it("isEqual supports NaN, RegExp, Map, Set and cyclical structures", () => {
    expect(isEqual(NaN, NaN)).toBe(true);
    expect(isEqual(/a/gi, /a/gi)).toBe(true);
    expect(isEqual(/a/g, /a/i)).toBe(false);

    const mapA = new Map([["k", { v: 1 }]]);
    const mapB = new Map([["k", { v: 1 }]]);
    expect(isEqual(mapA, mapB)).toBe(true);
    expect(isEqual(mapA, new Map([["k", { v: 2 }]]))).toBe(false);

    const setA = new Set([1, { a: 1 }]);
    const setB = new Set([{ a: 1 }, 1]);
    expect(isEqual(setA, setB)).toBe(true);

    const objA: any = { name: "s" };
    objA.self = objA;
    const objB: any = { name: "s" };
    objB.self = objB;
    expect(isEqual(objA, objB)).toBe(true);
  });

  it("isMatch performs partial deep comparison", () => {
    const obj = { a: 1, b: { c: 2, d: 3 }, e: [1, 2, 3] };
    expect(isMatch(obj, { a: 1 })).toBe(true);
    expect(isMatch(obj, { b: { c: 2 } } as any)).toBe(true);
    expect(isMatch(obj, { e: [1, 2, 3] })).toBe(true);
    expect(isMatch(obj, { e: [1, 2] })).toBe(false);
    expect(isMatch(obj, { f: 1 } as any)).toBe(false);
  });
});
