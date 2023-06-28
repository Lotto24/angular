import {EventEmitter} from '@angular/core';
import {ImportedComponentReadyEmitter} from '../imported-component-ready.interface';
import {firstValueFrom, Observable, takeUntil, throwError, timeout,} from 'rxjs';

export async function deferUntilComponentReady<T>(
  importedComponentReady: EventEmitter<undefined>,
  destroy$: Observable<void>,
  timeoutMs: number
): Promise<void> {
  return firstValueFrom(
    importedComponentReady.pipe(
      takeUntil(destroy$),
      timeout({
        each: timeoutMs,
        with: () =>
          throwError(
            () => new Error('imported component ready did not emit in time')
          ),
      })
    )
  );
}

export function assertImportedComponentReadyEmitter(
  type: any
): type is ImportedComponentReadyEmitter {
  return (
    (type as ImportedComponentReadyEmitter).importedComponentReady !== undefined
  );
}
