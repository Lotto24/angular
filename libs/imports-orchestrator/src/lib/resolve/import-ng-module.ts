import { createNgModule, Type } from '@angular/core';
import {
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

export function importNgModule(
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
      throw new Error('no ngModuleRef constructor found');
    }

    const ngModuleRef = createNgModule(ngModuleConstructor, item.injector);

    const componentConstructors = (ngModuleRef as any)
      ._bootstrapComponents as Array<Type<any>> | null;

    if (!componentConstructors?.length) {
      item.logger.debug('no bootstrap components found in ngModuleRef');
      item.instance.importFinished.next();
      item.instance.importFinished.complete();
      return;
    }

    const mountComponentPromises = componentConstructors.map(
      (componentConstructor) => {
        const componentRef = item.viewContainerRef.createComponent(
          componentConstructor,
          { injector: ngModuleRef.injector, ngModuleRef }
        );

        return mountComponent(componentRef, item).then(() => componentRef);
      }
    );

    const resolvedComponentRefs = await Promise.all(mountComponentPromises);
    item.instance.importFinished.next(resolvedComponentRefs);
    item.instance.importFinished.complete();
  };
}
