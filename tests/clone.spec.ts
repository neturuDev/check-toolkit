import { describe, it, expect } from "vitest";
import { clone, cloneDeep, cloneWith, cloneDeepWith } from "../lib/clone";

describe("clone (shallow)", () => {
  it("clones arrays shallowly", () => {
    const nested = { a: 1 };
    const arr = [1, nested];
    const c = clone(arr);
    expect(Object.is(c, arr)).toBe(false);
    expect(c[0]).toBe(1);
    expect(c[1]).toBe(nested); // shallow: same nested reference
  });

  it("clones plain objects shallowly", () => {
    const nested = { x: 2 };
    const obj = { a: 1, b: nested };
    const c = clone(obj);
    expect(Object.is(c, obj)).toBe(false);
    expect(c.a).toBe(1);
    expect(c.b).toBe(nested); // shallow copy keeps reference
  });

  it("returns primitives unchanged", () => {
    expect(clone(42)).toBe(42);
    expect(clone("str")).toBe("str");
    expect(clone(null)).toBe(null);
    expect(clone(undefined)).toBe(undefined);
  });
});

describe("cloneDeep", () => {
  it("deep clones nested objects/arrays", () => {
    const obj = { a: { b: [1, { c: 3 }] } };
    const c = cloneDeep(obj);
    expect(Object.is(c, obj)).toBe(false);
    expect(Object.is(c.a, obj.a)).toBe(false);
    expect(Object.is(c.a.b, obj.a.b)).toBe(false);
    expect(Object.is(c.a.b[1], obj.a.b[1])).toBe(false);
    expect(c).toEqual(obj);
    // Mutating original should not affect clone
    (obj.a.b[1] as any).c = 999;
    expect((c.a.b[1] as any).c).toBe(3);
  });

  it("clones Date and RegExp instances", () => {
    const d = new Date(2020, 1, 1);
    const r = /test/gi;
    const cd = cloneDeep(d);
    const cr = cloneDeep(r);
    expect(Object.is(cd, d)).toBe(false);
    expect(cd.getTime()).toBe(d.getTime());
    expect(Object.is(cr, r)).toBe(false);
    expect(cr.source).toBe(r.source);
    expect(cr.flags).toBe(r.flags);
  });

  it("deep clones Map and Set values", () => {
    const valueObj = { v: 1 };
    const m = new Map<string, any>([["k", valueObj]]);
    const s = new Set<any>([valueObj]);
    const cm = cloneDeep(m);
    const cs = cloneDeep(s);
    expect(Object.is(cm, m)).toBe(false);
    expect(Object.is(cm.get("k"), valueObj)).toBe(false);
    expect(cm.get("k")).toEqual(valueObj);
    // For Set, find an equivalent object inside the cloned set
    const found = Array.from(cs).find((x) => (x as any).v === 1);
    expect(found).toBeDefined();
    expect(Object.is(found, valueObj)).toBe(false);
  });

  it("preserves circular references", () => {
    const obj: any = { name: "root" };
    obj.self = obj;
    const cloned = cloneDeep(obj);
    expect(Object.is(cloned, obj)).toBe(false);
    expect(cloned.self).toBe(cloned);
    // array circular
    const arr: any[] = [];
    arr.push(arr);
    const clonedArr = cloneDeep(arr);
    expect(clonedArr[0]).toBe(clonedArr);
  });
});

describe("cloneWith (shallow with customizer)", () => {
  it("uses customizer for top-level value only (shallow)", () => {
    // top-level customization
    expect(cloneWith(1, () => 2)).toBe(2);

    const nested = { n: 1 };
    const obj = { a: nested };
    // customizer sees the top-level object; returning a value replaces it entirely
    const replaced = cloneWith(obj, (v) => {
      if (v && typeof v === "object" && "a" in v) return { replaced: true };
      return undefined;
    });
    expect((replaced as any).replaced).toBe(true);
  });

  it("does not apply customizer to nested items when shallow", () => {
    const obj = { a: { b: 1 } };
    const result = cloneWith(obj, (v) => {
      if (typeof v === "number") return 999;
      return undefined;
    });
    // shallow clone => nested number unchanged (customizer only used on top-level)
    expect((result as any).a.b).toBe(1);
  });
});

describe("cloneDeepWith (deep with customizer)", () => {
  it("applies customizer recursively", () => {
    const obj = { a: { b: 1, c: [2, 3] }, d: 4 };
    const cloned = cloneDeepWith(obj, (v) => {
      if (typeof v === "number") return v * 10;
      return undefined;
    });
    expect((cloned as any).a.b).toBe(10);
    expect((cloned as any).a.c[0]).toBe(20);
    expect((cloned as any).d).toBe(40);
  });

  it("fallbacks to normal cloning when customizer returns undefined", () => {
    const obj = { a: { b: 2 } };
    const cloned = cloneDeepWith(obj, () => undefined);
    expect(cloned).toEqual(obj);
    expect(Object.is((cloned as any).a, obj.a)).toBe(false);
  });
});
