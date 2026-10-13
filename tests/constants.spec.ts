import { describe, it, expect } from "vitest";
import { OBJECT_TYPES } from "../lib/constants";

describe("OBJECT_TYPES constants", () => {
  it("exports the expected keys", () => {
    const keys = Object.keys(OBJECT_TYPES).sort();
    expect(keys).toEqual(
      [
        "array",
        "object",
        "arguments",
        "string",
        "function",
        "date",
        "regExp",
        "map",
        "set",
      ].sort()
    );
  });

  it("contains the expected literal values", () => {
    expect(OBJECT_TYPES.array).toBe("[object Array]");
    expect(OBJECT_TYPES.object).toBe("[object Object]");
    expect(OBJECT_TYPES.arguments).toBe("[object Arguments]");
    expect(OBJECT_TYPES.string).toBe("[object String]");
    expect(OBJECT_TYPES.function).toBe("[object Function]");
    expect(OBJECT_TYPES.date).toBe("[object Date]");
    expect(OBJECT_TYPES.regExp).toBe("[object RegExp]");
    expect(OBJECT_TYPES.map).toBe("[object Map]");
    expect(OBJECT_TYPES.set).toBe("[object Set]");
  });
});
