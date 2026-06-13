import { describe, it, expect } from "vitest";
import { clamp } from "../lib/math";

describe("math helpers", () => {
  it("clamps values within the range", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it("normalizes bounds when min is greater than max", () => {
    expect(clamp(5, 10, 0)).toBe(5);
    expect(clamp(15, 10, 0)).toBe(10);
    expect(clamp(-1, 10, 0)).toBe(0);
  });
});
