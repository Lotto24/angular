import {delay} from './delay.';
import {LOG_PREFIX} from "../../util/logger";

export async function retry<T>(fn: () => Promise<T>, tries = 5, interval = 1000): Promise<T> {
  let err: unknown;

  for (let i = 0; i < tries; i++) {
    try {
      return await fn();
    } catch (err0) {
      err = err0;
    }

    await delay(interval);
  }

  throw err;
}

export async function resolvePromiseWithRetries(
  promise: Promise<unknown>
): Promise<unknown> {
  const resolveFn = () => promise;
  return await retry(async () => {
    // when offline, do not attempt to lazy-load chunk.
    // once import promise fails, there is no way to recover
    if (!window.navigator.onLine) {
      throw new Error(`${LOG_PREFIX}: offline, cannot load chunk`);
    }

    return await resolveFn();
  });
}
