import { ChangeDetectorRef, ComponentRef } from '@angular/core';
import { ImportsOrchestratorQueueItem } from '../../host-directive';
import { bindComponentInputs, bindComponentOutputs } from './bind-component-io';
import { firstValueFrom } from 'rxjs';
import { deferUntilComponentReady$ } from './defer-until-component-ready';

export async function mountComponent(
  componentRef: ComponentRef<any>,
  item: ImportsOrchestratorQueueItem
): Promise<void> {
  item.destroyComponents$.subscribe(() => componentRef.destroy());
  bindComponentInputs(componentRef, item.io.inputs$, item.destroyComponents$);
  bindComponentOutputs(componentRef, item.io.outputs$, item.destroyComponents$);

  try {
    await firstValueFrom(deferUntilComponentReady$(componentRef, item));
  } catch (x) {}

  // This will trigger Angular lifecycle on componentRef's entire component tree
  // * Bindings will be resolved
  // * Projected content will be processed
  // * Usages of ImportsOrchestratorQueueDirective in the tree will then insert items to the queue
  // * It is of vital importance that items are queued before triggering processQueue again
  // IMPORTANT: markForCheck is not enough, as it would not cause an immediate change detection cycle
  componentRef.injector.get(ChangeDetectorRef).detectChanges();
}
