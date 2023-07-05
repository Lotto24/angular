import {
  ImportsOrchestratorQueueItem,
  ImportsOrchestratorQueueItemResolveFn,
  resolvePromiseWithRetries,
} from '@lotto24-angular/imports-orchestrator';

export function importPromise<T>(
  promise: () => Promise<T>,
  callback: null | ((result: T) => void) = null
): ImportsOrchestratorQueueItemResolveFn {
  return async (item: ImportsOrchestratorQueueItem): Promise<void> => {
    item.lifecycle?.importStarted?.emit();
    try {
      const result = (await resolvePromiseWithRetries(promise)) as T;
      callback && callback(result);
    } catch (x) {
      item.lifecycle?.importErrored?.emit(x);
    }

    item.lifecycle?.importFinished?.emit();
  };
}
