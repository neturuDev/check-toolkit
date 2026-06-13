/**
 * Resolves after the specified number of milliseconds.
 *
 * @example
 * await delay(300); // waits 300ms
 */
export const delay = (ms: number): Promise<void> => {
  const timeout = Math.max(0, ms);

  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
};
