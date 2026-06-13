import { describe, it, expect } from "vitest";
import { pick, omit, pickBy, omitBy } from "../lib/object";
import { isNil } from "../lib/base";

describe("object helpers", () => {
  const obj = { a: 1, b: 2, c: 3, d: null as number | null };

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
