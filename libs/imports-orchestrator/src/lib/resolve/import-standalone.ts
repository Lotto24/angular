import { ChangeDetectorRef } from '@angular/core';
import {
  assertStandalone,
  bindComponentInputs,
  bindComponentOutputs,
  Constructor,
  ESModule,
  mountComponent,
  resolveConstructorsFromESModule,
  resolvePromiseWithRetries,
} from './util';
import {
  ImportsOrchestratorQueueItem,
  ImportsOrchestratorQueueItemResolveFn,
} from '../host-directive';

export function importStandalone(
  promise: () => Promise<any>
): ImportsOrchestratorQueueItemResolveFn {
  return async (item: ImportsOrchestratorQueueItem) => {
    const resolvedImport = (await resolvePromiseWithRetries(promise)) as
      | Constructor
      | ESModule;
    const constructor = resolveConstructorsFromESModule(resolvedImport).shift();

    if (!constructor) {
      throw new Error('class not found');
    }

    assertStandalone(constructor);

    const componentRef = await mountComponent(item, constructor);

    // logger.debug(`loading import="${item.import}", providers=${item.providers?.length}`);
    const componentChangeDetectorRef =
      componentRef.injector.get(ChangeDetectorRef);

    if (item.inputs) {
      bindComponentInputs(componentRef, item.inputs);
    }

    if (item.outputs) {
      bindComponentOutputs(componentRef, item.outputs, item.destroy$);
    }

    item.instance.componentMount.next(componentRef);
    item.instance.componentMount.complete();

    // This will trigger Angular lifecycle on componentRef's entire component tree
    // * Bindings will be resolved
    // * Projected content will be processed
    // * Usages of ImportsOrchestratorQueueDirective in the tree will then insert items to the queue
    // * It is of vital importance that items are queued before triggering processQueue again
    // IMPORTANT: markForCheck is not enough. This will not cause an immediate change detection cycle
    componentChangeDetectorRef.detectChanges();
  };
}
