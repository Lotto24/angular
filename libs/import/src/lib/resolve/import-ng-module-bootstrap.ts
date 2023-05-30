import {ImportQueueItem, ImportQueueItemResolveFn} from "../import-queue.directive";
import {mountComponent} from "./util/component";
import {ChangeDetectorRef, createNgModule, Type} from "@angular/core";
import {bindComponentInputs, bindComponentOutputs} from "./util/bind-component-io";
import {resolvePromiseWithRetries} from "./util/retry";
import {Constructor, resolveConstructorFromESModule} from "./util/resolve-constructor";
import {ESModule, isNgModuleDef, NgModuleDef} from "./util/module";

export function importNgModuleBootstrap(promise: Promise<any>): ImportQueueItemResolveFn {
  return async (item: ImportQueueItem) => {
    const resolvedImport = await resolvePromiseWithRetries(promise) as Constructor | ESModule;
    const ngModuleConstructor = resolveConstructorFromESModule(resolvedImport)
      ?.filter((type) => isNgModuleDef(type)).shift();

    if (!ngModuleConstructor) {
      throw new Error('no class found');
    }

    const ngModuleRef = createNgModule(ngModuleConstructor, item.injector);
    const componentConstructor = ((ngModuleRef as any)._bootstrapComponents as Array<Type<any>>).shift();

    if (!componentConstructor) {
      throw new Error('no class found');
    }

    const componentRef = await mountComponent(item.viewContainerRef, item.injector, componentConstructor);

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
