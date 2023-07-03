import type { ComponentRef } from '@angular/core';
import type { Observable } from 'rxjs';
import { takeUntil } from 'rxjs';

export function bindComponentInputs(
  componentRef: ComponentRef<any>,
  inputs$: Observable<{ [key: string]: any }>,
  destroy$: Observable<void>
): void {
  inputs$.pipe(takeUntil(destroy$)).subscribe((inputs) => {
    Object.entries(inputs).forEach(
      ([key, value]) => (componentRef.instance[key] = value)
    );
  });
}

export function bindComponentOutputs(
  componentRef: ComponentRef<any>,
  outputs$: Observable<{ [key: string]: any }>,
  destroy$: Observable<void>
): void {
  outputs$.pipe(takeUntil(destroy$)).subscribe((outputs) => {
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
