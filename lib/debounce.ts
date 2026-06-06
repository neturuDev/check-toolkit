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
  options: DebounceOptions = {},
): DebouncedFunction<T> {
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;
  let lastThis: any;
  let lastCallTime: number | undefined;
  let lastInvokeTime = 0;
  const leading = !!options.leading;
  const trailing = options.trailing !== false; // default true
  const maxWait = options.maxWait;
  const maxing = maxWait !== undefined;

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

  function remainingWait(time: number) {
    const sinceLastCall = time - (lastCallTime as number);
    const sinceLastInvoke = time - lastInvokeTime;
    const timeWaiting = wait - sinceLastCall;

    return maxing
      ? Math.min(timeWaiting, (maxWait as number) - sinceLastInvoke)
      : timeWaiting;
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

  function leadingEdge(time: number) {
    lastInvokeTime = time;
    startTimer(timerExpired, wait);
    if (leading) {
      return invoke(time);
    }
    return undefined;
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
    startTimer(timerExpired, remainingWait(now));
  }

  function debounced(this: any, ...args: Parameters<T>) {
    const now = Date.now();
    const isInvoking = shouldInvoke(now);
    lastArgs = args;
    lastThis = this;
    lastCallTime = now;

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(now);
      }
      if (maxing) {
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
    lastInvokeTime = 0;
    lastArgs = lastThis = lastCallTime = undefined;
  };

  debounced.flush = () => {
    if (timerId) {
      return trailingEdge(Date.now());
    }
    return undefined;
  };

  return debounced as DebouncedFunction<T>;
}
