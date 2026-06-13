import { describe, it, expect, vi } from "vitest";
import { noop, identity, once } from "../lib/function";

describe("function helpers", () => {
  it("noop returns undefined", () => {
    expect(noop()).toBeUndefined();
  });

  it("identity returns the same value", () => {
    const value = { a: 1 };
    expect(identity(value)).toBe(value);
  });

  it("once invokes the function only once", () => {
    const fn = vi.fn((x: number) => x * 2);
    const wrapped = once(fn);

    expect(wrapped(2)).toBe(4);
    expect(wrapped(3)).toBe(4);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("once retries after a thrown first invocation", () => {
    const fn = vi.fn(() => {
      if (fn.mock.calls.length === 1) {
        throw new Error("boom");
      }
      return "ok";
    });
    const wrapped = once(fn);

    expect(() => wrapped()).toThrow("boom");
    expect(wrapped()).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
