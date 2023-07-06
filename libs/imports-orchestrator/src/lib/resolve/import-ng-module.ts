import { createNgModule, Type, ViewContainerRef } from '@angular/core';
import {
  Constructor,
  ESModule,
  isNgModuleDef,
  mountComponent,
  resolveConstructorsFromESModule,
  resolvePromiseWithRetries,
} from './util';
import { ImportsOrchestratorQueueItemResolveFn } from '../host-directive';
import { ImportsOrchestratorQueueItem } from '../import.service';

export function importNgModule(
  promise: () => Promise<unknown>
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

    const componentConstructors = (
      ngModuleRef as unknown as {
        _bootstrapComponents: Array<Type<unknown>> | null;
      }
    )._bootstrapComponents;

    if (!componentConstructors?.length) {
      item.logger.debug('no bootstrap components found in ngModuleRef');
      item.lifecycle?.importFinished?.emit(undefined);
      return;
    }

    const viewContainerRef = item.injector.get(ViewContainerRef);

    const mountComponentPromises = componentConstructors.map(
      (componentConstructor) => {
        const componentRef = viewContainerRef.createComponent(
          componentConstructor,
          { injector: ngModuleRef.injector, ngModuleRef }
        );

        return mountComponent(componentRef, item).then(() => componentRef);
      }
    );

    const componentRefs = await Promise.all(mountComponentPromises);
    componentRefs.forEach((componentRef) =>
      item.lifecycle?.importComponent?.emit(componentRef)
    );
    return componentRefs;
  };
}
