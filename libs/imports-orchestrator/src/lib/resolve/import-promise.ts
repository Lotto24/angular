import {
  ImportResolveFn,
  resolvePromiseWithRetries,
} from '@lotto24-angular/imports-orchestrator';

export function importPromise(
  promise: () => Promise<unknown>
): ImportResolveFn {
  return async () => resolvePromiseWithRetries(promise);
}
