import { describe, expect, expectTypeOf, it } from "vitest";
import { isNil } from "../lib/base";
import { mapValues, omit, omitBy, pick, pickBy } from "../lib/object";

describe("object helpers", () => {
  const obj = { a: 1, b: 2, c: 3, d: null as number | null };

  describe("mapValues", () => {
    it("maps own values without mutating the source", () => {
      const source = { a: 1, b: 2 };
      expect(mapValues(source, (value) => value * 2)).toEqual({ a: 2, b: 4 });
      expect(source).toEqual({ a: 1, b: 2 });
    });

    it("passes the key and includes symbol keys", () => {
      const sym = Symbol("id");
      const seen: PropertyKey[] = [];
      const mapped = mapValues({ a: 1, [sym]: 2 }, (value, key) => {
        seen.push(key);
        return value + 1;
      });
      expect(mapped).toEqual({ a: 2, [sym]: 3 });
      expect(seen).toEqual(["a", sym]);
    });

    it("skips non-enumerable symbols", () => {
      const hidden = Symbol("hidden");
      const source = { a: 1 };
      Object.defineProperty(source, hidden, { value: 2, enumerable: false });
      expect(mapValues(source, (value) => Number(value) + 1)).toEqual({ a: 2 });
    });

    it("copies an own __proto__ property without changing the prototype", () => {
      const source = {};
      Object.defineProperty(source, "__proto__", {
        value: 1,
        enumerable: true,
      });
      const mapped = mapValues(source, (value) => Number(value) + 1);
      expect(Object.getPrototypeOf(mapped)).toBe(Object.prototype);
      expect(Object.getOwnPropertyDescriptor(mapped, "__proto__")?.value).toBe(2);
    });

    it("ignores inherited properties", () => {
      const parent = { inherited: 1 };
      const child = Object.create(parent) as { inherited: number; a: number };
      child.a = 1;
      expect(mapValues(child, (value) => value + 1)).toEqual({ a: 2 });
    });

    it("preserves keys and replaces the value type", () => {
      const mapped = mapValues({ a: 1, b: 2 }, (value) => value > 1);
      expectTypeOf(mapped).toEqualTypeOf<{ a: boolean; b: boolean }>();
    });
  });

  describe("pick", () => {
    it("picks selected keys", () => {
      expect(pick(obj, ["a", "c"])).toEqual({ a: 1, c: 3 });
    });

    it("ignores keys that are not own properties", () => {
      const source = Object.create({ inherited: true });
      source.a = 1;
      expect(pick(source, ["a", "inherited" as "a"])).toEqual({ a: 1 });
    });

    it("picks numeric keys", () => {
      const source: { 123: string; a: number } = { 123: "x", a: 1 };
      expect(pick(source, [123])).toEqual({ 123: "x" });
    });

    it("picks __proto__ without polluting the result", () => {
      const source = {};
      const payload = { admin: true };
      Object.defineProperty(source, "__proto__", {
        value: payload,
        enumerable: true,
      });
      const picked = pick(source, ["__proto__" as never]);
      expect(Object.getPrototypeOf(picked)).toBe(Object.prototype);
      expect(Object.getOwnPropertyDescriptor(picked, "__proto__")?.value).toBe(payload);
    });

    it("picks symbol keys", () => {
      const sym = Symbol("id");
      const source = { a: 1, [sym]: 2 };
      expect(pick(source, [sym])).toEqual({ [sym]: 2 });
    });
  });

  describe("omit", () => {
    it("omits selected keys", () => {
      expect(omit(obj, ["b", "d"])).toEqual({ a: 1, c: 3 });
    });

    it("omits symbol keys and keeps other symbol properties", () => {
      const sym = Symbol("id");
      const keep = Symbol("keep");
      const source = { a: 1, [sym]: 2, [keep]: 3 };
      expect(omit(source, [sym])).toEqual({ a: 1, [keep]: 3 });
    });
  });

  describe("pickBy", () => {
    it("keeps entries matching the predicate", () => {
      expect(pickBy(obj, (value) => value != null && value > 1)).toEqual({
        b: 2,
        c: 3,
      });
    });

    it("includes symbol keys", () => {
      const sym = Symbol("id");
      const source = { a: 1, [sym]: 2 };
      expect(pickBy(source, (_, key) => key === sym)).toEqual({ [sym]: 2 });
    });
  });

  describe("omitBy", () => {
    it("removes entries matching the predicate", () => {
      expect(omitBy(obj, isNil)).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("includes symbol keys", () => {
      const sym = Symbol("id");
      const source = { a: null, [sym]: 2 };
      expect(omitBy(source, isNil)).toEqual({ [sym]: 2 });
    });
  });
});
