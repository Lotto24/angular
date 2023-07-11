import type { ComponentRef } from '@angular/core';
import {
  asapScheduler,
  observeOn,
  pairwise,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
import { ImportsOrchestratorQueueItem } from '../../import.service';

export function bindComponentInputs(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): void {
  item.io?.inputs$
    .pipe(
      takeUntil(item.destroy$),
      startWith(undefined),
      pairwise(),
      tap(([previous, current]) =>
        console.log(`previous=${previous}, current=${current}`)
      )
    )
    .subscribe(([previous, current]) => {
      if (!current) return;

      Object.entries(current).forEach(([key, value]) => {
        // if (!!previous && previous[key] === current[key]) {
        //   return;
        // }

        componentRef.setInput(key, value);
      });
    });
}

export function bindComponentOutputs(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): void {
  item.io?.outputs$
    .pipe(
      takeUntil(item.destroy$),
      startWith(undefined),
      pairwise(),
      observeOn(asapScheduler)
    )
    .subscribe(([previous, current]) => {
      if (!current) return;

      Object.entries(current).forEach(([key, value]) => {
        if (typeof value !== 'function') {
          throw new Error(
            `outputs.${key} must be a function, got '${typeof value}'`
          );
        }

        if (!!previous && previous[key] === current[key]) {
          return;
        }

        componentRef.instance[key]
          .pipe(takeUntil(item.destroy$))
          .subscribe((data: any) => {
            value(data);
          });
      });
    });
}
