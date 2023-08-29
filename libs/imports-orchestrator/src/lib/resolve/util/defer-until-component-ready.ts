import { ImportedComponentReady } from '../imported-component-ready.interface';
import {
  catchError,
  filter,
  from,
  map,
  Observable,
  of,
  race,
  take,
  timeout,
  TimeoutError,
} from 'rxjs';
import { ChangeDetectorRef, ComponentRef, Signal } from '@angular/core';

import { ImportsOrchestratorQueueItem } from '../../service';
import { assertPromise, assertSignal } from '@lotto24-angular/util';
import { toObservable } from '@angular/core/rxjs-interop';

export function deferUntilComponentReady$<T>(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): Observable<void> {
  const instance = componentRef.instance;
  if (!assertImportedComponentReadyEmitter(instance)) {
    return of(undefined);
  }

  item.logger.debug(
    `deferring until component w/ import=${item.identifier} emits ready`
  );
  componentRef.injector.get(ChangeDetectorRef).markForCheck(); // ensure Lifecycle hooks are called

  return race(resolveReady(instance), item.destroy$).pipe(
    timeout(item.timeout),
    catchError((err) => {
      if (err instanceof TimeoutError) {
        item.logger.warn(
          `deferred component w/ import=${item.identifier} timed out after ${item.timeout}ms`
        );
      } else {
        item.logger.error(
          `deferred component w/ import=${item.identifier} errored: ${err}`
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

function resolveReady(instance: ImportedComponentReady): Observable<void> {
  const callback = instance.importedComponentReady.call(instance);
  if (assertPromise(callback)) {
    return from(callback);
  }

  return (
    assertSignal(callback)
      ? toObservable(callback as unknown as Signal<boolean>)
      : (callback as unknown as Observable<boolean>)
  ).pipe(
    filter((value) => value),
    map(() => undefined),
    take(1)
  );
}
