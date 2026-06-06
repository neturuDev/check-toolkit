import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { debounce } from "../lib/debounce";

describe("debounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("invokes function on trailing edge with last arguments (default)", () => {
    const fn = vi.fn();
    const deb = debounce(fn, 100);

    deb("first");
    expect(fn).toHaveBeenCalledTimes(0);

    // call again before wait; last args should be used
    vi.advanceTimersByTime(50);
    deb("second");

    vi.advanceTimersByTime(100); // reaches 100ms since last call
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("second");
  });

  it("with leading: true and trailing: false invokes immediately and not on trailing", () => {
    const fn = vi.fn();
    const deb = debounce(fn, 100, { leading: true, trailing: false });

    // immediate
    deb("now");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("now");

    // subsequent calls within wait should not produce trailing call
    deb("later");
    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);

    // after wait, a new call invokes immediately again
    deb("again");
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith("again");
  });

  it("honors maxWait and invokes with the latest arguments", () => {
    const fn = vi.fn();
    const deb = debounce(fn, 100, { maxWait: 200 });

    // series of calls every 50ms
    deb("t0"); // t=0
    vi.advanceTimersByTime(50);
    deb("t50"); // t=50
    vi.advanceTimersByTime(50);
    deb("t100"); // t=100
    vi.advanceTimersByTime(50);
    deb("t150"); // t=150

    // at 200ms since first call, maxWait should force invoke
    vi.advanceTimersByTime(50); // now t=200
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("t150");
  });

  it("cancel prevents a scheduled invocation", () => {
    const fn = vi.fn();
    const deb = debounce(fn, 100);

    deb("will-cancel");
    deb.cancel();
    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(0);
  });

  it("flush invokes pending call immediately and prevents duplicate trailing call", () => {
    const fn = vi.fn();
    const deb = debounce(fn, 100);

    deb("flush-now");
    deb.flush();

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("flush-now");

    vi.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
