import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { delay } from "../lib/promise";

describe("promise helpers", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("delay resolves after the specified time", async () => {
    const promise = delay(300);
    vi.advanceTimersByTime(299);
    await Promise.resolve();
    let settled = false;
    promise.then(() => {
      settled = true;
    });
    await Promise.resolve();
    expect(settled).toBe(false);

    vi.advanceTimersByTime(1);
    await promise;
  });

  it("treats negative values as zero", async () => {
    const promise = delay(-100);
    vi.advanceTimersByTime(0);
    await promise;
  });
});
