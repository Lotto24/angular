import { ChangeDetectorRef, createNgModule, Type } from '@angular/core';
import {
  bindComponentInputs,
  bindComponentOutputs,
  Constructor,
  ESModule,
  isNgModuleDef,
  mountComponent,
  resolveConstructorsFromESModule,
  resolvePromiseWithRetries,
} from './util';
import {
  ImportsOrchestratorQueueItem,
  ImportsOrchestratorQueueItemResolveFn,
} from '../host-directive';

export function importNgModuleBootstrap(
  promise: () => Promise<any>
): ImportsOrchestratorQueueItemResolveFn {
  return async (item: ImportsOrchestratorQueueItem) => {
    const resolvedImport = (await resolvePromiseWithRetries(promise)) as
      | Constructor
      | ESModule;
    const ngModuleConstructor = resolveConstructorsFromESModule(resolvedImport)
      ?.filter((type) => isNgModuleDef(type))
      ?.shift();

    if (!ngModuleConstructor) {
      throw new Error('no class found');
    }

    const ngModuleRef = createNgModule(ngModuleConstructor, item.injector);
    const componentConstructor = (
      (ngModuleRef as any)._bootstrapComponents as Array<Type<any>>
    )
      ?.slice()
      .shift();

    if (!componentConstructor) {
      throw new Error('no class found');
    }

    const componentRef = await mountComponent(item, componentConstructor);

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
