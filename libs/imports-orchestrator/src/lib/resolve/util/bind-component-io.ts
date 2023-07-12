import type { ComponentRef } from '@angular/core';
import { filter, mergeMap, pairwise, startWith, takeUntil } from 'rxjs';
import { ImportsOrchestratorQueueItem } from '../../service';
import { ComponentIO } from '../../host-directive';

export function bindComponentInputs(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): void {
  item.io?.inputs$
    .pipe(
      takeUntil(item.destroy$),
      startWith({} as ComponentIO),
      pairwise(),
      filter(([_, current]) => Object.keys(current).length > 0),
      mergeMap(([previous, current]) =>
        Object.entries(current).filter(
          ([key, value]) => previous[key] !== value
        )
      )
    )
    .subscribe(([key, value]) => componentRef.setInput(key, value));
}

export function bindComponentOutputs(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): void {
  item.io?.outputs$
    .pipe(
      takeUntil(item.destroy$),
      startWith({} as ComponentIO),
      pairwise(),
      filter(([_, current]) => Object.keys(current).length > 0),
      mergeMap(([previous, current]) =>
        Object.entries(current).filter(
          ([key, value]) => previous[key] !== value
        )
      )
    )
    .subscribe(([key, value]) => {
      if (typeof value !== 'function') {
        throw new Error(
          `outputs.${key} must be a function, got '${typeof value}'`
        );
      }

      componentRef.instance[key]
        .pipe(takeUntil(item.destroy$))
        .subscribe((data: any) => {
          value(data);
        });
    });
}
