/** Largest delay `setTimeout` accepts before a 32-bit overflow (often firing in 1ms). */
const MAX_TIMER_MS = 2_147_483_647;

/**
 * Finite delays above ~2^84 do not shrink when a 32-bit slice is subtracted,
 * so rescheduling would wait forever.
 */
const canSchedule = (ms: number): boolean =>
  ms <= MAX_TIMER_MS || ms - MAX_TIMER_MS < ms;

const normalizeDelay = (ms: number): number => {
  if (typeof ms !== "number" || !Number.isFinite(ms)) {
    throw new TypeError("Expected ms to be a finite number");
  }

  const wait = Math.max(0, ms);
  if (!canSchedule(wait)) {
    throw new TypeError("Delay is too large to schedule");
  }

  return wait;
};

const startTimer = (ms: number, onFire: () => void): { clear: () => void } => {
  let current: ReturnType<typeof setTimeout> | undefined;
  let cleared = false;

  const arm = (remaining: number) => {
    const slice = remaining > MAX_TIMER_MS ? MAX_TIMER_MS : remaining;
    current = setTimeout(() => {
      if (cleared) return;
      const next = remaining - slice;
      if (next > 0) {
        if (next >= remaining) {
          throw new TypeError("Delay is too large to schedule");
        }
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
 * A non-finite `ms`, or a finite delay that cannot advance in float64 (about 1.93e25 and above), throws `TypeError`.
 * Negative `ms` waits 0. Larger finite delays are split so the host timer does not overflow.
 *
 * @example
 * await delay(300); // waits 300ms
 */
export const delay = (ms: number): Promise<void> => {
  const wait = normalizeDelay(ms);

  return new Promise((resolve) => {
    startTimer(wait, resolve);
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
 * Resolves or rejects with `promise`, unless it is still pending after `ms`.
 * Negative `ms` waits 0. A non-finite `ms`, a delay too large to schedule, or a value that is not thenable, throws `TypeError` synchronously.
 * Larger finite delays are split so the host timer does not overflow.
 * The timer is cleared when `promise` settles first.
 *
 * @example
 * await timeout(fetch(url), 3000);
 */
export const timeout = <T>(promise: PromiseLike<T>, ms: number): Promise<T> => {
  if (!isThenable(promise)) {
    throw new TypeError("Expected a thenable");
  }

  const wait = normalizeDelay(ms);

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
