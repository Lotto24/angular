import {
  assertStandalone,
  Constructor,
  ESModule,
  mountComponent,
  resolveConstructorsFromESModule,
  resolvePromiseWithRetries,
} from './util';
import { ImportsOrchestratorQueueItem } from '../service';
import { ViewContainerRef } from '@angular/core';
import {ImportResolveFn} from "./import-resolve-fn.interface";

export function importStandalone(
  promise: () => Promise<unknown>
): ImportResolveFn {
  return async (item: ImportsOrchestratorQueueItem) => {
    const resolvedImport = (await resolvePromiseWithRetries(promise)) as
      | Constructor
      | ESModule;
    const constructor = resolveConstructorsFromESModule(resolvedImport).shift();

    if (!constructor) {
      throw new Error('class not found');
    }

    assertStandalone(constructor);

    const viewContainerRef = item.injector.get(ViewContainerRef);

    const componentRef = viewContainerRef.createComponent(constructor, {
      injector: item.injector,
    });

    await mountComponent(componentRef, item);
    item.lifecycle?.importComponent?.emit(componentRef);
    return componentRef;
  };
}
