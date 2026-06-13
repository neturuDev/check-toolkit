/**
 * No-op function useful as a default callback.
 */
export const noop = (): void => {};

/**
 * Returns the first argument unchanged.
 */
export const identity = <T>(value: T): T => value;

/**
 * Creates a function that invokes `func` at most once after a successful call.
 * If `func` throws, the next invocation retries.
 *
 * @example
 * const init = once(() => ({ count: 0 }));
 * init() === init(); // => true
 */
export const once = <T extends (...args: any[]) => any>(func: T): T => {
  let called = false;
  let result: ReturnType<T>;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!called) {
      result = func.apply(this, args) as ReturnType<T>;
      called = true;
    }
    return result;
  } as T;
};
