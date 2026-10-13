/** Largest delay `setTimeout` accepts before a 32-bit overflow (often firing in 1ms). */
const MAX_TIMER_MS = 2_147_483_647;

/** Calls `onFire` after `ms`, splitting delays the host timer cannot hold. Returns a cancel function. */
const startTimer = (ms: number, onFire: () => void): (() => void) => {
  let current: ReturnType<typeof setTimeout>;

  const arm = (remaining: number) => {
    current = setTimeout(
      remaining > MAX_TIMER_MS ? () => arm(remaining - MAX_TIMER_MS) : onFire,
      Math.min(remaining, MAX_TIMER_MS),
    );
  };

  arm(ms);

  return () => clearTimeout(current);
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
    const cancel = startTimer(wait, () => reject(new TimeoutError(wait)));

    // Promise.resolve adopts the thenable and turns a throwing `then` into a rejection.
    // resolve/reject are no-ops once settled, so the loser of the race is ignored.
    Promise.resolve(promise).then(
      (value) => {
        cancel();
        resolve(value);
      },
      (reason: unknown) => {
        cancel();
        reject(reason);
      },
    );
  });
};
