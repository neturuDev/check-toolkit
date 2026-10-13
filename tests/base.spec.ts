import { runInNewContext } from "node:vm";
import { describe, expect, expectTypeOf, it } from "vitest";
import {
  isArray,
  isArrayLike,
  isBoolean,
  isDate,
  isEmpty,
  isEqual,
  isError,
  isFunction,
  isMap,
  isMatch,
  isNan,
  isNil,
  isNotNaN,
  isNotNil,
  isNotUndefined,
  isNull,
  isNumber,
  isObject,
  isPlainObject,
  isPromise,
  isRegExp,
  isSet,
  isString,
  isSymbol,
  isUndefined,
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

    const maybeName: string | null | undefined = "alice";
    if (isNotNil(maybeName)) {
      expect(maybeName).toBe("alice");
    }
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

  it("isBoolean detects boolean primitives", () => {
    expect(isBoolean(true)).toBe(true);
    expect(isBoolean(false)).toBe(true);
    expect(isBoolean(new Boolean(true))).toBe(false);
    expect(isBoolean(1)).toBe(false);
  });

  it("isPlainObject detects plain objects only", () => {
    expect(isPlainObject({})).toBe(true);
    expect(isPlainObject({ a: 1 })).toBe(true);
    expect(isPlainObject(Object.create(null))).toBe(true);
    expect(isPlainObject([])).toBe(false);
    expect(isPlainObject(null)).toBe(false);
    expect(isPlainObject(new Date())).toBe(false);
    class Box {}
    expect(isPlainObject(new Box())).toBe(false);
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

  it("isDate, isRegExp, isMap, and isSet narrow built-ins and reject lookalikes", () => {
    expect(isDate(new Date(0))).toBe(true);
    expect(isDate(new Date(Number.NaN))).toBe(true);
    expect(isDate("2020-01-01")).toBe(false);
    class FakeDate {
      get [Symbol.toStringTag]() {
        return "Date";
      }
      getTime() {
        return 0;
      }
    }
    class SubDate extends Date {}
    expect(isDate(new FakeDate())).toBe(false);
    const Clock = class Date {
      get [Symbol.toStringTag]() {
        return "Date";
      }
      getTime() {
        return 0;
      }
    };
    expect(new Clock() instanceof globalThis.Date).toBe(false);
    expect(isDate(new Clock())).toBe(true);
    expect(isDate(new SubDate(0))).toBe(true);
    expect(isDate(new SubDate(Number.NaN))).toBe(true);

    expect(isRegExp(/a/i)).toBe(true);
    expect(isRegExp(new RegExp("a"))).toBe(true);
    expect(isRegExp("a")).toBe(false);
    expect(isRegExp({ [Symbol.toStringTag]: "RegExp" })).toBe(false);

    class MyMap extends Map {}
    class MySet extends Set {}
    expect(isMap(new Map())).toBe(true);
    expect(isMap(new MyMap())).toBe(true);
    expect(isMap(new WeakMap())).toBe(false);
    expect(isMap(new Set())).toBe(false);
    expect(isMap({ [Symbol.toStringTag]: "Map" })).toBe(false);

    expect(isSet(new Set())).toBe(true);
    expect(isSet(new MySet())).toBe(true);
    expect(isSet(new WeakSet())).toBe(false);
    expect(isSet({ [Symbol.toStringTag]: "Set" })).toBe(false);

    const value: unknown = new Date(0);
    if (isDate(value)) {
      expectTypeOf(value).toEqualTypeOf<Date>();
      expect(value.getTime()).toBe(0);
    }
    const map: unknown = new Map<string, number>();
    if (isMap(map)) {
      expectTypeOf(map).toEqualTypeOf<Map<unknown, unknown>>();
    }
  });

  it("isError accepts error subclasses and rejects plain objects", () => {
    class AppError extends Error {}

    expect(isError(new Error("x"))).toBe(true);
    expect(isError(new TypeError("x"))).toBe(true);
    expect(isError(new AggregateError([], "x"))).toBe(true);
    expect(isError(new DOMException("x"))).toBe(true);
    expect(isError(new AppError("x"))).toBe(true);
    expect(isError({ message: "x", name: "Error" })).toBe(false);
    class FakeError {
      name = "Error";
      message = "x";
      get [Symbol.toStringTag]() {
        return "Error";
      }
    }
    expect(isError(new FakeError())).toBe(false);
    expect(isError({ message: "x", name: "Error", [Symbol.toStringTag]: "Error" })).toBe(
      false,
    );
    expect(isError("Error")).toBe(false);
    expect(isError(null)).toBe(false);

    const value: unknown = new TypeError("x");
    if (isError(value)) {
      expectTypeOf(value).toEqualTypeOf<Error>();
    }
  });

  it("isPromise accepts native promises and rejects thenables", () => {
    expect(isPromise(Promise.resolve(1))).toBe(true);
    expect(isPromise(Promise.reject(new Error("x")).catch(() => undefined))).toBe(true);

    async function load() {
      return 1;
    }
    expect(isPromise(load())).toBe(true);

    class MyPromise<T> extends Promise<T> {}
    expect(isPromise(new MyPromise((resolve) => resolve(1)))).toBe(true);
    class FakePromise {
      get [Symbol.toStringTag]() {
        return "Promise";
      }
      then() {}
    }
    expect(isPromise({ then() {} })).toBe(false);
    expect(isPromise(new FakePromise())).toBe(false);
    expect(isPromise({ [Symbol.toStringTag]: "Promise", then() {} })).toBe(false);
    expect(isPromise(null)).toBe(false);

    const value: unknown = Promise.resolve(1);
    if (isPromise(value)) {
      expectTypeOf(value).toEqualTypeOf<Promise<unknown>>();
    }
  });

  it("recognizes built-ins created in another realm", () => {
    const foreignDate = runInNewContext("new Date(0)");
    const foreignRegExp = runInNewContext("/a/i");
    const foreignMap = runInNewContext("new Map()");
    const foreignSet = runInNewContext("new Set()");
    const foreignError = runInNewContext("new Error('x')");
    const foreignAggregateError = runInNewContext("new AggregateError([], 'x')");
    const foreignPromise = runInNewContext("Promise.resolve(1)");

    expect(foreignDate instanceof Date).toBe(false);
    expect(foreignError instanceof Error).toBe(false);
    expect(foreignAggregateError instanceof Error).toBe(false);
    expect(foreignPromise instanceof Promise).toBe(false);

    expect(isDate(foreignDate)).toBe(true);
    expect(isRegExp(foreignRegExp)).toBe(true);
    expect(isMap(foreignMap)).toBe(true);
    expect(isSet(foreignSet)).toBe(true);
    expect(isError(foreignError)).toBe(true);
    expect(isError(foreignAggregateError)).toBe(true);
    expect(isPromise(foreignPromise)).toBe(true);
  });
});
