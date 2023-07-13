import type { ComponentRef } from '@angular/core';
import {
  filter,
  mergeMap,
  pairwise,
  race,
  skip,
  startWith,
  takeUntil,
  tap,
} from 'rxjs';
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
  const outputs$ = item.io?.outputs$.pipe(
    takeUntil(item.destroy$),
    startWith({} as ComponentIO),
    pairwise(),
    filter(
      ([previous, current]) =>
        Object.keys(previous)?.join(';') !== Object.keys(current).join(';')
    ),
    tap(([previous, current]) => console.log(previous, current)),
    mergeMap(([_, current]) => Object.entries(current))
  );

  if (!outputs$) return;

  outputs$.subscribe(([key, value]) => {
    if (typeof value !== 'function') {
      throw new Error(
        `outputs.${key} must be a function, got '${typeof value}'`
      );
    }

    componentRef.instance[key]
      .pipe(takeUntil(race(item.destroy$, outputs$.pipe(skip(1)))))
      .subscribe((data: any) => {
        value(data);
      });
  });
}
