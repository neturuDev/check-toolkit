export interface DebounceOptions {
  leading?: boolean;
  trailing?: boolean;
  maxWait?: number;
}

export interface DebouncedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 0,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  const leading = !!options.leading;
  const trailing = options.trailing !== false; // default true
  const maxWait = options.maxWait;

  function invoke(time: number) {
    lastInvokeTime = time;
    const args = lastArgs!;
    const thisArg = lastThis;
    lastArgs = lastThis = undefined;
    return func.apply(thisArg, args);
  }

  function startTimer(pending: () => void, ms: number) {
    if (timerId) clearTimeout(timerId);
    timerId = setTimeout(pending, ms);
  }

  function shouldInvoke(time: number) {
    if (lastCallTime === undefined) return true;
    const sinceLastCall = time - lastCallTime;
    const sinceLastInvoke = time - lastInvokeTime;
    return (
      sinceLastCall >= wait ||
      sinceLastCall < 0 || // system clock moved backward
      (maxWait !== undefined && sinceLastInvoke >= maxWait)
    );
  }

  function trailingEdge(time: number) {
    timerId = undefined;
    if (trailing && lastArgs) {
      return invoke(time);
    }
    lastArgs = lastThis = undefined;
    return undefined;
  }

  function timerExpired() {
    const now = Date.now();
    if (shouldInvoke(now)) {
      return trailingEdge(now);
    }
    const remaining = wait - (now - (lastCallTime as number));
    startTimer(timerExpired, remaining);
  }

  function debounced(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const isInvoking = shouldInvoke(now);
    lastArgs = args;
    lastThis = this;
    lastCallTime = now;

    if (isInvoking) {
      if (timerId === undefined) {
        // Leading edge
        if (leading) {
          return invoke(now);
        }
        // Schedule a trailing invocation
        startTimer(timerExpired, wait);
      } else if (maxWait !== undefined) {
        // Handle maxWait
        startTimer(timerExpired, wait);
        return invoke(now);
      }
    }
    if (timerId === undefined) {
      startTimer(timerExpired, wait);
    }
  }

  debounced.cancel = () => {
    if (timerId) {
      clearTimeout(timerId);
      timerId = undefined;
    }
    lastArgs = lastThis = lastCallTime = undefined;
  };

  debounced.flush = () => {
    if (timerId) {
      const now = Date.now();
      const result = invoke(now);
      clearTimeout(timerId);
      timerId = undefined;
      return result;
    }
    return undefined;
  };

  return debounced as DebouncedFunction<T>;
}
