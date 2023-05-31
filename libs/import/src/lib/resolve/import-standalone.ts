import {ChangeDetectorRef} from "@angular/core";
import {resolvePromiseWithRetries} from "./util/retry";
import {ImportQueueItem, ImportQueueItemResolveFn} from "../import-queue.directive";
import {bindComponentInputs, bindComponentOutputs} from "./util/bind-component-io";
import {assertStandalone, mountComponent} from "./util/component";
import {Constructor, resolveConstructorFromESModule} from "./util/resolve-constructor";
import {ESModule} from "./util/module";

export function importStandalone(promise: () => Promise<any>): ImportQueueItemResolveFn {
  return async (item: ImportQueueItem) => {
    const resolvedImport = await resolvePromiseWithRetries(promise) as Constructor | ESModule;
    const constructor = resolveConstructorFromESModule(resolvedImport).shift();

    if (!constructor) {
      throw new Error('class not found');
    }

    assertStandalone(constructor);

    const componentRef = await mountComponent(item.viewContainerRef, item.injector, constructor);

    // logger.debug(`loading import="${item.import}", providers=${item.providers?.length}`);
    const componentChangeDetectorRef = componentRef.injector.get(ChangeDetectorRef);

    if (item.inputs) {
      bindComponentInputs(componentRef, item.inputs);
    }

    if (item.outputs) {
      bindComponentOutputs(componentRef, item.outputs, item.destroy$);
    }

    // This will trigger Angular lifecycle on componentRef's entire component tree
    // * Bindings will be resolved
    // * Projected content will be processed
    // * Usages of ImportQueueDirective in the tree will then insert items to the queue
    // * It is of vital importance that items are queued before triggering processQueue again
    // IMPORTANT: markForCheck is not enough. This will not cause an immediate change detection cycle
    componentChangeDetectorRef.detectChanges();
  }
}
