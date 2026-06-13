import { describe, it, expect } from "vitest";
import {
  compact,
  countBy,
  difference,
  differenceBy,
  differenceWith,
  groupBy,
  keyBy,
  partition,
  sortBy,
  uniq,
  uniqBy,
} from "../lib/array";

describe("array helpers", () => {
  describe("difference", () => {
    it("removes values present in other arrays", () => {
      expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]);
    });

    it("handles multiple exclude arrays", () => {
      expect(difference([1, 2, 3, 4], [2], [3, 99])).toEqual([1, 4]);
    });

    it("treats NaN as equal to NaN (SameValueZero)", () => {
      const input = [NaN, 1, 2];
      expect(difference(input, [NaN])).toEqual([1, 2]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior with invalid input
      expect(difference(null, [1, 2])).toEqual([]);
      // @ts-expect-error
      expect(difference(undefined, [1])).toEqual([]);
    });
  });

  describe("differenceBy", () => {
    it("excludes by iteratee result", () => {
      const arr = [2.1, 1.2, 3.5];
      const excluded = [2.3, 3.9];
      expect(differenceBy(arr, excluded, Math.floor)).toEqual([1.2]);
    });

    it("works with object iteratee", () => {
      const arr = [{ x: 1 }, { x: 2 }, { x: 3 }];
      const excluded = [{ x: 2 }];
      expect(differenceBy(arr, excluded, (o) => o.x)).toEqual([
        { x: 1 },
        { x: 3 },
      ]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior
      expect(differenceBy(null, [{ x: 1 }], (o: any) => o.x)).toEqual([]);
    });
  });

  describe("differenceWith", () => {
    it("excludes items when comparator returns true", () => {
      const a = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const b = [{ id: 2 }];
      const cmp = (u: { id: number }, v: { id: number }) => u.id === v.id;
      expect(differenceWith(a, b, cmp)).toEqual([{ id: 1 }, { id: 3 }]);
    });

    it("returns empty array when first argument is not an array", () => {
      // @ts-expect-error testing runtime behavior
      expect(differenceWith(undefined, [{ id: 1 }], () => false)).toEqual([]);
    });
  });

  describe("keyBy", () => {
    it("keys by iteratee function", () => {
      const arr = [
        { id: "a", v: 1 },
        { id: "b", v: 2 },
      ];
      const result = keyBy(arr, (item) => item.id);
      expect(result).toEqual({ a: { id: "a", v: 1 }, b: { id: "b", v: 2 } });
    });

    it("keys by property name (keyof)", () => {
      const arr = [
        { id: 1, name: "one" },
        { id: 2, name: "two" },
        { id: 1, name: "uno" },
      ];
      const result = keyBy(arr, "id");
      expect(result).toEqual({
        "1": { id: 1, name: "uno" },
        "2": { id: 2, name: "two" },
      });
    });

    it("works with empty array", () => {
      expect(keyBy([], "id")).toEqual({});
    });
  });

  describe("compact", () => {
    it("removes falsy values", () => {
      expect(compact([0, 1, false, 2, "", 3, null, undefined])).toEqual([
        1, 2, 3,
      ]);
    });
  });

  describe("uniq", () => {
    it("removes duplicate values", () => {
      expect(uniq([1, 2, 1, 3, 2])).toEqual([1, 2, 3]);
    });
  });

  describe("uniqBy", () => {
    it("removes duplicates by iteratee", () => {
      expect(uniqBy([2.1, 1.2, 2.3], Math.floor)).toEqual([2.1, 1.2]);
    });
  });

  describe("groupBy", () => {
    it("groups items by iteratee", () => {
      const items = [
        { type: "fruit", name: "apple" },
        { type: "fruit", name: "banana" },
        { type: "veg", name: "carrot" },
      ];
      expect(groupBy(items, "type")).toEqual({
        fruit: [
          { type: "fruit", name: "apple" },
          { type: "fruit", name: "banana" },
        ],
        veg: [{ type: "veg", name: "carrot" }],
      });
    });
  });

  describe("countBy", () => {
    it("counts items by property name", () => {
      const users = [
        { status: "active" },
        { status: "active" },
        { status: "pending" },
      ];
      expect(countBy(users, "status")).toEqual({ active: 2, pending: 1 });
    });

    it("counts items by iteratee function", () => {
      expect(countBy([2.1, 1.2, 2.3, 1.8], Math.floor)).toEqual({
        1: 2,
        2: 2,
      });
    });

    it("returns empty object for empty array", () => {
      expect(countBy([], "id")).toEqual({});
    });
  });

  describe("partition", () => {
    it("splits array by predicate", () => {
      expect(partition([1, 2, 3, 4], (n) => n % 2 === 0)).toEqual([
        [2, 4],
        [1, 3],
      ]);
    });
  });

  describe("sortBy", () => {
    it("sorts by property name", () => {
      const users = [
        { name: "bob", age: 30 },
        { name: "alice", age: 20 },
      ];
      expect(sortBy(users, "age")).toEqual([
        { name: "alice", age: 20 },
        { name: "bob", age: 30 },
      ]);
    });

    it("compares numbers numerically", () => {
      const items = [{ n: 10 }, { n: 2 }, { n: 30 }];
      expect(sortBy(items, "n")).toEqual([{ n: 2 }, { n: 10 }, { n: 30 }]);
    });

    it("compares mixed string and number keys without JS coercion", () => {
      const items = [{ k: 10 }, { k: "2" }, { k: 2 }];
      expect(sortBy(items, (item) => item.k)).toEqual([
        { k: "2" },
        { k: 2 },
        { k: 10 },
      ]);
    });

    it("allows only sortable property keys", () => {
      const users = [{ age: 30, meta: { active: true } }];
      expect(sortBy(users, "age")).toEqual([{ age: 30, meta: { active: true } }]);
      // @ts-expect-error meta values are not string | number
      sortBy(users, "meta");
    });
  });
});
