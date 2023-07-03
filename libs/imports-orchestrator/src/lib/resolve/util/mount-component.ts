import { ChangeDetectorRef, ComponentRef } from '@angular/core';
import {
  assertImportedComponentReadyEmitter,
  deferUntilComponentReady,
} from './defer-until-component-ready';
import { ImportsOrchestratorQueueItem } from '../../host-directive';
import { bindComponentInputs, bindComponentOutputs } from './bind-component-io';

export async function mountComponent(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): Promise<void> {
  // logger.debug(`loading import="${item.import}", providers=${item.providers?.length}`);
  const componentChangeDetectorRef =
    componentRef.injector.get(ChangeDetectorRef);

  item.destroy$.subscribe(() => componentRef.destroy());
  bindComponentInputs(componentRef, item.inputs$, item.destroy$);
  bindComponentOutputs(componentRef, item.outputs$, item.destroy$);

  if (assertImportedComponentReadyEmitter(componentRef.instance)) {
    item.logger.debug(
      `deferring until component w/import=${item.import} emits ready`
    );
    await deferUntilComponentReady(componentRef.instance, item.timeout);
  }

  // This will trigger Angular lifecycle on componentRef's entire component tree
  // * Bindings will be resolved
  // * Projected content will be processed
  // * Usages of ImportsOrchestratorQueueDirective in the tree will then insert items to the queue
  // * It is of vital importance that items are queued before triggering processQueue again
  // IMPORTANT: markForCheck is not enough, as it would not cause an immediate change detection cycle
  componentChangeDetectorRef.detectChanges();
}
