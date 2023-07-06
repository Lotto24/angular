import {
  ImportsOrchestratorQueueItemResolveFn,
  resolvePromiseWithRetries,
} from '@lotto24-angular/imports-orchestrator';

export function importPromise(
  promise: () => Promise<unknown>
): ImportsOrchestratorQueueItemResolveFn {
  return async () => resolvePromiseWithRetries(promise);
}
