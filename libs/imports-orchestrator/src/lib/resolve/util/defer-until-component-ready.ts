import { ImportedComponentReady } from '../imported-component-ready.interface';
import {
  catchError,
  from,
  Observable,
  of,
  race,
  timeout,
  TimeoutError,
} from 'rxjs';
import { ChangeDetectorRef, ComponentRef } from '@angular/core';

import { ImportsOrchestratorQueueItem } from '../../import.service';

export function deferUntilComponentReady$<T>(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): Observable<void> {
  const instance = componentRef.instance;
  if (!assertImportedComponentReadyEmitter(instance)) {
    return of(undefined);
  }

  item.logger.debug(
    `deferring until component w/ import=${item.import} emits ready`
  );
  componentRef.injector.get(ChangeDetectorRef).markForCheck(); // ensure Lifecycle hooks are called

  const ready$ = from(instance.importedComponentReady.call(instance));
  return race(ready$, item.destroyComponents$).pipe(
    timeout(item.timeout),
    catchError((err) => {
      if (err instanceof TimeoutError) {
        item.logger.warn(
          `deferred component w/ import=${item.import} timed out after ${item.timeout}ms`
        );
      } else {
        item.logger.error(
          `deferred component w/ import=${item.import} errored: ${err}`
        );
      }
      return of(undefined);
    })
  );
}

export function assertImportedComponentReadyEmitter(
  type: any
): type is ImportedComponentReady {
  return (type as ImportedComponentReady).importedComponentReady !== undefined;
}
