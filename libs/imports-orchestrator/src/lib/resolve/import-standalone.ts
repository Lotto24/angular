import {
  assertStandalone,
  Constructor,
  ESModule,
  mountComponent,
  resolveConstructorsFromESModule,
  resolvePromiseWithRetries,
} from './util';
import { ImportsOrchestratorQueueItemResolveFn } from '../host-directive';
import { ImportsOrchestratorQueueItem } from '../import.service';
import { ViewContainerRef } from '@angular/core';

export function importStandalone(
  promise: () => Promise<unknown>
): ImportsOrchestratorQueueItemResolveFn {
  return async (item: ImportsOrchestratorQueueItem) => {
    item.lifecycle?.importStarted?.emit();

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

    item.lifecycle?.importFinished?.emit([componentRef]);
  };
}
