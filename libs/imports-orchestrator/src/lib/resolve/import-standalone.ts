import {
  assertStandalone,
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

    const componentRef = item.viewContainerRef.createComponent(constructor, {
      injector: item.injector,
    });

    await mountComponent(componentRef, item);

    item.instance.importFinished.emit([componentRef]);
  };
}
