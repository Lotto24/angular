import { ViewContainerRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ImportObservableComponentIO } from './import.service';

export type ImportsOrchestratorQueueItemForComponentRef = {
  io: ImportObservableComponentIO;
  viewContainerRef: ViewContainerRef;
  destroyComponents$: Observable<void>;
};

export function assertComponentStuff(
  type: any
): type is ImportsOrchestratorQueueItemForComponentRef {
  return (
    type.io !== undefined &&
    type.viewContainerRef !== undefined &&
    type.destroyComponents$ !== undefined
  );
}
