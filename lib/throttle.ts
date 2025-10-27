import { debounce, type DebouncedFunction } from "./debounce";

export interface ThrottleOptions {
  leading?: boolean;
  trailing?: boolean;
}

export interface ThrottledFunction<T extends (...args: any[]) => any>
  extends DebouncedFunction<T> {}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const leading = options.leading !== false; // default true
  const trailing = options.trailing !== false; // default true

  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait, // key difference
  }) as ThrottledFunction<T>;
}
