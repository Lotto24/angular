import type { ComponentRef } from '@angular/core';
import type { Observable } from 'rxjs';
import { takeUntil } from 'rxjs';

import { LOG_PREFIX } from '../../util/logger';

export function bindComponentInputs(componentRef: ComponentRef<any>, inputs: { [key: string]: any }): void {
  if (inputs == null) {
    return;
  }

  if (typeof inputs !== 'object') {
    throw new Error(`${LOG_PREFIX}: inputs must be provided as object.`);
  }

  Object.entries(inputs).forEach(([key, value]) => (componentRef.instance[key] = value));
}

export function bindComponentOutputs(
  componentRef: ComponentRef<any>,
  outputs: { [key: string]: any },
  destroy$: Observable<void>
): void {
  if (typeof outputs !== 'object') {
    throw new Error(`${LOG_PREFIX}: outputs must be provided as object.`);
  }

  Object.entries(outputs).forEach(([key, value]) => {
    if (typeof value !== 'function') {
      throw new Error(`${LOG_PREFIX}: outputs.${key} must be a function, got '${typeof value}'`);
    }

    componentRef.instance[key].pipe(takeUntil(destroy$)).subscribe((data: any) => {
      value(data);
    });
  });
}
