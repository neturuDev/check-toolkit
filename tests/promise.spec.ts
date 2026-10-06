import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { delay, timeout, TimeoutError } from "../lib/promise";

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

  it("waits the full time when the delay exceeds the 32-bit timer limit", async () => {
    const limit = 2_147_483_647;
    const promise = delay(limit + 25);
    let settled = false;
    void promise.then(() => {
      settled = true;
    });

    await vi.advanceTimersByTimeAsync(limit);
    await Promise.resolve();
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(25);
    await promise;
    expect(settled).toBe(true);
  });

  it("throws TypeError for non-finite and unschedulable delays", () => {
    expect(() => delay(Number.NaN)).toThrow(TypeError);
    expect(() => delay(Number.POSITIVE_INFINITY)).toThrow(TypeError);
    expect(() => delay(Number.MAX_VALUE)).toThrow(TypeError);
  });

  it("treats negative values as zero", async () => {
    const promise = delay(-100);
    vi.advanceTimersByTime(0);
    await promise;
  });

  it("resolves when the promise settles before the deadline", async () => {
    const result = timeout(delay(50).then(() => "ok"), 200);
    await vi.advanceTimersByTimeAsync(50);
    await expect(result).resolves.toBe("ok");
    await vi.advanceTimersByTimeAsync(200);
    await expect(result).resolves.toBe("ok");
  });

  it("rejects with TimeoutError when the promise is too slow", async () => {
    const result = timeout(delay(500).then(() => "late"), 100);
    const captured = result.then(
      () => {
        throw new Error("expected TimeoutError");
      },
      (error: unknown) => error,
    );
    await vi.advanceTimersByTimeAsync(100);
    const error = await captured;
    expect(error).toBeInstanceOf(TimeoutError);
    expect(error).toBeInstanceOf(Error);
    expect(error).toMatchObject({
      name: "TimeoutError",
      message: "Timed out after 100ms",
      timeoutMs: 100,
    });
  });

  it("propagates the original rejection", async () => {
    const failing = Promise.reject(new Error("boom"));
    await expect(timeout(failing, 1000)).rejects.toThrow("boom");
  });

  it("lets an already settled promise win at ms 0", async () => {
    await expect(timeout(Promise.resolve(7), 0)).resolves.toBe(7);
  });

  it("waits the full deadline when it exceeds the 32-bit timer limit", async () => {
    const limit = 2_147_483_647;
    let resolvePending: (value: string) => void = () => {};
    const pending = new Promise<string>((resolve) => {
      resolvePending = resolve;
    });
    const result = timeout(pending, limit + 25);
    const captured = result.then(
      (value) => value,
      (error: unknown) => error,
    );

    await vi.advanceTimersByTimeAsync(limit);
    await expect(Promise.race([captured, Promise.resolve("pending")])).resolves.toBe(
      "pending",
    );

    await vi.advanceTimersByTimeAsync(25);
    await expect(captured).resolves.toBeInstanceOf(TimeoutError);
    resolvePending("too late");
  });

  it("treats negative ms as a zero wait", async () => {
    let resolvePending: (value: string) => void = () => {};
    const pending = new Promise<string>((resolve) => {
      resolvePending = resolve;
    });
    const result = timeout(pending, -10);
    const assertion = expect(result).rejects.toMatchObject({ timeoutMs: 0 });
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
    resolvePending("too late");
  });

  it("rejects and clears the timer when then throws synchronously", async () => {
    const thenable = {
      then() {
        throw new Error("then failed");
      },
    } as PromiseLike<never>;
    const clear = vi.spyOn(globalThis, "clearTimeout");
    try {
      await expect(timeout(thenable, 1000)).rejects.toThrow("then failed");
      expect(clear).toHaveBeenCalled();
    } finally {
      clear.mockRestore();
    }
  });

  it("accepts a thenable that settles synchronously", async () => {
    const thenable = {
      then(onFulfilled?: ((value: string) => void) | null) {
        onFulfilled?.("sync");
      },
    } as PromiseLike<string>;
    await expect(timeout(thenable, 0)).resolves.toBe("sync");
  });

  it("throws TypeError for a non-finite deadline, an unschedulable deadline, or a non-thenable", () => {
    expect(() => timeout(Promise.resolve(1), Number.NaN)).toThrow(TypeError);
    expect(() => timeout(Promise.resolve(1), Number.POSITIVE_INFINITY)).toThrow(
      TypeError,
    );
    expect(() => timeout(Promise.resolve(1), Number.MAX_VALUE)).toThrow(TypeError);
    expect(() => timeout(null as unknown as Promise<number>, 10)).toThrow(TypeError);
  });

  it("clears the timer when the promise wins", async () => {
    const clear = vi.spyOn(globalThis, "clearTimeout");
    try {
      await expect(timeout(Promise.resolve(1), 1000)).resolves.toBe(1);
      expect(clear).toHaveBeenCalled();
    } finally {
      clear.mockRestore();
    }
  });
});
