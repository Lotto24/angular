import { ImportResolveFn } from './import-resolve-fn.interface';
import { resolvePromiseWithRetries } from './util';

export function importPromise(
  promise: () => Promise<unknown>
): ImportResolveFn {
  return async () => resolvePromiseWithRetries(promise);
}
