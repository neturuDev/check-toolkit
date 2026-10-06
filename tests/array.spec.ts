import { describe, expect, expectTypeOf, it } from "vitest";
import {
  chunk,
  compact,
  countBy,
  difference,
  differenceBy,
  differenceWith,
  flatten,
  groupBy,
  intersection,
  intersectionBy,
  keyBy,
  maxBy,
  minBy,
  partition,
  sortBy,
  sum,
  sumBy,
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

    it("stores constructor and __proto__ as own keys", () => {
      const keyed = keyBy(["constructor", "__proto__"], (item) => item);
      expect(keyed.constructor).toBe("constructor");
      expect(Object.getOwnPropertyDescriptor(keyed, "__proto__")?.value).toBe(
        "__proto__",
      );
      expect(Object.getPrototypeOf(keyed)).toBe(Object.prototype);
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
      const grouped = groupBy(["constructor", "__proto__"], (item) => item);
      expect(grouped.constructor).toEqual(["constructor"]);
      expect(Object.getOwnPropertyDescriptor(grouped, "__proto__")?.value).toEqual([
        "__proto__",
      ]);
      expect(Object.getPrototypeOf(grouped)).toBe(Object.prototype);

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

    it("keeps constructor and __proto__ as own keys", () => {
      const counted = countBy(
        ["constructor", "__proto__", "constructor"],
        (item) => item,
      );
      expect(counted.constructor).toBe(2);
      expect(Object.getOwnPropertyDescriptor(counted, "__proto__")?.value).toBe(1);
      expect(Object.getPrototypeOf(counted)).toBe(Object.prototype);
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

  describe("intersection", () => {
    it("keeps unique values present in every array, in first-array order", () => {
      expect(intersection([2, 1, 2, 3], [1, 2], [2, 3, 4])).toEqual([2]);
    });

    it("returns unique values when no other arrays are given", () => {
      expect(intersection([1, 1, 2])).toEqual([1, 2]);
    });

    it("returns an empty array when any other list is empty or not an array", () => {
      expect(intersection([1, 2], [])).toEqual([]);
      // @ts-expect-error testing runtime behavior
      expect(intersection([1, 2], null)).toEqual([]);
      // @ts-expect-error testing runtime behavior
      expect(intersection(null, [1])).toEqual([]);
    });

    it("treats NaN as equal and keeps the first -0", () => {
      expect(intersection([1, Number.NaN, 1], [Number.NaN])).toEqual([Number.NaN]);
      const zeros = intersection([-0], [0]);
      expect(Object.is(zeros[0], -0)).toBe(true);
    });

    it("compares objects by reference", () => {
      const left = { id: 1 };
      const right = { id: 1 };
      expect(intersection([left], [right])).toEqual([]);
      expect(intersection([left], [left])).toEqual([left]);
    });
  });

  describe("intersectionBy", () => {
    it("compares by iteratee and keeps the first match", () => {
      const left = [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 1, name: "c" },
      ];
      expect(intersectionBy(left, [{ id: 2, name: "other" }], "id")).toEqual([
        { id: 2, name: "b" },
      ]);
      expect(intersectionBy(left, [{ id: 1, name: "other" }], (item) => item.id)).toEqual([
        { id: 1, name: "a" },
      ]);
    });

    it("compares numbers by Math.floor", () => {
      expect(intersectionBy([2.1, 1.2, 2.3], [2.4], Math.floor)).toEqual([2.1]);
    });

    it("returns an empty array when an argument is not an array", () => {
      // @ts-expect-error testing runtime behavior
      expect(intersectionBy(null, [{ id: 1 }], "id")).toEqual([]);
    });
  });

  describe("chunk", () => {
    it("splits an array into groups of the given size", () => {
      const input = [1, 2, 3, 4, 5];
      const parts = chunk(input, 2);
      expect(parts).toEqual([
        [1, 2],
        [3, 4],
        [5],
      ]);
      parts[0]![0] = 9;
      expect(input[0]).toBe(1);
    });

    it("truncates a finite size toward zero and rejects unusable sizes", () => {
      expect(chunk([1, 2, 3, 4, 5], 2.9)).toEqual([
        [1, 2],
        [3, 4],
        [5],
      ]);
      expect(chunk([1, 2], 1.2)).toEqual([[1], [2]]);
      expect(chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
      expect(chunk([1, 2], 0)).toEqual([]);
      expect(chunk([1, 2], -1)).toEqual([]);
      expect(chunk([1], Number.NaN)).toEqual([]);
      expect(chunk([1], Number.POSITIVE_INFINITY)).toEqual([]);
      expect(chunk([], 2)).toEqual([]);
    });
  });

  describe("flatten", () => {
    it("flattens one level and leaves deeper arrays nested", () => {
      expect(flatten([1, [2, [3]], 4])).toEqual([1, 2, [3], 4]);
      expect(flatten([[1, 2], [], [3]])).toEqual([1, 2, 3]);
      expect(flatten(["ab", ["c"]])).toEqual(["ab", "c"]);
      expect(flatten([])).toEqual([]);
    });

    it("does not flatten strings or array-like objects", () => {
      const arrayLike = { length: 1, 0: "a" };
      expect(flatten([arrayLike, ["b"]])).toEqual([arrayLike, "b"]);
    });

    it("unwraps one array level in the return type", () => {
      expectTypeOf(flatten([1, [2, [3]], 4])).toEqualTypeOf<
        (number | number[])[]
      >();
      expectTypeOf(flatten([[1, 2], [3]])).toEqualTypeOf<number[]>();
    });
  });

  describe("sum and sumBy", () => {
    it("keeps zero and does not treat it as missing", () => {
      expect(sum([0, 0])).toBe(0);
      expect(sumBy([{ n: 0 }, { n: null }, { n: 2 }], "n")).toBe(2);
      expect(minBy([0, 1, -1], (n) => n)).toBe(-1);
      expect(maxBy([0, -1], (n) => n)).toBe(0);
    });

    it("sums numbers and treats an empty array as zero", () => {
      expect(sum([1, 2, 3])).toBe(6);
      expect(sum([])).toBe(0);
      expect(sum([1, , 2] as number[])).toBe(3);
      expect(sum([1, Number.POSITIVE_INFINITY])).toBe(Number.POSITIVE_INFINITY);
      expect(sum([1, Number.NaN, 2])).toBeNaN();
    });

    it("sums by property or iteratee and skips nullish values", () => {
      const items: Array<{ price: number | null | undefined }> = [
        { price: 1 },
        { price: null },
        { price: undefined },
        { price: 2 },
      ];
      expect(sumBy(items, "price")).toBe(3);
      expect(sumBy(items, (item) => item.price)).toBe(3);
      expect(sumBy([], (item: { n: number }) => item.n)).toBe(0);
    });

    it("returns NaN when a present value is not a finite or infinite number", () => {
      const mixed = [{ v: 1 }, { v: "2" }] as Array<{ v: number }>;
      expect(sumBy(mixed, "v")).toBeNaN();
    });

    it("allows only numeric property keys", () => {
      const users = [{ age: 30, meta: { active: true } }];
      expect(sumBy(users, "age")).toBe(30);
      // @ts-expect-error meta values are not numbers
      sumBy(users, "meta");
    });
  });

  describe("minBy and maxBy", () => {
    it("returns the first extreme element and ignores nullish and NaN", () => {
      const items = [
        { name: "a", n: 1 },
        { name: "b", n: 1 },
        { name: "c", n: 2 },
      ];
      expect(minBy(items, "n")).toEqual({ name: "a", n: 1 });
      expect(maxBy(items, "n")).toEqual({ name: "c", n: 2 });
      expect(minBy(["b", "a", "c"], (item) => item)).toBe("a");
      expect(maxBy(["b", "", "c"], (item) => item)).toBe("c");
      expect(minBy(["b", ""], (item) => item)).toBe("");

      const read = (value: number | null | undefined) => value;
      expect(minBy([null, undefined, Number.NaN, 4, 2], read)).toBe(2);
      expect(maxBy([null, undefined, Number.NaN, 4, 2], read)).toBe(4);
      expect(minBy([Number.POSITIVE_INFINITY, 1], (n) => n)).toBe(1);
      expect(maxBy([1, Number.POSITIVE_INFINITY], (n) => n)).toBe(
        Number.POSITIVE_INFINITY,
      );
    });

    it("returns undefined when nothing is comparable", () => {
      expect(minBy([], (n: number) => n)).toBeUndefined();
      expect(maxBy([null, undefined], (n) => n)).toBeUndefined();
      expect(minBy([Number.NaN, Number.NaN], (n) => n)).toBeUndefined();
    });

    it("matches sortBy for mixed string and number keys", () => {
      const items = [{ k: 10 }, { k: "2" }, { k: 2 }];
      const iteratee = (item: { k: string | number }) => item.k;
      expect(minBy(items, iteratee)).toEqual(sortBy(items, iteratee)[0]);
      expect(maxBy(items, iteratee)).toEqual(sortBy(items, iteratee).at(-1));
    });

    it("does not mutate the input and rejects non-sortable keys", () => {
      const input = [{ n: 2 }, { n: 1 }];
      expect(minBy(input, "n")).toEqual({ n: 1 });
      expect(input).toEqual([{ n: 2 }, { n: 1 }]);

      const users = [{ age: 30, meta: { active: true } }];
      expect(maxBy(users, "age")).toEqual(users[0]);
      // @ts-expect-error meta values are not string or number
      minBy(users, "meta");
    });

    it("types the result as the element or undefined", () => {
      const youngest = minBy([{ age: 1, name: "a" }], "age");
      expectTypeOf(youngest).toEqualTypeOf<
        { age: number; name: string } | undefined
      >();
    });
  });
});
