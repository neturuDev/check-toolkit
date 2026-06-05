import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { throttle } from "../lib/throttle";

describe("throttle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("calls immediately by default (leading=true)", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50);
    t("a");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("a");
  });

  it("documents current behavior for leading=false and trailing=true", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50, { leading: false, trailing: true });
    t(1);
    t(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(2);
    // advance to trigger trailing call and assert last call used last args
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith(2);
  });

  it("when trailing=false and leading=true, only the immediate call happens (no trailing)", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50, { leading: true, trailing: false });
    t("first");
    t("second");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("first");
    // advance time long enough that a trailing call would have occurred if enabled
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("when both leading and trailing are false, function is never called", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50, { leading: false, trailing: false });
    t();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("multiple rapid calls within wait produce at most an immediate + one trailing call", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50); // default leading & trailing true
    // initial immediate call
    t("first");
    // rapid calls during wait period
    t("second");
    t("third");
    // still within wait: no extra immediate calls
    expect(fn).toHaveBeenCalledTimes(1);
    // advance to flush trailing
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
    // trailing should have been called with the last arguments
    expect(fn.mock.calls[1]).toEqual(["third"]);
  });

  it("cancel drops scheduled trailing invocation", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50); // leading=true, trailing=true

    t("first"); // immediate
    t("second"); // schedules trailing
    t.cancel();

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenLastCalledWith("first");
  });

  it("flush executes pending trailing invocation immediately", () => {
    const fn = vi.fn();
    const t = throttle(fn, 50); // leading=true, trailing=true

    t("first"); // immediate
    t("second"); // pending trailing with last args
    t.flush();

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("second");

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
