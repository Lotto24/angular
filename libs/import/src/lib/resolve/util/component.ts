import { ComponentRef, isStandalone, Type } from '@angular/core';
import { ImportQueueItem } from '../../host-directive/import-queue.directive';

export async function mountComponent(
  item: ImportQueueItem,
  componentType: Type<unknown>
): Promise<ComponentRef<unknown>> {
  return item.viewContainerRef.createComponent(componentType, {
    injector: item.injector,
  });
}

export function assertStandalone(resolved: Type<unknown>) {
  if (!isStandalone(resolved)) {
    throw new Error(
      'provided resolver did not yield Angular standalone component'
    );
  }
}
