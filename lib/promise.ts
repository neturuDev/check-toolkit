/** Largest delay `setTimeout` accepts before a 32-bit overflow (often firing in 1ms). */
const MAX_TIMER_MS = 2_147_483_647;

const startTimer = (ms: number, onFire: () => void): { clear: () => void } => {
  let current: ReturnType<typeof setTimeout> | undefined;
  let cleared = false;

  const arm = (remaining: number) => {
    const slice = remaining > MAX_TIMER_MS ? MAX_TIMER_MS : remaining;
    current = setTimeout(() => {
      if (cleared) return;
      const next = remaining - slice;
      if (next > 0) {
        arm(next);
        return;
      }
      onFire();
    }, slice);
  };

  arm(ms);

  return {
    clear() {
      cleared = true;
      clearTimeout(current);
    },
  };
};

/**
 * Resolves after the specified number of milliseconds.
 * Negative and non-finite `ms` (`NaN`, `Infinity`) wait 0.
 * Delays above the 32-bit timer limit are split so the host timer does not overflow.
 *
 * @example
 * await delay(300); // waits 300ms
 */
export const delay = (ms: number): Promise<void> => {
  const wait = Math.max(0, ms);

  return new Promise((resolve) => {
    startTimer(Number.isFinite(wait) ? wait : 0, resolve);
  });
};

/**
 * Rejected by {@link timeout} when `promise` does not settle in time.
 * `timeoutMs` is the wait that was used (`ms` below 0 is treated as 0).
 */
export class TimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Timed out after ${timeoutMs}ms`);
    this.name = "TimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

const isThenable = (value: unknown): value is PromiseLike<unknown> => {
  if (typeof value !== "object" && typeof value !== "function") return false;
  if (value === null) return false;
  return typeof (value as { then?: unknown }).then === "function";
};

/**
 * Resolves or rejects with `promise`, unless it is still pending after `ms`, then rejects with {@link TimeoutError}.
 * Negative `ms` waits 0. A non-finite `ms` or a value that is not thenable rejects with `TypeError`.
 * Delays above the 32-bit timer limit are split so the host timer does not overflow.
 * The timer is cleared when `promise` settles first.
 * Only the wait is abandoned: the underlying operation (for example a request) keeps running.
 *
 * @example
 * await timeout(fetch(url), 3000);
 */
export const timeout = <T>(promise: PromiseLike<T>, ms: number): Promise<T> => {
  if (!isThenable(promise)) {
    return Promise.reject(new TypeError("Expected a thenable"));
  }

  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    return Promise.reject(new TypeError("Expected ms to be a finite number"));
  }

  const wait = Math.max(0, ms);

  return new Promise<T>((resolve, reject) => {
    let settled = false;
    let clearTimer = () => {};

    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimer();
      callback();
    };

    const timer = startTimer(wait, () => {
      finish(() => reject(new TimeoutError(wait)));
    });
    clearTimer = () => timer.clear();

    try {
      promise.then(
        (value) => {
          finish(() => resolve(value));
        },
        (reason: unknown) => {
          finish(() => reject(reason));
        },
      );
    } catch (error) {
      finish(() => reject(error));
    }
  });
};
