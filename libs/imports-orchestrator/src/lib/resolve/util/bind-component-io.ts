import type { ComponentRef } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import type { Observable } from 'rxjs';
import { asapScheduler, filter, map, observeOn, takeUntil, tap } from 'rxjs';

export function bindComponentInputs(
  componentRef: ComponentRef<any>,
  inputs$: Observable<{ [key: string]: any } | void>,
  destroy$: Observable<void>
): void {
  inputs$
    .pipe(
      filter((value) => !!value),
      map((value) => value as { [key: string]: any }),
      takeUntil(destroy$),
      observeOn(asapScheduler),
      tap((value) => console.log(value))
    )
    .subscribe((inputs) => {
      Object.entries(inputs).forEach(
        ([key, value]) => (componentRef.instance[key] = value)
      );
      const cdr = componentRef.injector.get(ChangeDetectorRef);
      cdr.markForCheck();
    });
}

export function bindComponentOutputs(
  componentRef: ComponentRef<any>,
  outputs$: Observable<{ [key: string]: any } | void>,
  destroy$: Observable<void>
): void {
  outputs$
    .pipe(
      filter((value) => !!value),
      map((value) => value as { [key: string]: any }),
      takeUntil(destroy$)
    )
    .subscribe((outputs) => {
      Object.entries(outputs).forEach(([key, value]) => {
        if (typeof value !== 'function') {
          throw new Error(
            `outputs.${key} must be a function, got '${typeof value}'`
          );
        }

        componentRef.instance[key]
          .pipe(takeUntil(destroy$))
          .subscribe((data: any) => {
            value(data);
          });
      });
    });
}
